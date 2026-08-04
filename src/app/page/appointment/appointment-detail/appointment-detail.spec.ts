import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentDetail } from './appointment-detail';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Api } from '../../../api/api';
import { AuthService } from '../../../auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { DatePipe } from '@angular/common';

describe('AppointmentDetail', () => {
    let component: AppointmentDetail;
    let fixture: ComponentFixture<AppointmentDetail>;
    let apiSpy: any;
    let messageServiceSpy: any;
    let confirmationServiceSpy: any;
    let routerSpy: any;
    let authServiceSpy: any;
    let httpTestingController: HttpTestingController;

    const mockAppointment = {
        idAppointment: '1',
        code: 'APT-123',
        status: 'Pendiente de revisión',
        createdAt: '2023-01-01T10:00:00Z',
        updatedAt: '2023-01-02T10:00:00Z',
        comments: [],
        files: []
    };

    beforeEach(async () => {
        apiSpy = { invoke: vi.fn() };
        messageServiceSpy = { add: vi.fn() };
        confirmationServiceSpy = { confirm: vi.fn() };
        routerSpy = { navigate: vi.fn() };
        authServiceSpy = { isAdmin: vi.fn(), currentUser: vi.fn() };

        await TestBed.configureTestingModule({
            imports: [
                AppointmentDetail,
                HttpClientTestingModule
            ],
            providers: [
                { provide: Api, useValue: apiSpy },
                { provide: MessageService, useValue: messageServiceSpy },
                { provide: ConfirmationService, useValue: confirmationServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: AuthService, useValue: authServiceSpy },
                {
                    provide: ActivatedRoute,
                    useValue: { snapshot: { paramMap: { get: () => '1' } } }
                },
                DatePipe
            ]
        }).compileComponents();
        
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    beforeEach(() => {
        vi.clearAllMocks();
        fixture = TestBed.createComponent(AppointmentDetail);
        component = fixture.componentInstance;

        apiSpy.invoke.mockResolvedValue({
            type: 'success',
            listAppointment: [mockAppointment]
        });
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should create and load appointment on init', async () => {
        fixture.detectChanges();
        await new Promise(r => setTimeout(r, 100));

        expect(component).toBeTruthy();
        expect(component.appointment).toBeTruthy();
        expect(component.appointment.idAppointment).toBe('1');
    });

    it('should navigate back to list for admin', () => {
        authServiceSpy.isAdmin.mockReturnValue(true);
        component.goToList();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/appointment/getall']);
    });

    it('should navigate back to list for user', () => {
        authServiceSpy.isAdmin.mockReturnValue(false);
        component.goToList();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/appointment/my-appointments']);
    });

    it('should generate initials properly', () => {
        expect(component.getInitials('John Doe')).toBe('JD');
        expect(component.getInitials('John')).toBe('J');
        expect(component.getInitials('')).toBe('U');
    });

    it('should get severity based on status', () => {
        expect(component.getSeverity('Pendiente de revisión')).toBe('warn');
        expect(component.getSeverity('Visto')).toBe('info');
        expect(component.getSeverity('En coordinación')).toBe('secondary');
        expect(component.getSeverity('Cerrado')).toBe('success');
        expect(component.getSeverity('Rechazado')).toBe('danger');
        expect(component.getSeverity('Unknown')).toBe('info');
    });

    it('should get step class properly based on status', async () => {
        fixture.detectChanges();
        await new Promise(r => setTimeout(r, 100)); // wait for appointment to load

        component.appointment.status = 'En coordinación';
        expect(component.getStepClass('pending')).toBe('tl-done');
        expect(component.getStepClass('seen')).toBe('tl-done');
        expect(component.getStepClass('coordination')).toBe('tl-current');
        expect(component.getStepClass('closed')).toBe('tl-pending');

        component.appointment.status = 'Rechazado';
        expect(component.getStepClass('pending')).toBe('tl-done');
        expect(component.getStepClass('refused')).toBe('tl-current');
        expect(component.getStepClass('closed')).toBe('tl-pending');
    });
    
    it('should return pending if appointment is null in getStepClass', () => {
        component.appointment = null;
        expect(component.getStepClass('pending')).toBe('tl-pending');
    });

    it('should get step date properly', async () => {
        fixture.detectChanges();
        await new Promise(r => setTimeout(r, 100)); // load appointment

        component.appointment.status = 'En coordinación';
        // pending step is tl-done, so returns updated date or created date?
        // for pending, it always returns createdAt
        expect(component.getStepDate('pending')).toContain('2023');
        // coordination is tl-current, returns updatedAt
        expect(component.getStepDate('coordination')).toContain('2023');
        // closed is tl-pending, returns empty
        expect(component.getStepDate('closed')).toBe('');
    });

    it('should return empty step date if appointment is null', () => {
        component.appointment = null;
        expect(component.getStepDate('pending')).toBe('');
    });

    it('should coordinate appointment', async () => {
        fixture.detectChanges();
        await new Promise(r => setTimeout(r, 100));

        apiSpy.invoke.mockResolvedValueOnce({ type: 'success', listMessage: ['Coordinado'] });

        (component as any).coordinateAppointment({ target: {} } as Event);
        
        // Mock the confirm action
        const confirmArgs = confirmationServiceSpy.confirm.mock.calls[0][0];
        confirmArgs.accept();

        await new Promise(r => setTimeout(r, 100));

        expect(component.appointment.status).toBe('En coordinación');
        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    });
    
    it('should reject appointment', async () => {
        fixture.detectChanges();
        await new Promise(r => setTimeout(r, 100));

        apiSpy.invoke.mockResolvedValueOnce({ type: 'success', listMessage: ['Rechazado'] });

        (component as any).rejectAppointment({ target: {} } as Event);
        
        const confirmArgs = confirmationServiceSpy.confirm.mock.calls[0][0];
        confirmArgs.accept();

        await new Promise(r => setTimeout(r, 100));

        expect(component.appointment.status).toBe('Rechazado');
        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    });

    it('should close appointment', async () => {
        fixture.detectChanges();
        await new Promise(r => setTimeout(r, 100));

        apiSpy.invoke.mockResolvedValueOnce({ type: 'success', listMessage: ['Cerrado'] });

        (component as any).closeAppointment({ target: {} } as Event);
        
        const confirmArgs = confirmationServiceSpy.confirm.mock.calls[0][0];
        confirmArgs.accept();

        await new Promise(r => setTimeout(r, 100));

        expect(component.appointment.status).toBe('Cerrado');
        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    });

    it('should show error when rejecting appointment fails', async () => {
        fixture.detectChanges();
        await new Promise(r => setTimeout(r, 100));

        apiSpy.invoke.mockRejectedValueOnce('Error');

        (component as any).rejectAppointment({ target: {} } as Event);
        
        const confirmArgs = confirmationServiceSpy.confirm.mock.calls[0][0];
        confirmArgs.accept();

        await new Promise(r => setTimeout(r, 100));

        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });

    it('should show error when coordinating appointment fails', async () => {
        fixture.detectChanges();
        await new Promise(r => setTimeout(r, 100));

        apiSpy.invoke.mockRejectedValueOnce('Error');

        (component as any).coordinateAppointment({ target: {} } as Event);
        
        const confirmArgs = confirmationServiceSpy.confirm.mock.calls[0][0];
        confirmArgs.accept();

        await new Promise(r => setTimeout(r, 100));

        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });
    
    it('should show error when closing appointment fails', async () => {
        fixture.detectChanges();
        await new Promise(r => setTimeout(r, 100));

        apiSpy.invoke.mockRejectedValueOnce('Error');

        (component as any).closeAppointment({ target: {} } as Event);
        
        const confirmArgs = confirmationServiceSpy.confirm.mock.calls[0][0];
        confirmArgs.accept();

        await new Promise(r => setTimeout(r, 100));

        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });

    it('should not send comment if empty', async () => {
        fixture.detectChanges();
        await new Promise(r => setTimeout(r, 100));

        component.newComment = '   ';
        component.sendComment();

        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'warn' }));
        expect(apiSpy.invoke).toHaveBeenCalledTimes(1); // only the init call
    });

    it('should send comment', async () => {
        fixture.detectChanges();
        await new Promise(r => setTimeout(r, 100));

        authServiceSpy.currentUser.mockReturnValue({ firstName: 'Test User' });
        apiSpy.invoke.mockResolvedValueOnce({ type: 'success', listMessage: ['Comentario agregado'] });

        component.newComment = 'This is a comment';
        component.sendComment();

        await new Promise(r => setTimeout(r, 100));

        expect(component.appointment.comments).toHaveLength(1);
        expect(component.appointment.comments[0].description).toBe('This is a comment');
        expect(component.appointment.comments[0].authorName).toBe('Test User');
        expect(component.newComment).toBe('');
        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    });
    
    it('should handle comment error', async () => {
        fixture.detectChanges();
        await new Promise(r => setTimeout(r, 100));

        apiSpy.invoke.mockRejectedValueOnce('Error');

        component.newComment = 'This is a comment';
        component.sendComment();

        await new Promise(r => setTimeout(r, 100));

        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });

    it('should download file', () => {
        const file = { idAppointmentfile: '123', name: 'test.pdf' };
        
        const createObjectURLSpy = vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:url');
        const revokeObjectURLSpy = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

        const appendChildSpy = vi.spyOn(document.body, 'appendChild');
        const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

        component.downloadFile(file);

        const req = httpTestingController.expectOne(request => request.url.includes('/appointment/file/download/123'));
        expect(req.request.method).toBe('GET');
        req.flush(new Blob(['test content'], { type: 'application/pdf' }));

        expect(createObjectURLSpy).toHaveBeenCalled();
        expect(appendChildSpy).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalled();
        expect(revokeObjectURLSpy).toHaveBeenCalled();
    });

    it('should handle download file error', () => {
        const file = { idAppointmentfile: '123', name: 'test.pdf' };
        
        component.downloadFile(file);

        const req = httpTestingController.expectOne(request => request.url.includes('/appointment/file/download/123'));
        req.error(new ProgressEvent('error'));

        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });
});
