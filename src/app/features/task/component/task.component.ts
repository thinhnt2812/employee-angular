import { Component, OnInit, ViewChild } from '@angular/core';
import { TaskService } from '../task.service';
import { Task, TaskStatusConstants } from '../task.model';
import { Department } from '../../department/department.model';
import { Employee, } from '../../employee/employee.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { Router, ActivatedRoute } from '@angular/router'; 

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
  statuses = TaskStatusConstants.getStatuses(); // Sử dụng TaskStatusConstants để lấy trạng thái

  newTask: Task = this.getEmptyTask(); // Biến lưu trữ nhiệm vụ mới hoặc đang chỉnh sửa
  isEditing = false; // Cờ kiểm tra trạng thái chỉnh sửa
  searchTerm = ''; // Biến lưu trữ giá trị tìm kiếm
  searchConfirmed = false; // Biến lưu trữ trạng thái xác nhận tìm kiếm
  validationMessage: string = '';
  taskToDelete: number | null = null;
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  selectedDepartment: number | null = null;
  selectedStatus: number | null = null;
  selectedPriority: number | null = null;
  filterConfirmed = false; // Biến lưu trữ trạng thái xác nhận lọc
  notificationMessage: string = '';
  notificationTimeout: any = null;
  assigneeSearchTerm = ''; // Biến lưu trữ giá trị tìm kiếm người xử lý
  filteredEmployees: Employee[] = []; // Danh sách nhân viên đã lọc theo từ khóa tìm kiếm

  @ViewChild('content') modalContent: any;

  constructor(private taskService: TaskService, private modalService: NgbModal, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.searchConfirmed = true; // Mặc định xác nhận tìm kiếm
    this.filterConfirmed = true; // Mặc định xác nhận lọc
    this.loadTasks(); // Tải danh sách nhiệm vụ khi khởi tạo
    this.loadDepartments(); // Tải danh sách phòng ban khi khởi tạo
    this.loadEmployees(); // Tải danh sách nhân viên khi khởi tạo
    this.setNextTaskId(); // Đặt ID cho nhiệm vụ mới
    this.route.queryParams.subscribe(params => {
      this.currentPage = +params['page'] || 1;
      this.itemsPerPage = +params['icpp'] || 10;
      const sortDirection = params['sort'] || 'asc';
      const sortAttribute = params['direction'] || 'id';
      this.sortField = sortAttribute;
      this.sortDirection = sortDirection;
      this.selectedDepartment = params['department'] ? +params['department'] : null;
      this.selectedStatus = params['status'] ? +params['status'] : null;
      this.selectedPriority = params['priority'] ? +params['priority'] : null;
      const taskId = params['taskId'] ? +params['taskId'] : null;
      if (taskId) {
        this.taskService.getTaskById(taskId).then(task => {
          if (task) {
            this.newTask = { ...task };
            this.isEditing = true;
            this.setStatus(task.status.id);
            this.loadEmployeesByDepartment(task.department);
            this.modalService.open(this.modalContent, { ariaLabelledBy: 'modal-basic-title' });
          }
        });
      }
      this.loadTasks();
    });
  }

  // Tải danh sách nhiệm vụ từ service và lọc theo từ khóa tìm kiếm
  async loadTasks() {
    if (!this.searchConfirmed && !this.filterConfirmed) return;
    const allTasks = await this.taskService.getTasks();
    this.totalItems = allTasks.length;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = this.currentPage * this.itemsPerPage;
    this.tasks = allTasks
      .filter(task => 
        (!this.searchTerm.trim() || task.name.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
        (!this.selectedDepartment || task.department === this.selectedDepartment) &&
        (!this.selectedStatus || task.status.id === this.selectedStatus) &&
        (!this.selectedPriority || task.priority === this.selectedPriority)
      )
      .slice(startIndex, endIndex);
    this.sortTasks();
    this.updateUrl();
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
    this.filteredEmployees = this.employees; // Khởi tạo danh sách nhân viên đã lọc
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
    this.updateUrl();
  }

  // Xác định ID tiếp theo cho nhiệm vụ mới nếu không ở chế độ chỉnh sửa
  async setNextTaskId() {
    if (!this.isEditing) {
      this.newTask.id = await this.taskService.getNextTaskId();
    }
  }

  // Thêm hoặc cập nhật nhiệm vụ, sau đó đóng modal
  async addOrUpdateTask(modal: any) {
    if (!this.newTask.name.trim() || !this.newTask.description.trim() || !this.newTask.department || !this.newTask.assignee.trim() || !this.newTask.dueDate.trim() || !this.newTask.status.name.trim()) {
      this.validationMessage = 'Vui lòng nhập đầy đủ thông tin.';
      return;
    }
    const currentDate = new Date();
    const dueDate = new Date(this.newTask.dueDate);
    if (dueDate < currentDate) {
      this.validationMessage = 'Ngày hết hạn không được là ngày trong quá khứ.';
      return;
    }
    this.validationMessage = '';
    if (this.isEditing) {
      await this.taskService.updateTask(this.newTask);
      const index = this.tasks.findIndex(task => task.id === this.newTask.id);
      if (index !== -1) this.tasks[index] = { ...this.newTask };
      this.isEditing = false;
      this.showNotification('Cập nhật thành công');
    } else {
      await this.taskService.addTask({ ...this.newTask });
      this.tasks.unshift({ ...this.newTask });
      this.showNotification('Thêm thành công.');
    }
    this.resetForm();
    modal.close();
    this.loadEmployees(); // Tải lại danh sách nhân viên sau khi thêm hoặc cập nhật nhiệm vụ
    this.modalService.dismissAll(); // Đóng tất cả các modal
    this.removeTaskIdFromUrl(); // Remove task ID from URL
  }

  // Xóa nhiệm vụ dựa trên ID
  async deleteTask(id: number) {
    await this.taskService.deleteTask(id);
    this.loadTasks();
    this.setNextTaskId();
    this.showNotification('Xóa thành công');
  }

  // Chỉnh sửa thông tin nhiệm vụ
  editTask(task: Task, content: any) {
    this.newTask = { ...task };
    this.isEditing = true;
    this.setStatus(task.status.id);
    this.loadEmployeesByDepartment(task.department); // Tải nhân viên theo phòng ban khi chỉnh sửa nhiệm vụ
    this.updateUrlWithTaskId(task.id); // Update URL with task ID
    this.openModal(content);
  }

  // Cập nhật trạng thái của nhiệm vụ
  setStatus(statusId: number) {
    const status = this.statuses.find(status => status.id === statusId) || this.statuses[0];
    this.newTask.status = { id: status.id, name: status.name };
  }

  // Mở modal để thêm hoặc chỉnh sửa nhiệm vụ
  openModal(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
    if (this.employees.length > 5) {
      this.filteredEmployees = this.employees; // Khởi tạo danh sách nhân viên đã lọc
    }
  }

  // Đóng modal và đặt lại biểu mẫu
  closeModal(modal: any) {
    modal.close();
    this.resetForm();
    this.removeTaskIdFromUrl(); // Remove task ID from URL
    this.modalService.dismissAll();
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
      this.showNotification('Xóa thành công');
    }
  }

  // Xử lý tìm kiếm khi giá trị từ khóa thay đổi
  onSearchTermChange() {
    this.searchConfirmed = false;
    if (!this.searchTerm.trim()) {
      this.searchConfirmed = true;
      this.loadTasks();
    }
  }

  // Xác nhận tìm kiếm
  confirmSearch() {
    this.searchConfirmed = true;
    this.loadTasks();
  }

  // Xử lý thay đổi bộ lọc
  onFilterChange() {
    this.filterConfirmed = false;
  }

  // Xác nhận lọc
  confirmFilter() {
    this.filterConfirmed = true;
    this.loadTasks();
    this.updateTotalItems();
    this.updateUrlWithFilters(); // Update URL with filter parameters
  }

  // Xử lý tìm kiếm người xử lý khi giá trị từ khóa thay đổi
  onAssigneeSearchTermChange() {
    if (this.assigneeSearchTerm.trim()) {
      this.filteredEmployees = this.employees.filter(employee =>
        employee.name.toLowerCase().includes(this.assigneeSearchTerm.toLowerCase())
      );
    } else {
      this.filteredEmployees = this.employees; // Show all employees in the department
    }
  }

  // Chọn người xử lý từ gợi ý
  selectAssignee(name: string) {
    this.newTask.assignee = name;
    this.assigneeSearchTerm = name;
    this.filteredEmployees = [];
  }

  // Khởi tạo một đối tượng nhiệm vụ rỗng
  private getEmptyTask(): Task {
    return { id: 0, name: '', description: '', priority: 1, department: 0, dueDate: '', assignee: '', status: { id: 0, name: '' } };
  }

  // Đặt lại biểu mẫu sau khi thêm hoặc cập nhật nhiệm vụ
  private resetForm() {
    this.isEditing = false;
    this.newTask = this.getEmptyTask();
    this.setNextTaskId();
    this.loadEmployees(); // Tải lại danh sách nhân viên khi đặt lại biểu mẫu
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

  // Lấy biểu tượng sắp xếp
  getSortIcon(field: string): string {
    if (this.sortField === field) {
      return this.sortDirection === 'asc' ? 'fa-arrow-down' : 'fa-arrow-up';
    }
    return 'fa-arrows-up-down';
  }

  // Cập nhật URL với tham số trang hiện tại và số bản ghi trên trang
  private updateUrl(): void {
    this.router.navigate([], {
      queryParams: { page: this.currentPage, icpp: this.itemsPerPage, direction: this.sortField, sort: this.sortDirection },
      queryParamsHandling: 'merge'
    });
  }

  private async updateTotalItems() {
    const allTasks = await this.taskService.getTasks();
    this.totalItems = allTasks
      .filter(task => 
        (!this.searchTerm.trim() || task.name.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
        (!this.selectedDepartment || task.department === this.selectedDepartment) &&
        (!this.selectedStatus || task.status.id === this.selectedStatus) &&
        (!this.selectedPriority || task.priority === this.selectedPriority)
      ).length;
  }

  private updateUrlWithTaskId(taskId: number): void {
    this.router.navigate([], {
      queryParams: { taskId: taskId },
      queryParamsHandling: 'merge'
    });
  }

  private removeTaskIdFromUrl(): void {
    this.router.navigate([], {
      queryParams: { taskId: null },
      queryParamsHandling: 'merge'
    });
  }

  private updateUrlWithFilters(): void {
    const queryParams: any = {
      page: this.currentPage,
      icpp: this.itemsPerPage,
      direction: this.sortField,
      sort: this.sortDirection
    };
    if (this.selectedDepartment !== null) queryParams.department = this.selectedDepartment;
    else queryParams.department = null;
    
    if (this.selectedStatus !== null) queryParams.status = this.selectedStatus;
    else queryParams.status = null;
    
    if (this.selectedPriority !== null) queryParams.priority = this.selectedPriority;
    else queryParams.priority = null;

    this.router.navigate([], {
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });
  }

  showNotification(message: string) {
    this.notificationMessage = message;
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    this.notificationTimeout = setTimeout(() => {
      this.notificationMessage = '';
    }, 5000);
  }
}
