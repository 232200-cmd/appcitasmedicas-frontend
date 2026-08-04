
export type SeverityType = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

export function getAppointmentSeverity(status: string): SeverityType {
    switch (status) {
        case 'Pendiente de revisión': return 'warn';
        case 'Visto': return 'info';
        case 'En coordinación': return 'secondary';
        case 'Cerrado': return 'success';
        case 'Rechazado': return 'danger';
        default: return 'info';
    }
}

export function getAppointmentAvatarClass(status: string): string {
    switch (status) {
        case 'Pendiente de revisión': return 'avatar-pending';
        case 'Visto': return 'avatar-seen';
        case 'En coordinación': return 'avatar-coordination';
        case 'Cerrado': return 'avatar-closed';
        case 'Rechazado': return 'avatar-refused';
        default: return 'avatar-pending';
    }
}


export function getInitials(fullName: string): string {
    if (!fullName) return '?';
    const parts = fullName.trim().split(' ');
    return parts.length > 1
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0][0].toUpperCase();
}


export function parseApiResponse(response: unknown): any {
    return typeof response === 'string' ? JSON.parse(response) : response;
}
