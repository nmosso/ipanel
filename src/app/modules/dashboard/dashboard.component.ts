
import { FormGroup, FormControl, Validators, FormsModule, FormBuilder } from '@angular/forms';
import { startWith } from 'rxjs/operators';

import { ENDPOINTS, ApiMethod } from '../../core/shared/utils/const';
import { ApiService } from '../../core/shared/utils/api.service';
import Swal from 'sweetalert2';
// dashboard.component.ts
import {
  Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, ViewChildren, QueryList
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { EmmService, EmmResponse } from './emm.service';


import { Subscription, timer, switchMap, forkJoin, Subject, of, from } from 'rxjs';
import { Last5Response, Point, ReaderStats } from './types';

import { takeUntil, catchError, tap } from 'rxjs/operators'; //switchMap, 

import { Chart, ChartConfiguration, registerables } from 'chart.js/auto';
// import 'chartjs-adapter-date-fns';
import es from 'date-fns/locale/es';
// Chart.register(...registerables);

interface Cardserver { status: 'enabled' | 'disabled'; cardserverid: string; }
interface Cardreader { status: 'enabled' | 'disabled'; cardreader: string; cardserverid: string; }



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements   OnInit, AfterViewInit, OnDestroy {

  // ahora: agrega la colección para "Últimos 5"
  @ViewChildren('ecmLast5Chart') last5Charts!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChildren('emmChart') emmCharts!: QueryList<ElementRef<HTMLCanvasElement>>;

  deviceForm!: FormGroup;

  clients: number = 0;
  devicestotal: number = 0;
  devicesonline: number = 0;
  devicesconnected: number = 0;
  devicesoffline: number = 0;
  devicesdisabled: number = 0;

  adminrole: string[]; //*ngIf="multirole.includes(role)"
  operatorrole: string[]; //*ngIf="multirole.includes(role)"
  role:string;
//  cardserverId = 'Cardserver01';  // setéalo según tu UI/route
  cardservers = ['Cardserver01', 'Cardserver02', 'Cardserver03']; //, 'Cardserver04'
  emmtypes = ['shared', 'global'] as const;

  private readonly colsPerSrv = 3; // last5, shared, global

  // estado por índice
  charts: Chart[] = [];
  legends: { name: string; color: string }[][] = [];
  lastUpdated: (Date | undefined)[] = [];


  private sub?: Subscription;
  private destroy$ = new Subject<void>();

  // --- NUEVO: estado para la tabla snapshot ---
  tableReaders: string[] = [];  // filas (readers, ordenadas)
  tableMatrix: { [cs: string]: { [reader: string]: ReaderStats } } = {}; // celdas
  // dashboard.component.ts
  private ChartCtor: any;
  private chartLocale: any;
  cardserverslist:any = [];
  cardreaderslist: any = [];
  cardserversEnabled: Cardserver[] = [];
  cardreadersForServer: Cardreader[] = [];

  selectedCardserverid:string= null;
  selectedCardreader: string = null;
  //private subs = new Subscription();
  cardreaderLoading = false
  myname: string = '---';

  constructor(private http: ApiService, private emmService: EmmService, private fb: FormBuilder) { 
    this.adminrole = ['superadmin'];
    this.operatorrole = ['admin','tenant','operator'];
    this.role = localStorage.getItem('role');
    this.myname = localStorage.getItem('name');
  }
  private idx3(iSrv: number, col: number) {  // col: 0=last5, 1=shared, 2=global
    return iSrv * this.colsPerSrv + col;
  }

  async ngOnInit(): Promise<void> {
    this.loadStats();
    this.setForm();
    this.getcardservers();
    this.getcardreaders();

  }
  async loadStats() { 
    this.emmService.getClientStats().then((data:any) => {  
      this.clients = data.clients ?? 0;
      this.devicestotal = data.devices ?? 0;
      this.devicesonline = data.devicesonline ?? 0;
      this.devicesconnected = data.devicesconnected ?? 0;
      this.devicesoffline = data.devicesoffline ?? 0;
      this.devicesdisabled = data.devicesdisabled ?? 0;
        //console.log("statistics:",data);
    })
  }
  async getcardservers() {
    //let params = {noclients: 'true'};
    //console.log("getcardservers ----------------------------------------------------------------------------");
    this.emmService.getCardServers().then(async (data: any) => { //getchannelsinfo

      this.cardserverslist = data;
      //console.log(this.cardserverslist)
    });
  }
  async getcardreaders() {
    //let params = {noclients: 'true'};
    console.log("getcardreaders ----------------------------------------------------------------------------");
    this.emmService.getReadersByCardserverid().then((data: any) => { //getchannelsinfo
      console.log("cardreaderslist DATA ======================================================================");
      this.cardreaderslist = data;
      console.log(this.cardreaderslist)
    });
  }
  async restartCardserver() {
/*     let cs = {carserverid:this.selectedCardserverid};
    console.log("Cardserverid:",cs) */
    this.emmService.restartCardServers(this.selectedCardserverid).then((resp:any)=>{ 
      Swal.fire({
        title: '',
        text: 'Restart Device Sended',
        icon: 'success',
        confirmButtonText: 'Close'
      });
    });
  }
  async restartCardreader() {
    //let cs =  { carserverid: this.selectedCardserverid, cardreader:this.selectedCardreader };
    //console.log("cardreader:",cs)
    this.emmService.restartCardServers(this.selectedCardserverid, this.selectedCardreader).then((resp: any) => {
      Swal.fire({
        title: '',
        text: 'Restart Card Sended',
        icon: 'success',
        confirmButtonText: 'Close'
      });
    });
  }
  
  private idx(iSrv: number, iType: number) {
    return iSrv * this.emmtypes.length + iType; // orden DOM: server outer, type inner
  }
  
  async ngAfterViewInit(): Promise<void> {
    const chartJs = await import('chart.js/auto');
    await import('chartjs-adapter-date-fns');       // side effect
    const esLocale = await import('date-fns/locale/es');

    this.ChartCtor = chartJs.Chart;
    this.chartLocale = esLocale.default ?? esLocale;

    chartJs.Chart.register(...chartJs.registerables);

    const total = this.cardservers.length * this.colsPerSrv;
    this.charts = new Array(total);
    this.legends = new Array(total).fill(0).map(() => []);
    this.lastUpdated = new Array(total).fill(undefined);
    this.colorByReaderMaps = new Array(total).fill(0).map(() => new Map());

    // 2.1 Inicializar canvases de "Últimos 5" (columna 0 de cada fila)
    this.last5Charts.forEach((ref, row) => {
      const i = this.idx3(row, 0);
      this.initChartAt(i, ref.nativeElement.getContext('2d')!);
    });

    // 2.2 Inicializar canvases de EMM (shared/global) en orden DOM:
    // j=0 -> (row=0, shared), j=1 -> (row=0, global), j=2 -> (row=1, shared)...
    this.emmCharts.forEach((ref, j) => {
      const row = Math.floor(j / this.emmtypes.length);
      const type = j % this.emmtypes.length;         // 0=shared, 1=global
      const i = this.idx3(row, type + 1);         // col 1 ó 2
      this.initChartAt(i, ref.nativeElement.getContext('2d')!);
    });

    // === TIMERS ===
    // A) Refresco EMM (shared/global) cada 60s
    this.sub = timer(0, 60_000).pipe(
      switchMap(() => forkJoin(
        this.cardservers.flatMap(cs => this.emmtypes.map(et => this.emmService.getEmmChartStats(cs, et)))
      ))
    ).subscribe({
      next: (resps) => {
        // mapear respuestas al índice de chart correcto
        resps.forEach((resp, j) => {
          const row = Math.floor(j / this.emmtypes.length);
          const type = j % this.emmtypes.length;     // 0=shared, 1=global
          const i = this.idx3(row, type + 1);     // col 1 ó 2
          this.updateChartAt(i, resp);
        });
      },
      error: (err) => console.error('EMM fetch error', err)
    });

    // B) Refresco "Últimos 5" cada 60s
    timer(0, 60_000).pipe(
      // getEcmChartStats() devuelve Promise<Last5Response> (mapa)
      switchMap(() => this.emmService.getEcmChartStats()),
      catchError(err => { console.error(err); return of({} as Last5Response); }),
      takeUntil(this.destroy$)
    ).subscribe((data: Last5Response) => {
      this.cardservers.forEach((cs, row) => {
        const points = data[cs] || [];
        this.buildLast5Chart(row, cs, points);   // índice absoluto (columna 0)
        this.lastUpdated[this.idx3(row, 0)] = new Date();
      });
      // <<<--- construir la tabla snapshot
      this.updateSnapshotTable(data);
    });


  }


  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.destroy$.next(); this.destroy$.complete();
    this.charts.forEach(c => c?.destroy());
    //this.subs.unsubscribe();
  }


  async setForm() {
    this.deviceForm = this.fb.group({
      cardserverid: [null],
      cardreader:[null]
    });
    this.deviceForm.get('cardserverid')?.valueChanges.subscribe(v => {
      console.log('cardserverid valueChanges ->', v);
    });

    this.deviceForm.get('cardreader')?.valueChanges.subscribe(v => {
      console.log('cardreader valueChanges ->', v);
    });

/*    this.deviceForm = new FormGroup({
      cardserverid: new FormControl(null),
      cardreader: new FormControl(null)
    }) */

  //  this.fb.group({
  //     cardserverid: [null],            // opcional
  //     cardreader: [{ value: null, disabled: true }] // se habilita al elegir server
  //   });
 
    // // React a selección del server y trae lectores on-demand
    // const sub = this.deviceForm.get('cardserverid')!.valueChanges.pipe(
    //   startWith(this.deviceForm.get('cardserverid')!.value),
    //   tap(() => {
    //     console.log("CARGANDO lectores para serverId=");
    //     this.cardreaderLoading = true;
    //     this.cardreadersForServer = [];
    //     this.deviceForm.patchValue({ cardreader: null }, { emitEvent: false });
    //     this.deviceForm.get('cardreader')!.disable({ emitEvent: false });
    //   }),
    //   switchMap((serverId: string | null) => {
    //     if (!serverId) return of([] as Cardreader[]);
    //     // tu servicio que recibe el serverId y devuelve Promise<Cardreader[]>
        
    //     return from(this.emmService.getReadersByCardserverid(serverId)).pipe(
    //       catchError(() => of([] as Cardreader[]))
    //     );
    //   }),
    //   tap(() => (this.cardreaderLoading = false))
    // ).subscribe(list => {
    //   // normaliza y filtra habilitados por si el backend trae de más
    //   const sid = (this.deviceForm.get('cardserverid')!.value ?? '').toString().trim().toLowerCase();
    //   this.cardreadersForServer = (list ?? []).filter(r =>
    //     r.status === 'enabled' &&
    //     (r.cardserverid ?? '').toString().trim().toLowerCase() === sid
    //   );

    //   if (this.cardreadersForServer.length > 0) {
    //     this.deviceForm.get('cardreader')!.enable({ emitEvent: false });
    //   }
    //   // si no hay lectores, dejamos deshabilitado
    // });

    // this.sub.add(sub);

  }
  onSelectChange(type:string,e: Event) {
    const el = e.target as HTMLSelectElement;
    console.log('type:',type,'DOM select value ->', el.value, 'selectedIndex ->', el.selectedIndex);
    if (type === 'cardserverid') {
      this.selectedCardserverid = el.value;
    } else {
      this.selectedCardserverid = el.value.split('-')[0];
      this.selectedCardreader = el.value.split('-')[1];
    }

  }
  /** crea gráfico vacío en índice i */
  private async initChartAt(i: number, ctx: CanvasRenderingContext2D): Promise<void> {
    //const esLocale = await import('date-fns/locale/es');
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
    const cmap = this.getColorMapAt(i);
    if (!Array.isArray(readers)) return;
    for (const r of readers) if (!cmap.has(r.id)) this.pickColor(cmap, r.id);
  }

  /** transforma JSON → datasets y actualiza gráfico i */
  private updateChartAt(i: number, resp: EmmResponse): void {
    const chart = this.charts[i];
    if (!chart) return;

    // Coalesce y normalización contra null/undefined
    const series = Array.isArray(resp.series) ? resp.series : [];
    const readers = this.normalizeReaders((resp as any).readers, series);

    // Colores listos
    this.ensureReaderColorsAt(i, readers);
    const nameById = new Map(readers.map(r => [r.id, r.name ?? r.id]));
    const cmap = this.getColorMapAt(i);

    const bucketSec = resp.meta?.bucket_sec ?? 60;
    const stepMin = Math.max(1, Math.round(bucketSec / 60));
    const fromMs = this.toMs(resp.meta?.from as any);
    const toMsVal = this.toMs(resp.meta?.to as any);

    // Si no hay series, limpia datasets y deja eje/leyenda coherentes
    if (series.length === 0) {
      chart.data.datasets = [] as any;

      const x: any = (chart.options.scales!.x ??= {});
      x.distribution = 'linear';
      x.time = { ...(x.time || {}), unit: 'minute', stepSize: stepMin, tooltipFormat: 'PPpp', displayFormats: { minute: 'HH:mm' } };
      if (Number.isFinite(fromMs) && Number.isFinite(toMsVal)) {
        x.min = fromMs;
        x.max = toMsVal;
        x.ticks = { ...(x.ticks || {}), maxTicksLimit: Math.min(72, Math.ceil((toMsVal - fromMs) / (stepMin * 60 * 1000))) };
      }

      // leyenda usando readers (si están vacíos, la leyenda queda vacía)
      this.legends[i] = readers.map(r => {
        const c = cmap.get(r.id) ?? this.pickColor(cmap, r.id);
        return { name: nameById.get(r.id) ?? r.id, color: c.stroke };
      });
      this.lastUpdated[i] = new Date(this.toMs(resp.meta?.generated_at as any));
      chart.update('none');
      return;
    }

    // Hay series → construir datasets normalmente
    const datasets = series.map(s => {
      const c = cmap.get(s.reader_id) ?? this.pickColor(cmap, s.reader_id);
      return {
        label: nameById.get(s.reader_id) ?? s.reader_id,
        data: s.points.map(([t, q]) => ({ x: this.toMs(t as any), y: q })),
        borderColor: c.stroke,
        backgroundColor: c.fill,
        fill: true
      };
    });

    chart.data.datasets = datasets as any;

    const x: any = (chart.options.scales!.x ??= {});
    x.distribution = 'linear';
    x.time = { ...(x.time || {}), unit: 'minute', stepSize: stepMin, tooltipFormat: 'PPpp', displayFormats: { minute: 'HH:mm' } };
    x.min = fromMs;
    x.max = toMsVal;
    x.ticks = { ...(x.ticks || {}), maxTicksLimit: Math.min(72, Math.ceil((toMsVal - fromMs) / (stepMin * 60 * 1000))) };

    chart.update('none');

    this.legends[i] = readers.map(r => {
      const c = cmap.get(r.id) ?? this.pickColor(cmap, r.id);
      return { name: nameById.get(r.id) ?? r.id, color: c.stroke };
    });
    this.lastUpdated[i] = new Date(this.toMs(resp.meta?.generated_at as any));
  }

  // estado por índice
  //charts: Chart[] = [];
  //legends: { name: string; color: string }[][] = [];
  //lastUpdated: (Date | undefined)[] = [];
  private colorByReaderMaps: Map<string, { stroke: string; fill: string }>[] = [];
  
  // Paleta fija (R, G, B)
  private palette = [
    { stroke: 'rgb(220,53,69)', fill: 'rgba(220,53,69,0.15)' },  // rojo
    { stroke: 'rgb(40,167,69)', fill: 'rgba(40,167,69,0.15)' },  // verde
    { stroke: 'rgb(0,123,255)', fill: 'rgba(0,123,255,0.15)' },  // azul
    { stroke: 'rgb(111,66,193)', fill: 'rgba(111,66,193,0.15)' }, // violeta
    { stroke: 'rgb(23,162,184)', fill: 'rgba(23,162,184,0.15)' }, // cian
    { stroke: 'rgb(255,193,7)', fill: 'rgba(255,193,7,0.15)' },  // amarillo
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

  private buildLast5Chart(row: number, cs: string, points: Point[]) {
    const i = this.idx3(row, 0);               // índice absoluto del chart "Últimos 5"
    const chart = this.charts[i];
    if (!chart) return;

    const toX = (p: Point) => p.dateend * 1000;

    // ---- colores por reader (usa tu paleta y el mapa por gráfico) ----
    const allReaders = Array.from(
      points.reduce((acc, p) => {
        Object.keys(p.readers || {}).forEach(r => acc.add(r));
        return acc;
      }, new Set<string>())
    ).sort();

    // asegurá colores estables para estos readers en el gráfico i
    this.ensureReaderColorsAt(i, allReaders.map(id => ({ id })));
    const cmap = this.colorByReaderMaps[i];

    // ---- datasets ----
    const datasets: any[] = [];

    // 1) Serie total (naranja)
    datasets.push({
      label: 'ECM total',
      data: points.map(p => ({ x: toX(p), y: p.ecm_total })),
      borderColor: 'rgb(255,159,64)',
      backgroundColor: 'rgba(255,159,64,0.15)',
      borderWidth: 2,
      fill: true,
      tension: 0.3,
      pointRadius: 0
    });

    // 2) Series por reader (con color)
    for (const r of allReaders) {
      const c = cmap.get(r) || { stroke: '#6c757d', fill: 'rgba(108,117,125,0.15)' }; // fallback gris
      datasets.push({
        label: r,
        data: points.map(p => ({ x: toX(p), y: p.readers?.[r]?.count ?? 0 })),
        borderColor: c.stroke,
        backgroundColor: c.fill,
        borderWidth: 2,
        fill: false,
        tension: 0.3,
        pointRadius: 0
      });
    }

    // actualizar chart (parsing:false → usamos {x,y}, sin labels)
    chart.data = { datasets } as any;

    if (points.length) {
      const minX = toX(points[0]);
      const maxX = toX(points[points.length - 1]);
      const x: any = chart.options.scales!.x;
      x.min = minX;
      x.max = maxX;
    }

    chart.update('none');

    // leyenda con colores correctos
    this.legends[i] = datasets.map((d: any) => ({
      name: d.label,
      color: d.borderColor || '#888'
    }));
  }


  private updateSnapshotTable(data: Last5Response) {
    const readersSet = new Set<string>();
    const matrix: { [cs: string]: { [reader: string]: ReaderStats } } = {};

    for (const cs of this.cardservers) {
      const pts = data[cs] || [];
      if (!pts.length) { matrix[cs] = {}; continue; }

      // último por dateend
      const latest = pts.reduce((acc, p) => (!acc || p.dateend > acc.dateend) ? p : acc, pts[0]);

      const row: { [reader: string]: ReaderStats } = {};

      // stats por reader
      if (latest.readers) {
        Object.entries(latest.readers).forEach(([r, st]) => {
          readersSet.add(r);
          row[r] = st as ReaderStats;
        });
      }

      // ---- TOTAL (qtty/avg/min/max/stddev) ----
      let N = 0;
      let sum = 0;        // Σ n * avg
      let sumsq = 0;      // Σ n * (std^2 + avg^2)
      let minAll: number | null = null;
      let maxAll: number | null = null;

      for (const st of Object.values(row)) {
        const n = (st.n_nonzero ?? st.count ?? 0) as number;
        const avg = (st.avg_ms ?? 0) as number;
        const sd = (st.stddev_ms ?? 0) as number;

        if (n > 0) {
          N += n;
          sum += n * avg;
          sumsq += n * (sd * sd + avg * avg);
        }
        if (typeof st.min_ms === 'number') minAll = (minAll === null) ? st.min_ms! : Math.min(minAll, st.min_ms!);
        if (typeof st.max_ms === 'number') maxAll = (maxAll === null) ? st.max_ms! : Math.max(maxAll, st.max_ms!);
      }

      let avgAll: number | null = null;
      let sdAll: number | null = null;
      if (N > 0) {
        avgAll = sum / N;
        const variance = Math.max(0, (sumsq / N) - avgAll * avgAll);
        sdAll = Math.sqrt(variance);
      }

      // Reutilizamos la forma ReaderStats: en TOTAL, "count" = qtty (ecm_total)
      row['TOTAL'] = {
        count: latest.ecm_total ?? 0,
        avg_ms: avgAll,
        min_ms: minAll,
        max_ms: maxAll,
        stddev_ms: sdAll
      } as ReaderStats;

      matrix[cs] = row;
    }

    // Orden de filas: TOTAL primero, luego readers alfabéticos
    const readers = Array.from(readersSet).sort();
    this.tableReaders = ['TOTAL', ...readers];
    this.tableMatrix = matrix;
  }

//------------------
  /** Devuelve el Map de colores, inicializándolo si hace falta */
  private getColorMapAt(i: number) {
    return (this.colorByReaderMaps[i] ??= new Map<string, { stroke: string; fill: string }>());
  }

  private pickColor(cmap: Map<string, { stroke: string; fill: string }>, id: string) {
    const idx = cmap.size % this.palette.length;
    const color = this.palette[idx] ?? { stroke: '#888', fill: 'rgba(136,136,136,0.2)' };
    cmap.set(id, color);
    return color;
  }

  /** Normaliza readers (array/obj/null) y agrega ids que solo aparezcan en series */
  private normalizeReaders(
    input: unknown,
    series?: Array<{ reader_id: string }>
  ): Array<{ id: string; name?: string }> {
    let arr: Array<{ id: string; name?: string }>;
    if (Array.isArray(input)) {
      arr = input;
    } else if (input && typeof input === 'object') {
      arr = Object.entries(input as Record<string, any>).map(([id, v]) => ({
        id,
        name: (v && typeof v === 'object' ? v.name : v) ?? id
      }));
    } else {
      arr = [];
    }
    const have = new Set(arr.map(r => r.id));
    for (const s of series ?? []) if (!have.has(s.reader_id)) arr.push({ id: s.reader_id, name: s.reader_id });
    return arr;
  }




}

