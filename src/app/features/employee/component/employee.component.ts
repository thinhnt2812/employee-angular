import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../employee.service';
import { Employee } from '../employee.model';

@Component({
  selector: 'app-employee-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
})
export class EmployeeManagementComponent implements OnInit {
  employeeList: Employee[] = [];
  originalEmployeeList: Employee[] = [];
  currentEmployee: Employee = this.getDefaultEmployee();
  editMode: boolean = false;
  searchKeyword: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

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

  constructor(private employeeService: EmployeeService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.currentPage = +params['page'] || 1;
      this.fetchEmployees();
    });
  }

  trackById(index: number, item: Employee): number {
    return Number(item.id);
  }

  private fetchEmployees(): void {
    this.employeeService.getEmployees().then((data) => {
      this.originalEmployeeList = [...data];
      this.totalItems = data.length;
      this.updateEmployeeList();
      this.assignNewId();
    });
  }

  private updateEmployeeList(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const filteredList = this.searchKeyword.trim() ? this.filterEmployees() : this.originalEmployeeList;
    this.employeeList = filteredList.slice(startIndex, endIndex);
    this.totalItems = filteredList.length;
    this.updateUrl();
  }

  private filterEmployees(): Employee[] {
    const keyword = this.searchKeyword.toLowerCase();
    return this.originalEmployeeList.filter(employee =>
      employee.name.toLowerCase().includes(keyword)
    );
  }

  private updateUrl(): void {
    this.router.navigate([], {
      queryParams: {
        page: this.currentPage
      },
      queryParamsHandling: 'merge'
    });
  }

  private assignNewId(): void {
    const maxId = this.originalEmployeeList.length > 0 ? Math.max(...this.originalEmployeeList.map(e => Number(e.id))) : 0;
    this.currentEmployee.id = maxId + 1;
  }

  onAddOrUpdate(): void {
    if (!this.validatePhone(this.currentEmployee.phone)) {
      alert('Số điện thoại phải có đúng 10 chữ số!');
      return;
    }

    if (Object.values(this.currentEmployee).some(value => value === '')) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (!this.validateDob(this.currentEmployee.dob)) {
      alert('Ngày sinh không được lớn hơn ngày hiện tại!');
      return;
    }

    this.currentEmployee.gender = Number(this.currentEmployee.gender);
    this.currentEmployee.employeeType = Number(this.currentEmployee.employeeType);
    this.currentEmployee.workStatus = Number(this.currentEmployee.workStatus);

    if (this.editMode) {
      this.employeeService.updateEmployee(this.currentEmployee).then(() => {
        this.fetchEmployees();
        this.resetForm();
      });
    } else {
      this.employeeService.addEmployee(this.currentEmployee).then((id) => {
        this.currentEmployee.id = id as number;
        this.originalEmployeeList.unshift(this.currentEmployee);
        this.totalItems++;
        this.updateEmployeeList();
        this.resetForm();
      });
    }
  }

  onEdit(employee: Employee): void {
    this.editMode = true;
    this.currentEmployee = { ...employee };
  }

  onDelete(id: number): void {
    this.employeeService.deleteEmployee(id).then(() => {
      this.fetchEmployees();
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.updateEmployeeList();
    this.updateUrl();
  }

  private validateDob(dob: string): boolean {
    return new Date(dob) <= new Date();
  }

  private validatePhone(phone: string): boolean {
    return /^\d{10}$/.test(phone);
  }

  private resetForm(): void {
    this.currentEmployee = this.getDefaultEmployee();
    this.editMode = false;
  }

  private getDefaultEmployee(): Employee {
    return { id: 0, name: '', gender: 0, hometown: '', dob: '', phone: '', employeeType: 0, workStatus: 0 };
  }

  sortEmployeesBy(attribute: keyof Employee): void {
    this.employeeList.sort((a, b) => {
      const valueA = a[attribute] ?? '';
      const valueB = b[attribute] ?? '';
      return String(valueA).localeCompare(String(valueB));
    });
  }

  sortEmployeesByIdDesc(): void {
    this.employeeList.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
  }

  sortEmployeesByDobYear(): void {
    this.employeeList.sort((a, b) => {
      const yearA = new Date(a.dob).getFullYear() || 0;
      const yearB = new Date(b.dob).getFullYear() || 0;
      return yearB - yearA;
    });
  }

  goToFirstPage(): void {
    this.currentPage = 1;
    this.updateEmployeeList();
    this.updateUrl();
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateEmployeeList();
      this.updateUrl();
    }
  }

  goToNextPage(): void {
    if (this.currentPage * this.itemsPerPage < this.totalItems) {
      this.currentPage++;
      this.updateEmployeeList();
      this.updateUrl();
    }
  }

  goToLastPage(): void {
    this.currentPage = Math.ceil(this.totalItems / this.itemsPerPage);
    this.updateEmployeeList();
    this.updateUrl();
  }

  getGenderLabel(gender: number): string {
    switch (gender) {
      case 1: return 'Nam';
      case 2: return 'Nữ';
      case 3: return 'Khác';
      default: return '';
    }
  }

  getEmployeeTypeLabel(employeeType: number): string {
    switch (employeeType) {
      case 1: return 'Trưởng phòng';
      case 2: return 'Kế toán';
      case 3: return 'Nhân viên';
      default: return '';
    }
  }

  getWorkStatusLabel(workStatus: number): string {
    switch (workStatus) {
      case 1: return 'Đang làm';
      case 2: return 'Đã nghỉ';
      default: return '';
    }
  }
}
