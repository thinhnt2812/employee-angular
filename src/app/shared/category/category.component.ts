import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'category',
  imports: [CommonModule, RouterLink],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent {
  menuItems = [
    { name: 'Tổng quan', icon: 'fa-regular fa-chart-bar', routerLink: '/comingsoon' },
    { name: 'Nhân viên', icon: 'fa-regular fa-circle-user', routerLink: '/employee' },
    { name: 'Trợ giúp', icon: 'fa-regular fa-handshake', routerLink: '/comingsoon' }
  ];

  selectedMenuItem: number | null = null;

  selectMenuItem(index: number) {
    this.selectedMenuItem = index;  
  }
}
