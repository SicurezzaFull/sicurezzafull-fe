import { Component, OnInit } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { NgxGpAutocompleteService } from '@angular-magic/ngx-gp-autocomplete';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { ClientService } from 'src/app/services/client.service'; // Cambiato qui
import { Router } from '@angular/router';
import { ROUTES } from 'src/app/utils/constants';

@Component({
    templateUrl: './create-client.component.html', // Cambiato qui
    providers: [MessageService, ConfirmationService],
})
export class CreateClientComponent implements OnInit { // Cambiato qui
    selectedLegalForm: any = null;
    selectedCeo: any = null;

    ceosItems: any;
    checkedStatus: boolean = true;

    logoPreview: string | ArrayBuffer | null = null;
    signaturePreview: string | ArrayBuffer | null = null;

    signatureFile: File | null = null;
    logoFile: File | null = null;

    constructor(
        public fb: FormBuilder,
        private router: Router,
        private ngxGpAutocompleteService: NgxGpAutocompleteService,
        private userService: UserService,
        private clientService: ClientService // Cambiato qui
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
    }

    createForm = this.fb.group({
        id: [null],
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required]],
        address: ['', [Validators.required]],
        city: ['', [Validators.required]],
        postalCode: ['', [Validators.required]],
        country: ['', [Validators.required]],
        vat: ['', [Validators.required]],
        pec: ['', [Validators.required]],
        cfepi: ['', [Validators.required]],
        rea: ['', [Validators.required]],
        posinps: ['', [Validators.required]],
        patinail: ['', [Validators.required]],
        cassaedile: ['', [Validators.required]],
        status: [true],
    });

    onFileChange(event: any, type: string) {
        const file = event.target.files[0];
        if (type === 'signature') {
            this.signatureFile = file;
            const reader = new FileReader();
            reader.onload = (e) => this.signaturePreview = reader.result;
            reader.readAsDataURL(file);
        } else if (type === 'logo') {
            this.logoFile = file;
            const reader = new FileReader();
            reader.onload = (e) => this.logoPreview = reader.result;
            reader.readAsDataURL(file);
        }
    }

    onSubmit(): void {
        if (this.createForm.valid) {
            this.clientService.createClient(
                this.createForm.value.name,
                this.createForm.value.email,
                this.createForm.value.phone,
                this.createForm.value.address,
                this.createForm.value.city,
                this.createForm.value.postalCode,
                this.createForm.value.country,
                this.createForm.value.vat,
                this.createForm.value.pec,
                this.createForm.value.cfepi,
                this.createForm.value.rea,
                this.createForm.value.posinps,
                this.createForm.value.patinail,
                this.createForm.value.cassaedile,
                this.signatureFile,
                this.logoFile,
                this.createForm.value.status
            ).subscribe(
                () => {
                    this.router.navigate([ROUTES.ROUTE_TABLE_CLIENT]);
                },
                error => {
                    console.error('Error creating client:', error);
                    // Optionally show a user-friendly message here
                }
            );
        }
    }

}
