import { Routes } from '@angular/router';
import { EmployeeManagementComponent } from './features/employee/component/employee.component';
import { DepartmentComponent } from './features/department/component/department.component';
import { TaskComponent } from './features/task/component/task.component';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { ComingsoonComponent } from './shared/comingsoon/comingsoon.component';

export const routes: Routes = [
    { path: 'employee', component: EmployeeManagementComponent },
    { path: 'department', component: DepartmentComponent },
    { path: 'task', component: TaskComponent },
    { path: 'comingsoon', component: ComingsoonComponent },
    { path: '**', component: PageNotFoundComponent }
];
