import {Component, OnInit} from '@angular/core';
import {Factura} from '../../bo/Factura';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {NgbModal, NgbPagination, NgbPaginationConfig} from '@ng-bootstrap/ng-bootstrap';
import {DetalleFactura} from '../../bo/DetalleFactura';
import {Producto} from '../../bo/Producto';
import {Services} from '../../services/Services';
import {DatePipe, DecimalPipe} from '@angular/common';
import {UrlField} from '../../bo/UrlField';

@Component({
  selector: 'app-venta',
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.scss']
})
export class VentaComponent implements OnInit {

  facturas: Factura[];
  form = new FormGroup({});
  formDetalle = new FormGroup({});
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
  modalDataPicker: any;
  fechaSeleccionada: string;
  lstDetalle: DetalleFactura[];
  lstProductos: Producto[];
  contadorProductos: number;
  mostrarAgregar: boolean;
  cantidadComboProructos: number[];
  errorStock: boolean;
  guardaRegistros: boolean;

  constructor(private modalService: NgbModal,
              private service: Services, private decimalPipe: DecimalPipe, private datePipe: DatePipe) {
    this.facturas = [];
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
    this.fechaSeleccionada = '';
    this.lstDetalle = [];
    this.lstProductos = [];
    this.contadorProductos = 0;
    this.mostrarAgregar = false;
    this.cantidadComboProructos = [];
    this.errorStock = false;
    this.guardaRegistros = false;
    this.form = new FormGroup({
      id: new FormControl(''),
      codigo: new FormControl('', Validators.required),
      descripcion: new FormControl('', Validators.required),
      total: new FormControl(0, Validators.required)
    });

    this.formDetalle = new FormGroup({
      id: new FormControl(''),
      producto: new FormControl('', Validators.required),
      cantidad: new FormControl('', Validators.required),
      total: new FormControl({value: '', disabled: true}, Validators.required)
    });

    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth()-3);

    this.formFiltros = new FormGroup({
      id: new FormControl(''),
      codigo: new FormControl(''),
      fechaInicio: new FormControl({value: this.datePipe.transform(fechaInicio, 'dd/MM/yyyy'), disabled: true}),
      fechaFin: new FormControl({value: this.datePipe.transform(new Date(), 'dd/MM/yyyy'), disabled: true})
    });

    this.formFiltrosBK = new FormGroup({
      id: new FormControl(''),
      codigo: new FormControl(''),
      fechaInicio: new FormControl({value: this.datePipe.transform(fechaInicio, 'dd/MM/yyyy'), disabled: true}),
      fechaFin: new FormControl({value: this.datePipe.transform(new Date(), 'dd/MM/yyyy'), disabled: true})
    });

