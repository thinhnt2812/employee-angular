import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { CategoryComponent } from './shared/category/category.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, CategoryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'qlnv';
}
