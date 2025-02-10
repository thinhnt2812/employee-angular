import { Injectable } from '@angular/core';
import { IndexedDBService } from '../../service/indexeddb.service';
import { Employee } from './employee.model';
import { DepartmentService } from '../department/department.service';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private dbPromise: Promise<any>;

  constructor(
    private indexedDBService: IndexedDBService,
    private departmentService: DepartmentService
  ) {
    this.dbPromise = this.indexedDBService.getDB();
  }

  // Lấy đối tượng cơ sở dữ liệu
  private async getDB() {
    return this.dbPromise;
  }

  // Tạo giao dịch với cơ sở dữ liệu
  private async transaction(storeName: string, mode: IDBTransactionMode) {
    const db = await this.getDB();
    return db.transaction(storeName, mode).objectStore(storeName);
  }

  // Lấy tất cả các nhân viên
  async getEmployees(): Promise<Employee[]> {
    return await (await this.transaction('employees', 'readonly')).getAll();
  }

  // Lấy nhân viên theo ID
  async getEmployeeById(id: number): Promise<Employee | undefined> {
    return await (await this.transaction('employees', 'readonly')).get(id);
  }

  // Thêm nhân viên mới
  async addEmployee(employee: Employee): Promise<IDBValidKey> {
    const store = await this.transaction('employees', 'readwrite');
    const tx = store.transaction;
    const id = await store.add(employee);
    await tx.done;
    return id;
  }

  // Cập nhật nhân viên
  async updateEmployee(employee: Employee): Promise<IDBValidKey> {
    const store = await this.transaction('employees', 'readwrite');
    const tx = store.transaction;
    const id = await store.put(employee);
    await tx.done;
    return id;
  }

  // Xóa nhân viên theo ID
  async deleteEmployee(id: number): Promise<void> {
    const store = await this.transaction('employees', 'readwrite');
    const tx = store.transaction;
    await store.delete(id);
    await tx.done;
  }

  // Lấy tất cả các phòng ban
  async getDepartments() {
    return this.departmentService.getDepartments();
  }
}
