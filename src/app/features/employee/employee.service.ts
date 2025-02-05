import { Injectable } from '@angular/core';
import { Employee } from './employee.model';
import { EmployeeService as EmployeeDBService } from '../../service/employeeDB';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  constructor(private employeeDBService: EmployeeDBService) {}

  getEmployees(): Promise<Employee[]> {
    return this.employeeDBService.getEmployees();
  }

  addEmployee(employee: Employee): Promise<IDBValidKey> {
    return this.employeeDBService.addEmployee(employee);
  }

  updateEmployee(employee: Employee): Promise<IDBValidKey> {
    return this.employeeDBService.updateEmployee(employee);
  }

  deleteEmployee(id: number): Promise<void> {
    return this.employeeDBService.deleteEmployee(id);
  }
}
