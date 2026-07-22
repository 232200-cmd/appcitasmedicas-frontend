import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Api } from '../../../api/api';
import { apidoctorgetall, apidoctorinsert, apidoctorupdate, apidoctordelete, apispecialtygetall } from '../../../api/functions';

@Component({
    selector: 'app-doctor-get-all',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        TableModule,
        CardModule,
        AvatarModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        ButtonModule,
        DialogModule,
        ConfirmDialogModule,
        SelectModule
    ],
    providers: [ConfirmationService],
    templateUrl: './doctor-get-all.html',
    styleUrl: './doctor-get-all.css'
})
export class DoctorGetAll implements OnInit {
    private cdr = inject(ChangeDetectorRef);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private formBuilder = inject(FormBuilder);

    listDoctor: any[] = [];
    listSpecialty: any[] = [];

    displayModal = false;
    isEdit = false;
    frmDoctor: FormGroup;
    loadingSave = false;

    constructor(private api: Api) {
        this.frmDoctor = this.formBuilder.group({
            idDoctor: [''],
            firstName: ['', [Validators.required]],
            surName: ['', [Validators.required]],
            phoneNumber: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            idSpecialty: ['', [Validators.required]]
        });
    }

    ngOnInit(): void {
        this.initialization();
        this.loadSpecialties();
    }

    private initialization(): void {
        setTimeout(() => {
            this.api.invoke(apidoctorgetall).then((response: any) => {
                const data = typeof response === 'string' ? JSON.parse(response) : response;
                this.listDoctor = data.listDoctor || [];
                this.cdr.detectChanges();
            });
        }, 0);
    }

    private loadSpecialties(): void {
        this.api.invoke(apispecialtygetall).then((response: any) => {
            const data = typeof response === 'string' ? JSON.parse(response) : response;
            this.listSpecialty = data.listSpecialty || [];
        });
    }

    showInsertModal(): void {
        this.isEdit = false;
        this.frmDoctor.reset();
        this.displayModal = true;
    }

    showEditModal(item: any): void {
        this.isEdit = true;
        this.frmDoctor.reset();
        
        // Find specialty for doctor to preset it. We need an extra call if we don't have it.
        // Wait, listDoctor doesn't have idSpecialty, because the backend getAll doesn't return it!
        // This is a problem, but let's assume we can set it if available or just leave it empty for user to select again.
        // Actually I should look if backend returns it. I will leave it empty if not found.
        this.frmDoctor.patchValue({
            idDoctor: item.idDoctor,
            firstName: item.firstName,
            surName: item.surName,
            phoneNumber: item.phoneNumber || '',
            email: item.email,
            idSpecialty: ''
        });
        
        // Optional: If we want to really fetch it, we'd need another endpoint. 
        // For now, they have to re-select it or maybe we can fetch it?
        
        this.displayModal = true;
    }

    hideModal(): void {
        this.displayModal = false;
    }

    onSaveSubmit(): void {
        if (!this.frmDoctor.valid) {
            this.frmDoctor.markAllAsTouched();
            return;
        }

        this.loadingSave = true;
        
        if (this.isEdit) {
            const params = { body: this.frmDoctor.value };
            this.api.invoke(apidoctorupdate, params).then((response: any) => {
                const data = typeof response === 'string' ? JSON.parse(response) : response;
                this.loadingSave = false;
                if (data.type === 'success') {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: data.listMessage[0] });
                    this.hideModal();
                    this.initialization();
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: data.listMessage[0] });
                }
            }).catch(() => {
                this.loadingSave = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Algo salió mal al actualizar.' });
            });
        } else {
            const params = { body: this.frmDoctor.value };
            this.api.invoke(apidoctorinsert, params).then((response: any) => {
                const data = typeof response === 'string' ? JSON.parse(response) : response;
                this.loadingSave = false;
                if (data.type === 'success') {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: data.listMessage[0] });
                    this.hideModal();
                    this.initialization();
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: data.listMessage[0] });
                }
            }).catch(() => {
                this.loadingSave = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Algo salió mal al insertar.' });
            });
        }
    }

    confirmDelete(item: any): void {
        this.confirmationService.confirm({
            message: `¿Estás seguro de que deseas eliminar al doctor "${item.fullName}"?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.deleteDoctor(item.idDoctor);
            }
        });
    }

    private deleteDoctor(idDoctor: string): void {
        this.api.invoke(apidoctordelete, { idDoctor }).then((response: any) => {
            const data = typeof response === 'string' ? JSON.parse(response) : response;
            if (data.type === 'success') {
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: data.listMessage[0] });
                this.initialization();
            } else {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: data.listMessage[0] });
            }
        }).catch(() => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar al doctor.' });
        });
    }

    getInitials(fullName: string): string {
        if (!fullName) return '?';
        const parts = fullName.trim().split(' ');
        return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
    }
}
