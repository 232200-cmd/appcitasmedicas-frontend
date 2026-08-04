import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentDashboard } from './dashboard';
import { Api } from '../../../api/api';
import { RouterTestingModule } from '@angular/router/testing';
import { vi } from 'vitest';

describe('AppointmentDashboard', () => {
    let component: AppointmentDashboard;
    let fixture: ComponentFixture<AppointmentDashboard>;
    let apiSpy: any;

    beforeEach(async () => {
        apiSpy = { invoke: vi.fn() };

        await TestBed.configureTestingModule({
            imports: [
                AppointmentDashboard,
                RouterTestingModule
            ],
            providers: [
                { provide: Api, useValue: apiSpy }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        vi.clearAllMocks();
        fixture = TestBed.createComponent(AppointmentDashboard);
        component = fixture.componentInstance;
        
        apiSpy.invoke.mockResolvedValue({
            type: 'success',
            listAppointment: [
                { idAppointment: '1', status: 'Pendiente de revisión' },
                { idAppointment: '2', status: 'Pendiente de revisión' },
                { idAppointment: '3', status: 'Cerrado' }
            ]
        });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load appointments on init', async () => {
        fixture.detectChanges(); // calls ngOnInit
        await new Promise(r => setTimeout(r, 100)); // wait for init
        
        expect(apiSpy.invoke).toHaveBeenCalled();
        expect(component.listAppointment).toHaveLength(3);
    });

    it('should count appointments by status', async () => {
        fixture.detectChanges();
        await new Promise(r => setTimeout(r, 100));

        expect(component.countByStatus('Pendiente de revisión')).toBe(2);
        expect(component.countByStatus('Cerrado')).toBe(1);
        expect(component.countByStatus('Rechazado')).toBe(0);
    });

    it('should get severity based on status', () => {
        expect(component.getSeverity('Cerrado')).toBe('success');
        expect(component.getSeverity('Pendiente de revisión')).toBe('warn');
        expect(component.getSeverity('Rechazado')).toBe('danger');
        expect(component.getSeverity('Desconocido')).toBe('info');
    });
});
