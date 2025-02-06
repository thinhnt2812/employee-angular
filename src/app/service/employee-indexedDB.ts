import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';

@Injectable({
  providedIn: 'root',
})
export class IndexedDBService {
  private db: Promise<IDBPDatabase>; // Biến lưu trữ kết nối đến cơ sở dữ liệu IndexedDB

  constructor() {
    this.db = this.initDB(); // Khởi tạo cơ sở dữ liệu khi service được tạo
  }

  // Phương thức khởi tạo cơ sở dữ liệu IndexedDB
  private async initDB() {
    return openDB('EmployeeDB', 1, { // Mở (hoặc tạo) cơ sở dữ liệu có tên 'EmployeeDB' với phiên bản 1
      upgrade(db) { // Hàm được gọi khi cơ sở dữ liệu cần nâng cấp (khi chưa tồn tại hoặc có phiên bản cũ hơn)
        if (!db.objectStoreNames.contains('employees')) { // Kiểm tra xem object store 'employees' đã tồn tại chưa
          db.createObjectStore('employees', { keyPath: 'id', autoIncrement: true }); 
          // Tạo object store 'employees' với khóa chính là 'id' và tự động tăng
        }
      },
    });
  }

  // Phương thức trả về kết nối đến cơ sở dữ liệu
  async getDB(): Promise<IDBPDatabase> {
    return this.db;
  }
}
