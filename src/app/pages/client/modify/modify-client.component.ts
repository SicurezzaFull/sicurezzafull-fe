import { Component, OnInit } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { NgxGpAutocompleteService } from '@angular-magic/ngx-gp-autocomplete';

import { FormArray, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { ClientService } from 'src/app/services/client.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ROUTES } from 'src/app/utils/constants';

@Component({
    templateUrl: './modify-client.component.html',
    providers: [MessageService, ConfirmationService],
})
export class ModifyClientComponent implements OnInit {
    idClient: string;

    constructor(
        public fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private ngxGpAutocompleteService: NgxGpAutocompleteService,
        private userService: UserService,
        private clientService: ClientService
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
            this.idClient = params['id'];
            this.modifyForm.patchValue({
                id: this.idClient,
            });
            this.clientService.getClient(this.idClient).subscribe((client) => {
                this.modifyForm.patchValue({
                    id: this.idClient,
                    name: client.name,
                    phone: client.phone,
                    email: client.email,
                    address: client.address,
                    city: client.city,
                    postalCode: client.postalCode,
                    country: client.country,
                    vat: client.vat,
                    pec: client.pec,
                    signature: client.signature,
                    logo: client.logo,
                });
            });
        });
    }

    modifyForm = this.fb.group({
        id: ['', [Validators.required]],
        name: ['', [Validators.required]],
        phone: ['', [Validators.required]],
        email: ['', [Validators.required]],
        address: ['', [Validators.required]],
        city: ['', [Validators.required]],
        postalCode: ['', [Validators.required]],
        country: ['', [Validators.required]],
        vat: ['', [Validators.required]],
        pec: ['', [Validators.required]],
        signature: [''],
        logo: [''],
    });

    onSubmit(): void {
        this.clientService
            .patchClient(
                this.modifyForm.value.id,
                this.modifyForm.value.name,
                this.modifyForm.value.phone,
                this.modifyForm.value.email,
                this.modifyForm.value.address,
                this.modifyForm.value.city,
                this.modifyForm.value.postalCode,
                this.modifyForm.value.country,
                this.modifyForm.value.vat,
                this.modifyForm.value.pec,
                this.modifyForm.value.signature,
                this.modifyForm.value.logo
            )
            .subscribe((res) => this.router.navigate([ROUTES.ROUTE_TABLE_CLIENT]));
    }

    goToTableClient() {
        this.router.navigate([ROUTES.ROUTE_TABLE_CLIENT]);
    }
}
