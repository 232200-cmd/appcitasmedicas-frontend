import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentGetAll } from './appointment-get-all';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Api } from '../../../api/api';
import { vi } from 'vitest';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

describe('AppointmentGetAll', () => {
    let component: AppointmentGetAll;
    let fixture: ComponentFixture<AppointmentGetAll>;
    let apiSpy: any;
    let messageServiceSpy: any;
    let confirmationServiceSpy: any;

    beforeEach(async () => {
        apiSpy = { invoke: vi.fn() };
        messageServiceSpy = { add: vi.fn() };
        confirmationServiceSpy = { confirm: vi.fn() };

        await TestBed.configureTestingModule({
            imports: [AppointmentGetAll],
            providers: [
                { provide: Api, useValue: apiSpy },
                { provide: MessageService, useValue: messageServiceSpy },
                { provide: ConfirmationService, useValue: confirmationServiceSpy },
                { provide: ActivatedRoute, useValue: {} },
                DatePipe
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        vi.clearAllMocks();
        fixture = TestBed.createComponent(AppointmentGetAll);
        component = fixture.componentInstance;

        apiSpy.invoke.mockResolvedValue({
            type: 'success',
            listAppointment: [
                { idAppointment: '1', code: 'C-001', status: 'Pendiente de revisión' },
                { idAppointment: '2', code: 'C-002', status: 'Visto' }
            ]
        });
    });

    it('should create and load data on init', async () => {
        fixture.detectChanges();
        await new Promise(r => setTimeout(r, 100)); // allow setTimeout inside initialization to resolve

        expect(component).toBeTruthy();
        expect(apiSpy.invoke).toHaveBeenCalled();
        expect(component.listAppointment).toHaveLength(2);
        expect(component.countByStatus('Visto')).toBe(1);
    });

    it('should get initials and severity', () => {
        expect(component.getInitials('John Doe')).toBe('JD');
        expect(component.getSeverity('Cerrado')).toBe('success');
    });

    it('should mark appointment as seen', async () => {
        fixture.detectChanges();
        await new Promise(r => setTimeout(r, 100));

        apiSpy.invoke.mockResolvedValueOnce({ type: 'success', listMessage: ['Success'] });
        const item = { idAppointment: '1', code: 'C-001', status: 'Pendiente de revisión' };
        
        component.seenAppointment({ target: {} } as Event, item);
        const confirmArgs = confirmationServiceSpy.confirm.mock.calls[0][0];
        confirmArgs.accept();

        await new Promise(r => setTimeout(r, 100));
        expect(item.status).toBe('Visto');
        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    });

    it('should reject appointment', async () => {
        fixture.detectChanges();
        await new Promise(r => setTimeout(r, 100));

        apiSpy.invoke.mockResolvedValueOnce({ type: 'success', listMessage: ['Success'] });
        const item = { idAppointment: '1', code: 'C-001', status: 'Pendiente de revisión' };
        
        component.rejectAppointment({ target: {} } as Event, item);
        const confirmArgs = confirmationServiceSpy.confirm.mock.calls[0][0];
        confirmArgs.accept();

        await new Promise(r => setTimeout(r, 100));
        expect(item.status).toBe('Rechazado');
    });

    it('should close appointment', async () => {
        fixture.detectChanges();
        await new Promise(r => setTimeout(r, 100));

        apiSpy.invoke.mockResolvedValueOnce({ type: 'success', listMessage: ['Success'] });
        const item = { idAppointment: '1', code: 'C-001', status: 'Pendiente de revisión' };
        
        component.closeAppointment({ target: {} } as Event, item);
        const confirmArgs = confirmationServiceSpy.confirm.mock.calls[0][0];
        confirmArgs.accept();

        await new Promise(r => setTimeout(r, 100));
        expect(item.status).toBe('Cerrado');
    });

    it('should handle errors in seenAppointment', async () => {
        apiSpy.invoke.mockRejectedValueOnce('Error');
        const item = { idAppointment: '1', code: 'C-001', status: 'Pendiente de revisión' };
        
        component.seenAppointment({ target: {} } as Event, item);
        const confirmArgs = confirmationServiceSpy.confirm.mock.calls[0][0];
        confirmArgs.accept();

        await new Promise(r => setTimeout(r, 100));
        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });
    
    it('should handle errors in rejectAppointment', async () => {
        apiSpy.invoke.mockRejectedValueOnce('Error');
        const item = { idAppointment: '1', code: 'C-001', status: 'Pendiente de revisión' };
        
        component.rejectAppointment({ target: {} } as Event, item);
        const confirmArgs = confirmationServiceSpy.confirm.mock.calls[0][0];
        confirmArgs.accept();

        await new Promise(r => setTimeout(r, 100));
        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });

    it('should handle errors in closeAppointment', async () => {
        apiSpy.invoke.mockRejectedValueOnce('Error');
        const item = { idAppointment: '1', code: 'C-001', status: 'Pendiente de revisión' };
        
        component.closeAppointment({ target: {} } as Event, item);
        const confirmArgs = confirmationServiceSpy.confirm.mock.calls[0][0];
        confirmArgs.accept();

        await new Promise(r => setTimeout(r, 100));
        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });
});
