import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Api } from '../../../api/api';
import { apiappointmentgetall } from '../../../api/functions';

@Component({
    selector: 'app-appointment-dashboard',
    standalone: true,
    imports: [
        RouterModule,
        ButtonModule,
        TableModule,
        CardModule,
        TagModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        DatePipe
    ],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css'
})
export class AppointmentDashboard implements OnInit {
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

    countByStatus(status: string): number {
        return this.listAppointment.filter(a => a.status === status).length;
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
}
