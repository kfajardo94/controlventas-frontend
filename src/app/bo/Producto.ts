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
  cantidadStock: number;

  constructor(id: number, codigo: string, nombre: string, descripcion: string, tipoProducto: TipoProducto,
              precio: number, imagen: string, imagenStr: string, cantidadStock: number) {
    this.id = id;
    this.codigo = codigo;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.tipoProducto = tipoProducto;
    this.precio = precio;
    this.imagen = imagen;
    this.imagenStr = imagenStr;
    this.cantidadStock = cantidadStock;
  }
}
