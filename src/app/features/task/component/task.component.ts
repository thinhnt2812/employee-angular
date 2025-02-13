import { Component, OnInit } from '@angular/core';
import { TaskService } from '../task.service';
import { Task } from '../task.model';
import { Department } from '../../department/department.model';
import { Employee } from '../../employee/employee.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaginationComponent } from '../../../shared/pagination/pagination.component'; // Import PaginationComponent

@Component({
  selector: 'app-task',
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {
  tasks: Task[] = []; // Danh sách các nhiệm vụ
  departments: Department[] = []; // Danh sách các phòng ban
  employees: Employee[] = []; // Danh sách các nhân viên
  
  // Danh sách trạng thái của nhiệm vụ
  statuses = [
    { id: 1, name: 'Mới' },
    { id: 2, name: 'Đang làm' },
    { id: 3, name: 'Đã làm xong' },
    { id: 4, name: 'Đã kiểm tra' },
    { id: 5, name: 'Phản hồi' },
    { id: 6, name: 'Đóng' }
  ];

  newTask: Task = this.getEmptyTask(); // Biến lưu trữ nhiệm vụ mới hoặc đang chỉnh sửa
  isEditing = false; // Cờ kiểm tra trạng thái chỉnh sửa
  searchTerm = ''; // Biến lưu trữ giá trị tìm kiếm
  validationMessage: string = '';
  taskToDelete: number | null = null;
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  selectedDepartment: string = '';
  selectedStatus: number | null = null;
  selectedPriority: number | null = null;

  constructor(private taskService: TaskService, private modalService: NgbModal) {}

  ngOnInit() {
    this.loadTasks(); // Tải danh sách nhiệm vụ khi khởi tạo
    this.loadDepartments(); // Tải danh sách phòng ban khi khởi tạo
    this.loadEmployees(); // Tải danh sách nhân viên khi khởi tạo
    this.setNextTaskId(); // Đặt ID cho nhiệm vụ mới
  }

  // Tải danh sách nhiệm vụ từ service và lọc theo từ khóa tìm kiếm
  async loadTasks() {
    const allTasks = await this.taskService.getTasks();
    this.totalItems = allTasks.length;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = this.currentPage * this.itemsPerPage;
    this.tasks = allTasks
      .filter(task => 
        (!this.searchTerm.trim() || task.name.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
        (!this.selectedDepartment || task.department === +this.selectedDepartment) &&
        (!this.selectedStatus || task.status.id === this.selectedStatus) &&
        (!this.selectedPriority || task.priority === this.selectedPriority)
      )
      .slice(startIndex, endIndex);
    this.sortTasks();
  }

  // Tải danh sách phòng ban từ service và lọc các phòng ban đang hoạt động
  async loadDepartments() {
    const allDepartments = await this.taskService.getDepartments();
    this.departments = allDepartments.filter(department => department.workStatus.id === 1);
  }

  // Lấy tên phòng ban theo ID
  getDepartmentName(departmentId: number): string {
    const department = this.departments.find(dept => dept.id === departmentId);
    return department ? department.name : 'Không xác định';
  }
  
  // Tải danh sách nhân viên từ service
  async loadEmployees() {
    this.employees = await this.taskService.getEmployees();
  }

  // Tải danh sách nhân viên theo phòng ban
  async loadEmployeesByDepartment(departmentId: number) {
    const allEmployees = await this.taskService.getEmployeesByDepartment(departmentId);
    this.employees = allEmployees.filter(employee => employee.workStatus === 1);
  }

  // Sắp xếp danh sách nhiệm vụ theo trường và hướng sắp xếp
  sortTasks() {
    if (this.sortField) {
      this.tasks.sort((a, b) => {
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
    this.sortTasks();
  }

  // Xác định ID tiếp theo cho nhiệm vụ mới nếu không ở chế độ chỉnh sửa
  async setNextTaskId() {
    if (!this.isEditing) {
      this.newTask.id = await this.taskService.getNextTaskId();
    }
  }

  // Thêm hoặc cập nhật nhiệm vụ, sau đó đóng modal
  async addOrUpdateTask(modal: any) {
    if (!this.newTask.name.trim() || !this.newTask.description.trim() || !this.newTask.department || !this.newTask.assignee.trim() || !this.newTask.dueDate.trim()) {
      this.validationMessage = 'Vui lòng nhập đầy đủ thông tin.';
      return;
    }
    this.validationMessage = '';
    if (this.isEditing) {
      await this.taskService.updateTask(this.newTask);
      const index = this.tasks.findIndex(task => task.id === this.newTask.id);
      if (index !== -1) this.tasks[index] = { ...this.newTask };
      this.isEditing = false;
    } else {
      await this.taskService.addTask({ ...this.newTask });
      this.tasks.unshift({ ...this.newTask });
    }
    this.resetForm();
    modal.close();
    this.loadEmployees(); // Load lại danh sách nhân viên sau khi thêm hoặc cập nhật nhiệm vụ
  }

  // Xóa nhiệm vụ dựa trên ID
  async deleteTask(id: number) {
    await this.taskService.deleteTask(id);
    this.loadTasks();
    this.setNextTaskId();
  }

  // Chỉnh sửa thông tin nhiệm vụ
  editTask(task: Task, content: any) {
    this.newTask = { ...task };
    this.isEditing = true;
    this.setStatus(task.status.id);
    this.loadEmployeesByDepartment(task.department); // Load nhân viên theo phòng ban khi chỉnh sửa nhiệm vụ
    this.openModal(content);
  }

  // Cập nhật trạng thái của nhiệm vụ
  setStatus(statusId: number) {
    this.newTask.status = this.statuses.find(status => status.id === statusId) || this.statuses[0];
  }

  // Mở modal để thêm hoặc chỉnh sửa nhiệm vụ
  openModal(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  // Đóng modal và đặt lại biểu mẫu
  closeModal(modal: any) {
    modal.close();
    this.resetForm();
  }

  // Mở modal xác nhận xóa nhiệm vụ
  openDeleteModal(id: number, content: any) {
    this.taskToDelete = id;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  // Xác nhận xóa nhiệm vụ
  async confirmDelete(modal: any) {
    if (this.taskToDelete !== null) {
      await this.taskService.deleteTask(this.taskToDelete);
      this.loadTasks();
      this.setNextTaskId();
      this.taskToDelete = null;
      modal.close();
    }
  }

  // Xử lý tìm kiếm khi giá trị từ khóa thay đổi
  onSearchTermChange() {
    this.loadTasks();
  }

  // Xử lý thay đổi bộ lọc
  onFilterChange() {
    this.loadTasks();
  }

  // Khởi tạo một đối tượng nhiệm vụ rỗng
  private getEmptyTask(): Task {
    return { id: 0, name: '', description: '', priority: 1, department: 0, dueDate: '', assignee: '', status: this.statuses[0] };
  }

  // Đặt lại biểu mẫu sau khi thêm hoặc cập nhật nhiệm vụ
  private resetForm() {
    this.isEditing = false;
    this.newTask = this.getEmptyTask();
    this.setNextTaskId();
    this.loadEmployees(); // Load lại danh sách nhân viên khi đặt lại biểu mẫu
  }

  // Hàm này xử lý thay đổi trang
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTasks();
  }

  // Kiểm tra xem một nhiệm vụ đã quá hạn hay chưa
  isPastDueDate(dueDate: string): boolean {
    const currentDate = new Date();
    const taskDueDate = new Date(dueDate);
    return taskDueDate < currentDate;
  }
}
