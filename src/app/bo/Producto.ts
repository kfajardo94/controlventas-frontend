import {TipoProducto} from './TipoProducto';

export class Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipoProducto: TipoProducto;
  precio: number;
  imagen: string;
  imagenStr: string;
  fechaVencimiento: Date;

  constructor(id: number, codigo: string, nombre: string, descripcion: string, tipoProducto: TipoProducto,
              precio: number, imagen: string, imagenStr: string, fechaVencimiento: Date) {
    this.id = id;
    this.codigo = codigo;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.tipoProducto = tipoProducto;
    this.precio = precio;
    this.imagen = imagen;
    this.imagenStr = imagenStr;
    this.fechaVencimiento = fechaVencimiento;
  }
}
