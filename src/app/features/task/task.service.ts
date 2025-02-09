import { Injectable } from '@angular/core';
import { IndexedDBService } from '../../service/indexeddb.service';
import { Task } from './task.model';
import { Department } from '../department/department.model'; 
import { Employee } from '../employee/employee.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  constructor(private indexedDBService: IndexedDBService) {}

  // Phương thức lấy database từ IndexedDBService
  private async getDB() {
    return this.indexedDBService.getDB();
  }

  // Lấy ID tiếp theo cho nhiệm vụ mới
  async getNextTaskId(): Promise<number> {
    const db = await this.getDB();
    const tasks = await db.getAll('tasks');
    return (tasks.length ? Math.max(...tasks.map(t => t.id)) : 0) + 1;
  }

  // Lấy danh sách tất cả các nhiệm vụ
  async getTasks(): Promise<Task[]> {
    const db = await this.getDB();
    return await db.getAll('tasks');
  }

  // Thêm một nhiệm vụ mới vào cơ sở dữ liệu
  async addTask(task: Task) {
    task.id = await this.getNextTaskId();
    const db = await this.getDB();
    const tx = db.transaction('tasks', 'readwrite');
    tx.objectStore('tasks').put(task);
    await tx.done;
  }

  // Cập nhật thông tin nhiệm vụ
  async updateTask(task: Task) {
    const db = await this.getDB();
    const tx = db.transaction('tasks', 'readwrite');
    tx.objectStore('tasks').put(task);
    await tx.done;
  }

  // Xóa nhiệm vụ theo ID
  async deleteTask(id: number) {
    const db = await this.getDB();
    const tx = db.transaction('tasks', 'readwrite');
    tx.objectStore('tasks').delete(id);
    await tx.done;
  }

  // Lấy danh sách tất cả các phòng ban
  async getDepartments(): Promise<Department[]> {
    const db = await this.getDB();
    return await db.getAll('departments');
  }

  // Lấy danh sách tất cả các nhân viên
  async getEmployees(): Promise<Employee[]> {
    const db = await this.getDB();
    return await db.getAll('employees');
  }
}