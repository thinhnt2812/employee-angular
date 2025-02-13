import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() itemsPerPage: number = 10;
  @Input() totalItems: number = 0;

  @Output() pageChange = new EventEmitter<number>();

  goToFirstPage(): void {
    this.pageChange.emit(1);
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  goToNextPage(): void {
    if (this.currentPage * this.itemsPerPage < this.totalItems) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  goToLastPage(): void {
    const lastPage = Math.ceil(this.totalItems / this.itemsPerPage);
    this.pageChange.emit(lastPage);
  }
}
