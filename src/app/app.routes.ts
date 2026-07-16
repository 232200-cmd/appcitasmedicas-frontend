import { Routes } from '@angular/router';
import { AppointmentInsert } from './page/appointment/appointment-insert/appointment-insert';
import { AppointmentGetAll } from './page/appointment/appointment-get-all/appointment-get-all';
import { AppointmentDetail } from './page/appointment/appointment-detail/appointment-detail';
import { AppointmentDashboard } from './page/appointment/appointment-dashboard/dashboard';
import { MyAppointments } from './page/appointment/my-appointments/my-appointments';
import { DoctorGetAll } from './page/doctor/doctor-get-all/doctor-get-all';
import { SpecialtyGetAll } from './page/specialty/specialty-get-all/specialty-get-all';
import { Login } from './page/auth/login/login';
import { Register } from './page/auth/register/register';
import { authGuard, adminGuard } from './auth/auth.guard';

export const routes: Routes = [
    { path: 'auth/login', component: Login },
    { path: 'auth/register', component: Register },
    { path: 'appointment/insert', component: AppointmentInsert, canActivate: [authGuard] },
    { path: 'appointment/detail/:idAppointment', component: AppointmentDetail, canActivate: [authGuard] },
    { path: 'appointment/my-appointments', component: MyAppointments, canActivate: [authGuard] },
    { path: 'appointment/getall', component: AppointmentGetAll, canActivate: [adminGuard] },
    { path: 'appointment/dashboard', component: AppointmentDashboard, canActivate: [adminGuard] },
    { path: 'doctor/getall', component: DoctorGetAll, canActivate: [adminGuard] },
    { path: 'specialty/getall', component: SpecialtyGetAll, canActivate: [adminGuard] },

    { path: '', redirectTo: 'auth/login', pathMatch: 'full' }
];