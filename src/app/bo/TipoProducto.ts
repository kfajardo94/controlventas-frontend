export class TipoProducto {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;

  constructor(id: number, nombre: string, codigo: string, descripcion: string) {
    this.id = id;
    this.nombre = nombre;
    this.codigo = codigo;
    this.descripcion = descripcion;
  }
}
