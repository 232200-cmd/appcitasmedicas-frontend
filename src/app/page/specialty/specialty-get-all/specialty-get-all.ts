import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Api } from '../../../api/api';
import { apispecialtygetall } from '../../../api/functions';

@Component({
    selector: 'app-specialty-get-all',
    standalone: true,
    imports: [
        TableModule,
        CardModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        ButtonModule
    ],
    templateUrl: './specialty-get-all.html',
    styleUrl: './specialty-get-all.css'
})
export class SpecialtyGetAll implements OnInit {
    private cdr = inject(ChangeDetectorRef);
    private messageService = inject(MessageService);

    listSpecialty: any[] = [];
    
    constructor(private api: Api) {
    }

    ngOnInit(): void {
        this.initialization();
    }

    private initialization(): void {
        setTimeout(() => {
            this.api.invoke(apispecialtygetall).then((response: any) => {
                const data = typeof response === 'string' ? JSON.parse(response) : response;
                this.listSpecialty = data.listSpecialty || [];
                this.cdr.detectChanges();
            });
        }, 0);
    }
}
