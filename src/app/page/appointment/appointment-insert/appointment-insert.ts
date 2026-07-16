import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { Api } from '../../../api/api';
import {
    apispecialtygetall,
    apidoctorgetbyspecialty,
    apiappointmentinsert,
    Apiappointmentinsert$Params
} from '../../../api/functions';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
    selector: 'app-appointment-insert',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        InputTextModule,
        TextareaModule,
        ButtonModule,
        FileUploadModule,
        SelectModule,
        DatePickerModule,
        CardModule,
        DividerModule
    ],
    templateUrl: './appointment-insert.html',
    styleUrl: './appointment-insert.css'
})
export class AppointmentInsert implements OnInit {
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);
    private router = inject(Router);

    frmInsertAppointment: FormGroup;

    listSpecialty: any[] = [];
    listDoctor: any[] = [];

    fileQuantity: number = 0;
    fileRowList: any[] = [];
    listFile: any[] = [];

    maxDate: Date = new Date();

    get personFullNameFb() { return this.frmInsertAppointment.controls['personFullName']; }
    get specialtyFb() { return this.frmInsertAppointment.controls['specialty']; }
    get doctorFb() { return this.frmInsertAppointment.controls['doctor']; }
    get descriptionFb() { return this.frmInsertAppointment.controls['description']; }
    get preferredDateFb() { return this.frmInsertAppointment.controls['preferredDate']; }

    constructor(private formBuilder: FormBuilder, private api: Api) {
        this.frmInsertAppointment = this.formBuilder.group({
            'personFullName': ['', [Validators.required]],
            'specialty': ['', [Validators.required]],
            'doctor': ['', [Validators.required]],
            'description': ['', [Validators.required]],
            'preferredDate': ['', [Validators.required]]
        });
    }

    ngOnInit(): void {
        this.initialization();

        // Cuando cambia la especialidad, recargamos la lista de doctores
        // y limpiamos el doctor seleccionado previamente (si ya no aplica).
        this.specialtyFb.valueChanges.subscribe((selectedSpecialty: any) => {
            this.doctorFb.setValue('');
            this.listDoctor = [];

            if (selectedSpecialty?.idSpecialty) {
                this.loadDoctorsBySpecialty(selectedSpecialty.idSpecialty);
            }
        });
    }

    private initialization(): void {
        this.api.invoke(apispecialtygetall).then((response: any) => {
            const data = typeof response === 'string' ? JSON.parse(response) : response;
            this.listSpecialty = data.listSpecialty;
        });
    }

    private loadDoctorsBySpecialty(idSpecialty: string): void {
        this.api.invoke(apidoctorgetbyspecialty, { idSpecialty }).then((response: any) => {
            const data = typeof response === 'string' ? JSON.parse(response) : response;
            this.listDoctor = data.listDoctor;
        });
    }

    addFile(): void {
        this.fileQuantity++;
        this.fileRowList.push({ 'id': 'file' + this.fileQuantity, 'label': 'Evidencia ' + this.fileQuantity });
    }

    removeFile(element: any): void {
        let tempElement = JSON.parse(JSON.stringify(element));
        let positionTemp = this.fileRowList.indexOf(element);
        this.fileRowList.splice(positionTemp, 1);
        let indexTemp = 0;
        this.listFile.every((value) => {
            if (value.name == tempElement.id) { return false; }
            indexTemp++;
            return true;
        });
        this.listFile.splice(indexTemp, 1);
    }

    onFileSelect(event: any, name: string): void {
        const file: Blob = event.currentFiles ? event.currentFiles[0] : event.files[0];
        this.listFile.push({ 'name': name, 'file': file });
    }

    sendInsertAppointment(event: Event): void {
        if (!this.frmInsertAppointment.valid) {
            this.frmInsertAppointment.markAllAsTouched();
            this.frmInsertAppointment.markAsDirty();
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Complete y corrija todos los datos faltantes.' });
            return;
        }

        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Confirmar operación?',
            header: 'Confirmación',
            icon: 'pi pi-info-circle',
            rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
            acceptButtonProps: { label: 'Aceptar', severity: 'primary' },
            accept: () => {
                let filesToSend: Blob[] = [];
                this.listFile.forEach((element: any) => { filesToSend.push(element.file); });

                const preferredDate = this.preferredDateFb.value ? new Date(this.preferredDateFb.value).toISOString() : undefined;

                const bodyParams: Apiappointmentinsert$Params = {
                    body: {
                        idSpecialty: this.specialtyFb.value.idSpecialty,
                        idDoctor: this.doctorFb.value.idDoctor,
                        personFullName: this.frmInsertAppointment.value.personFullName,
                        description: this.descriptionFb.value,
                        preferredDate: preferredDate,
                        files: filesToSend
                    }
                };

                this.api.invoke(apiappointmentinsert, bodyParams).then((response: any) => {
                    const data = typeof response === 'string' ? JSON.parse(response) : response;
                    switch (data.type) {
                        case 'success':
                            this.messageService.add({ severity: 'success', summary: 'Correcto', detail: data.listMessage[0] });
                            this.frmInsertAppointment.reset();
                            this.fileRowList = [];
                            this.listFile = [];
                            this.fileQuantity = 0;
                            this.listDoctor = [];
                            break;
                        case 'error':
                            this.messageService.add({ severity: 'error', summary: 'Error', detail: data.listMessage[0] });
                            break;
                    }
                }).catch(() => {
                    this.messageService.add({ severity: 'error', summary: 'Exception', detail: 'Algo ocurrió mal.' });
                });
            },
            reject: () => { }
        });
    }

    goBack(): void {
        this.router.navigate(['/appointment/my-appointments']);
    }
}