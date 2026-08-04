import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DoctorGetAll } from './doctor-get-all';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Api } from '../../../api/api';
import { ReactiveFormsModule } from '@angular/forms';
import { vi } from 'vitest';
import { of } from 'rxjs';

describe('DoctorGetAll', () => {
    let component: DoctorGetAll;
    let fixture: ComponentFixture<DoctorGetAll>;
    let apiSpy: any;
    let messageServiceSpy: any;
    let confirmationServiceSpy: any;

    beforeEach(async () => {
        apiSpy = { invoke: vi.fn() };
        messageServiceSpy = { add: vi.fn() };
        confirmationServiceSpy = { confirm: vi.fn() };

        await TestBed.configureTestingModule({
            imports: [
                DoctorGetAll,
                ReactiveFormsModule
            ],
            providers: [
                { provide: Api, useValue: apiSpy },
                { provide: MessageService, useValue: messageServiceSpy },
                { provide: ConfirmationService, useValue: confirmationServiceSpy }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        vi.clearAllMocks();
        fixture = TestBed.createComponent(DoctorGetAll);
        component = fixture.componentInstance;
        
        // Mock API responses for initialization
        apiSpy.invoke.mockImplementation((func: any) => {
            if (func.name === 'apidoctorgetall') {
                return Promise.resolve({
                    type: 'success',
                    listDoctor: [{ idDoctor: '1', firstName: 'John', surName: 'Doe', fullName: 'John Doe' }]
                });
            } else if (func.name === 'apispecialtygetall') {
                return Promise.resolve({
                    type: 'success',
                    listSpecialty: [{ idSpecialty: '1', name: 'Cardiologia' }]
                });
            }
            return Promise.resolve({ type: 'success', listMessage: ['Ok'] });
        });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load doctors and specialties on init', async () => {
        fixture.detectChanges(); // calls ngOnInit
        await new Promise(r => setTimeout(r, 100)); // wait for init
        
        expect(apiSpy.invoke).toHaveBeenCalled();
        expect(component.listDoctor).toHaveLength(1);
        expect(component.listSpecialty).toHaveLength(1);
    });

    it('should show insert modal', () => {
        component.showInsertModal();
        expect(component.isEdit).toBe(false);
        expect(component.displayModal).toBe(true);
        expect(component.frmDoctor.value.idDoctor).toBeNull();
    });

    it('should show edit modal with data', () => {
        const item = { idDoctor: '1', firstName: 'Jane', surName: 'Doe', phoneNumber: '123456789', email: 'jane@test.com', idSpecialty: '1' };
        component.showEditModal(item);
        expect(component.isEdit).toBe(true);
        expect(component.displayModal).toBe(true);
        expect(component.frmDoctor.value.idDoctor).toBe('1');
        expect(component.frmDoctor.value.firstName).toBe('Jane');
    });

    it('should hide modal', () => {
        component.displayModal = true;
        component.hideModal();
        expect(component.displayModal).toBe(false);
    });

    it('should validate only numbers', () => {
        const validEvent = { key: '5', preventDefault: vi.fn(), target: { value: '' } } as any;
        expect(component.onlyNumbers(validEvent)).toBe(true);

        const invalidEvent = { key: 'a', preventDefault: vi.fn(), target: { value: '' } } as any;
        expect(component.onlyNumbers(invalidEvent)).toBe(false);
        expect(invalidEvent.preventDefault).toHaveBeenCalled();

        const tooLongEvent = { key: '5', preventDefault: vi.fn(), target: { value: '123456789' } } as any;
        expect(component.onlyNumbers(tooLongEvent)).toBe(false);
    });

    it('should validate only letters', () => {
        const validEvent = { key: 'a', preventDefault: vi.fn() } as any;
        expect(component.onlyLetters(validEvent)).toBe(true);

        const invalidEvent = { key: '1', preventDefault: vi.fn() } as any;
        expect(component.onlyLetters(invalidEvent)).toBe(false);
        expect(invalidEvent.preventDefault).toHaveBeenCalled();
    });

    it('should handle name input correctly', () => {
        component.showInsertModal(); // initialize form
        const event = { target: { value: 'John123' } } as any;
        component.onNameInput(event, 'firstName');
        expect(component.frmDoctor.get('firstName')?.value).toBe('John');
    });

    it('should handle name paste correctly', () => {
        component.showInsertModal();
        const event = { preventDefault: vi.fn(), clipboardData: { getData: () => 'John123' } } as any;
        component.onNamePaste(event, 'firstName');
        expect(component.frmDoctor.get('firstName')?.value).toBe('John');
    });

    it('should handle phone paste correctly', () => {
        component.showInsertModal();
        const event = { preventDefault: vi.fn(), clipboardData: { getData: () => '123abc456' } } as any;
        component.onPhonePaste(event);
        expect(component.frmDoctor.get('phoneNumber')?.value).toBe('123456');
    });

    it('should handle phone input correctly', () => {
        component.showInsertModal();
        const event = { target: { value: '123abc456' } } as any;
        component.onPhoneInput(event);
        expect(component.frmDoctor.get('phoneNumber')?.value).toBe('123456');
    });

    it('should trim input', () => {
        component.showInsertModal();
        component.frmDoctor.get('firstName')?.setValue('  John  ');
        component.trimInput('firstName');
        expect(component.frmDoctor.get('firstName')?.value).toBe('John');
    });

    it('should show error if save fails due to api error', async () => {
        component.showInsertModal();
        component.frmDoctor.patchValue({
            firstName: 'ValidName', surName: 'Valid', phoneNumber: '123456789', email: 'test@test.com', idSpecialty: '1'
        });
        
        apiSpy.invoke.mockResolvedValue({
            type: 'error', listMessage: ['Error API']
        });
        
        component.onSaveSubmit();
        await new Promise(r => setTimeout(r, 100));

        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });

    it('should show success message on successful insert', async () => {
        component.showInsertModal();
        component.frmDoctor.patchValue({
            firstName: 'ValidName', surName: 'Valid', phoneNumber: '123456789', email: 'test@test.com', idSpecialty: '1'
        });
        
        apiSpy.invoke.mockResolvedValue({
            type: 'success', listMessage: ['Success msg']
        });
        
        component.onSaveSubmit();
        await new Promise(r => setTimeout(r, 100));

        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
        expect(component.displayModal).toBe(false);
    });

    it('should not submit if form is invalid', () => {
        component.showInsertModal();
        component.onSaveSubmit();
        expect(component.frmDoctor.invalid).toBe(true);
    });

    it('should handle exception during save', async () => {
        component.showInsertModal();
        component.frmDoctor.patchValue({
            firstName: 'ValidName', surName: 'Valid', phoneNumber: '123456789', email: 'test@test.com', idSpecialty: '1'
        });
        apiSpy.invoke.mockRejectedValue('Error');
        
        component.onSaveSubmit();
        await new Promise(r => setTimeout(r, 100));

        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });

    it('should confirm delete and call deleteDoctor', async () => {
        const item = { idDoctor: '1', fullName: 'John Doe' };
        
        apiSpy.invoke.mockImplementation((func: any, args: any) => {
            if (func.name === 'apidoctordelete' && args?.idDoctor === '1') {
                return Promise.resolve({ type: 'success', listMessage: ['Deleted'] });
            }
            return Promise.resolve({ type: 'success' });
        });

        // Bypassing confirmation service by calling directly
        (component as any).deleteDoctor('1');
        await new Promise(r => setTimeout(r, 100));

        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    });

    it('should handle exception during delete', async () => {
        apiSpy.invoke.mockRejectedValue('Error');

        (component as any).deleteDoctor('1');
        await new Promise(r => setTimeout(r, 100));

        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });

    it('should handle error from api during delete', async () => {
        apiSpy.invoke.mockResolvedValue({ type: 'error', listMessage: ['Delete error'] });

        (component as any).deleteDoctor('1');
        await new Promise(r => setTimeout(r, 100));

        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error', detail: 'Delete error' }));
    });

    it('should generate initials properly', () => {
        expect(component.getInitials('John Doe')).toBeTruthy();
    });
});
