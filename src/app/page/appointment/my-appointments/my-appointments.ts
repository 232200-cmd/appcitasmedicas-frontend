import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Api } from '../../../api/api';
import { apiappointmentgetall } from '../../../api/functions';

@Component({
    selector: 'app-my-appointments',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ButtonModule,
        TagModule,
        DatePipe
    ],
    templateUrl: './my-appointments.html',
    styleUrl: './my-appointments.css'
})
export class MyAppointments implements OnInit {
    private cdr = inject(ChangeDetectorRef);

    listAppointment: any[] = [];

    constructor(private api: Api) {}

    ngOnInit(): void {
        this.initialization();
    }

    private initialization(): void {
        setTimeout(() => {
            this.api.invoke(apiappointmentgetall).then((response: any) => {
                const data = typeof response === 'string' ? JSON.parse(response) : response;
                this.listAppointment = data.listAppointment;
                this.cdr.detectChanges();
            });
        }, 0);
    }

    getSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (status) {
            case 'Pendiente de revisión': return 'warn';
            case 'Visto': return 'info';
            case 'En coordinación': return 'secondary';
            case 'Cerrado': return 'success';
            case 'Rechazado': return 'danger';
            default: return 'info';
        }
    }

    getAvatarClass(status: string): string {
        switch (status) {
            case 'Pendiente de revisión': return 'avatar-pending';
            case 'Visto': return 'avatar-seen';
            case 'En coordinación': return 'avatar-coordination';
            case 'Cerrado': return 'avatar-closed';
            case 'Rechazado': return 'avatar-refused';
            default: return 'avatar-pending';
        }
    }
}