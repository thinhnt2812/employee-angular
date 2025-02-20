import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeService } from '../employee.service';
import { Employee, EmployeeConstants } from '../employee.model';
import { PaginationComponent } from '../../../shared/pagination/pagination.component'; 

@Component({
  selector: 'app-employee-management',
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
})
export class EmployeeManagementComponent implements OnInit {
  @ViewChild('employeeModal') employeeModal!: TemplateRef<any>;
  @ViewChild('confirmDeleteModal') confirmDeleteModal!: TemplateRef<any>;
  @ViewChild('validationErrorModal') validationErrorModal!: TemplateRef<any>;

  employeeList: Employee[] = [];
  originalEmployeeList: Employee[] = [];
  currentEmployee: Employee = this.getDefaultEmployee();
  editMode: boolean = false;
  searchKeyword: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  employeeIdToDelete: number | null = null;
  validationErrorMessage: string = '';
  searchConfirmed: boolean = false;
  filterConfirmed: boolean = false;

  sortOrder: { [key: string]: boolean } = {};

  hometowns: string[] = [
    'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'An Giang', 'Bình Dương', 'Bắc Giang', 'Bắc Ninh', 'Bạc Liêu',
    'Bến Tre', 'Bình Định', 'Bình Phước', 'Bình Thuận', 'Cà Mau',
    'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai',
    'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh',
    'Hải Dương', 'Hòa Bình', 'Hậu Giang', 'Hưng Yên', 'Khánh Hòa',
    'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Lâm Đồng', 'Long An',
    'Lào Cai', 'Nam Định', 'Nghệ An', 'Ninh Bình', 'Ninh Thuận',
    'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi',
    'Quảng Ninh', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình',
    'Thái Nguyên', 'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh',
    'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái', 'Bình Dương'
  ];

  gender = EmployeeConstants.getGenders(); // Sử dụng EmployeeConstants
  employeeType = EmployeeConstants.getEmployeeTypes(); // Sử dụng EmployeeConstants
  workStatus = EmployeeConstants.getWorkStatuses(); // Sử dụng EmployeeConstants

  departments: { id: number, name: string }[] = [];

  filterDepartment: number | null = null;
  filterWorkStatus: number | null = null;

  constructor(
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal
  ) {}

