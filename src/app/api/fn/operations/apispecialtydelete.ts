import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

export interface Apispecialtydelete$Params {
    idSpecialty: string;
}

export function apispecialtydelete(http: HttpClient, rootUrl: string, params?: Apispecialtydelete$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    const rb = new RequestBuilder(rootUrl, apispecialtydelete.PATH, 'delete');
    if (params) {
        rb.path('idSpecialty', params.idSpecialty, {});
    }
    return http.request(rb.build({ responseType: 'text', accept: '*/*', context })).pipe(
        filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
        map((r: HttpResponse<any>) => (r as HttpResponse<any>).clone({ body: undefined }) as StrictHttpResponse<void>)
    );
}
apispecialtydelete.PATH = '/specialty/delete/{idSpecialty}';
