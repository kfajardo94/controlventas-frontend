import {Producto} from "./Producto";
import {Factura} from './Factura';

export class DetalleFactura {
  id: number;
  factura: Factura;
  productoCodigo: string;
  productoNombre: string;
  cantidad: number;
  total: number;
  idTemporal!: number;


  constructor(id: number, factura: Factura, productoCodigo: string, productoNombre: string, cantidad: number, total: number) {
    this.id = id;
    this.factura = factura;
    this.productoCodigo = productoCodigo;
    this.productoNombre = productoNombre;
    this.cantidad = cantidad;
    this.total = total;
  }
}
