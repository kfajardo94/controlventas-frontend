import { Component, OnInit } from '@angular/core';
import {Producto} from '../../bo/Producto';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Services} from '../../services/Services';
import {NgbModal, NgbPagination, NgbPaginationConfig} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss']
})
export class ProductosComponent implements OnInit {

  productos: Producto[];
  form = new FormGroup({});
  formFiltros = new FormGroup({});
  formFiltrosBK = new FormGroup({});
  type: string;
  mensaje: string;
  modo: number;
  deshabilitarBotones = false;
  mostrarMensaje = false;
  pagination: NgbPagination;
  filtroCerrado: boolean;
  nombreAccion: string;

  constructor(private modalService: NgbModal,
              private service: Services) {
    this.productos = [];
    this.type = '';
    this.mensaje = '';
    this.nombreAccion = '';
    this.modo = 0;
    this.deshabilitarBotones = false;
    this.mostrarMensaje = false;
    this.pagination = new NgbPagination(new NgbPaginationConfig());
    this.pagination.page = 0;
    this.pagination.pageSize = 10;
    this.pagination.maxSize = 10;
    this.form = new FormGroup({
      id: new FormControl(''),
      nombre: new FormControl('', Validators.required),
      codigo: new FormControl('', Validators.required),
      descripcion: new FormControl('', Validators.required),
      precio: new FormControl('', Validators.required),
      tipoProducto: new FormControl('', Validators.required),
      imagen: new FormControl('', Validators.required)
    });

    this.formFiltros = new FormGroup({
      id: new FormControl(''),
      codigo: new FormControl(''),
      nombre: new FormControl('')
    });

    this.formFiltrosBK = new FormGroup({
      id: new FormControl(''),
      codigo: new FormControl(''),
      nombre: new FormControl('')
    });

    this.filtroCerrado = true;
  }

  ngOnInit(): void {
    this.getValuesByPage('', '', this.pagination.page, this.pagination.pageSize);
  }

