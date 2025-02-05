import { Routes } from '@angular/router';
import { EmployeeManagementComponent } from './features/employee/component/employee.component';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { ComingsoonComponent } from './shared/comingsoon/comingsoon.component';

export const routes: Routes = [
    { path: 'employee', component: EmployeeManagementComponent },
    { path: 'comingsoon', component: ComingsoonComponent },
    { path: '**', component: PageNotFoundComponent }
];
