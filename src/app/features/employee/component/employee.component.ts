import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeService } from '../employee.service';
import { Employee } from '../employee.model';

@Component({
  selector: 'app-employee-management',
  imports: [CommonModule, FormsModule],
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

  gender: { id: number, name: string }[] = [
    { id: 1, name: 'Nam' },
    { id: 2, name: 'Nữ' },
    { id: 3, name: 'Khác' }
  ];

  employeeType: { id: number, name: string }[] = [
    { id: 1, name: 'Trưởng phòng' },
    { id: 2, name: 'kế toán' },
    { id: 3, name: 'Nhân viên' }
  ];

  workStatus: { id: number, name: string }[] = [
    { id: 1, name: 'Đang làm' },
    { id: 2, name: 'Đã nghỉ' }
  ];

  departments: { id: number, name: string }[] = [];

  filterDepartment: number | null = null;
  filterWorkStatus: number | null = null;

  constructor(
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    // Hàm này được gọi khi component được khởi tạo
    this.route.queryParams.subscribe(params => {
      this.currentPage = +params['page'] || 1;
      this.fetchEmployees();
    });
    this.fetchDepartments(); // Lấy danh sách phòng ban khi khởi tạo
  }

  private fetchDepartments(): void {
    // Hàm này lấy danh sách phòng ban từ service
    this.employeeService.getDepartments().then(data => {
      this.departments = data
        .filter(dept => dept.workStatus.id === 1) // Chỉ lấy những phòng ban đang hoạt động
        .map(dept => ({ id: dept.id, name: dept.name }));
    });
  }

  trackById(index: number, item: Employee): number {
    // Hàm này dùng để theo dõi các phần tử trong danh sách bằng id
    return Number(item.id);
  }

  private fetchEmployees(): void {
    // Hàm này lấy danh sách nhân viên từ service
    this.employeeService.getEmployees().then(data => {
      this.originalEmployeeList = [...data];
      this.totalItems = data.length;
      this.updateEmployeeList();
    });
  }

  private updateEmployeeList(): void {
    // Hàm này cập nhật danh sách nhân viên hiển thị theo trang hiện tại và từ khóa tìm kiếm
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const filteredList = this.searchKeyword.trim() ? this.filterEmployees() : this.originalEmployeeList;
    const departmentFilteredList = this.filterDepartment ? filteredList.filter(emp => emp.department === this.filterDepartment) : filteredList;
    const workStatusFilteredList = this.filterWorkStatus ? departmentFilteredList.filter(emp => emp.workStatus === this.filterWorkStatus) : departmentFilteredList;
    this.employeeList = workStatusFilteredList.slice(startIndex, endIndex);
    this.totalItems = workStatusFilteredList.length;
    this.updateUrl();
  }

  private filterEmployees(): Employee[] {
    // Hàm này lọc danh sách nhân viên theo từ khóa tìm kiếm
    const keyword = this.searchKeyword.toLowerCase();
    return this.originalEmployeeList.filter(employee =>
      employee.name.toLowerCase().includes(keyword)
    );
  }

  private updateUrl(): void {
    // Hàm này cập nhật URL với tham số trang hiện tại
    this.router.navigate([], {
      queryParams: { page: this.currentPage },
      queryParamsHandling: 'merge'
    });
  }

  onAddOrUpdate(): void {
    // Hàm này xử lý thêm mới hoặc cập nhật thông tin nhân viên
    if (Object.values(this.currentEmployee).some(value => value === '')) {
      this.validationErrorMessage = 'Vui lòng điền đầy đủ thông tin!';
      this.modalService.open(this.validationErrorModal).result.then(
        () => this.openModal(),
        () => this.openModal()
      );
      return;
    }

    if (!this.validatePhone(this.currentEmployee.phone)) {
      this.validationErrorMessage = 'Số điện thoại phải có đúng 10 chữ số!';
      this.modalService.open(this.validationErrorModal).result.then(
        () => this.openModal(),
        () => this.openModal()
      );
      return;
    }

    if (!this.validateDob(this.currentEmployee.dob)) {
      this.validationErrorMessage = 'Ngày sinh không được lớn hơn ngày hiện tại!';
      this.modalService.open(this.validationErrorModal).result.then(
        () => this.openModal(),
        () => this.openModal()
      );
      return;
    }

    // Thêm ngày giờ hiện tại ở Việt Nam vào đối tượng nhân viên
    this.currentEmployee.createdAt = this.getVietnamTime();

    this.currentEmployee.gender = Number(this.currentEmployee.gender);
    this.currentEmployee.employeeType = Number(this.currentEmployee.employeeType);
    this.currentEmployee.workStatus = Number(this.currentEmployee.workStatus);
    this.currentEmployee.department = Number(this.currentEmployee.department);

    if (this.editMode) {
      this.employeeService.updateEmployee(this.currentEmployee).then(() => {
        this.fetchEmployees();
        this.resetForm();
      });
    } else {
      this.employeeService.addEmployee(this.currentEmployee).then(id => {
        this.currentEmployee.id = id as number;
        this.originalEmployeeList.unshift(this.currentEmployee);
        this.totalItems++;
        this.updateEmployeeList();
        this.resetForm();
      });
    }
  }

  private getVietnamTime(): string {
    // Hàm này trả về thời gian hiện tại ở Việt Nam
    const now = new Date();
    now.setHours(now.getHours() + 7); // Điều chỉnh múi giờ UTC+7
    return now.toISOString().replace('T', ' ').substring(0, 19);
  }

  onEdit(employee: Employee): void {
    // Hàm này xử lý khi người dùng muốn chỉnh sửa thông tin nhân viên
    this.editMode = true;
    this.currentEmployee = { ...employee };
    this.openModal();
  }

  onDelete(id: number): void {
    // Hàm này xử lý khi người dùng muốn xóa nhân viên
    this.employeeIdToDelete = id;
    this.modalService.open(this.confirmDeleteModal);
  }

  confirmDelete(): void {
    // Hàm này xác nhận xóa nhân viên
    if (this.employeeIdToDelete !== null) {
      this.employeeService.deleteEmployee(this.employeeIdToDelete).then(() => {
        this.fetchEmployees();
        this.employeeIdToDelete = null;
      });
    }
  }

  onSearch(): void {
    // Hàm này xử lý tìm kiếm nhân viên
    if (this.searchKeyword.trim().length >= 3 || this.searchKeyword.trim().length === 0) {
      this.currentPage = 1;
      this.updateEmployeeList();
      this.updateUrl();
    }
  }

  private validateDob(dob: string): boolean {
    // Hàm này kiểm tra ngày sinh hợp lệ
    return new Date(dob) <= new Date();
  }

  private validatePhone(phone: string): boolean {
    // Hàm này kiểm tra số điện thoại hợp lệ
    return /^\d{10}$/.test(phone);
  }

  private resetForm(): void {
    // Hàm này đặt lại form về trạng thái mặc định
    this.currentEmployee = this.getDefaultEmployee();
    this.editMode = false;
  }

  private getDefaultEmployee(): Employee {
    // Hàm này trả về đối tượng nhân viên mặc định
    return { id: 0, name: '', gender: 0, hometown: '', dob: '', phone: '', employeeType: 0, workStatus: 1, department: 0 };
  }

  sortEmployeesBy(attribute: keyof Employee): void {
    // Hàm này sắp xếp danh sách nhân viên theo thuộc tính
    this.sortOrder[attribute] = !this.sortOrder[attribute];
    const order = this.sortOrder[attribute] ? 1 : -1;
    this.employeeList.sort((a, b) => {
      const valueA = a[attribute] ?? '';
      const valueB = b[attribute] ?? '';
      return order * String(valueA).localeCompare(String(valueB));
    });
  }

  sortEmployeesByIdDesc(): void {
    // Hàm này sắp xếp danh sách nhân viên theo id giảm dần
    this.sortOrder['id'] = !this.sortOrder['id'];
    const order = this.sortOrder['id'] ? 1 : -1;
    this.employeeList.sort((a, b) => order * ((Number(b.id) || 0) - (Number(a.id) || 0)));
  }

  sortEmployeesByDobYear(): void {
    // Hàm này sắp xếp danh sách nhân viên theo năm sinh giảm dần
    this.sortOrder['dob'] = !this.sortOrder['dob'];
    const order = this.sortOrder['dob'] ? 1 : -1;
    this.employeeList.sort((a, b) => {
      const yearA = new Date(a.dob).getFullYear() || 0;
      const yearB = new Date(b.dob).getFullYear() || 0;
      return order * (yearB - yearA);
    });
  }

  goToFirstPage(): void {
    // Hàm này chuyển đến trang đầu tiên
    this.currentPage = 1;
    this.updateEmployeeList();
    this.updateUrl();
  }

  goToPreviousPage(): void {
    // Hàm này chuyển đến trang trước đó
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateEmployeeList();
      this.updateUrl();
    }
  }

  goToNextPage(): void {
    // Hàm này chuyển đến trang tiếp theo
    if (this.currentPage * this.itemsPerPage < this.totalItems) {
      this.currentPage++;
      this.updateEmployeeList();
      this.updateUrl();
    }
  }

  goToLastPage(): void {
    // Hàm này chuyển đến trang cuối cùng
    this.currentPage = Math.ceil(this.totalItems / this.itemsPerPage);
    this.updateEmployeeList();
    this.updateUrl();
  }

  getGenderLabel(gender: number): string {
    // Hàm này trả về nhãn giới tính
    const gend = this.gender.find(d => d.id === gender);
    return gend ? gend.name : '';
  }

  getEmployeeTypeLabel(employeeType: number): string {
    // Hàm này trả về nhãn loại nhân viên
    const eplT = this.employeeType.find(d => d.id === employeeType);
    return eplT ? eplT.name : '';
  }

  getWorkStatusLabel(workStatus: number): string {
    // Hàm này trả về nhãn trạng thái làm việc
    const work = this.workStatus.find(d => d.id === workStatus);
    return work ? work.name : '';
  }

  getDepartmentLabel(department: number): string {
    // Hàm này trả về nhãn phòng ban
    const dept = this.departments.find(d => d.id === department);
    return dept ? dept.name : '';
  }

  openModal(employee?: Employee): void {
    // Hàm này mở modal thêm mới hoặc chỉnh sửa nhân viên
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

  private assignNewId(): void {
    // Hàm này gán id mới cho nhân viên
    const maxId = this.originalEmployeeList.length > 0 ? Math.max(...this.originalEmployeeList.map(e => Number(e.id))) : 0;
    this.currentEmployee.id = maxId + 1;
  }

  openConfirmDeleteModal(id: number): void {
    // Hàm này mở modal xác nhận xóa nhân viên
    this.employeeIdToDelete = id;
    this.modalService.open(this.confirmDeleteModal);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.updateEmployeeList();
    this.updateUrl();
  }
}