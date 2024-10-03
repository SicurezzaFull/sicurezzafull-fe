import { Component, OnInit } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { NgxGpAutocompleteService } from '@angular-magic/ngx-gp-autocomplete';

import { FormArray, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { ClientService } from 'src/app/services/client.service';  // Modificato
import { ActivatedRoute, Router } from '@angular/router';
import { ROUTES } from 'src/app/utils/constants';

@Component({
    templateUrl: './detail-client.component.html',  // Modificato
    providers: [MessageService, ConfirmationService],
})
export class DetailClientComponent implements OnInit {  // Modificato
    idClient: string;  // Modificato

    detailForm = this.fb.group({
        id: ['', { disabled: true }],
        name: ['', { disabled: true }],
        vat: [''],
        phone: [''],
        email: [''],
        address: [''],  // Aggiunto
        city: [''],     // Aggiunto
        postalCode: [''], // Aggiunto
        country: [''],  // Aggiunto
        pec: [''],
        signature: [''],  // Aggiunto
        logo: [''],  // Aggiunto
    });

    constructor(
        public fb: FormBuilder,
        private route: ActivatedRoute,
        private ngxGpAutocompleteService: NgxGpAutocompleteService,
        private userService: UserService,
        private clientService: ClientService  // Modificato
    ) {
        this.ngxGpAutocompleteService.setOptions({
            componentRestrictions: { country: ['IT'] },
            types: ['geocode'],
        });
    }

    ngOnInit() {
        this.loadServices();
    }

    loadServices() {
        this.route.queryParams.subscribe((params) => {
            this.idClient = params['id'];  // Modificato
            this.detailForm.patchValue({
                id: this.idClient,  // Modificato
            });
            this.clientService
                .getClient(this.idClient)  // Modificato
                .subscribe((client) => {  // Modificato
                    this.detailForm.patchValue({
                        id: this.idClient,
                        name: client.name,
                        vat: client.vat,
                        phone: client.phone,
                        email: client.email,
                        address: client.address,  // Aggiunto
                        city: client.city,        // Aggiunto
                        postalCode: client.postalCode,  // Aggiunto
                        country: client.country,  // Aggiunto
                        pec: client.pec,
                        signature: client.signature,  // Aggiunto
                        logo: client.logo,  // Aggiunto
                    });
                });

            this.detailForm.controls['id'].disable({ onlySelf: true });
            this.detailForm.controls['name'].disable({ onlySelf: true });
            this.detailForm.controls['vat'].disable({ onlySelf: true });
            this.detailForm.controls['phone'].disable({ onlySelf: true });
            this.detailForm.controls['email'].disable({ onlySelf: true });
            this.detailForm.controls['address'].disable({ onlySelf: true });  // Aggiunto
            this.detailForm.controls['city'].disable({ onlySelf: true });  // Aggiunto
            this.detailForm.controls['postalCode'].disable({ onlySelf: true });  // Aggiunto
            this.detailForm.controls['country'].disable({ onlySelf: true });  // Aggiunto
            this.detailForm.controls['pec'].disable({ onlySelf: true });
            this.detailForm.controls['signature'].disable({ onlySelf: true });  // Aggiunto
            this.detailForm.controls['logo'].disable({ onlySelf: true });  // Aggiunto
        });
    }

    selectAddress(place: any): void { }
}
