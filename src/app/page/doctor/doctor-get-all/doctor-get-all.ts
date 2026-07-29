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
            firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
            surName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
            phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{9}$'), Validators.maxLength(9)]],
            email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
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
        this.frmDoctor.patchValue({
            idDoctor: item.idDoctor,
            firstName: item.firstName,
            surName: item.surName,
            phoneNumber: item.phoneNumber || '',
            email: item.email,
            idSpecialty: item.idSpecialty || ''
        });
        this.displayModal = true;
    }

    /** Permite solo dígitos al tipear */
    onlyNumbers(event: KeyboardEvent): boolean {
        const char = event.key;
        if (!/^[0-9]$/.test(char)) {
            event.preventDefault();
            return false;
        }
        const current = (event.target as HTMLInputElement).value;
        if (current.length >= 9) {
            event.preventDefault();
            return false;
        }
        return true;
    }

    /** Bloquea pegar texto no numérico o que exceda 9 dígitos */
    onPhonePaste(event: ClipboardEvent): void {
        event.preventDefault();
        const pasted = event.clipboardData?.getData('text') || '';
        const cleaned = pasted.replace(/[^0-9]/g, '').slice(0, 9);
        this.frmDoctor.get('phoneNumber')?.setValue(cleaned);
        this.frmDoctor.get('phoneNumber')?.markAsTouched();
    }

    /** Sanitiza cualquier valor pegado o modificado de otra forma */
    onPhoneInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        const cleaned = input.value.replace(/[^0-9]/g, '').slice(0, 9);
        if (input.value !== cleaned) {
            input.value = cleaned;
            this.frmDoctor.get('phoneNumber')?.setValue(cleaned, { emitEvent: false });
        }
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

    trimInput(controlName: string): void {
        const control = this.frmDoctor.get(controlName);
        if (control && typeof control.value === 'string') {
            control.setValue(control.value.trim());
        }
    }

    onlyLetters(event: KeyboardEvent): boolean {
        const char = event.key;
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(char)) {
            event.preventDefault();
            return false;
        }
        return true;
    }

    onNamePaste(event: ClipboardEvent, controlName: string): void {
        event.preventDefault();
        const pasted = event.clipboardData?.getData('text') || '';
        const cleaned = pasted.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').slice(0, 50);
        this.frmDoctor.get(controlName)?.setValue(cleaned);
        this.frmDoctor.get(controlName)?.markAsTouched();
    }

    onNameInput(event: Event, controlName: string): void {
        const input = event.target as HTMLInputElement;
        const cleaned = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').slice(0, 50);
        if (input.value !== cleaned) {
            input.value = cleaned;
            this.frmDoctor.get(controlName)?.setValue(cleaned, { emitEvent: false });
        }
    }
}