  modal(content: any, modo: number, item: any): void {
    this.modo = modo;
    this.deshabilitarBotones = false;
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      }, (reason) => {
      }
    );

    const inputDescripcion = document.getElementById('inputDescripcion');
    if (inputDescripcion) {
      inputDescripcion.focus();
    }

    if (this.modo === 1) {
      this.nombreAccion = 'Agregar';
      this.form = new FormGroup({
        id: new FormControl(''),
        nombre: new FormControl('', Validators.required),
        codigo: new FormControl('', Validators.required),
        descripcion: new FormControl('', Validators.required),
        precio: new FormControl('', Validators.required),
        tipoProducto: new FormControl('', Validators.required),
        imagen: new FormControl('', Validators.required)
      });
    } else if (this.modo === 2) {
      this.nombreAccion = 'Editar';
      this.form = new FormGroup({
        id: new FormControl({value: item.id, disabled: true}),
        nombre: new FormControl(item.nombre, Validators.required),
        codigo: new FormControl(item.codigo, Validators.required),
        descripcion: new FormControl(item.descripcion, Validators.required),
        precio: new FormControl(item.precio, Validators.required),
        tipoProducto: new FormControl(item.tipoProducto.id, Validators.required),
        imagen: new FormControl(item.imagen, Validators.required)
      });
    } else if (this.modo === 3) {
      this.nombreAccion = 'Ver';
      this.form = new FormGroup({
        id: new FormControl({value: item.id, disabled: true}),
        nombre: new FormControl(item.nombre, Validators.required),
        codigo: new FormControl(item.codigo, Validators.required),
        descripcion: new FormControl(item.descripcion, Validators.required),
        precio: new FormControl(item.precio, Validators.required),
        tipoProducto: new FormControl(item.tipoProducto.id, Validators.required),
        imagen: new FormControl(item.imagen, Validators.required)
      });
    }
  }

  modalEliminar(contentEliminar: any, item: any): void {
    this.modalService.open(contentEliminar, { size: 'sm' });
    this.deshabilitarBotones = false;
    this.form = new FormGroup({
      id: new FormControl(''),
      nombre: new FormControl('', Validators.required),
      codigo: new FormControl('', Validators.required),
      descripcion: new FormControl('', Validators.required),
      precio: new FormControl('', Validators.required),
      tipoProducto: new FormControl('', Validators.required),
      imagen: new FormControl('', Validators.required)
    });
  }

  guardar(): void {
    if (this.modo === 1){
      if (this.form && this.form.valid){
        const obj = this.llenarObjeto(this.form);
        this.service.saveEntity('video', obj).subscribe( res => {
          this.type = 'success';
          this.mensaje = 'Registro creado';
          this.deshabilitarBotones = true;
          this.mostrarMensaje = true;
          setTimeout(() => {
            this.modalService.dismissAll();
            this.mostrarMensaje = false;
          } , 1000);
          this.getValuesByPage(this.formFiltrosBK.controls.id.value.toString().trim(),
            this.formFiltrosBK.controls.descripcion.value.toString().trim(), 0, this.pagination.pageSize);
        }, error1 => {
          this.type = 'danger';
          this.mensaje = 'Ha ocurrido un error al insertar los datos';
          this.mostrarMensaje = true;
          setTimeout(() => {
            this.mostrarMensaje = false;
          } , 1500);
          console.error('Error al consumir Post');
        });
      }
    } else if (this.modo === 2){
      if (this.form && this.form.valid){
        const obj = this.llenarObjeto(this.form);
        this.service.editEntity('video', obj).subscribe( res => {
          this.type = 'success';
          this.mensaje = 'Registro modificado';
          this.deshabilitarBotones = true;
          this.mostrarMensaje = true;
          setTimeout(() => {
            this.modalService.dismissAll();
            this.mostrarMensaje = false;
          } , 1000);
          this.getValuesByPage(this.formFiltrosBK.controls.id.value.toString().trim(),
            this.formFiltrosBK.controls.descripcion.value.toString().trim(), 0, this.pagination.pageSize);
        }, error1 => {
          this.type = 'danger';
          this.mensaje = 'Ha ocurrido un error al actualizar los datos';
          this.mostrarMensaje = true;
          setTimeout(() => {
            this.mostrarMensaje = false;
          } , 1500);
          console.error('Error al consumir Post');
        });
      }
    }
  }

  eliminar(): void {
    this.service.deleteEntity('video', this.form.controls.id.value).subscribe(res => {
      this.type = 'success';
      this.mensaje = 'Registro eliminado';
      this.deshabilitarBotones = true;
      this.mostrarMensaje = true;
      setTimeout(() => {
        this.modalService.dismissAll();
        this.mostrarMensaje = false;
      } , 1000);
      this.getValuesByPage(this.formFiltrosBK.controls.id.value.toString().trim(),
        this.formFiltrosBK.controls.descripcion.value.toString().trim(), 0, this.pagination.pageSize);
    }, error => {
      this.type = 'danger';
      this.mensaje = 'Ha ocurrido un error al eliminar el registro';
      this.mostrarMensaje = true;
      setTimeout(() => {
        this.mostrarMensaje = false;
      } , 1500);
      console.error('Error al consumir delete');
    });
  }

  llenarObjeto(form: any): any{
    const obj = {
      id: form.controls.id.value.toString().trim(),
      descripcion: form.controls.descripcion.value.trim(),
      srcImagen: form.controls.srcImagen.value.trim(),
      srcVideo: form.controls.srcVideo.value.trim(),
      fechaCreacion: form.controls.fechaCreacion.value,
    };

    return obj;
  }

  limpiarControls(campo: any): any{
    this.form.controls[campo].setValue(this.form.controls[campo].value.trim());
  }

  getValuesByPage(idValue: any, descripcionValue: string, pageValue: any, sizeValue: any): void{
    this.pagination.page = pageValue + 1;
    const obj = {
      video: {id: idValue, descripcion: descripcionValue},
      page: pageValue,
      size: sizeValue
    };

    this.service.getFromEntityByPage('video', obj).subscribe( res => {
      this.productos = res.content;
      this.pagination.collectionSize = res  .totalElements;
    }, error1 => {
      console.error('Error al consumir Get All');
    });
  }

  changePage(event: any): void {
    this.pagination.page = event;
    this.getValuesByPage(this.formFiltrosBK.controls.id.value.toString().trim(),
      this.formFiltrosBK.controls.descripcion.value.toString().trim(), this.pagination.page, this.pagination.pageSize);
  }

  changeSize(size: any): void {
    this.pagination.pageSize = size;
    this.getValuesByPage(this.formFiltrosBK.controls.id.value.toString().trim(),
      this.formFiltrosBK.controls.descripcion.value.toString().trim(), 0, this.pagination.pageSize);
  }

  limpiarFiltros(): void {
    this.formFiltros = new FormGroup({
      id: new FormControl(''),
      codigo: new FormControl(''),
      nombre: new FormControl('')
    });
  }

  filtrar(collapse: any): void {
    collapse.toggle();
    this.formFiltrosBK = new FormGroup({
      id: new FormControl({value: this.formFiltros.controls.id.value.toString().trim(), disabled: true}),
      codigo: new FormControl({value: this.formFiltros.controls.codigo.value.toString().trim(), disabled: true}),
      nombre: new FormControl({value: this.formFiltros.controls.nombre.value.toString().trim(), disabled: true})
    });
    this.getValuesByPage(this.formFiltros.controls.id.value.toString().trim(),
      this.formFiltros.controls.descripcion.value.toString().trim(), 0, this.pagination.pageSize);
  }
}
