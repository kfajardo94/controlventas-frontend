import {Producto} from "./Producto";

export class Factura {
  id: number;
  codigo: string;
  tipo: string;
  descripcion: string;
  fecha: Date;
  total: number;

  constructor(id: number, codigo: string, tipo: string, descripcion: string, fecha: Date, total: number) {
    this.id = id;
    this.codigo = codigo;
    this.tipo = tipo;
    this.descripcion = descripcion;
    this.fecha = fecha;
    this.total = total;
  }
}
