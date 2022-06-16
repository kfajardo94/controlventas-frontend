export class TipoProducto {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;

  constructor(id: number, codigo: string, nombre: string, descripcion: string) {
    this.id = id;
    this.codigo = codigo;
    this.nombre = nombre;
    this.descripcion = descripcion;
  }
}
