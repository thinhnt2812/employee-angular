import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'category',
  imports: [CommonModule, RouterLink],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
  menuItems = [
    { name: 'Nhiệm vụ', icon: 'fa-solid fa-bars-progress', routerLink: '/task' },
    { name: 'Cài Đặt', icon: 'fa-solid fa-gears', routerLink: '/' }
  ];

  subMenuItems = [
    { name: 'Nhân viên', icon: 'fa-solid fa-users', routerLink: '/employee' },
    { name: 'Phòng ban', icon: 'fa-solid fa-house-user', routerLink: '/department' }
  ];

  selectedMenuItem: number | null = null;
  selectedSubMenuItem: number | null = null;
  showSubMenu: boolean = false;

  ngOnInit() {
    const savedMenuItem = localStorage.getItem('selectedMenuItem');
    const savedSubMenuItem = localStorage.getItem('selectedSubMenuItem');
    if (savedMenuItem !== null) {
      this.selectedMenuItem = +savedMenuItem;
      if (this.menuItems[this.selectedMenuItem].name === 'Cài Đặt') {
        this.showSubMenu = true;
      }
    }
    if (savedSubMenuItem !== null) {
      this.selectedSubMenuItem = +savedSubMenuItem;
    }
  }

  selectMenuItem(index: number) {
    this.selectedMenuItem = index;
    this.selectedSubMenuItem = null;
    localStorage.setItem('selectedMenuItem', index.toString());
    localStorage.removeItem('selectedSubMenuItem');
    if (this.menuItems[index].name === 'Cài Đặt') {
      this.showSubMenu = !this.showSubMenu;
    } else {
      this.showSubMenu = false;
    }
  }

  selectSubMenuItem(index: number) {
    this.selectedSubMenuItem = index;
    localStorage.setItem('selectedSubMenuItem', index.toString());
  }
}
