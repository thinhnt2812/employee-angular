import { Component, OnInit } from '@angular/core';
import { DepartmentService } from '../department.service';
import { Department, DepartmentConstants } from '../department.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaginationComponent } from '../../../shared/pagination/pagination.component'; 
import { Router, ActivatedRoute } from '@angular/router'; 

@Component({
  selector: 'app-department',
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})
export class DepartmentComponent implements OnInit {
  departments: Department[] = []; // Danh sách các phòng ban
  
  // Danh sách trạng thái làm việc của phòng ban
  workStatuses = DepartmentConstants.getStatuses();

  newDepartment: Department = this.getEmptyDepartment(); // Biến lưu trữ phòng ban mới hoặc đang chỉnh sửa
  isEditing = false; // Cờ kiểm tra trạng thái chỉnh sửa
  searchTerm = ''; // Biến lưu trữ giá trị tìm kiếm
  validationMessage: string = ''; // Thông báo xác thực
  departmentToDelete: number | null = null; // ID phòng ban cần xóa
  sortField: string = ''; // Trường sắp xếp
  sortDirection: 'asc' | 'desc' = 'asc'; // Hướng sắp xếp
  currentPage = 1; // Trang hiện tại
  itemsPerPage = 10; // Số mục trên mỗi trang
  totalItems = 0; // Tổng số mục
  selectedStatus: number | null = null; // Trạng thái làm việc được chọn

  constructor(private departmentService: DepartmentService, private modalService: NgbModal, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.currentPage = +params['page'] || 1;
      this.itemsPerPage = +params['icpp'] || 10;
      const sortDirection = params['sort'] || 'asc';
      const sortAttribute = params['direction'] || 'id';
      this.sortField = sortAttribute;
      this.sortDirection = sortDirection;
      this.loadDepartments();
    });
    this.setNextDepartmentId(); // Đặt ID cho phòng ban mới
  }

  // Tải danh sách phòng ban từ service và lọc theo từ khóa tìm kiếm
  async loadDepartments() {
    const allDepartments = await this.departmentService.getDepartments();
    const filteredDepartments = this.selectedStatus !== null
      ? allDepartments.filter(dept => dept.workStatus.id === this.selectedStatus)
      : allDepartments;
    this.totalItems = filteredDepartments.length;
    this.departments = this.searchTerm.trim()
      ? filteredDepartments.filter(dept => dept.name.toLowerCase().includes(this.searchTerm.toLowerCase()))
      : filteredDepartments;
    this.sortDepartments();
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.departments = this.departments.slice(startIndex, endIndex);
    this.updateUrl();
  }

  // Sắp xếp danh sách phòng ban theo trường và hướng sắp xếp
  sortDepartments() {
    if (this.sortField) {
      this.departments.sort((a, b) => {
        const fieldA = this.getFieldValue(a, this.sortField);
        const fieldB = this.getFieldValue(b, this.sortField);
        if (fieldA < fieldB) return this.sortDirection === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
  }

  // Lấy giá trị của một trường từ một đối tượng
  getFieldValue(obj: any, field: string) {
    return field.split('.').reduce((o, key) => (o && o[key] !== 'undefined') ? o[key] : null, obj);
  }

  // Đặt trường và hướng sắp xếp mới
  setSortField(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc'; 
    }
    this.loadDepartments();
  }

  // Xác định ID tiếp theo cho phòng ban mới nếu không ở chế độ chỉnh sửa
  async setNextDepartmentId() {
    if (!this.isEditing) {
      this.newDepartment.id = await this.departmentService.getNextDepartmentId();
    }
  }

  // Thêm hoặc cập nhật phòng ban, sau đó đóng modal
  async addOrUpdateDepartment(modal: any) {
    if (!this.newDepartment.name.trim() || !this.newDepartment.description.trim()) {
      this.validationMessage = 'Vui lòng nhập đầy đủ thông tin.';
      return;
    }
    this.validationMessage = '';
    if (this.isEditing) {
      await this.departmentService.updateDepartment(this.newDepartment);
      const index = this.departments.findIndex(dept => dept.id === this.newDepartment.id);
      if (index !== -1) this.departments[index] = { ...this.newDepartment };
      this.isEditing = false;
    } else {
      await this.departmentService.addDepartment({ ...this.newDepartment });
      this.departments.unshift({ ...this.newDepartment });
    }
    this.resetForm();
    modal.close();
  }

  // Xóa phòng ban dựa trên ID
  async deleteDepartment(id: number) {
    await this.departmentService.deleteDepartment(id);
    this.loadDepartments();
    this.setNextDepartmentId();
  }

  // Chỉnh sửa thông tin phòng ban
  editDepartment(department: Department, content: any) {
    this.newDepartment = { ...department };
    this.isEditing = true;
    this.setWorkStatus(department.workStatus.id);
    this.openModal(content);
  }

  // Cập nhật trạng thái làm việc của phòng ban
  setWorkStatus(statusId: number) {
    const status = this.workStatuses.find(status => status.value === statusId) || this.workStatuses[0];
    this.newDepartment.workStatus = { id: status.value, name: status.label };
  }

  // Mở modal để thêm hoặc chỉnh sửa phòng ban
  openModal(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  // Đóng modal và đặt lại biểu mẫu
  closeModal(modal: any) {
    modal.close();
    this.resetForm();
  }

  // Mở modal xác nhận xóa phòng ban
  openDeleteModal(id: number, content: any) {
    this.departmentToDelete = id;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  // Xác nhận xóa phòng ban
  async confirmDelete(modal: any) {
    if (this.departmentToDelete !== null) {
      await this.departmentService.deleteDepartment(this.departmentToDelete);
      this.loadDepartments();
      this.setNextDepartmentId();
      this.departmentToDelete = null;
      modal.close();
    }
  }

  // Xác nhận tìm kiếm
  confirmSearchTerm() {
    this.loadDepartments();
  }

  // Xử lý thay đổi giá trị tìm kiếm
  onSearchTermChange() {
    if (!this.searchTerm.trim()) {
      this.loadDepartments();
    }
  }

  // Xử lý thay đổi trạng thái làm việc
  onStatusChange() {
    // Không cần đặt cờ
  }

  // Xác nhận thay đổi trạng thái làm việc
  confirmStatusChange() {
    this.loadDepartments();
  }

  // Khởi tạo một đối tượng phòng ban rỗng
  private getEmptyDepartment(): Department {
    return { id: 0, name: '', description: '', workStatus: { id: this.workStatuses[0].value, name: this.workStatuses[0].label } };
  }

  // Đặt lại biểu mẫu sau khi thêm hoặc cập nhật phòng ban
  private resetForm() {
    this.isEditing = false;
    this.newDepartment = this.getEmptyDepartment();
    this.setNextDepartmentId();
  }

  // Hàm này cập nhật URL với tham số trang hiện tại và số bản ghi trên trang
  private updateUrl(): void {
    this.router.navigate([], {
      queryParams: { page: this.currentPage, icpp: this.itemsPerPage, direction: this.sortField, sort: this.sortDirection },
      queryParamsHandling: 'merge'
    });
  }

  // Hàm này xử lý thay đổi trang
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDepartments();
  }

  // Lấy biểu tượng sắp xếp
  getSortIcon(field: string): string {
    if (this.sortField === field) {
      return this.sortDirection === 'asc' ? 'fa-arrow-up' : 'fa-arrow-down';
    }
    return 'fa-arrows-up-down';
  }
}
