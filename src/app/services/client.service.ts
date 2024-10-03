import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const API_URL = environment.endpoint + 'api/client/';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
    providedIn: 'root',
})
export class ClientService {

    constructor(private http: HttpClient) { }

    getAllClients(): Observable<any> {
        return this.http.get(API_URL + 'allClients', httpOptions);
    }

    getClient(id: string): Observable<any> {
        return this.http.get(API_URL + 'getClient' + '/' + id);
    }

    createClient(
        name: string,
        email: string,
        phone: string,
        address: string,
        city: string,
        postalCode: string,
        country: string,
        vat: string,
        pec: string,
        signatureFile?: File,
        logoFile?: File,
        status?: boolean
    ): Observable<any> {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('address', address);
        formData.append('city', city);
        formData.append('postalCode', postalCode);
        formData.append('country', country);
        formData.append('vat', vat);
        formData.append('pec', pec);
        formData.append('signature', signatureFile); // Add file to form data
        formData.append('logo', logoFile); // Add file to form data
        formData.append('status', String(status)); // Append status as string if it's boolean

        return this.http.post(API_URL + 'createClient', formData);
    }


    patchClient(
        id: string,
        name: string,
        phone: string,
        email: string,
        address: string,
        city: string,
        postalCode: string,
        country: string,
        vat: string,
        pec: string,
        signature: string,
        logo: string
    ): Observable<any> {
        return this.http.patch(
            `${API_URL}patchClient/${id}`,
            {
                name,
                phone,
                email,
                address,
                city,
                postalCode,
                country,
                vat,
                pec,
                signature,
                logo,
            },
            httpOptions
        );
    }


    deleteClient(id: string): Observable<any> {
        return this.http.delete(API_URL + 'deleteClient' + '/' + id);
    }
}
