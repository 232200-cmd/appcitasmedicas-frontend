import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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

    // Password strength signals
    passwordValue = signal<string>('');
    hasMinLength = computed(() => this.passwordValue().length >= 8);
    hasUppercase = computed(() => /[A-Z]/.test(this.passwordValue()));
    hasLowercase = computed(() => /[a-z]/.test(this.passwordValue()));
    hasNumber = computed(() => /[0-9]/.test(this.passwordValue()));
    hasSpecial = computed(() => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.passwordValue()));

    strengthLevel = computed(() => {
        const checks = [this.hasMinLength(), this.hasUppercase(), this.hasLowercase(), this.hasNumber(), this.hasSpecial()];
        const passed = checks.filter(Boolean).length;
        if (passed <= 1) return { label: 'Muy débil', class: 'strength-very-weak', percent: 20 };
        if (passed === 2) return { label: 'Débil', class: 'strength-weak', percent: 40 };
        if (passed === 3) return { label: 'Regular', class: 'strength-fair', percent: 60 };
        if (passed === 4) return { label: 'Fuerte', class: 'strength-strong', percent: 80 };
        return { label: 'Muy segura', class: 'strength-very-strong', percent: 100 };
    });

    get firstNameFb() { return this.frmRegister.controls['firstName']; }
    get surNameFb() { return this.frmRegister.controls['surName']; }
    get emailFb() { return this.frmRegister.controls['email']; }
    get passwordFb() { return this.frmRegister.controls['password']; }

    constructor(private formBuilder: FormBuilder, private api: Api) {
        this.frmRegister = this.formBuilder.group({
            'firstName': ['', [Validators.required]],
            'surName': ['', [Validators.required]],
            'email': ['', [Validators.required, Validators.email]],
            'password': ['', [Validators.required, this.passwordStrengthValidator.bind(this)]]
        });
    }

    passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
        const value = control.value || '';
        this.passwordValue.set(value);

        const errors: ValidationErrors = {};
        if (value.length < 8) errors['minLength'] = true;
        if (!/[A-Z]/.test(value)) errors['noUppercase'] = true;
        if (!/[a-z]/.test(value)) errors['noLowercase'] = true;
        if (!/[0-9]/.test(value)) errors['noNumber'] = true;
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) errors['noSpecial'] = true;

        return Object.keys(errors).length ? { passwordStrength: errors } : null;
    }

    onPasswordInput(): void {
        const value = this.frmRegister.get('password')?.value || '';
        this.passwordValue.set(value);
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
