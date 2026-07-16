import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

export interface Apiappointmentinsert$Params {
    body?: {
        'idSpecialty'?: string;
        'idDoctor'?: string;
        'personFullName'?: string;
        'description'?: string;
        'preferredDate'?: string;
        'files'?: Blob[];
    }
}

export function apiappointmentinsert(http: HttpClient, rootUrl: string, params?: Apiappointmentinsert$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    const rb = new RequestBuilder(rootUrl, apiappointmentinsert.PATH, 'post');
    if (params) { rb.body(params.body, 'multipart/form-data'); }
    return http.request(rb.build({ responseType: 'text', accept: '*/*', context })).pipe(
        filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
        map((r: HttpResponse<any>) => (r as HttpResponse<any>).clone({ body: undefined }) as StrictHttpResponse<void>)
    );
}
apiappointmentinsert.PATH = '/appointment/insert';
