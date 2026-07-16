import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Api } from '../../../api/api';
import { apiauthlogin, Apiauthlogin$Params } from '../../../api/functions';
import { AuthService } from '../../../auth/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        InputTextModule,
        PasswordModule,
        ButtonModule
    ],
    templateUrl: './login.html',
    styleUrl: './login.css'
})
export class Login {
    private messageService = inject(MessageService);
    private authService = inject(AuthService);
    private router = inject(Router);

    frmLogin: FormGroup;
    loading = signal<boolean>(false);

    get emailFb() { return this.frmLogin.controls['email']; }
    get passwordFb() { return this.frmLogin.controls['password']; }

    constructor(private formBuilder: FormBuilder, private api: Api) {
        this.frmLogin = this.formBuilder.group({
            'email': ['', [Validators.required, Validators.email]],
            'password': ['', [Validators.required]]
        });
    }

    onSubmit(): void {
        if (!this.frmLogin.valid) {
            this.frmLogin.markAllAsTouched();
            return;
        }

        this.loading.set(true);

        const params: Apiauthlogin$Params = {
            body: {
                email: this.frmLogin.value.email,
                password: this.frmLogin.value.password
            }
        };

        this.api.invoke(apiauthlogin, params).then((response: any) => {
            const data = typeof response === 'string' ? JSON.parse(response) : response;
            this.loading.set(false);

            if (data.type === 'success') {
                this.authService.setSession(data.token, {
                    idUser: data.idUser,
                    firstName: data.firstName,
                    surName: data.surName,
                    email: data.email,
                    role: data.role
                });

                this.messageService.add({ severity: 'success', summary: 'Bienvenido', detail: data.listMessage[0] });

                if (data.role === 'Administrador') {
                    this.router.navigate(['/appointment/dashboard']);
                } else {
                    this.router.navigate(['/appointment/my-appointments']);
                }
            } else {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: data.listMessage[0] });
            }
        }).catch(() => {
            this.loading.set(false);
            this.messageService.add({ severity: 'error', summary: 'Exception', detail: 'Algo ocurrió mal.' });
        });
    }

    goToRegister(): void {
        this.router.navigate(['/auth/register']);
    }
}
