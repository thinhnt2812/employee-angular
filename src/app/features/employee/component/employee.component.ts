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

  // Lấy ID cho từng employee trong danh sách
  trackById(index: number, item: Employee): number {
    return Number(item.id);
  }

  // Lấy danh sách nhân viên từ service
  private fetchEmployees(): void {
    this.employeeService.getEmployees().subscribe((data) => {
      this.originalEmployeeList = [...data];
      this.totalItems = data.length;
      this.updateEmployeeList();
      this.assignNewId();
    });
  }

  // Cập nhật danh sách nhân viên khi phân trang hoặc tìm kiếm
  private updateEmployeeList(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const filteredList = this.searchKeyword.trim() ? this.filterEmployees() : this.originalEmployeeList;
    this.employeeList = filteredList.slice(startIndex, endIndex);
    this.totalItems = filteredList.length;
    this.updateUrl();
  }

  // Tìm kiếm nhân viên theo từ khóa
  private filterEmployees(): Employee[] {
    const keyword = this.searchKeyword.toLowerCase();
    return this.originalEmployeeList.filter(employee =>
      employee.name.toLowerCase().includes(keyword)
    );
  }

  // Cập nhật URL khi thay đổi trang
  private updateUrl(): void {
    this.router.navigate([], {
      queryParams: {
        page: this.currentPage
      },
      queryParamsHandling: 'merge'
    });
  }

  // Tự động tạo ID mới khi thêm nhân viên
  private assignNewId(): void {
    const maxId = this.originalEmployeeList.length > 0 ? Math.max(...this.originalEmployeeList.map(e => Number(e.id))) : 0;
    this.currentEmployee.id = (maxId + 1).toString();
  }

  // Hàm thêm hoặc sửa nhân viên
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

    if (this.editMode) {
      this.employeeService.updateEmployee(this.currentEmployee).subscribe(() => {
        this.fetchEmployees();
        this.resetForm();
      });
    } else {
      this.employeeService.addEmployee(this.currentEmployee).subscribe((newEmployee) => {
        this.originalEmployeeList.unshift(newEmployee);
        this.totalItems++;
        this.updateEmployeeList();
        this.resetForm();
      });
    }
  }

  // Hàm chỉnh sửa nhân viên
  onEdit(employee: Employee): void {
    this.editMode = true;
    this.currentEmployee = { ...employee };
  }

  // Hàm xóa nhân viên
  onDelete(id: string): void {
    this.employeeService.deleteEmployee(id).subscribe(() => {
      this.fetchEmployees();
    });
  }

  // Hàm tìm kiếm nhân viên theo tên
  onSearch(): void {
    this.currentPage = 1;
    this.updateEmployeeList();
    this.updateUrl();
  }

  // Kiểm tra ngày sinh hợp lệ
  private validateDob(dob: string): boolean {
    return new Date(dob) <= new Date();
  }

  // Kiểm tra số điện thoại hợp lệ
  private validatePhone(phone: string): boolean {
    return /^\d{10}$/.test(phone);
  }

  // Đặt lại form sau khi thêm/sửa nhân viên
  private resetForm(): void {
    this.currentEmployee = this.getDefaultEmployee();
    this.editMode = false;
  }

  // Giá trị mặc định cho nhân viên mới
  private getDefaultEmployee(): Employee {
    return { id: '', name: '', gender: '', hometown: '', dob: '', phone: '', employeeType: '', workStatus: '' };
  }

  // Sắp xếp nhân viên theo thuộc tính
  sortEmployeesBy(attribute: keyof Employee): void {
    this.employeeList.sort((a, b) => {
      const valueA = a[attribute] ?? '';
      const valueB = b[attribute] ?? '';
      return String(valueA).localeCompare(String(valueB));
    });
  }

  // Sắp xếp nhân viên theo ID giảm dần
  sortEmployeesByIdDesc(): void {
    this.employeeList.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
  }

  // Sắp xếp nhân viên theo năm sinh giảm dần
  sortEmployeesByDobYear(): void {
    this.employeeList.sort((a, b) => {
      const yearA = new Date(a.dob).getFullYear() || 0;
      const yearB = new Date(b.dob).getFullYear() || 0;
      return yearB - yearA;
    });
  }

  // Chuyển đến trang đầu tiên
  goToFirstPage(): void {
    this.currentPage = 1;
    this.updateEmployeeList();
    this.updateUrl();
  }

  // Chuyển đến trang trước
  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateEmployeeList();
      this.updateUrl();
    }
  }

  // Chuyển đến trang sau
  goToNextPage(): void {
    if (this.currentPage * this.itemsPerPage < this.totalItems) {
      this.currentPage++;
      this.updateEmployeeList();
      this.updateUrl();
    }
  }

  // Chuyển đến trang cuối cùng
  goToLastPage(): void {
    this.currentPage = Math.ceil(this.totalItems / this.itemsPerPage);
    this.updateEmployeeList();
    this.updateUrl();
  }
}
