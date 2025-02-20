import { Injectable } from '@angular/core';
import { IndexedDBService } from '../../service/indexeddb.service';
import { Task } from './task.model';
import { Department } from '../department/department.model';
import { Employee } from '../employee/employee.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private dbPromise: Promise<any>;

  constructor(private indexedDBService: IndexedDBService) {
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

  // Lấy ID tiếp theo cho task mới
  async getNextTaskId(): Promise<number> {
    const store = await this.transaction('tasks', 'readonly');
    const count = await store.count();
    return count + 1;
  }

  // Lấy tất cả các task
  async getTasks(): Promise<Task[]> {
    return await (await this.transaction('tasks', 'readonly')).getAll();
  }

  // Thêm task mới
  async addTask(task: Task) {
    task.id = await this.getNextTaskId();
    await (await this.transaction('tasks', 'readwrite')).put(task);
  }

  // Cập nhật task
  async updateTask(task: Task) {
    await (await this.transaction('tasks', 'readwrite')).put(task);
  }

  // Xóa task theo ID
  async deleteTask(id: number) {
    await (await this.transaction('tasks', 'readwrite')).delete(id);
  }

  // Lấy tất cả các phòng ban
  async getDepartments(): Promise<Department[]> {
    return await (await this.transaction('departments', 'readonly')).getAll();
  }

  // Lấy tất cả các nhân viên
  async getEmployees(): Promise<Employee[]> {
    return await (await this.transaction('employees', 'readonly')).getAll();
  }

  // Lấy nhân viên theo phòng ban
  async getEmployeesByDepartment(departmentId: number): Promise<Employee[]> {
    const employees = await this.getEmployees();
    return employees.filter(emp => emp.department === departmentId);
  }

  async getTaskById(taskId: number): Promise<Task | null> {
    // Implementation to get a task by ID
    const tasks = await this.getTasks();
    return tasks.find(task => task.id === taskId) || null;
  }
}
