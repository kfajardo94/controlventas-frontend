import {Producto} from "./Producto";
import {Factura} from './Factura';

export class DetalleFactura {
  id: number;
  factura: Factura;
  producto: Producto;
  cantidad: number;
  total: number;
  idTemporal!: number;

  constructor(id: number, factura: Factura, producto: Producto, cantidad: number, total: number) {
    this.id = id;
    this.factura = factura;
    this.producto = producto;
    this.cantidad = cantidad;
    this.total = total;
  }
}
