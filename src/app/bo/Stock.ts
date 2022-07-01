import {Producto} from "./Producto";

export class Stock {
  id: number;
  producto: Producto;
  cantidad: number;
  precioCompra: number;
  fecha: Date;

  constructor(id: number, producto: Producto, cantidad: number, precioCompra: number, fecha: Date) {
    this.id = id;
    this.producto = producto;
    this.cantidad = cantidad;
    this.precioCompra = precioCompra;
    this.fecha = fecha;
  }
}
