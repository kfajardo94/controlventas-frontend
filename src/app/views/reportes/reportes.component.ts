import { Component, OnInit } from '@angular/core';
import {Factura} from '../../bo/Factura';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {NgbModal, NgbPagination, NgbPaginationConfig} from '@ng-bootstrap/ng-bootstrap';
import {DetalleFactura} from '../../bo/DetalleFactura';
import {Producto} from '../../bo/Producto';
import {Services} from '../../services/Services';
import {DatePipe, DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit {

  facturas: Factura[];
  form = new FormGroup({});
  formDetalle = new FormGroup({});
  formFiltros = new FormGroup({});
  formFiltrosBK = new FormGroup({});
  type: string;
  modo: number;
  pagination: NgbPagination;
  filtroCerrado: boolean;
  nombreAccion: string;
  modalCrud: any;
  modalDataPicker: any;
  fechaSeleccionada: string;
  lstDetalle: DetalleFactura[];
  lstProductos: Producto[];
  saldoCompras: string;
  saldoVentas: string;
  saldoFavor: string;

  constructor(private modalService: NgbModal,
              private service: Services, private decimalPipe: DecimalPipe, private datePipe: DatePipe) {
    this.facturas = [];
    this.type = '';
    this.nombreAccion = '';
    this.modo = 0;
    this.pagination = new NgbPagination(new NgbPaginationConfig());
    this.pagination.page = 0;
    this.pagination.pageSize = 10;
    this.pagination.maxSize = 10;
    this.fechaSeleccionada = '';
    this.lstDetalle = [];
    this.lstProductos = [];
    this.saldoCompras = this.decimalPipe.transform(0, '1.2-2')!.toString();
    this.saldoVentas = this.decimalPipe.transform(0, '1.2-2')!.toString();
    this.saldoFavor = this.decimalPipe.transform(0, '1.2-2')!.toString();
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
      total: new FormControl('', Validators.required)
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

    this.getTotales();

    this.filtroCerrado = true;
  }

  ngOnInit(): void {
    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth()-3);

    const fInicio = this.datePipe.transform(fechaInicio, 'dd/MM/yyyy');
    const fFin = this.datePipe.transform(new Date(), 'dd/MM/yyyy');
    this.getValuesByPage('', '', fInicio ? fInicio.toString() : '', fFin ? fFin.toString() : '', this.pagination.page, this.pagination.pageSize);
  }

  modal(content: any, modo: number, item: any): void {

    this.lstDetalle = [];

    this.modo = modo;
    this.modalCrud = this.modalService.open(content, {windowClass: 'modalPersonalizadoCrud'});
    const inputCodigo = document.getElementById('inputCodigo');
    if (inputCodigo) {
      inputCodigo.focus();
    }

    if (this.modo === 1) {
      this.nombreAccion = 'Agregar';
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
        total: new FormControl('', Validators.required)
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
      obj: {id: idValue, codigo: codigoValue, tipo: ''},
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
    this.getTotales();
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

  async getTotales(){

    const fechaIArray = this.formFiltros.controls.fechaInicio.value.split('/');

    let nuevaFechaIString = '';

    fechaIArray.slice().reverse().forEach((x: any) =>
      nuevaFechaIString += x + '-'
    );

    nuevaFechaIString = nuevaFechaIString.substr(0, nuevaFechaIString.length -1);
    const fechaI = new Date(nuevaFechaIString);

    const fechaFArray = this.formFiltros.controls.fechaFin.value.split('/');

    let nuevaFechaFString = '';

    fechaFArray.slice().reverse().forEach( (x: any) =>
      nuevaFechaFString += x + '-'
    );

    nuevaFechaFString = nuevaFechaFString.substr(0, nuevaFechaFString.length -1);
    const fechaF = new Date(nuevaFechaFString);

    const obj = {
      obj: null,
      fechaInicio: fechaI,
      fechaFin: fechaF,
      page: 0,
      size: 0
    };

    let sCompras: number = 0;
    let sVentas: number = 0;
    let sFavor: number = 0;

    this.saldoCompras = this.decimalPipe.transform(sCompras, '1.2-2')!.toString();
    this.saldoVentas = this.decimalPipe.transform(sVentas, '1.2-2')!.toString();
    this.saldoFavor = this.decimalPipe.transform(sFavor, '1.2-2')!.toString();

    await this.service.getFromEntityAndMethodPromise('factura', 'getTotales', obj).then(res => {
      if (res) {
        for (const obj of res) {
          if (obj.tipo === 'C') {
            sCompras = obj.totalFacturas;
            this.saldoCompras = this.decimalPipe.transform(obj.totalFacturas, '1.2-2')!.toString();
          } else if (obj.tipo === 'V') {
            sVentas = obj.totalFacturas;
            this.saldoVentas = this.decimalPipe.transform(obj.totalFacturas, '1.2-2')!.toString();
          }
        }
      }
    }).catch(reason => {
      console.error(reason)
    });

    this.saldoFavor = this.decimalPipe.transform((sVentas-sCompras), '1.2-2')!.toString();
  }


}
