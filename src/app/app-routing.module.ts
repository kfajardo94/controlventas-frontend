import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './views/home/home.component';
import {ProductosComponent} from './views/productos/productos.component';
import {TipoProductoComponent} from './views/tipo-producto/tipo-producto.component';
import {StockComponent} from "./views/stock/stock.component";

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'producto', component: ProductosComponent},
  {path: 'tipo-producto', component: TipoProductoComponent},
  {path: 'stock', component: StockComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
