import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Api } from '../../../api/api';
import { apispecialtygetall, apispecialtyinsert, apispecialtyupdate, apispecialtydelete } from '../../../api/functions';
import { parseApiResponse } from '../../../shared/shared-utils';

@Component({
    selector: 'app-specialty-get-all',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        TableModule,
        CardModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        ButtonModule,
        DialogModule,
        ConfirmDialogModule
    ],
    providers: [ConfirmationService],
    templateUrl: './specialty-get-all.html',
    styleUrl: './specialty-get-all.css'
})
export class SpecialtyGetAll implements OnInit {
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly messageService = inject(MessageService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly formBuilder = inject(FormBuilder);

    listSpecialty: any[] = [];

    displayModal = false;
    isEdit = false;
    frmSpecialty: FormGroup;
    loadingSave = false;

    constructor(private readonly api: Api) {
        this.frmSpecialty = this.formBuilder.group({
            idSpecialty: [''],
            name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]]
        });
    }

    ngOnInit(): void {
        this.initialization();
    }

    private initialization(): void {
        setTimeout(() => {
            this.api.invoke(apispecialtygetall).then((response: any) => {
                const data = parseApiResponse(response);
                this.listSpecialty = data.listSpecialty || [];
                this.cdr.detectChanges();
            });
        }, 0);
    }

    showInsertModal(): void {
        this.isEdit = false;
        this.frmSpecialty.reset();
        this.displayModal = true;
    }

    showEditModal(item: any): void {
        this.isEdit = true;
        this.frmSpecialty.reset();
        this.frmSpecialty.patchValue({
            idSpecialty: item.idSpecialty,
            name: item.name
        });
        this.displayModal = true;
    }

    hideModal(): void {
        this.displayModal = false;
    }

    onSaveSubmit(): void {
        if (!this.frmSpecialty.valid) {
            this.frmSpecialty.markAllAsTouched();
            return;
        }

        this.loadingSave = true;
        const params = this.isEdit
            ? { body: this.frmSpecialty.value }
            : { body: { name: this.frmSpecialty.value.name } };
        const apiCall = this.isEdit ? apispecialtyupdate : apispecialtyinsert;
        const errorMsg = this.isEdit ? 'Algo salió mal al actualizar.' : 'Algo salió mal al insertar.';

        this.api.invoke(apiCall, params).then((response: any) => {
            const data = parseApiResponse(response);
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
            this.messageService.add({ severity: 'error', summary: 'Error', detail: errorMsg });
        });
    }

    confirmDelete(item: any): void {
        this.confirmationService.confirm({
            message: `¿Estás seguro de que deseas eliminar la especialidad "${item.name}"?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.deleteSpecialty(item.idSpecialty);
            }
        });
    }

    private deleteSpecialty(idSpecialty: string): void {
        this.api.invoke(apispecialtydelete, { idSpecialty }).then((response: any) => {
            const data = parseApiResponse(response);
            if (data.type === 'success') {
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: data.listMessage[0] });
                this.initialization();
            } else {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: data.listMessage[0] });
            }
        }).catch(() => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la especialidad.' });
        });
    }

    trimInput(controlName: string): void {
        const control = this.frmSpecialty.get(controlName);
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

    onNamePaste(event: ClipboardEvent): void {
        event.preventDefault();
        const pasted = event.clipboardData?.getData('text') || '';
        const cleaned = pasted.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').slice(0, 60);
        this.frmSpecialty.get('name')?.setValue(cleaned);
        this.frmSpecialty.get('name')?.markAsTouched();
    }

    onNameInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        const cleaned = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').slice(0, 60);
        if (input.value !== cleaned) {
            input.value = cleaned;
            this.frmSpecialty.get('name')?.setValue(cleaned, { emitEvent: false });
        }
    }
}
