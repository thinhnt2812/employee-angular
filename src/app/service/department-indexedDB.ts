import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';

@Injectable({ providedIn: 'root' })
export class IndexedDBService {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  /**
   * Khởi tạo cơ sở dữ liệu IndexedDB
   */
  private async initDB(): Promise<IDBPDatabase> {
    return openDB('DepartmentDB', 1, {
      upgrade(db) {
        // Tạo bảng 'departments' nếu chưa tồn tại
        if (!db.objectStoreNames.contains('departments')) {
          db.createObjectStore('departments', { keyPath: 'id' });
        }
      }
    });
  }

  /**
   * Trả về instance của IndexedDB
   */
  async getDB(): Promise<IDBPDatabase> {
    return this.dbPromise;
  }
}
