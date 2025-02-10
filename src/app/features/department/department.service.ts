import { Injectable } from '@angular/core';
import { IndexedDBService } from '../../service/indexeddb.service';
import { Department } from './department.model';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
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

  // Lấy ID tiếp theo cho phòng ban mới
  async getNextDepartmentId(): Promise<number> {
    const store = await this.transaction('departments', 'readonly');
    const count = await store.count();
    return count + 1;
  }

  // Lấy tất cả các phòng ban
  async getDepartments(): Promise<Department[]> {
    return await (await this.transaction('departments', 'readonly')).getAll();
  }

  // Thêm phòng ban mới
  async addDepartment(department: Department) {
    department.id = await this.getNextDepartmentId();
    const store = await this.transaction('departments', 'readwrite');
    const tx = store.transaction;
    await store.put(department);
    await tx.done;
  }

  // Cập nhật phòng ban
  async updateDepartment(department: Department) {
    const store = await this.transaction('departments', 'readwrite');
    const tx = store.transaction;
    await store.put(department);
    await tx.done;
  }

  // Xóa phòng ban theo ID
  async deleteDepartment(id: number) {
    const store = await this.transaction('departments', 'readwrite');
    const tx = store.transaction;
    await store.delete(id);
    await tx.done;
  }
}
