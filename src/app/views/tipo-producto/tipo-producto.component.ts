import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {NgbModal, NgbPagination, NgbPaginationConfig} from '@ng-bootstrap/ng-bootstrap';
import {Services} from '../../services/Services';
import {TipoProducto} from '../../bo/TipoProducto';
import {error, promise} from 'selenium-webdriver';
import {UrlField} from '../../bo/UrlField';

@Component({
  selector: 'app-tipo-producto',
  templateUrl: './tipo-producto.component.html',
  styleUrls: ['./tipo-producto.component.scss']
})
export class TipoProductoComponent implements OnInit {

  tipoProducto: TipoProducto[];
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
  modalCrud: any;

  constructor(private modalService: NgbModal,
              private service: Services) {
    this.tipoProducto = [];
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
      descripcion: new FormControl('', Validators.required)
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
    this.getValuesByPage('', '', '', this.pagination.page, this.pagination.pageSize);
  }

  modal(content: any, modo: number, item: any): void {
    this.modo = modo;
    this.deshabilitarBotones = false;
    this.modalCrud = this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
    const inputCodigo = document.getElementById('inputCodigo');
    if (inputCodigo) {
      inputCodigo.focus();
    }

    if (this.modo === 1) {
      this.nombreAccion = 'Agregar';
      this.form = new FormGroup({
        id: new FormControl(''),
        nombre: new FormControl('', Validators.required),
        codigo: new FormControl('', Validators.required),
        descripcion: new FormControl('', Validators.required)
      });
    } else if (this.modo === 2) {
      this.nombreAccion = 'Editar';
      this.form = new FormGroup({
        id: new FormControl({value: item.id, disabled: true}),
        nombre: new FormControl(item.nombre, Validators.required),
        codigo: new FormControl(item.codigo, Validators.required),
        descripcion: new FormControl(item.descripcion, Validators.required)
      });
    } else if (this.modo === 3) {
      this.nombreAccion = 'Ver';
      this.form = new FormGroup({
        id: new FormControl({value: item.id, disabled: true}),
        nombre: new FormControl({value: item.nombre, disabled: true}),
        codigo: new FormControl({value: item.codigo, disabled: true}),
        descripcion: new FormControl({value: item.descripcion, disabled: true})
      });
    }
  }

  modalEliminar(contentEliminar: any, item: any): void {
    this.modalService.open(contentEliminar, { size: 'sm' });
    this.deshabilitarBotones = false;
    this.form = new FormGroup({
      id: new FormControl({value: item.id, disabled: true}),
      nombre: new FormControl({value: item.nombre, disabled: true})
    });
  }

