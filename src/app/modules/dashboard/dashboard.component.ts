
import { ENDPOINTS, ApiMethod } from '../../core/shared/utils/const';
import { ApiService } from '../../core/shared/utils/api.service';
import { Injectable } from '@angular/core';

// dashboard.component.ts
import {
  Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, ViewChildren, QueryList
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { EmmService, EmmResponse } from './emm.service';

import { Chart, ChartConfiguration, registerables } from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
//import { es } from 'date-fns/locale';
import es from 'date-fns/locale/es';
import { Subscription, timer, switchMap, forkJoin } from 'rxjs';

Chart.register(...registerables);


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements   OnInit, AfterViewInit, OnDestroy {
  //@ViewChild('emmChart', { static: false }) emmChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChildren('emmChart') emmCharts!: QueryList<ElementRef<HTMLCanvasElement>>;

  movies:number = 0;
  tvshows: number = 0;
  livechannels:number=0;
  fastchannels: number = 0;
  clients: number = 0;
  adminrole: string[]; //*ngIf="multirole.includes(role)"
  operatorrole: string[]; //*ngIf="multirole.includes(role)"
  role:string;
//  cardserverId = 'Cardserver01';  // setéalo según tu UI/route
  cardservers = ['Cardserver01', 'Cardserver02', 'Cardserver03']; //, 'Cardserver04'
  emmtypes = ['shared', 'global'] as const;

  // estado por índice
  charts: Chart[] = [];
  legends: { name: string; color: string }[][] = [];
  lastUpdated: (Date | undefined)[] = [];

  private sub?: Subscription;


  constructor(private http: ApiService, private emmService: EmmService) { 
    this.adminrole = ['admin'];
    this.operatorrole = ['admin','operator'];
    this.role = localStorage.getItem('role');
  }

  ngOnInit(): void {
  
  }
  private idx(iSrv: number, iType: number) {
    return iSrv * this.emmtypes.length + iType; // orden DOM: server outer, type inner
  }
  
  ngAfterViewInit(): void {
    const total = this.cardservers.length * this.emmtypes.length;
    this.charts = new Array(total);
    this.legends = new Array(total).fill(0).map(() => []);
    this.lastUpdated = new Array(total).fill(undefined);
    this.colorByReaderMaps = new Array(total).fill(0).map(() => new Map());

    // Inicializa cada canvas en el orden que salen en el HTML (server x type)
    this.emmCharts.forEach((ref, i) => this.initChartAt(i, ref.nativeElement.getContext('2d')!));

    // Refresco cada 60 s: pide todas las combinaciones en paralelo
    this.sub = timer(0, 60_000).pipe(
      switchMap(() =>
        forkJoin(
          this.cardservers.flatMap(cs =>
            this.emmtypes.map(et => this.emmService.getEmmChartStats(cs, et))
          )
        )
      )
    ).subscribe({
      next: (resps) => {
        // resps viene en el mismo orden que canvases: (srv1,shared),(srv1,global),(srv2,shared)...
        resps.forEach((resp, i) => this.updateChartAt(i, resp));
      },
      error: (err) => console.error('EMM fetch error', err)
    });
  }


  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.charts.forEach(c => c.destroy());
  }

  /** crea gráfico vacío en índice i */
  private initChartAt(i: number, ctx: CanvasRenderingContext2D): void {
    const chart = new Chart(ctx, <ChartConfiguration<'line'>>{
      type: 'line',
      data: { datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        parsing: false,
        animation: false,
        interaction: { mode: 'nearest', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => items[0]?.label ?? '',
              label: (item) => `${item.dataset.label}: ${item.parsed.y}`
            }
          }
        },
        elements: {
          line: { tension: 0.3, borderWidth: 2 },
          point: { radius: 0 }
        },
        scales: {
          x: {
            type: 'time',
            distribution: 'linear',
            adapters: { date: { locale: es } },
            time: { unit: 'minute', stepSize: 5, tooltipFormat: 'PPpp', displayFormats: { minute: 'HH:mm' } },
            ticks: { maxTicksLimit: 24 }
          },
          y: { beginAtZero: true, title: { display: true, text: 'EMM / bucket' } }
        }
      }
    });
    this.charts[i] = chart;
  }

  // util epoch/string → ms
  private toMs = (t: string | number) =>
    typeof t === 'number' ? (t < 1e12 ? t * 1000 : t) : Date.parse(t);

  /** asigna colores estables por reader para el gráfico i */
  private ensureReaderColorsAt(i: number, readers: Array<{ id: string }>): void {
    const cmap = this.colorByReaderMaps[i];
    for (const r of readers) {
      if (!cmap.has(r.id)) {
        const idx = cmap.size % this.palette.length;
        cmap.set(r.id, this.palette[idx]);
      }
    }
  }

  /** transforma JSON → datasets y actualiza gráfico i */
  private updateChartAt(i: number, resp: EmmResponse): void {
    const chart = this.charts[i];
    if (!chart) return;

    this.ensureReaderColorsAt(i, resp.readers);

    const nameById = new Map(resp.readers.map(r => [r.id, r.name]));
    const bucketSec = resp.meta.bucket_sec ?? 60;
    const stepMin = Math.max(1, Math.round(bucketSec / 60));
    const fromMs = this.toMs(resp.meta.from as any);
    const toMsVal = this.toMs(resp.meta.to as any);

    const cmap = this.colorByReaderMaps[i];

    const datasets = resp.series.map(s => {
      const c = cmap.get(s.reader_id)!;
      return {
        label: nameById.get(s.reader_id) ?? s.reader_id,
        data: s.points.map(([t, q]) => ({ x: this.toMs(t as any), y: q })),
        borderColor: c.stroke,
        backgroundColor: c.fill,
        fill: true
      };
    });

    chart.data.datasets = datasets as any;

    // dominio y step del eje X
    const x: any = chart.options.scales!.x;
    x.distribution = 'linear';
    x.time = { ...(x.time || {}), unit: 'minute', stepSize: stepMin, tooltipFormat: 'PPpp', displayFormats: { minute: 'HH:mm' } };
    x.min = fromMs;
    x.max = toMsVal;
    x.ticks = { ...(x.ticks || {}), maxTicksLimit: Math.min(72, Math.ceil((toMsVal - fromMs) / (stepMin * 60 * 1000))) };

    chart.update('none');

    // leyenda + timestamp
    this.legends[i] = resp.readers.map(r => {
      const c = cmap.get(r.id)!;
      return { name: nameById.get(r.id) ?? r.id, color: c.stroke };
    });
    this.lastUpdated[i] = new Date(this.toMs(resp.meta.generated_at as any));
  }
  // estado por índice
  //charts: Chart[] = [];
  //legends: { name: string; color: string }[][] = [];
  //lastUpdated: (Date | undefined)[] = [];
  private colorByReaderMaps: Map<string, { stroke: string; fill: string }>[] = [];
  
  // Paleta fija (R, G, B)
  private palette = [
    { stroke: 'rgb(220,53,69)', fill: 'rgba(220,53,69,0.15)' }, // rojo
    { stroke: 'rgb(40,167,69)', fill: 'rgba(40,167,69,0.15)' }, // verde
    { stroke: 'rgb(0,123,255)', fill: 'rgba(0,123,255,0.15)' }, // azul
  ];

  // Se mantiene entre refrescos
  private colorByReader = new Map<string, { stroke: string; fill: string }>();

  /** Asigna colores estables a cada reader; si aparecen nuevos, los cicla R-G-B */
  private ensureReaderColors(readers: Array<{ id: string }>): void {
    for (const r of readers) {
      if (!this.colorByReader.has(r.id)) {
        const idx = this.colorByReader.size % this.palette.length;
        this.colorByReader.set(r.id, this.palette[idx]);
      }
    }
  }

}

