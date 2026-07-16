import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

export interface Apiappointmentclose$Params { idAppointment: string; }

export function apiappointmentclose(http: HttpClient, rootUrl: string, params: Apiappointmentclose$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    const rb = new RequestBuilder(rootUrl, apiappointmentclose.PATH, 'patch');
    rb.path('idAppointment', params.idAppointment, {});
    return http.request(rb.build({ responseType: 'text', accept: '*/*', context })).pipe(
        filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
        map((r: HttpResponse<any>) => (r as HttpResponse<any>).clone({ body: undefined }) as StrictHttpResponse<void>)
    );
}
apiappointmentclose.PATH = '/appointment/close/{idAppointment}';