    this.filtroCerrado = true;
  }

  ngOnInit(): void {
    this.cargarListas();
    this.getCierre();
    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth()-3);

    const fInicio = this.datePipe.transform(fechaInicio, 'dd/MM/yyyy');
    const fFin = this.datePipe.transform(new Date(), 'dd/MM/yyyy');
    this.getValuesByPage('', '', fInicio ? fInicio.toString() : '', fFin ? fFin.toString() : '', this.pagination.page, this.pagination.pageSize);
  }

  async modal(content: any, modo: number, item: any) {
    this.guardaRegistros = false;
    this.cantidadComboProructos = [];

    this.lstDetalle = [];

    this.modo = modo;
    this.deshabilitarBotones = false;
    this.modalCrud = this.modalService.open(content, {windowClass: 'modalPersonalizadoCrud'});

    this.modalCrud.result.then((result: any) => {
      if (this.modo === 1 && !this.guardaRegistros) {
        this.revertirStock();
      }
    }, (reason: any) => {
      if (this.modo === 1 && !this.guardaRegistros) {
        this.revertirStock();
      }
    });

    const inputCodigo = document.getElementById('inputCodigo');
    if (inputCodigo) {
      inputCodigo.focus();
    }

    if (this.modo === 1) {
      this.contadorProductos = 0;
      this.nombreAccion = 'Realizar Venta';
      this.form = new FormGroup({
        id: new FormControl(''),
        codigo: new FormControl('', Validators.required),
        descripcion: new FormControl('', Validators.required),
        total: new FormControl({value: 0, disabled: true}, Validators.required)
      });
      this.formDetalle = new FormGroup({
        id: new FormControl(''),
        producto: new FormControl('', Validators.required),
        cantidad: new FormControl('', Validators.required),
        total: new FormControl({value: '', disabled: true}, Validators.required)
      });
    } else if (this.modo === 2) {
      this.nombreAccion = 'Editar';
      this.form = new FormGroup({
        id: new FormControl({value: item.id, disabled: true}),
        codigo: new FormControl(item.codigo, Validators.required),
        descripcion: new FormControl(item.descripcion, Validators.required),
        total: new FormControl(item.total, Validators.required)
      });
    } else if (this.modo === 3) {
      this.nombreAccion = 'Ver';
      this.form = new FormGroup({
        id: new FormControl({value: item.id, disabled: true}),
        codigo: new FormControl({value: item.codigo, disabled: true}),
        descripcion: new FormControl({value: item.descripcion, disabled: true}),
        total: new FormControl({value: 'Q ' + String(this.decimalPipe.transform(item.total, '1.2-2')), disabled: true})
      });

      const objDetalle = {
        lstDetalle: null,
        detalleFactura: null,
        factura: item,
        page: 0,
        size: 0
      };

      this.service.getFromEntityAndMethod('detalleFactura', 'getByFactura', objDetalle).subscribe( res => {
        this.lstDetalle = res;
      });
    }
  }

  guardar() {
    const request: any = {
      id: this.form.controls.id.value,
      codigo: this.form.controls.codigo.value,
      tipo: 'V',
      descripcion: this.form.controls.descripcion.value,
      fecha: new Date(),
      total: 0
    };
    this.modalCrud._windowCmptRef.hostView.rootNodes[0].scrollTop = 0;
    this.service.getFromEntityAndMethodString('factura', 'getValidadorUniques', request).subscribe(
      res => {
        if (!res) {
          if (this.modo === 1){
            if (this.form && this.form.valid){

              const obj = this.llenarObjeto(this.form);
              this.service.saveEntityPromise('factura', obj).then(res => {
                this.type = 'success';
                this.mensaje = 'Registro creado';
                this.deshabilitarBotones = true;
                this.mostrarMensaje = true;

                this.lstDetalle.forEach( x => {
                  x.factura = res;
                });

                const objDetalle = {
                  lstDetalle: this.lstDetalle,
                  detalleFactura: null,
                  factura: null,
                  page: 0,
                  size: 0
                };

                this.service.saveEntity('detalleFactura', objDetalle).subscribe( res2 => {
                  setTimeout(() => {
                    this.guardaRegistros = true;
                    this.modalService.dismissAll();
                    this.mostrarMensaje = false;
                  } , 1000);
                  this.getValuesByPage(this.formFiltrosBK.controls.id.value.toString().trim(),
                    this.formFiltrosBK.controls.codigo.value.toString().trim(), this.formFiltrosBK.controls.fechaInicio.value.toString()
                      .trim(), this.formFiltrosBK.controls.fechaFin.value.toString(), 0, this.pagination.pageSize);
                }, error1 => {
                  this.type = 'danger';
                  this.mensaje = 'Ha ocurrido un error al insertar los datos';
                  this.mostrarMensaje = true;
                  setTimeout(() => {
                    this.mostrarMensaje = false;
                  } , 1500);
                  console.error('Error al consumir Post');
                });
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
              this.service.editEntity('factura', obj).subscribe(res => {
                this.type = 'success';
                this.mensaje = 'Registro modificado';
                this.deshabilitarBotones = true;
                this.mostrarMensaje = true;
                setTimeout(() => {
                  this.guardaRegistros = true;
                  this.modalService.dismissAll();
                  this.mostrarMensaje = false;
                } , 1000);
                this.getValuesByPage(this.formFiltrosBK.controls.id.value.toString().trim(),
                  this.formFiltrosBK.controls.codigo.value.toString().trim(), this.formFiltrosBK.controls.fechaInicio.value.toString()
                    .trim(), this.formFiltrosBK.controls.fechaFin.value.toString(), 0, this.pagination.pageSize);
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

  llenarObjeto(form: any): any{
    const obj = {
      id: form.controls.id.value.toString().trim(),
      codigo: form.controls.codigo.value,
      tipo: 'V',
      descripcion: form.controls.descripcion.value,
      fecha: new Date(),
      total: form.controls.total.value
    };

    return obj;
  }

  limpiarControls(campo: any, form: any): any{
    form.controls[campo].setValue(form.controls[campo].value.trim());
  }

  getValuesByPage(idValue: any, codigoValue: string, fechaInicio: string, fechaFin: string, pageValue: any, sizeValue: any): void{

    const fechaIArray = fechaInicio.split('/');

    let nuevaFechaIString = '';

    fechaIArray.slice().reverse().forEach(x =>
      nuevaFechaIString += x + '-'
    );

    nuevaFechaIString = nuevaFechaIString.substr(0, nuevaFechaIString.length -1);
    const fechaI = new Date(nuevaFechaIString);

    const fechaFArray = fechaFin.split('/');

    let nuevaFechaFString = '';

    fechaFArray.slice().reverse().forEach(x =>
      nuevaFechaFString += x + '-'
    );

    nuevaFechaFString = nuevaFechaFString.substr(0, nuevaFechaFString.length -1);
    const fechaF = new Date(nuevaFechaFString);

    this.pagination.page = pageValue + 1;
    const obj = {
      obj: {id: idValue, codigo: codigoValue, tipo: 'V'},
      fechaInicio: fechaI,
      fechaFin: fechaF,
      page: pageValue,
      size: sizeValue
    };

    this.service.getFromEntityByPage('factura', obj).subscribe(res => {
      this.facturas = res.content;
      this.pagination.collectionSize = res  .totalElements;
    }, error1 => {
      console.error('Error al consumir Get All');
    });
  }

  changePage(event: any): void {
    this.pagination.page = event;
    this.getValuesByPage(this.formFiltrosBK.controls.id.value.toString().trim(),
      this.formFiltrosBK.controls.codigo.value.toString().trim(), this.formFiltrosBK.controls.fechaInicio.value.toString()
        .trim(), this.formFiltrosBK.controls.fechaFin.value.toString()
        .trim(), this.pagination.page, this.pagination.pageSize);
  }

  changeSize(size: any): void {
    this.pagination.pageSize = size;
    this.getValuesByPage(this.formFiltrosBK.controls.id.value.toString().trim(),
      this.formFiltrosBK.controls.codigo.value.toString().trim(), this.formFiltrosBK.controls.fechaInicio.value.toString()
        .trim(), this.formFiltrosBK.controls.fechaFin.value.toString(), 0, this.pagination.pageSize);
  }

  limpiarFiltros(): void {

    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth()-3);

    const fInicio = this.datePipe.transform(fechaInicio, 'dd/MM/yyyy');
    const fFin = this.datePipe.transform(new Date(), 'dd/MM/yyyy');

    this.formFiltros = new FormGroup({
      id: new FormControl(''),
      codigo: new FormControl(''),
      fechaInicio: new FormControl({value: fInicio, disabled: true}),
      fechaFin: new FormControl({value: fFin, disabled: true})
    });
  }

  filtrar(collapse: any): void {
    collapse.toggle();
    this.formFiltrosBK = new FormGroup({
      id: new FormControl({value: this.formFiltros.controls.id.value.toString().trim(), disabled: true}),
      codigo: new FormControl({value: this.formFiltros.controls.codigo.value.toString().trim(), disabled: true}),
      fechaInicio: new FormControl({value: this.formFiltros.controls.fechaInicio.value.toString().trim(), disabled: true}),
      fechaFin: new FormControl({value: this.formFiltros.controls.fechaFin.value.toString().trim(), disabled: true})
    });
    this.getValuesByPage(this.formFiltros.controls.id.value.toString().trim(),
      this.formFiltros.controls.codigo.value.toString().trim(), this.formFiltrosBK.controls.fechaInicio.value.toString()
        .trim(), this.formFiltrosBK.controls.fechaFin.value.toString(),
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

  modalDatePicker(datePicker: any, fieldName: string){
    this.fechaSeleccionada = fieldName;
    this.modalDataPicker = this.modalService.open(datePicker, {windowClass : 'modalPersonalizado'});
  }
  onDateSelect(event: any, form: any) {
    const fecha: any = new Date(event.year, event.month - 1, event.day);
    form.controls[this.fechaSeleccionada].setValue(this.datePipe.transform(fecha, 'dd/MM/yyyy'));
    this.modalDataPicker.close();
  }

  cargarListas(){
    this.service.getAllItemsFromEntity('producto').subscribe( res =>{
      this.lstProductos = res as Producto[];

    });
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

  async agregarProducto(){

    this.contadorProductos++;
    const idProducto: Number = Number(this.formDetalle.controls.producto.value.toString());
    const cantidadProducto: number = Number.parseInt(this.formDetalle.controls.cantidad.value.toString());
    const precioCompra: any = Number(this.formDetalle.controls.total.value.toString()) * cantidadProducto;

    const producto: Producto = this.lstProductos.find(x => x.id === idProducto) as Producto;

    const factura: any = null;

    let stock: any = null;
    const urlFields: UrlField[] = [{
      fieldName: 'idProducto',
      value: idProducto.toString()
    }];
    this.formDetalle.controls.producto.disable();
    this.formDetalle.controls.cantidad.disable();
    await this.service.getItemsFromEntityByFieldsPromise('stock', 'getByProducto', urlFields).then(res =>{
      stock = res;
    }).catch(error => {
      console.error(error);
    });

    if (stock) {
      stock.cantidad = stock.cantidad - Number(this.formDetalle.controls.cantidad.value);
      if (stock.cantidad < 0){
        this.errorStock = true;
        setTimeout(() => {
          this.errorStock = false;
          const obj = {
            value: idProducto
          };
          this.cargarDatosProducto(obj);
        } , 2000);
        return;
      } else if (stock.cantidad === 0) {
        await this.service.deleteEntity('stock', stock.id).subscribe(res => {
        }, error =>{
          console.error(error);
        });
      } else {
        await this.service.saveEntityPromise('stock', stock).then(res => {
        }).catch(error =>{
          console.error(error);
        });
      }
    } else {
      this.errorStock = true;
      setTimeout(() => {
        this.errorStock = false;
        const obj = {
          value: idProducto
        };
        this.cargarDatosProducto(obj);
      } , 2000);
      return;
    }

    const detalle = new DetalleFactura(0, factura, producto.codigo, producto.nombre, cantidadProducto, precioCompra);
    detalle.idTemporal = this.contadorProductos;

    this.lstDetalle = [...this.lstDetalle, detalle];

    const valorTotalFactura = Number(this.form.controls.total.value) + precioCompra;

    this.form.controls.total.setValue(valorTotalFactura);

    this.formDetalle.controls.producto.enable();
    this.formDetalle.controls.cantidad.enable();

    this.formDetalle = new FormGroup({
      id: new FormControl(''),
      producto: new FormControl('', Validators.required),
      cantidad: new FormControl('', Validators.required),
      total: new FormControl({ value: '', disabled: true }, Validators.required)
    });

    this.cantidadComboProructos = [];
  }

  eliminarDetalle(item: any){

    const valorTotalFactura = Number(this.form.controls.total.value) - Number(item.total);

    this.form.controls.total.setValue(valorTotalFactura);

    const lstDetalleBK = this.lstDetalle;

    this.lstDetalle = [];

    for (const obj of lstDetalleBK) {
      if (item.idTemporal !== obj.idTemporal) {
        this.lstDetalle = [... this.lstDetalle, obj];
      }
    }

    this.formDetalle.controls.producto.setValue('');
    this.formDetalle.controls.cantidad.setValue('');
    this.cantidadComboProructos = [];

    this.revertirStockItem(item);
  }

  async getCierre(){
    this.mostrarAgregar = false;
    const fechaActual = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

    const objFecha = {
      fechaInmediata: fechaActual
    };
    let caja = null;
    await this.service.getFromEntityAndMethodPromise('cierreCaja', 'getFechaInmediataByFecha', objFecha).then( res =>{
      if (res) {
        caja = res;
        let fechaActual:any = new Date();
        fechaActual = this.datePipe.transform(fechaActual, 'dd/MM/yyyy');
        let fechaRes = this.datePipe.transform(res.fecha, 'dd/MM/yyyy');
        if (fechaActual !== fechaRes) {
          this.mostrarAgregar = true;
        }
      }
    }).catch(error1 => {
      console.error(error1);
    });
    if (!caja){
      this.mostrarAgregar = true;
    }
  }

  async cargarDatosProducto(value: any) {
    this.formDetalle.controls.producto.disable();

    const urlFields: UrlField[] = [{
      fieldName: 'id',
      value: value.value
    }];

    this.cantidadComboProructos = [];
    await this.service.getItemsFromEntityByFieldsPromise('producto', 'getById', urlFields).then( (res: any) => {

      this.formDetalle.controls.total.setValue(res ? this.decimalPipe.transform(res.precio, '1.2-2'): '');
      this.formDetalle.controls.cantidad.setValue('');

      this.cantidadComboProructos = [0];
      this.errorStock = true;
      if (res && res.cantidadStock){
        this.errorStock = false;
        this.cantidadComboProructos = [];
        for (let i = 0; i < res.cantidadStock; i++) {
          this.cantidadComboProructos = [...this.cantidadComboProructos, i+1];
        }
      }
      setTimeout(() => {
        this.errorStock = false;
        } , 2000);

      this.formDetalle.controls.producto.enable();
      this.formDetalle.controls.cantidad.enable();
    }).catch(error => {
      this.formDetalle.controls.producto.enable();
      this.formDetalle.controls.cantidad.enable();
      console.error(error)
    });
  }

  async revertirStock(){
    if(this.lstDetalle && this.lstDetalle.length > 0) {
      for (const obj of this.lstDetalle) {

        let producto: any = null;

        const urlFieldsP: UrlField[] = [{
          fieldName: 'codigo',
          value: obj.productoCodigo
        }];

        await this.service.getItemsFromEntityByFieldsPromise('producto', 'getByCodigo', urlFieldsP).then(res =>{
          producto = res;
        }).catch(error => {
          console.error(error);
        });

        let stock: any = null;

        const urlFields: UrlField[] = [{
          fieldName: 'idProducto',
          value: producto ? producto.id : null
        }];
        await this.service.getItemsFromEntityByFieldsPromise('stock', 'getByProducto', urlFields).then(res =>{
          stock = res;
        }).catch(error => {
          console.error(error);
        });

        if (stock) {
          stock.cantidad = stock.cantidad + obj.cantidad;
        } else {
          stock = {
            id: '',
            producto: producto,
            cantidad: 0
          };
          stock.cantidad = stock.cantidad + obj.cantidad;
        }

        await this.service.saveEntityPromise('stock', stock).then(res => {
        }).catch(error =>{
          console.error(error);
        });


      }
    }

  }

  async revertirStockItem(item: any){
    let producto: any = null;

    const urlFieldsP: UrlField[] = [{
      fieldName: 'codigo',
      value: item.productoCodigo
    }];

    await this.service.getItemsFromEntityByFieldsPromise('producto', 'getByCodigo', urlFieldsP).then(res =>{
      producto = res;
    }).catch(error => {
      console.error(error);
    });

    let stock: any = null;

    const urlFields: UrlField[] = [{
      fieldName: 'idProducto',
      value: producto ? producto.id : null
    }];
    await this.service.getItemsFromEntityByFieldsPromise('stock', 'getByProducto', urlFields).then(res =>{
      stock = res;
    }).catch(error => {
      console.error(error);
    });

    if (stock) {
      stock.cantidad = stock.cantidad + item.cantidad;
    } else {
      stock = {
        id: '',
        producto: producto,
        cantidad: 0
      };
      stock.cantidad = stock.cantidad + item.cantidad;
    }

    await this.service.saveEntityPromise('stock', stock).then(res => {
    }).catch(error =>{
      console.error(error);
    });
  }


}
