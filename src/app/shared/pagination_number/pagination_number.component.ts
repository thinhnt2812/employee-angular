import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-paginationnumber',
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination_number.component.html'
})
export class PaginationNumberComponent {
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

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.pageChange.emit(page);
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages = [];
    const maxPagesToShow = 3;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= halfPagesToShow + 1) {
        for (let i = 1; i <= maxPagesToShow; i++) {
          pages.push(i);
        }
        pages.push(-1, totalPages); // -1 will be used as ellipsis
      } else if (this.currentPage >= totalPages - halfPagesToShow) {
        pages.push(1, -1); // -1 will be used as ellipsis
        for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1, -1); // -1 will be used as ellipsis
        for (let i = this.currentPage - halfPagesToShow; i <= this.currentPage + halfPagesToShow; i++) {
          pages.push(i);
        }
        pages.push(-1, totalPages); // -1 will be used as ellipsis
      }
    }

    return pages;
  }

  isEllipsis(page: number): boolean {
    return page === -1;
  }

  isCurrentPage(page: number): boolean {
    return this.currentPage === page;
  }
}