  guardar() {
    const request: any = {
      tipoProducto : {
        id: this.form.controls.id.value,
        nombre: this.form.controls.nombre.value,
        codigo: this.form.controls.codigo.value
      },
      page: 0,
      size: 0
    };
    this.modalCrud._windowCmptRef.hostView.rootNodes[0].scrollTop = 0;
    this.service.getFromEntityAndMethodString('tipoProducto', 'getValidadorUniques', request).subscribe(
      res => {
        if (!res) {
          if (this.modo === 1){
            if (this.form && this.form.valid){

              const obj = this.llenarObjeto(this.form);
              this.service.saveEntity('tipoProducto', obj).subscribe( res => {
                this.type = 'success';
                this.mensaje = 'Registro creado';
                this.deshabilitarBotones = true;
                this.mostrarMensaje = true;
                setTimeout(() => {
                  this.modalService.dismissAll();
                  this.mostrarMensaje = false;
                } , 1000);
                this.getValuesByPage(this.formFiltrosBK.controls.id.value.toString().trim(),
                  this.formFiltrosBK.controls.codigo.value.toString().trim(), this.formFiltrosBK.controls.nombre.value.
                  toString().trim(), 0, this.pagination.pageSize);
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
              this.service.editEntity('tipoProducto', obj).subscribe( res => {
                this.type = 'success';
                this.mensaje = 'Registro modificado';
                this.deshabilitarBotones = true;
                this.mostrarMensaje = true;
                setTimeout(() => {
                  this.modalService.dismissAll();
                  this.mostrarMensaje = false;
                } , 1000);
                this.getValuesByPage(this.formFiltrosBK.controls.id.value.toString().trim(),
                  this.formFiltrosBK.controls.codigo.value.toString().trim(), this.formFiltrosBK.controls.nombre.value.toString()
                    .trim(), 0, this.pagination.pageSize);
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
        } else {
          this.type = 'danger';
          this.mensaje = res;
          setTimeout(() => {
            this.mostrarMensaje = false;
          } , 1500);
          console.error('Error al consumir servicio');this.mostrarMensaje = true;

        }
      }, error =>{
        console.error(error);
      }
    );
  }

  async eliminar() {

    let producto = null;
    const fields: UrlField[] = [{
      fieldName: 'idTipoProducto',
      value: this.form.controls.id.value
    }];
    await this.service.getItemsFromEntityByFieldsPromise('producto', 'getByTipoProducto', fields).then( res => {
      producto = res;
      if (producto) {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        this.type = 'danger';
        this.mensaje = 'No se puede eliminar el registro, se encuentra asociado a productos';
        this.mostrarMensaje = true;
        setTimeout(() => {
          this.mostrarMensaje = false;
        } , 2000);
        console.error('Error al consumir delete');
      }
    }).catch( error => {
      console.error('Ha ocurrido un error');
    });

    if (producto) {
      return;
    }

    this.service.deleteEntity('tipoProducto', this.form.controls.id.value).subscribe(res => {
      this.type = 'success';
      this.mensaje = 'Registro eliminado';
      this.deshabilitarBotones = true;
      this.mostrarMensaje = true;
      setTimeout(() => {
        this.modalService.dismissAll();
        this.mostrarMensaje = false;
      } , 1000);
      this.getValuesByPage(this.formFiltrosBK.controls.id.value.toString().trim(),
        this.formFiltrosBK.controls.codigo.value.toString().trim(), this.formFiltrosBK.controls.nombre.value.toString()
          .trim(), 0, this.pagination.pageSize);
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
      nombre: form.controls.nombre.value.trim(),
      codigo: form.controls.codigo.value.trim(),
      descripcion: form.controls.descripcion.value.trim()
    };

    return obj;
  }

  limpiarControls(campo: any, form: any): any{
    form.controls[campo].setValue(form.controls[campo].value.trim());
  }

  getValuesByPage(idValue: any, codigoValue: string, nombreValue: string, pageValue: any, sizeValue: any): void{
    this.pagination.page = pageValue + 1;
    const obj = {
      tipoProducto: {id: idValue, codigo: codigoValue, nombre: nombreValue},
      page: pageValue,
      size: sizeValue
    };

    this.service.getFromEntityByPage('tipoProducto', obj).subscribe( res => {
      this.tipoProducto = res.content;
      this.pagination.collectionSize = res  .totalElements;
    }, error1 => {
      console.error('Error al consumir Get All');
    });
  }

  changePage(event: any): void {
    this.pagination.page = event;
    this.getValuesByPage(this.formFiltrosBK.controls.id.value.toString().trim(),
      this.formFiltrosBK.controls.codigo.value.toString().trim(), this.formFiltrosBK.controls.nombre.value.toString()
        .trim(), this.pagination.page, this.pagination.pageSize);
  }

  changeSize(size: any): void {
    this.pagination.pageSize = size;
    this.getValuesByPage(this.formFiltrosBK.controls.id.value.toString().trim(),
      this.formFiltrosBK.controls.codigo.value.toString().trim(), this.formFiltrosBK.controls.nombre.value.toString()
        .trim(), 0, this.pagination.pageSize);
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
      this.formFiltros.controls.codigo.value.toString().trim(), this.formFiltros.controls.nombre.value.toString().trim(),
      0, this.pagination.pageSize);
  }


  removeLetters(nameField: string, maxIntegerLength: number, form: any) {
    if (form.value[nameField]) {
      let newValueInteger = '';
      const value = form.value[nameField];
      const lstCharacters = value.toString().split('');
      for (const character of lstCharacters) {
        if (character.match('[0-9]')) {
          if (newValueInteger.length < maxIntegerLength) {
            newValueInteger += character;
          }
        }
      }
      const finalValue = (newValueInteger && newValueInteger.length > 0 ? newValueInteger : '0');
      if (finalValue) {
        // tslint:disable-next-line:radix
        if (Number.parseInt(finalValue) && Number.parseInt(finalValue) > 0) {
          // tslint:disable-next-line:radix
          form.get(nameField).setValue(Number.parseInt(finalValue));
        } else {
          form.get(nameField).setValue('0');
        }
      } else {
        form.get(nameField).setValue(null);
      }
    }
  }


}
