import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AuthService } from './auth/auth.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        RouterModule,
        ButtonModule,
        DrawerModule,
        TooltipModule,
        ToastModule,
        ConfirmDialogModule
    ],
    templateUrl: './app.html',
    styleUrls: ['./app.css']
})
export class App {
    authService = inject(AuthService);
    private router = inject(Router);

    sidebarVisible = signal<boolean>(false);

    navItems = computed(() => {
        if (this.authService.isAdmin()) {
            return [
                { label: 'Inicio', icon: 'pi pi-home', routerLink: '/appointment/dashboard' },
                { label: 'Citas', icon: 'pi pi-calendar', routerLink: '/appointment/getall' },
                { label: 'Doctores', icon: 'pi pi-id-card', routerLink: '/doctor/getall' },
                { label: 'Especialidades', icon: 'pi pi-heart', routerLink: '/specialty/getall' }
            ];
        }
        return [
            { label: 'Nueva cita', icon: 'pi pi-plus-circle', routerLink: '/appointment/insert' }
        ];
    });

    toggleSidebar(): void {
        this.sidebarVisible.update(visible => !visible);
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }
}
