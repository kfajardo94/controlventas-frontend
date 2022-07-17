import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './views/home/home.component';
import {ProductosComponent} from './views/productos/productos.component';
import {TipoProductoComponent} from './views/tipo-producto/tipo-producto.component';
import {CompraComponent} from './views/compra/compra.component';
import {VentaComponent} from './views/venta/venta.component';
import {ReportesComponent} from './views/reportes/reportes.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'producto', component: ProductosComponent},
  {path: 'tipo-producto', component: TipoProductoComponent},
  {path: 'compra', component: CompraComponent},
  {path: 'venta', component: VentaComponent},
  {path: 'reporte', component: ReportesComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
