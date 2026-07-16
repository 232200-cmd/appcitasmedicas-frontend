import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Api } from '../../../api/api';
import { apidoctorgetall } from '../../../api/functions';

@Component({
    selector: 'app-doctor-get-all',
    standalone: true,
    imports: [
        TableModule,
        CardModule,
        AvatarModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule
    ],
    templateUrl: './doctor-get-all.html',
    styleUrl: './doctor-get-all.css'
})
export class DoctorGetAll implements OnInit {
    private cdr = inject(ChangeDetectorRef);

    listDoctor: any[] = [];

    constructor(private api: Api) {}

    ngOnInit(): void {
        this.initialization();
    }

    private initialization(): void {
        setTimeout(() => {
            this.api.invoke(apidoctorgetall).then((response: any) => {
                const data = typeof response === 'string' ? JSON.parse(response) : response;
                this.listDoctor = data.listDoctor;
                this.cdr.detectChanges();
            });
        }, 0);
    }

    getInitials(fullName: string): string {
        if (!fullName) return '?';
        const parts = fullName.trim().split(' ');
        return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
    }
}
