import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Api } from '../../../api/api';
import { apiappointmentgetall } from '../../../api/functions';
import { getAppointmentSeverity, getAppointmentAvatarClass, parseApiResponse, SeverityType } from '../../../shared/shared-utils';

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
    private readonly cdr = inject(ChangeDetectorRef);

    listAppointment: any[] = [];

    constructor(private readonly api: Api) {}

    ngOnInit(): void {
        this.initialization();
    }

    private initialization(): void {
        setTimeout(() => {
            this.api.invoke(apiappointmentgetall).then((response: any) => {
                const data = parseApiResponse(response);
                this.listAppointment = data.listAppointment;
                this.cdr.detectChanges();
            });
        }, 0);
    }

    getSeverity(status: string): SeverityType {
        return getAppointmentSeverity(status);
    }

    getAvatarClass(status: string): string {
        return getAppointmentAvatarClass(status);
    }
}