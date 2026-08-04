import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';
import { MessageService } from 'primeng/api';
import { Api } from '../../../api/api';
import { AuthService } from '../../../auth/auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { vi } from 'vitest';

describe('Login', () => {
    let component: Login;
    let fixture: ComponentFixture<Login>;
    let apiSpy: any;
    let messageServiceSpy: any;
    let authServiceSpy: any;
    let routerSpy: any;

    beforeEach(async () => {
        apiSpy = { invoke: vi.fn() };
        messageServiceSpy = { add: vi.fn() };
        authServiceSpy = { setSession: vi.fn() };
        routerSpy = { navigate: vi.fn() };

        await TestBed.configureTestingModule({
            imports: [
                Login,
                ReactiveFormsModule
            ],
            providers: [
                { provide: Api, useValue: apiSpy },
                { provide: MessageService, useValue: messageServiceSpy },
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        vi.clearAllMocks();
        fixture = TestBed.createComponent(Login);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show error if form is invalid', () => {
        component.frmLogin.patchValue({ email: '', password: '' });
        component.onSubmit();
        expect(component.frmLogin.invalid).toBe(true);
        expect(apiSpy.invoke).not.toHaveBeenCalled();
    });

    it('should login as Admin and navigate to dashboard', async () => {
        component.frmLogin.patchValue({ email: 'admin@test.com', password: '123' });
        apiSpy.invoke.mockResolvedValue({
            type: 'success',
            token: 'fake-token',
            idUser: '1',
            firstName: 'Admin',
            surName: 'Test',
            email: 'admin@test.com',
            role: 'Administrador',
            listMessage: ['Success']
        });

        component.onSubmit();
        await new Promise(r => setTimeout(r, 100));

        expect(apiSpy.invoke).toHaveBeenCalled();
        expect(authServiceSpy.setSession).toHaveBeenCalledWith('fake-token', expect.any(Object));
        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/appointment/dashboard']);
        expect(component.loading()).toBe(false);
    });

    it('should login as Paciente and navigate to my-appointments', async () => {
        component.frmLogin.patchValue({ email: 'paciente@test.com', password: '123' });
        apiSpy.invoke.mockResolvedValue({
            type: 'success',
            token: 'fake-token',
            idUser: '2',
            firstName: 'Paciente',
            surName: 'Test',
            email: 'paciente@test.com',
            role: 'Paciente',
            listMessage: ['Success']
        });

        component.onSubmit();
        await new Promise(r => setTimeout(r, 100));

        expect(routerSpy.navigate).toHaveBeenCalledWith(['/appointment/my-appointments']);
    });

    it('should show error message on api error response', async () => {
        component.frmLogin.patchValue({ email: 'error@test.com', password: '123' });
        apiSpy.invoke.mockResolvedValue({
            type: 'error',
            listMessage: ['Credenciales inválidas']
        });

        component.onSubmit();
        await new Promise(r => setTimeout(r, 100));

        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error', detail: 'Credenciales inválidas' }));
    });

    it('should show error message on exception', async () => {
        component.frmLogin.patchValue({ email: 'error@test.com', password: '123' });
        apiSpy.invoke.mockRejectedValue('Server error');

        component.onSubmit();
        await new Promise(r => setTimeout(r, 100));

        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error', detail: 'Algo ocurrió mal.' }));
        expect(component.loading()).toBe(false);
    });

    it('should navigate to register', () => {
        component.goToRegister();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/register']);
    });
});
