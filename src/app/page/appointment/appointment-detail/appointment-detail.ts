import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { Api } from '../../../api/api';
import {
    apiappointmentgetall,
    apiappointmentreject,
    apiappointmentclose,
    apiappointmentcoordination,
    apiappointmentcomment,
    Apiappointmentreject$Params,
    Apiappointmentclose$Params,
    Apiappointmentcoordination$Params,
    Apiappointmentcomment$Params
} from '../../../api/functions';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthService } from '../../../auth/auth.service';
import { environment } from '../../../environments/environments';

@Component({
    selector: 'app-appointment-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        CardModule,
        TagModule,
        AvatarModule,
        InputTextModule,
        DatePipe
    ],
    templateUrl: './appointment-detail.html',
    styleUrl: './appointment-detail.css'
})
export class AppointmentDetail implements OnInit {
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);
    private http = inject(HttpClient);
    authService = inject(AuthService);

    appointment: any = null;
    newComment: string = '';

    processSteps = [
        { key: 'registered', label: 'Registrado' },
        { key: 'pending', label: 'Pendiente' },
        { key: 'seen', label: 'Visto' },
        { key: 'coordination', label: 'En coordinación' },
        { key: 'closed', label: 'Cerrado' }
    ];

    private statusOrder: Record<string, number> = {
        'Pendiente de revisión': 1,
        'Visto': 2,
        'En coordinación': 3,
        'Cerrado': 4,
        'Rechazado': 4
    };

    constructor(private api: Api) { }

    ngOnInit(): void {
        const idAppointment = this.route.snapshot.paramMap.get('idAppointment');
        this.api.invoke(apiappointmentgetall).then((response: any) => {
            const data = typeof response === 'string' ? JSON.parse(response) : response;
            this.appointment = data.listAppointment.find((a: any) => a.idAppointment === idAppointment) || data.listAppointment[0];
            this.cdr.detectChanges();
        });
    }

    goToList(): void {
        const destination = this.authService.isAdmin() ? '/appointment/getall' : '/appointment/my-appointments';
        this.router.navigate([destination]);
    }

    getInitials(name: string): string {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
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

    getStepClass(stepKey: string): string {
        if (!this.appointment) return 'tl-pending';
        const currentOrder = this.statusOrder[this.appointment.status] ?? 1;
        const stepOrderMap: Record<string, number> = { registered: 0, pending: 1, seen: 2, coordination: 3, closed: 4 };
        const stepOrder = stepOrderMap[stepKey];

        if (stepOrder < currentOrder) return 'tl-done';
        if (stepOrder === currentOrder) return 'tl-current';
        if (stepKey === 'registered') return 'tl-done';
        return 'tl-pending';
    }

    getStepDate(stepKey: string): string {
        if (!this.appointment) return '';
        if (stepKey === 'registered') {
            return this.appointment.createdAt ? new Date(this.appointment.createdAt).toLocaleString('es-PE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
        }
        const cls = this.getStepClass(stepKey);
        if (cls === 'tl-pending') return 'En espera';
        if (cls === 'tl-current') return this.appointment.updatedAt ? new Date(this.appointment.updatedAt).toLocaleString('es-PE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
        return '';
    }

    downloadFile(file: any): void {
        const url = `${environment.urlBase}/appointment/file/download/${file.idAppointmentfile}`;

        this.http.get(url, { responseType: 'blob' }).subscribe({
            next: (blob: Blob) => {
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = file.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(downloadUrl);
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo descargar el archivo.' });
            }
        });
    }

    coordinateAppointment(event: Event): void {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: '¿Desea pasar la cita ' + this.appointment.code + ' a coordinación?',
            header: 'Confirmar coordinación',
            icon: 'pi pi-sync',
            rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
            acceptButtonProps: { label: 'Sí, coordinar', severity: 'success' },
            accept: () => {
                const params: Apiappointmentcoordination$Params = { idAppointment: this.appointment.idAppointment };
                this.api.invoke(apiappointmentcoordination, params).then((response: any) => {
                    const data = typeof response === 'string' ? JSON.parse(response) : response;
                    if (data.type === 'success') {
                        this.appointment.status = 'En coordinación';
                        this.messageService.add({ severity: 'success', summary: 'Correcto', detail: data.listMessage[0] });
                    }
                }).catch(() => {
                    this.messageService.add({ severity: 'error', summary: 'Exception', detail: 'Algo ocurrió mal.' });
                });
            },
            reject: () => { }
        });
    }

    rejectAppointment(event: Event): void {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: '¿Desea rechazar la cita ' + this.appointment.code + '?',
            header: 'Confirmar rechazo',
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
            acceptButtonProps: { label: 'Sí, rechazar', severity: 'danger' },
            accept: () => {
                const params: Apiappointmentreject$Params = { idAppointment: this.appointment.idAppointment };
                this.api.invoke(apiappointmentreject, params).then((response: any) => {
                    const data = typeof response === 'string' ? JSON.parse(response) : response;
                    if (data.type === 'success') {
                        this.appointment.status = 'Rechazado';
                        this.messageService.add({ severity: 'success', summary: 'Correcto', detail: data.listMessage[0] });
                    }
                }).catch(() => {
                    this.messageService.add({ severity: 'error', summary: 'Exception', detail: 'Algo ocurrió mal.' });
                });
            },
            reject: () => { }
        });
    }

    closeAppointment(event: Event): void {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: '¿Desea cerrar la cita ' + this.appointment.code + '?',
            header: 'Confirmar cierre',
            icon: 'pi pi-check-circle',
            rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
            acceptButtonProps: { label: 'Sí, cerrar', severity: 'primary' },
            accept: () => {
                const params: Apiappointmentclose$Params = { idAppointment: this.appointment.idAppointment };
                this.api.invoke(apiappointmentclose, params).then((response: any) => {
                    const data = typeof response === 'string' ? JSON.parse(response) : response;
                    if (data.type === 'success') {
                        this.appointment.status = 'Cerrado';
                        this.messageService.add({ severity: 'success', summary: 'Correcto', detail: data.listMessage[0] });
                    }
                }).catch(() => {
                    this.messageService.add({ severity: 'error', summary: 'Exception', detail: 'Algo ocurrió mal.' });
                });
            },
            reject: () => { }
        });
    }

    sendComment(): void {
        if (!this.newComment.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'El comentario no puede estar vacío.' });
            return;
        }

        const params: Apiappointmentcomment$Params = {
            body: {
                idAppointment: this.appointment.idAppointment,
                description: this.newComment
            }
        };

        this.api.invoke(apiappointmentcomment, params).then((response: any) => {
            const data = typeof response === 'string' ? JSON.parse(response) : response;
            if (data.type === 'success') {
                this.appointment.comments.push({
                    authorName: this.authService.currentUser()?.firstName || 'Admin',
                    description: this.newComment,
                    createdAt: new Date().toISOString()
                });
                this.newComment = '';
                this.messageService.add({ severity: 'success', summary: 'Correcto', detail: data.listMessage[0] });
            }
        }).catch(() => {
            this.messageService.add({ severity: 'error', summary: 'Exception', detail: 'Algo ocurrió mal.' });
        });
    }
}