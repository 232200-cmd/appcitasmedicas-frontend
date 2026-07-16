import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Api } from '../../../api/api';
import {
    apiappointmentgetall,
    apiappointmentseen,
    apiappointmentreject,
    apiappointmentclose,
    Apiappointmentseen$Params,
    Apiappointmentreject$Params,
    Apiappointmentclose$Params
} from '../../../api/functions';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
    selector: 'app-appointment-get-all',
    standalone: true,
    imports: [
        RouterModule,
        FormsModule,
        ButtonModule,
        TableModule,
        CardModule,
        TagModule,
        AvatarModule,
        TooltipModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        DatePipe
    ],
    templateUrl: './appointment-get-all.html',
    styleUrl: './appointment-get-all.css'
})
export class AppointmentGetAll implements OnInit {
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);
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

    getInitials(fullName: string): string {
        if (!fullName) return '?';
        const parts = fullName.trim().split(' ');
        return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
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

    seenAppointment(event: Event, item: any): void {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: '¿Marcar la cita ' + item.code + ' como vista?',
            header: 'Confirmar',
            icon: 'pi pi-eye',
            rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
            acceptButtonProps: { label: 'Sí, marcar', severity: 'info' },
            accept: () => {
                const params: Apiappointmentseen$Params = { idAppointment: item.idAppointment };
                this.api.invoke(apiappointmentseen, params).then((response: any) => {
                    const data = typeof response === 'string' ? JSON.parse(response) : response;
                    if (data.type === 'success') {
                        item.status = 'Visto';
                        this.messageService.add({ severity: 'success', summary: 'Correcto', detail: data.listMessage[0] });
                    }
                }).catch(() => {
                    this.messageService.add({ severity: 'error', summary: 'Exception', detail: 'Algo ocurrió mal.' });
                });
            },
            reject: () => {}
        });
    }

    rejectAppointment(event: Event, item: any): void {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: '¿Desea rechazar la cita ' + item.code + '?',
            header: 'Confirmar rechazo',
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
            acceptButtonProps: { label: 'Sí, rechazar', severity: 'danger' },
            accept: () => {
                const params: Apiappointmentreject$Params = { idAppointment: item.idAppointment };
                this.api.invoke(apiappointmentreject, params).then((response: any) => {
                    const data = typeof response === 'string' ? JSON.parse(response) : response;
                    if (data.type === 'success') {
                        item.status = 'Rechazado';
                        this.messageService.add({ severity: 'success', summary: 'Correcto', detail: data.listMessage[0] });
                    }
                }).catch(() => {
                    this.messageService.add({ severity: 'error', summary: 'Exception', detail: 'Algo ocurrió mal.' });
                });
            },
            reject: () => {}
        });
    }

    closeAppointment(event: Event, item: any): void {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: '¿Desea cerrar la cita ' + item.code + '?',
            header: 'Confirmar cierre',
            icon: 'pi pi-check-circle',
            rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
            acceptButtonProps: { label: 'Sí, cerrar', severity: 'primary' },
            accept: () => {
                const params: Apiappointmentclose$Params = { idAppointment: item.idAppointment };
                this.api.invoke(apiappointmentclose, params).then((response: any) => {
                    const data = typeof response === 'string' ? JSON.parse(response) : response;
                    if (data.type === 'success') {
                        item.status = 'Cerrado';
                        this.messageService.add({ severity: 'success', summary: 'Correcto', detail: data.listMessage[0] });
                    }
                }).catch(() => {
                    this.messageService.add({ severity: 'error', summary: 'Exception', detail: 'Algo ocurrió mal.' });
                });
            },
            reject: () => {}
        });
    }
}