import {Component, HostListener, OnInit} from '@angular/core';
import {Producto} from '../../bo/Producto';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Services} from '../../services/Services';
import {NgbDate, NgbModal, NgbModalRef, NgbPagination, NgbPaginationConfig} from '@ng-bootstrap/ng-bootstrap';
import {TipoProducto} from '../../bo/TipoProducto';
import {DatePipe, DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss']
})
export class ProductosComponent implements OnInit {

  productos: Producto[];
  lstTipoProducto: TipoProducto[];
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
  mostrarImagen: boolean;
  formatoPrecio = '1.2-2';
  modalDataPicker: any;

  constructor(private modalService: NgbModal,
              private service: Services, private decimalPipe: DecimalPipe, private datePipe: DatePipe) {
    this.productos = [];
    this.lstTipoProducto = [];
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
      imagen: new FormControl('', Validators.required),
      fVencimiento: new FormControl('', Validators.required)
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
    this.mostrarImagen = false;
    this.cargarListas();
  }

  ngOnInit(): void {
    this.getValuesByPage('', '', '', this.pagination.page, this.pagination.pageSize);
  }

  modal(content: any, modo: number, item: any): void {
    this.mostrarImagen = false;
    this.modo = modo;
    this.deshabilitarBotones = false;
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      }, (reason) => {
      }
    );

    const inputName = document.getElementById('inputName');
    if (inputName) {
      inputName.focus();
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
        imagen: new FormControl('', Validators.required),
        fVencimiento: new FormControl({value: '', disabled: true}, Validators.required)
      });
    } else if (this.modo === 2) {

      this.nombreAccion = 'Editar';
      this.form = new FormGroup({
        id: new FormControl({value: item.id, disabled: true}),
        nombre: new FormControl(item.nombre, Validators.required),
        codigo: new FormControl(item.codigo, Validators.required),
        descripcion: new FormControl(item.descripcion, Validators.required),
        precio: new FormControl(this.decimalPipe.transform(item.precio.toString(), this.formatoPrecio), Validators.required),
        tipoProducto: new FormControl(item.tipoProducto.id, Validators.required),
        imagen: new FormControl(item.imagenStr, Validators.required),
        fVencimiento: new FormControl({value: this.datePipe.transform(item.fechaVencimiento, 'dd/MM/yyyy'), disabled: true}, Validators.required)
      });

      this.cargarImagenForm(item.imagenStr);
    } else if (this.modo === 3) {

      this.nombreAccion = 'Ver';
      this.form = new FormGroup({
        id: new FormControl({value: item.id, disabled: true}),
        nombre: new FormControl({value: item.nombre, disabled: true}),
        codigo: new FormControl({value: item.codigo, disabled: true}),
        descripcion: new FormControl({value: item.descripcion, disabled: true}),
        precio: new FormControl({value: this.decimalPipe.transform(item.precio.toString(), this.formatoPrecio), disabled: true}),
        tipoProducto: new FormControl({value: item.tipoProducto.id, disabled: true}),
        imagen: new FormControl({value: item.imagenStr, disabled: true}),
        fVencimiento: new FormControl({value: this.datePipe.transform(item.fechaVencimiento, 'dd/MM/yyyy'), disabled: true})
      });
      this.cargarImagenForm( item.imagenStr);
    }

  }

  modalEliminar(contentEliminar: any, item: any): void {
    this.modalService.open(contentEliminar, { size: 'sm' });
    this.deshabilitarBotones = false;
    this.form = new FormGroup({
      id: new FormControl(item.id),
      nombre: new FormControl(item.nombre, Validators.required),
      codigo: new FormControl(item.codigo, Validators.required),
      descripcion: new FormControl(item.descripcion, Validators.required),
      precio: new FormControl(item.precio, Validators.required),
      tipoProducto: new FormControl(item.tipoProducto.id, Validators.required),
      imagen: new FormControl(item.imagenStr, Validators.required),
      fVencimiento: new FormControl({value: this.datePipe.transform(item.fechaVencimiento, 'dd/MM/yyyy'), disabled: true}, Validators.required)
    });
  }

  guardar(): void {

    const request: any = {
      producto : {
        id: this.form.controls.id.value,
        nombre: this.form.controls.nombre.value,
        codigo: this.form.controls.codigo.value
      },
      page: 0,
      size: 0
    };

    this.service.getFromEntityAndMethodString('producto', 'getValidadorUniques', request).subscribe(
      res => {
        if (!res) {
          if (this.modo === 1){
            if (this.form && this.form.valid){
              const obj = this.llenarObjeto(this.form);
              this.service.saveEntity('producto', obj).subscribe( res => {
                this.type = 'success';
                this.mensaje = 'Registro creado';
                this.deshabilitarBotones = true;
                this.mostrarMensaje = true;
                setTimeout(() => {
                  this.modalService.dismissAll();
                  this.mostrarMensaje = false;
                } , 1000);
                this.getValuesByPage(this.formFiltrosBK.controls.id.value.toString().trim(),
                  this.formFiltrosBK.controls.nombre.value.toString().trim(),
                  this.formFiltrosBK.controls.codigo.value.toString().trim(),
                  0, this.pagination.pageSize);
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
              this.service.editEntity('producto', obj).subscribe( res => {
                this.type = 'success';
                this.mensaje = 'Registro modificado';
                this.deshabilitarBotones = true;
                this.mostrarMensaje = true;
                setTimeout(() => {
                  this.modalService.dismissAll();
                  this.mostrarMensaje = false;
                } , 1000);
                this.getValuesByPage(this.formFiltrosBK.controls.id.value.toString().trim(),
                  this.formFiltrosBK.controls.nombre.value.toString().trim(),
                  this.formFiltrosBK.controls.codigo.value.toString().trim(),
                  0, this.pagination.pageSize);
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
        } else{
          this.type = 'danger';
          this.mensaje = res;
          setTimeout(() => {
            this.mostrarMensaje = false;
          } , 1500);
          console.error('Error al consumir servicio');this.mostrarMensaje = true;
        }
      }, error =>{
        console.error(error);
      });

  }

  eliminar(): void {
    this.service.deleteEntity('producto', this.form.controls.id.value).subscribe(res => {
      this.type = 'success';
      this.mensaje = 'Registro eliminado';
      this.deshabilitarBotones = true;
      this.mostrarMensaje = true;
      setTimeout(() => {
        this.modalService.dismissAll();
        this.mostrarMensaje = false;
      } , 1000);
      this.getValuesByPage(this.formFiltrosBK.controls.id.value.toString().trim(),
        this.formFiltrosBK.controls.nombre.value.toString().trim(),
        this.formFiltrosBK.controls.codigo.value.toString().trim(),
        0, this.pagination.pageSize);
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

    let tipoProducto: any = null;

    if (this.lstTipoProducto) {
      tipoProducto = this.lstTipoProducto.find(x => x.id === Number(form.controls.tipoProducto.value.toString()));
    }

    const fechaArray: [] = form.controls.fVencimiento.value.toString().split('/');

    let nuevaFechaString = '';

    fechaArray.slice().reverse().forEach(x =>
      nuevaFechaString += x + '-'
    );

    nuevaFechaString = nuevaFechaString.substr(0, nuevaFechaString.length -1);
    const fecha = new Date(nuevaFechaString);

    const obj = {
      id: form.controls.id.value.toString().trim(),
      nombre: form.controls.nombre.value.trim(),
      codigo: form.controls.codigo.value.trim(),
      descripcion: form.controls.descripcion.value.trim(),
      precio: form.controls.precio.value,
      tipoProducto: tipoProducto,
      imagenStr: form.controls.imagen.value,
      fechaVencimiento: fecha
    };

    return obj;
  }

  limpiarControls(campo: any): any{
    this.form.controls[campo].setValue(this.form.controls[campo].value.trim());
  }

  getValuesByPage(idValue: any, nombreValue: string, codigoValue: string, pageValue: any, sizeValue: any): void{
    this.pagination.page = pageValue + 1;
    const obj = {
      producto: {id: idValue, nombre: nombreValue, codigo: codigoValue},
      page: pageValue,
      size: sizeValue
    };

    this.service.getFromEntityByPage('producto', obj).subscribe( res => {
      this.productos = res.content;
      this.pagination.collectionSize = res  .totalElements;
    }, error1 => {
      console.error('Error al consumir Get All');
    });
  }

  changePage(event: any): void {
    this.pagination.page = event;
    this.getValuesByPage(this.formFiltrosBK.controls.id.value.toString().trim(),
      this.formFiltrosBK.controls.nombre.value.toString().trim(),
      this.formFiltrosBK.controls.codigo.value.toString().trim(),
      this.pagination.page, this.pagination.pageSize);
  }

  changeSize(size: any): void {
    this.pagination.pageSize = size;
    this.getValuesByPage(this.formFiltrosBK.controls.id.value.toString().trim(),
      this.formFiltrosBK.controls.nombre.value.toString().trim(),
      this.formFiltrosBK.controls.codigo.value.toString().trim(),
      0, this.pagination.pageSize);
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
      this.formFiltrosBK.controls.nombre.value.toString().trim(),
      this.formFiltrosBK.controls.codigo.value.toString().trim(),
      0, this.pagination.pageSize);
  }

  cargaArchivo(target: any, event: any) {
    const file = target && target.files ? target.files[0] : null;

    if (file) {
      this.mostrarImagen = true;
      this.getBase64(file).then(
        data => {
          const arrayImage: any = data;
          this.cargarImagenForm(arrayImage);
        }
      )
    }

  }

  getBase64(file: any) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result);
      }
      reader.onerror = error => reject(error);
    });
  }

  cargarListas() {
    this.service.getAllItemsFromEntity('tipoProducto').subscribe( res=> {
      this.lstTipoProducto = res as TipoProducto[];
    });
  }

  cargarImagenForm(arrayImage: any){

    let arrayBase64 = arrayImage.split('base64,')[1].substring(4);
    this.form.controls.imagen.setValue(arrayImage);

    this.mostrarImagen = true;
    setTimeout(() => {
      let obj:any = document.getElementById('imagenProducto');
      obj.setAttribute('src', arrayImage);
    } , 0);
  }


  // teclasHabilitadas(event: any, longitud: number){
  //
  //   // keycodes
  //   // 190 && 110 = .
  //   // 37 = flecha izquierda
  //   // 38 = flecha arriba
  //   // 39 = flecha derecha
  //   // 40 = flecha abajo
  //   // 46 = delete
  //   // 8 = backspace
  //   // 9 = tab
  //   // 122 F11
  //   // 123 F12
  //
  //   const longitudCampo: any = this.form.value['precio'];
  //   console.log('longitudCampo: ', longitudCampo.length);
  //   console.log('event[\'keyCode\']: ', event['altKey']);
  //   return ((event['keyCode']  >= 48 && event['keyCode'] <= 57 && (longitudCampo.length < longitud && !event['shiftKey']))
  //     || (event['keyCode']  >= 96 && event['keyCode'] <= 105 && longitudCampo.length < longitud)
  //     || (event['keyCode'] === 190 && !event['shiftKey'])
  //     || event['keyCode'] === 110
  //     || event['keyCode'] === 8
  //     || event['keyCode'] === 9
  //     || event['keyCode'] === 37
  //     || event['keyCode'] === 38
  //     || event['keyCode'] === 39
  //     || event['keyCode'] === 40
  //     || event['keyCode'] === 46
  //     || event['keyCode'] === 122
  //     || event['keyCode'] === 123) && !event['altKey']
  //     ;
  // }

  longitudCampos(nameField: string, maxIntegerLength: number, form: any) {
    // const longitudCampo: any = form.value[nameField];
    // console.log('longitudCampo: ', longitudCampo.length);

  }

  removeLettersDecimals(nameField: string, maxIntegerLength: number, maxDecimalLength: number, form: any) {
    if (form.value[nameField]) {
      let newValueInteger = '';
      let newValueDecimal = '';
      let containsPoint = false;
      const value = form.value[nameField];
      const lstCharacters = value.toString().split('');
      for (const character of lstCharacters) {
        if (character.match('[0-9]')) {
          if (!containsPoint) {
            if (newValueInteger.length < maxIntegerLength) {
              newValueInteger += character;
            }
          } else {
            if (newValueDecimal.length < maxDecimalLength) {
              newValueDecimal += character;
            }
          }
        } else if (character === '.') {
          containsPoint = true;
        }
      }
      const finalValue = (newValueInteger && newValueInteger.length > 0 ? newValueInteger : '0') + '.' +
        (newValueDecimal && newValueDecimal.length > 0 ? newValueDecimal : '00');
      if (finalValue) {
        // tslint:disable-next-line:radix
        if (Number.parseFloat(finalValue) && Number.parseFloat(finalValue) > 0) {
          form.get(nameField).setValue(Number.parseFloat(finalValue));
        } else {
          form.get(nameField).setValue('0.00');
        }
      } else {
        form.get(nameField).setValue(null);
      }
    }
  }

  onDateSelect(event: any, fieldName: any, form: any) {
    const fecha: any = new Date(event.year, event.month - 1, event.day);
    form.controls[fieldName].setValue(this.datePipe.transform(fecha, 'dd/MM/yyyy'));
    this.modalDataPicker.close();
  }

  modalDatePicker(datePicker: any){
    this.modalDataPicker = this.modalService.open(datePicker, {windowClass : 'modalPersonalizado'});
  }

}