  // Hàm này được gọi khi component được khởi tạo
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.currentPage = +params['page'] || 1;
      this.itemsPerPage = +params['icpp'] || 10;
      this.fetchEmployees();
    });
    this.fetchDepartments();
    this.updateSortIconsFromParams();
    this.setDefaultSortParams(); // Thêm dòng này
  }

  // Hàm này lấy danh sách phòng ban từ service
  private fetchDepartments(): void {
    this.employeeService.getDepartments().then(data => {
      this.departments = data
        .filter(dept => dept.workStatus.id === 1)
        .map(dept => ({ id: dept.id, name: dept.name }));
    });
  }

  // Hàm này dùng để theo dõi các phần tử trong danh sách bằng id
  trackById(index: number, item: Employee): number {
    return Number(item.id);
  }

  // Hàm này lấy danh sách nhân viên từ service
  private fetchEmployees(): void {
    this.employeeService.getEmployees().then(data => {
      this.originalEmployeeList = [...data];
      this.totalItems = data.length;
      this.applyInitialSorting();
      this.updateEmployeeList();
    });
  }

  // Hàm này áp dụng sắp xếp ban đầu dựa trên tham số truy vấn
  private applyInitialSorting(): void {
    const direction = this.route.snapshot.queryParamMap.get('Sort') || 'asc';
    const attribute = this.route.snapshot.queryParamMap.get('Direction') as keyof Employee || 'id';
    this.sortOrder[attribute] = direction === 'asc';
    this.originalEmployeeList.sort((a, b) => {
      const valueA = a[attribute] ?? '';
      const valueB = b[attribute] ?? '';
      const order = this.sortOrder[attribute] ? 1 : -1;

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return order * (valueA - valueB);
      } else if (typeof valueA === 'string' && typeof valueB === 'string') {
        return order * valueA.localeCompare(valueB);
      } else {
        return 0;
      }
    });
  }

  // Hàm này cập nhật danh sách nhân viên hiển thị theo trang hiện tại và từ khóa tìm kiếm
  private updateEmployeeList(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const filteredList = this.searchKeyword.trim() ? this.filterEmployees() : this.originalEmployeeList;
    const departmentFilteredList = this.filterDepartment ? filteredList.filter(emp => emp.department === this.filterDepartment) : filteredList;
    const workStatusFilteredList = this.filterWorkStatus ? departmentFilteredList.filter(emp => emp.workStatus === this.filterWorkStatus) : departmentFilteredList;

    const sortedList = this.applySorting(workStatusFilteredList);

    this.employeeList = sortedList.slice(startIndex, endIndex);
    this.totalItems = sortedList.length;
    this.updateUrl();
  }

  // Hàm này áp dụng sắp xếp cho danh sách nhân viên
  private applySorting(employeeList: Employee[]): Employee[] {
    const direction = this.route.snapshot.queryParamMap.get('Sort') || 'asc';
    const attribute = this.route.snapshot.queryParamMap.get('Direction') as keyof Employee || 'id';
    const order = direction === 'asc' ? 1 : -1;

    return employeeList.sort((a, b) => {
      const valueA = a[attribute] ?? '';
      const valueB = b[attribute] ?? '';

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return order * (valueA - valueB);
      } else if (typeof valueA === 'string' && typeof valueB === 'string') {
        return order * valueA.localeCompare(valueB);
      } else {
        return 0;
      }
    });
  }

  // Hàm này lọc danh sách nhân viên theo từ khóa tìm kiếm
  private filterEmployees(): Employee[] {
    const keyword = this.searchKeyword.toLowerCase();
    return this.originalEmployeeList.filter(employee =>
      employee.name.toLowerCase().includes(keyword)
    );
  }

  // Hàm này cập nhật URL với tham số trang hiện tại và số bản ghi trên trang
  private updateUrl(): void {
    this.router.navigate([], {
      queryParams: { page: this.currentPage, icpp: this.itemsPerPage, Direction: this.route.snapshot.queryParamMap.get('Direction'), Sort: this.route.snapshot.queryParamMap.get('Sort') },
      queryParamsHandling: 'merge'
    });
  }

  // Hàm này xử lý thêm mới hoặc cập nhật thông tin nhân viên
  onAddOrUpdate(): void {
    if (Object.values(this.currentEmployee).some(value => value === '' || value === null)) {
      this.validationErrorMessage = 'Vui lòng điền đầy đủ thông tin!';
      return;
    }

    if (!this.validatePhone(this.currentEmployee.phone)) {
      this.validationErrorMessage = 'Số điện thoại phải có đúng 10 chữ số!';
      return;
    }

    if (!this.validateDob(this.currentEmployee.dob)) {
      this.validationErrorMessage = 'Ngày sinh không được lớn hơn ngày hiện tại!';
      return;
    }

    this.currentEmployee.createdAt = this.getVietnamTime();

    this.currentEmployee.gender = Number(this.currentEmployee.gender);
    this.currentEmployee.employeeType = Number(this.currentEmployee.employeeType);
    this.currentEmployee.workStatus = Number(this.currentEmployee.workStatus);
    this.currentEmployee.department = Number(this.currentEmployee.department);

    if (this.editMode) {
      this.employeeService.updateEmployee(this.currentEmployee).then(() => {
        this.fetchEmployees();
        this.resetForm();
        this.modalService.dismissAll(); // Close modal after update
      });
    } else {
      this.employeeService.addEmployee(this.currentEmployee).then(id => {
        this.currentEmployee.id = id as number;
        this.originalEmployeeList.unshift(this.currentEmployee);
        this.totalItems++;
        this.updateEmployeeList();
        this.resetForm();
        this.modalService.dismissAll(); // Close modal after add
      });
    }
  }

  // Hàm này trả về thời gian hiện tại ở Việt Nam
  private getVietnamTime(): string {
    const now = new Date();
    now.setHours(now.getHours() + 7);
    return now.toISOString().replace('T', ' ').substring(0, 19);
  }

  // Hàm này xử lý khi người dùng muốn chỉnh sửa thông tin nhân viên
  onEdit(employee: Employee): void {
    this.editMode = true;
    this.currentEmployee = { ...employee };
    this.openModal();
  }

  // Hàm này xử lý khi người dùng muốn xóa nhân viên
  onDelete(id: number): void {
    this.employeeIdToDelete = id;
    this.modalService.open(this.confirmDeleteModal);
  }

  // Hàm này xác nhận xóa nhân viên
  confirmDelete(): void {
    if (this.employeeIdToDelete !== null) {
      this.employeeService.deleteEmployee(this.employeeIdToDelete).then(() => {
        this.fetchEmployees();
        this.employeeIdToDelete = null;
      });
    }
  }

  // Hàm này xử lý tìm kiếm nhân viên
  onSearch(): void {
    if (this.searchKeyword.trim().length === 0) {
      this.searchConfirmed = false;
      this.currentPage = 1;
      this.updateEmployeeList();
      this.updateUrl();
    }
  }

  // Hàm này xác nhận tìm kiếm nhân viên
  confirmSearch(): void {
    this.searchConfirmed = true;
    this.currentPage = 1;
    this.updateEmployeeList();
    this.updateUrl();
  }

  // Hàm này kiểm tra ngày sinh hợp lệ
  private validateDob(dob: string): boolean {
    return new Date(dob) <= new Date();
  }

  // Hàm này kiểm tra số điện thoại hợp lệ
  private validatePhone(phone: string): boolean {
    return /^\d{10}$/.test(phone);
  }

  // Hàm này đặt lại form về trạng thái mặc định
  private resetForm(): void {
    this.currentEmployee = this.getDefaultEmployee();
    this.editMode = false;
  }

  // Hàm này trả về đối tượng nhân viên mặc định
  private getDefaultEmployee(): Employee {
    return { id: 0, name: '', gender: 0, hometown: '', dob: '', phone: '', employeeType: 0, workStatus: 1, department: 0 };
  }

  // Hàm này sắp xếp nhân viên theo thuộc tính
  sortEmployeesBy(attribute: keyof Employee): void {
    this.sortOrder[attribute] = !this.sortOrder[attribute];
    const order = this.sortOrder[attribute] ? 1 : -1;
    this.employeeList.sort((a, b) => {
      const valueA = a[attribute] ?? '';
      const valueB = b[attribute] ?? '';
      return order * String(valueA).localeCompare(String(valueB));
    });
    this.updateSortIcons(attribute);
    this.updateUrlWithSortParams(attribute, this.sortOrder[attribute] ? 'asc' : 'desc');
  }

  // Hàm này sắp xếp nhân viên theo id giảm dần
  sortEmployeesByIdDesc(): void {
    this.sortOrder['id'] = !this.sortOrder['id'];
    const order = this.sortOrder['id'] ? 1 : -1;
    this.employeeList.sort((a, b) => order * ((Number(b.id) || 0) - (Number(a.id) || 0)));
    this.updateSortIcons('id');
    this.updateUrlWithSortParams('id', this.sortOrder['id'] ? 'asc' : 'desc');
  }

  // Hàm này cập nhật biểu tượng sắp xếp
  private updateSortIcons(attribute: keyof Employee): void {
    const elements = document.querySelectorAll('.employee_info li i');
    elements.forEach(el => el.classList.remove('fa-arrow-up', 'fa-arrow-down'));
    const icon = document.querySelector(`.employee_info li[data-attribute="${attribute}"] i`);
    if (icon) {
      icon.classList.add(this.sortOrder[attribute] ? 'fa-arrow-up' : 'fa-arrow-down');
    }
  }

  // Hàm này sắp xếp nhân viên theo năm sinh
  sortEmployeesByDobYear(): void {
    this.sortOrder['dob'] = !this.sortOrder['dob'];
    const order = this.sortOrder['dob'] ? 1 : -1;
    this.employeeList.sort((a, b) => {
      const dateA = new Date(a.dob).getTime();
      const dateB = new Date(b.dob).getTime();
      return order * (dateB - dateA);
    });
    this.updateSortIcons('dob');
    this.updateUrlWithSortParams('dob', this.sortOrder['dob'] ? 'asc' : 'desc');
  }

  // Hàm này cập nhật URL với tham số sắp xếp
  private updateUrlWithSortParams(attribute: keyof Employee, direction: string): void {
    this.router.navigate([], {
      queryParams: { page: this.currentPage, icpp: this.itemsPerPage, Direction: attribute, Sort: direction },
      queryParamsHandling: 'merge'
    });
  }

  // Hàm này xử lý thay đổi trang
  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateEmployeeList();
    this.updateUrl();
  }

  // Hàm này trả về nhãn giới tính
  getGenderLabel(gender: number): string {
    return EmployeeConstants.getGenderName(gender); // Sử dụng EmployeeConstants
  }

  // Hàm này trả về nhãn loại nhân viên
  getEmployeeTypeLabel(employeeType: number): string {
    return EmployeeConstants.getEmployeeTypeName(employeeType); // Sử dụng EmployeeConstants
  }

  // Hàm này trả về nhãn trạng thái làm việc
  getWorkStatusLabel(workStatus: number): string {
    return EmployeeConstants.getWorkStatusName(workStatus); // Sử dụng EmployeeConstants
  }

  // Hàm này trả về nhãn phòng ban
  getDepartmentLabel(department: number): string {
    const dept = this.departments.find(d => d.id === department);
    return dept ? dept.name : '';
  }

  // Hàm này mở modal thêm mới hoặc chỉnh sửa nhân viên
  openModal(employee?: Employee): void {
    this.validationErrorMessage = '';
    if (employee) {
      this.currentEmployee = { ...employee };
      this.editMode = true;
    } else {
      this.resetForm();
      this.editMode = false;
      this.assignNewId();
    }
    this.modalService.open(this.employeeModal);
  }

  // Hàm này gán id mới cho nhân viên
  private assignNewId(): void {
    const maxId = this.originalEmployeeList.length > 0 ? Math.max(...this.originalEmployeeList.map(e => Number(e.id))) : 0;
    this.currentEmployee.id = maxId + 1;
  }

  // Hàm này mở modal xác nhận xóa nhân viên
  openConfirmDeleteModal(id: number): void {
    this.employeeIdToDelete = id;
    this.modalService.open(this.confirmDeleteModal);
  }

  // Hàm này xử lý khi thay đổi bộ lọc
  onFilterChange(): void {
    this.filterConfirmed = false;
  }

  // Hàm này xác nhận bộ lọc
  confirmFilter(): void {
    this.filterConfirmed = true;
    this.currentPage = 1;
    this.updateEmployeeList();
    this.updateUrl();
  }

  // Hàm này cập nhật biểu tượng sắp xếp từ tham số truy vấn
  private updateSortIconsFromParams(): void {
    const direction = this.route.snapshot.queryParamMap.get('Sort') || 'asc';
    const attribute = this.route.snapshot.queryParamMap.get('Direction') as keyof Employee || 'id';
    this.sortOrder[attribute] = direction === 'asc';
    this.updateSortIcons(attribute);
  }

  // Thêm phương thức này để đặt tham số sắp xếp mặc định
  private setDefaultSortParams(): void {
    const direction = this.route.snapshot.queryParamMap.get('Sort') || 'asc';
    const attribute = this.route.snapshot.queryParamMap.get('Direction') as keyof Employee || 'id';
    this.sortOrder[attribute] = direction === 'asc';
    this.updateUrlWithSortParams(attribute, direction);
  }
}