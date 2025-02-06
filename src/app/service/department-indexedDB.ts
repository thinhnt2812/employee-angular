import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' 
})
export class DepartmentDB {
  private dbName = 'CompanyDB'; 
  private storeName = 'departments';

  constructor() {
    this.initDB();
  }

  private initDB() {
    const request = indexedDB.open(this.dbName, 1);

    // Sự kiện khi cơ sở dữ liệu cần nâng cấp (khi phiên bản thay đổi)
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result; // Lấy đối tượng cơ sở dữ liệu từ sự kiện
      // Kiểm tra nếu chưa có object store 'departments', tạo mới
      if (!db.objectStoreNames.contains(this.storeName)) {
        const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true }); // Tạo object store với 'id' là khóa chính tự động tăng
        store.createIndex('name', 'name', { unique: true }); // Tạo chỉ mục cho trường 'name' (duy nhất)
        store.createIndex('status', 'status', { unique: false }); // Tạo chỉ mục cho trường 'status' (không duy nhất)
      }
    };

    // Sự kiện khi cơ sở dữ liệu đã được mở thành công
    request.onsuccess = (event: Event) => {
      console.log('IndexedDB initialized successfully'); // Thông báo thành công khi khởi tạo cơ sở dữ liệu
    };

    // Sự kiện khi có lỗi xảy ra khi mở cơ sở dữ liệu
    request.onerror = (event) => {
      console.error('Database error:', event); // Thông báo lỗi khi không thể mở cơ sở dữ liệu
    };
  }
}
