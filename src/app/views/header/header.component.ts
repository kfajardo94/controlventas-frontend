import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  title: string;

  constructor(private router: Router) {
    this.title = '';
  }

  ngOnInit(): void {
    if (!this.title) {
      this.title = 'Página Prueba';
    }

  }

  home(): any {
    this.router.navigate(['']);
  }

}
