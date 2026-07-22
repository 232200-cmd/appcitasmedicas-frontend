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
    private cdr = inject(ChangeDetectorRef);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private formBuilder = inject(FormBuilder);

    listSpecialty: any[] = [];
    
    displayModal = false;
    isEdit = false;
    frmSpecialty: FormGroup;
    loadingSave = false;

    constructor(private api: Api) {
        this.frmSpecialty = this.formBuilder.group({
            idSpecialty: [''],
            name: ['', [Validators.required]]
        });
    }

    ngOnInit(): void {
        this.initialization();
    }

    private initialization(): void {
        setTimeout(() => {
            this.api.invoke(apispecialtygetall).then((response: any) => {
                const data = typeof response === 'string' ? JSON.parse(response) : response;
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
        
        if (this.isEdit) {
            const params = { body: this.frmSpecialty.value };
            this.api.invoke(apispecialtyupdate, params).then((response: any) => {
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
            const params = { body: { name: this.frmSpecialty.value.name } };
            this.api.invoke(apispecialtyinsert, params).then((response: any) => {
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
            const data = typeof response === 'string' ? JSON.parse(response) : response;
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
}
