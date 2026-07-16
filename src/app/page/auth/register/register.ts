import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Api } from '../../../api/api';
import { apiauthregister, Apiauthregister$Params } from '../../../api/functions';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        InputTextModule,
        PasswordModule,
        ButtonModule
    ],
    templateUrl: './register.html',
    styleUrl: './register.css'
})
export class Register {
    private messageService = inject(MessageService);
    private router = inject(Router);

    frmRegister: FormGroup;
    loading = signal<boolean>(false);

    get firstNameFb() { return this.frmRegister.controls['firstName']; }
    get surNameFb() { return this.frmRegister.controls['surName']; }
    get emailFb() { return this.frmRegister.controls['email']; }
    get passwordFb() { return this.frmRegister.controls['password']; }

    constructor(private formBuilder: FormBuilder, private api: Api) {
        this.frmRegister = this.formBuilder.group({
            'firstName': ['', [Validators.required]],
            'surName': ['', [Validators.required]],
            'email': ['', [Validators.required, Validators.email]],
            'password': ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    onSubmit(): void {
        if (!this.frmRegister.valid) {
            this.frmRegister.markAllAsTouched();
            return;
        }

        this.loading.set(true);

        const params: Apiauthregister$Params = {
            body: {
                firstName: this.frmRegister.value.firstName,
                surName: this.frmRegister.value.surName,
                email: this.frmRegister.value.email,
                password: this.frmRegister.value.password
            }
        };

        this.api.invoke(apiauthregister, params).then((response: any) => {
            const data = typeof response === 'string' ? JSON.parse(response) : response;
            this.loading.set(false);

            if (data.type === 'success') {
                this.messageService.add({ severity: 'success', summary: 'Correcto', detail: data.listMessage[0] });
                this.router.navigate(['/auth/login']);
            } else {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: data.listMessage[0] });
            }
        }).catch(() => {
            this.loading.set(false);
            this.messageService.add({ severity: 'error', summary: 'Exception', detail: 'Algo ocurrió mal.' });
        });
    }

    goToLogin(): void {
        this.router.navigate(['/auth/login']);
    }
}
