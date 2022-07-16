import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'controlventas';

  url: string;

  constructor(private router: Router) {
    this.url = this.router.url;

  }


  viajarOpciones(opcion: string): void {
    this.router.navigate([this.url + opcion]);
  }
}
