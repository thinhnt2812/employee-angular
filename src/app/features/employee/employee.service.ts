import { Injectable } from '@angular/core';
import { IndexedDBService } from '../../service/employee-indexedDB';
import { Employee } from './employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  constructor(private indexedDBService: IndexedDBService) {} 
  // Inject IndexedDBService để thao tác với cơ sở dữ liệu

  // Lấy danh sách tất cả nhân viên từ IndexedDB
  async getEmployees(): Promise<Employee[]> {
    const db = await this.indexedDBService.getDB(); // Kết nối tới cơ sở dữ liệu
    return db.transaction('employees').objectStore('employees').getAll(); 
  }

  // Lấy thông tin nhân viên theo ID
  async getEmployeeById(id: number): Promise<Employee | undefined> {
    const db = await this.indexedDBService.getDB();
    return db.transaction('employees').objectStore('employees').get(id);
  }

  // Thêm nhân viên mới vào cơ sở dữ liệu
  async addEmployee(employee: Employee): Promise<IDBValidKey> {
    const db = await this.indexedDBService.getDB();
    return db.transaction('employees', 'readwrite').objectStore('employees').add(employee);
  }

  // Cập nhật thông tin nhân viên
  async updateEmployee(employee: Employee): Promise<IDBValidKey> {
    const db = await this.indexedDBService.getDB();
    return db.transaction('employees', 'readwrite').objectStore('employees').put(employee);
  }

  // Xóa nhân viên theo ID
  async deleteEmployee(id: number): Promise<void> {
    const db = await this.indexedDBService.getDB();
    return db.transaction('employees', 'readwrite').objectStore('employees').delete(id);
  }
}
