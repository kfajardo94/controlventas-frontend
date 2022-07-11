import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HeaderComponent} from './views/header/header.component';
import {FooterComponent} from './views/footer/footer.component';
import {HomeComponent} from './views/home/home.component';
import {MatGridListModule} from '@angular/material/grid-list';
import {HttpClientModule} from '@angular/common/http';
import {ProductosComponent} from './views/productos/productos.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TipoProductoComponent} from './views/tipo-producto/tipo-producto.component';
import {DatePipe, DecimalPipe} from '@angular/common';
import { CompraComponent } from './views/compra/compra.component';
import { VentaComponent } from './views/venta/venta.component';
import { CorteCajaComponent } from './views/corte-caja/corte-caja.component';
import { ReportesComponent } from './views/reportes/reportes.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    ProductosComponent,
    TipoProductoComponent,
    CompraComponent,
    VentaComponent,
    CorteCajaComponent,
    ReportesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatGridListModule,
    HttpClientModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [DecimalPipe, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule {

}
