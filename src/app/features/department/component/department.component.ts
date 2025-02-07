import { Component, OnInit } from '@angular/core';
import { DepartmentService } from '../department.service';
import { Department } from '../department.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-department',
  imports: [CommonModule, FormsModule],
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})
export class DepartmentComponent implements OnInit {
  departments: Department[] = []; // Danh sách các phòng ban
  
  // Danh sách trạng thái làm việc của phòng ban
  workStatuses = [
    { id: 1, name: 'Đang hoạt động' },
    { id: 2, name: 'Đã dừng' }
  ];

  newDepartment: Department = this.getEmptyDepartment(); // Biến lưu trữ phòng ban mới hoặc đang chỉnh sửa
  isEditing = false; // Cờ kiểm tra trạng thái chỉnh sửa
  searchTerm = ''; // Biến lưu trữ giá trị tìm kiếm
  validationMessage: string = '';
  departmentToDelete: number | null = null;
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(private departmentService: DepartmentService, private modalService: NgbModal) {}

  ngOnInit() {
    this.loadDepartments(); // Tải danh sách phòng ban khi khởi tạo
    this.setNextDepartmentId(); // Đặt ID cho phòng ban mới
  }

  // Tải danh sách phòng ban từ service và lọc theo từ khóa tìm kiếm
  async loadDepartments() {
    const allDepartments = await this.departmentService.getDepartments();
    this.totalItems = allDepartments.length;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = this.currentPage * this.itemsPerPage;
    this.departments = this.searchTerm.trim()
      ? allDepartments.filter(dept => dept.name.toLowerCase().includes(this.searchTerm.toLowerCase())).slice(startIndex, endIndex)
      : allDepartments.slice(startIndex, endIndex);
    this.sortDepartments();
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
      this.sortDirection = field === 'id' ? 'desc' : 'asc'; 
    }
    this.sortDepartments();
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
    this.newDepartment.workStatus = this.workStatuses.find(status => status.id === statusId) || this.workStatuses[0];
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

  // Xử lý tìm kiếm khi giá trị từ khóa thay đổi
  onSearchTermChange() {
    this.loadDepartments();
  }

  // Khởi tạo một đối tượng phòng ban rỗng
  private getEmptyDepartment(): Department {
    return { id: 0, name: '', description: '', workStatus: this.workStatuses[0] };
  }

  // Đặt lại biểu mẫu sau khi thêm hoặc cập nhật phòng ban
  private resetForm() {
    this.isEditing = false;
    this.newDepartment = this.getEmptyDepartment();
    this.setNextDepartmentId();
  }

  goToFirstPage() {
    this.currentPage = 1;
    this.loadDepartments();
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadDepartments();
    }
  }

  goToNextPage() {
    if (this.currentPage * this.itemsPerPage < this.totalItems) {
      this.currentPage++;
      this.loadDepartments();
    }
  }

  goToLastPage() {
    this.currentPage = Math.ceil(this.totalItems / this.itemsPerPage);
    this.loadDepartments();
  }
}
