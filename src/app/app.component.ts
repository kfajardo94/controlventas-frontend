import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {DatePipe, DecimalPipe} from '@angular/common';
import {Services} from './services/Services';
import {UrlField} from './bo/UrlField';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'controlventas';

  url: string;
  deshabilitarBotones: boolean;
  modalDataPicker: any;
  form = new FormGroup({});
  cierre: any = null;
  formatoPrecio = '1.2-2';

  constructor(private router: Router, private modalService: NgbModal, private datePipe: DatePipe,
              private service: Services, private decimalPipe: DecimalPipe) {
    this.url = this.router.url;
    this.deshabilitarBotones = false;
    this.form = new FormGroup({
      id: new FormControl(''),
      saldoAnterior: new FormControl({value: '', disabled: true}, Validators.required),
      saldoCierre: new FormControl({value: '', disabled: true}, Validators.required),
      fechaHoraCierre: new FormControl({value: this.datePipe.transform(new Date(), 'dd/MM/yyyy'), disabled: true}, Validators.required),
      saldoFavor: new FormControl({value: '', disabled: true}, Validators.required)
    });
  }

  viajarOpciones(opcion: string): void {
    this.router.navigate([this.url + opcion]);
  }

  confirmarCierre(): void {

    const saldoAnterior = Number(this.form.controls.saldoAnterior.value.replaceAll(',', ''));
    const saldoCierre = Number(this.form.controls.saldoCierre.value.replaceAll(',', '')) + Number(this.form.controls.saldoAnterior.value.replaceAll(',', ''));
    const fechaCierre = new Date();
    fechaCierre.setHours(fechaCierre.getHours()-6);

    const obj = {
      id: '',
      fecha: new Date(),
      saldoAnterior: saldoAnterior,
      saldoCierre: saldoCierre,
      fechaHoraCierre: fechaCierre
    };
    this.service.saveEntity('cierreCaja', obj).subscribe(res => {
      this.modalDataPicker.close();
    }, error1 => {
      console.error(error1);
    })

  }

  async cerrarCaja(content: any) {

    this.deshabilitarBotones = false;

    this.router.navigate([this.url + '']);

    const fechaActual = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

    const objFecha = {
      fechaInmediata: fechaActual
    };
    await this.service.getFromEntityAndMethodPromise('cierreCaja', 'getFechaInmediataByFecha', objFecha).then( res =>{
      this.cierre = res;
      if (this.cierre) {
        const fechaHoraCierre = new Date(this.cierre.fechaHoraCierre);
        fechaHoraCierre.setHours(fechaHoraCierre.getHours()+6)
        this.form.controls.fechaHoraCierre.setValue(this.datePipe.transform(fechaHoraCierre, 'dd/MM/yyyy HH:mm:ss'));

        const fecha = this.datePipe.transform(new Date(), 'dd/MM/yyyy');
        const fechaCierre = this.datePipe.transform(this.cierre.fecha, 'dd/MM/yyyy');
        if (fechaCierre === fecha ) {
          this.deshabilitarBotones = true;
          return;
        }
      }
    }).then(error1 => {
      console.error(error1);
    });

    let fechaCierre = null;
    if (this.cierre) {
      const fechaC = new Date(this.cierre.fecha);
      fechaC.setDate(fechaC.getDate()+1);
      fechaCierre= this.datePipe.transform(fechaC,'yyyy-MM-dd');
    }
    let fechaMenorHoy = new Date();
    fechaMenorHoy.setDate(fechaMenorHoy.getDate()-1);
    const fechaMenorHoyValue = this.datePipe.transform(fechaMenorHoy, 'yyyy-MM-dd');
    let obj = {
      obj: null,
      fechaInicio: fechaCierre,
      fechaFin: fechaMenorHoyValue,
      page: 0,
      size: 0
    };

    // MENOR A HOY
    let response:[] = [];
    await this.service.getFromEntityAndMethodPromise('factura', 'getTotales', obj).then( res =>{
      response = res;
    }).then(error1 => {
      console.error(error1);
    });

    this.form.controls.saldoAnterior.setValue(this.decimalPipe.transform(0, this.formatoPrecio));

    if (response) {
      let saldo = this.cierre ? this.cierre.saldoCierre : 0;
      response.forEach( (x: any)=> {

        if (x) {
          if (x.tipo === 'C'){
            saldo -= x.totalFacturas;
          } else if (x.tipo === 'V') {
            saldo += x.totalFacturas;
          }
        }
      });
      this.form.controls.saldoAnterior.setValue(this.decimalPipe.transform(saldo, this.formatoPrecio));
    }

    // IGUAL A HOY

    if (this.deshabilitarBotones) {
      if (this.cierre) {
        this.form.controls.saldoAnterior.setValue(this.decimalPipe.transform(this.cierre.saldoAnterior, this.formatoPrecio));
        this.form.controls.saldoFavor.setValue(this.decimalPipe.transform(this.cierre.saldoCierre, this.formatoPrecio));
        this.form.controls.saldoCierre.setValue(this.decimalPipe.transform(this.cierre.saldoCierre-this.cierre.saldoAnterior, this.formatoPrecio));
        const fechaCierre = new Date(this.cierre.fechaHoraCierre);
        fechaCierre.setHours(fechaCierre.getHours()+6)
        this.form.controls.fechaHoraCierre.setValue(this.datePipe.transform(fechaCierre, 'dd/MM/yyyy HH:mm:ss'));
      }
    } else {

      const objHoy = {
        obj: null,
        fechaInicio: fechaActual,
        fechaFin: fechaActual,
        page: 0,
        size: 0
      };

      let responseHoy:[] = [];
      await this.service.getFromEntityAndMethodPromise('factura', 'getTotales', objHoy).then( res =>{
        responseHoy = res;
      }).then(error1 => {
        console.error(error1);
      });

      this.form.controls.saldoCierre.setValue(this.decimalPipe.transform(0, this.formatoPrecio));

      if (responseHoy) {
        let saldo = 0;
        responseHoy.forEach( (x: any)=> {
          if (x) {
            if (x.tipo === 'C'){
              saldo -= x.totalFacturas;
            } else if (x.tipo === 'V') {
              saldo += x.totalFacturas;
            }
          }
        });
        this.form.controls.saldoCierre.setValue(this.decimalPipe.transform(saldo, this.formatoPrecio));
      }

      const saldoAnterior = this.form.controls.saldoAnterior.value;
      const saldoCierre = this.form.controls.saldoCierre.value;
      const saldoFavor = Number(saldoAnterior.replaceAll(',', '')) + Number(saldoCierre.replaceAll(',', ''));
      this.form.controls.saldoFavor.setValue(this.decimalPipe.transform(saldoFavor, this.formatoPrecio));

    }

    this.modalDataPicker = this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});

  }
}
