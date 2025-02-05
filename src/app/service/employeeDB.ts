import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';
import { Employee } from '../features/employee/employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private db: Promise<IDBPDatabase>;

  constructor() {
    this.db = this.initDB();
  }

  private async initDB() {
    return openDB('EmployeeDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('employees')) {
          db.createObjectStore('employees', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }

  async addEmployee(employee: Employee): Promise<IDBValidKey> {
    const db = await this.db;
    return db.transaction('employees', 'readwrite').objectStore('employees').add(employee);
  }

  async getEmployees(): Promise<Employee[]> {
    const db = await this.db;
    return db.transaction('employees').objectStore('employees').getAll();
  }

  async getEmployeeById(id: number): Promise<Employee | undefined> {
    const db = await this.db;
    return db.transaction('employees').objectStore('employees').get(id);
  }

  async updateEmployee(employee: Employee): Promise<IDBValidKey> {
    const db = await this.db;
    return db.transaction('employees', 'readwrite').objectStore('employees').put(employee);
  }

  async deleteEmployee(id: number): Promise<void> {
    const db = await this.db;
    return db.transaction('employees', 'readwrite').objectStore('employees').delete(id);
  }
}
