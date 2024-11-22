import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent  implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {}


navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }

 faqs = [
    {
      question: '¿La aplicación es para mayores de 18 años?',
      answer: 'si, incluso si sos menor te deberias registrar junto con un tutor.'
    },
    {
      question: '¿Como me registro?',
      answer: 'Podes ver un tutorial ingresando a nuestro instagram @imawin_1.'
    },
    {
      question: '¿Imawin tiene algun tipo de beneficio por registrarme?',
      answer: 'No, Imawin no recibe ningun beneficio extra.'
    },
    {
      question: '¿Por que me debo registrar con google?',
      answer: 'Por que google verifica que sea una persona real.'
    }
  ];


}
