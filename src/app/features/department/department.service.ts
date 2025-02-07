import { Injectable } from '@angular/core';
import { IndexedDBService } from '../../service/department-indexedDB';
import { Department } from './department.model';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  constructor(private indexedDBService: IndexedDBService) {}

  // Phương thức lấy database từ IndexedDBService
  private async getDB() {
    return this.indexedDBService.getDB();
  }

  // Lấy ID tiếp theo cho phòng ban mới
  async getNextDepartmentId(): Promise<number> {
    const db = await this.getDB();
    const departments = await db.getAll('departments');
    return (departments.length ? Math.max(...departments.map(d => d.id)) : 0) + 1;
  }

  // Lấy danh sách tất cả các phòng ban
  async getDepartments(): Promise<Department[]> {
    return (await this.getDB()).getAll('departments');
  }

  // Thêm một phòng ban mới vào cơ sở dữ liệu
  async addDepartment(department: Department) {
    department.id = await this.getNextDepartmentId();
    const db = await this.getDB();
    const tx = db.transaction('departments', 'readwrite');
    tx.objectStore('departments').put(department);
    await tx.done;
  }

  // Cập nhật thông tin phòng ban
  async updateDepartment(department: Department) {
    const db = await this.getDB();
    const tx = db.transaction('departments', 'readwrite');
    tx.objectStore('departments').put(department);
    await tx.done;
  }

  // Xóa phòng ban theo ID
  async deleteDepartment(id: number) {
    const db = await this.getDB();
    const tx = db.transaction('departments', 'readwrite');
    tx.objectStore('departments').delete(id);
    await tx.done;
  }
}