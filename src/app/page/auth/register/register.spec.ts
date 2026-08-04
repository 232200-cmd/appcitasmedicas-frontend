import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Register } from './register';
import { MessageService } from 'primeng/api';
import { Api } from '../../../api/api';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { vi } from 'vitest';

describe('Register', () => {
    let component: Register;
    let fixture: ComponentFixture<Register>;
    let apiSpy: any;
    let messageServiceSpy: any;
    let routerSpy: any;

    beforeEach(async () => {
        apiSpy = { invoke: vi.fn() };
        messageServiceSpy = { add: vi.fn() };
        routerSpy = { navigate: vi.fn() };

        await TestBed.configureTestingModule({
            imports: [
                Register,
                ReactiveFormsModule
            ],
            providers: [
                { provide: Api, useValue: apiSpy },
                { provide: MessageService, useValue: messageServiceSpy },
                { provide: Router, useValue: routerSpy }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        vi.clearAllMocks();
        fixture = TestBed.createComponent(Register);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show error if form is invalid on submit', () => {
        component.frmRegister.patchValue({ firstName: '', surName: '', email: '', password: '' });
        component.onSubmit();
        expect(component.frmRegister.invalid).toBe(true);
        expect(apiSpy.invoke).not.toHaveBeenCalled();
    });

    it('should validate password strength correctly', () => {
        const passwordCtrl = component.frmRegister.get('password');
        
        passwordCtrl?.setValue('weak');
        expect(passwordCtrl?.hasError('passwordStrength')).toBe(true);
        
        passwordCtrl?.setValue('StrongPass1!');
        expect(passwordCtrl?.hasError('passwordStrength')).toBe(false);
    });

    it('should update password signals on input', () => {
        component.frmRegister.get('password')?.setValue('Test1!');
        component.onPasswordInput();
        expect(component.passwordValue()).toBe('Test1!');
    });

    it('should calculate strength level correctly', () => {
        component.passwordValue.set('a'); // 1 passed (lowercase)
        expect(component.strengthLevel().percent).toBe(20);

        component.passwordValue.set('Ab'); // 2 passed
        expect(component.strengthLevel().percent).toBe(40);

        component.passwordValue.set('Ab1'); // 3 passed
        expect(component.strengthLevel().percent).toBe(60);

        component.passwordValue.set('Ab1!'); // 4 passed
        expect(component.strengthLevel().percent).toBe(80);

        component.passwordValue.set('Ab1!Longpass'); // 5 passed
        expect(component.strengthLevel().percent).toBe(100);
    });

    it('should register successfully and navigate to login', async () => {
        component.frmRegister.patchValue({
            firstName: 'John',
            surName: 'Doe',
            email: 'john@test.com',
            password: 'StrongPassword1!'
        });
        
        apiSpy.invoke.mockResolvedValue({
            type: 'success',
            listMessage: ['Registro exitoso']
        });

        component.onSubmit();
        await new Promise(r => setTimeout(r, 100));

        expect(apiSpy.invoke).toHaveBeenCalled();
        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
        expect(component.loading()).toBe(false);
    });

    it('should show error message on failed registration', async () => {
        component.frmRegister.patchValue({
            firstName: 'John',
            surName: 'Doe',
            email: 'john@test.com',
            password: 'StrongPassword1!'
        });
        
        apiSpy.invoke.mockResolvedValue({
            type: 'error',
            listMessage: ['Email ya registrado']
        });

        component.onSubmit();
        await new Promise(r => setTimeout(r, 100));

        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error', detail: 'Email ya registrado' }));
    });

    it('should handle exceptions during registration', async () => {
        component.frmRegister.patchValue({
            firstName: 'John',
            surName: 'Doe',
            email: 'john@test.com',
            password: 'StrongPassword1!'
        });
        
        apiSpy.invoke.mockRejectedValue('Server error');

        component.onSubmit();
        await new Promise(r => setTimeout(r, 100));

        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error', detail: 'Algo ocurrió mal.' }));
        expect(component.loading()).toBe(false);
    });

    it('should navigate to login when goToLogin is called', () => {
        component.goToLogin();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
});
