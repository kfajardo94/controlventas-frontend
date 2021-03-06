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
import { ReportesComponent } from './views/reportes/reportes.component';
import {LoginComponent} from '@akabane1994/login-generico-lib/lib/login/login.component';
import {LoginGenericoLibModule} from '@akabane1994/login-generico-lib';
import {SigninComponent} from '@akabane1994/login-generico-lib/lib/signin/signin.component';
import {RecuperarContraseniaComponent} from '@akabane1994/login-generico-lib/lib/recuperar-contrasenia/recuperar-contrasenia.component';

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
    ReportesComponent,
    LoginComponent,
    SigninComponent,
    RecuperarContraseniaComponent
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
