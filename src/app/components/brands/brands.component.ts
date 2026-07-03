import { Component, ElementRef, OnInit, ViewChild, ViewContainerRef, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BrandsService } from './brands.service';
import { ConfirmationComponent } from 'src/app/core/shared/components/confirmation/confirmation.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-brands',
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.css']
})
export class BrandsComponent implements OnInit {
  @ViewChild('closeModal') closeModal: ElementRef;

  brands: any[] = [];
  brandForm: FormGroup;
  editPopup: boolean = false;
  formSubmissionFlag: boolean = false;
  isEditMode: boolean = false;
  originalBrand: string = ''; // brand key used in PUT/DELETE
  serverError: string = '';

  constructor(
    private brandsService: BrandsService,
    private cdr: ChangeDetectorRef,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnInit(): void {
    this.setForm();
    this.getBrands();
  }

  setForm() {
    this.brandForm = new FormGroup({
      brand: new FormControl('', [Validators.required, Validators.minLength(2)]),
      description: new FormControl(''),
    });
  }

  async getBrands() {
    this.brandsService.getBrands().then((data: any) => {
      this.brands = data || [];
      this.cdr.detectChanges();
    }).catch((err: any) => {
      console.error('Error loading brands', err);
    });
  }

  openNew() {
    this.isEditMode = false;
    this.originalBrand = '';
    this.serverError = '';
    this.brandForm.reset();
    this.editPopup = true;
  }

  openEdit(item: any) {
    this.isEditMode = true;
    this.originalBrand = item.brand;
    this.serverError = '';
    this.brandForm.patchValue({
      brand: item.brand,
      description: item.description || ''
    });
    this.editPopup = true;
  }

  closeForm() {
    this.editPopup = false;
    this.brandForm.reset();
    this.serverError = '';
  }

  save() {
    if (this.brandForm.invalid) {
      this.brandForm.markAllAsTouched();
      return;
    }
    this.formSubmissionFlag = true;
    this.serverError = '';
    const payload = {
      brand: this.brandForm.value.brand?.trim(),
      description: this.brandForm.value.description?.trim() || ''
    };

    if (this.isEditMode) {
      this.brandsService.updateBrand(this.originalBrand, payload).then(() => {
        this.formSubmissionFlag = false;
        this.closeForm();
        this.getBrands();
        Swal.fire({ title: '', text: 'Marca actualizada correctamente', icon: 'success', confirmButtonText: 'Cerrar' });
      }).catch((err: any) => {
        this.formSubmissionFlag = false;
        this.serverError = err?.errmessage || err?.message || 'Error al actualizar la marca';
      });
    } else {
      this.brandsService.addBrand(payload).then(() => {
        this.formSubmissionFlag = false;
        this.closeForm();
        this.getBrands();
        Swal.fire({ title: '', text: 'Marca creada correctamente', icon: 'success', confirmButtonText: 'Cerrar' });
      }).catch((err: any) => {
        this.formSubmissionFlag = false;
        this.serverError = err?.errmessage || err?.message || 'Error al crear la marca';
      });
    }
  }

  delete(item: any) {
    const dialogRef = this.viewContainer.createComponent(ConfirmationComponent);
    dialogRef.instance.visible = true;
    dialogRef.instance.action.subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.brandsService.deleteBrand(item.brand).then(() => {
          dialogRef.instance.visible = false;
          this.getBrands();
          Swal.fire({ title: '', text: 'Marca eliminada correctamente', icon: 'success', confirmButtonText: 'Cerrar' });
        }).catch((err: any) => {
          dialogRef.instance.visible = false;
          Swal.fire({
            title: 'Error',
            text: err?.errmessage || err?.message || 'Error al eliminar la marca',
            icon: 'error',
            confirmButtonText: 'Cerrar'
          });
        });
      }
    });
  }

  trackByBrand(index: number, item: any): string {
    return item.brand;
  }

  get f() { return this.brandForm.controls; }
}
