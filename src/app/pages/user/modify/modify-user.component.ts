import { Component, OnInit } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { NgxGpAutocompleteService } from '@angular-magic/ngx-gp-autocomplete';

import { FormArray, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ROUTES } from 'src/app/utils/constants';
import { CompanyService } from 'src/app/services/company.service';
import { RoleService } from 'src/app/services/role.service';
import { AttendanceService } from 'src/app/services/attendance.service';
import { VehicleService } from 'src/app/services/vehicle.service';
import { Subscription } from 'rxjs';
import { getData } from 'country-list';

@Component({
    templateUrl: './modify-user.component.html',
    providers: [MessageService, ConfirmationService],
})
export class ModifyUserComponent implements OnInit {
    idUser: string;

    selectedLegalForm: any = null;
    selectedCeo: any = null;

    legalFormItems = [
        {
            name: 'Società a responsabilità limitata',
            id: 'Società a responsabilità limitata',
        },
        {
            name: 'Società per azioni',
            id: 'Società per azioni',
        },
    ];
    ceosItems: any;

    roles: [];
    companies: [];
    selectedRole: any;
    selectedCompany: any;
    selectedPlace: any;
    placesItems: any;

    selectedVehicle: any;
    selectedPlaceAddress: any;
    vehiclesItems: any;

    companyId: any;

    attendanceData: any;
    attendanceCheckIn: any;

    subscription: Subscription;

    countryItems: { name: string; code: string }[] = [];

    modifyForm = this.fb.group({
        id: ['', [Validators.required]],
        name: ['', [Validators.required]],
        surname: ['', [Validators.required]],
        fiscalCode: ['', [Validators.required]],
        email: [''],
        cellphone: [''],
        roleId: ['', [Validators.required]],
        companyId: ['', [Validators.required]],
        workerNumber: [''],
        associatedClient: [''],
        position: [''],
        address: [''],
        birthCountry: [''],
        birthDate: [''],
        iban: [''],
        status: [false, [Validators.required]],
    });

    changePasswordForm = this.fb.group(
        {
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: [
                '',
                [Validators.required, Validators.minLength(6)],
            ],
        },
        { validator: this.checkPasswords },
    );

    checkInForm = this.fb.group({
        placeId: null,
    });
    constructor(
        public fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private ngxGpAutocompleteService: NgxGpAutocompleteService,
        private userService: UserService,
        private attendanceService: AttendanceService,
        private vehicleService: VehicleService,
        private messageService: MessageService,
        private companyService: CompanyService,
        private roleService: RoleService,
    ) {
        this.ngxGpAutocompleteService.setOptions({
            componentRestrictions: { country: ['IT'] },
            types: ['geocode'],
        });
    }

    ngOnInit() {
        this.fetchCountries();
        this.loadServices();
    }

    fetchCountries() {
        const allCountries = new getData();
        const priorityCountries = ['Italia', 'Peru', 'Ecuador', 'El Salvador'];

        // Add priority countries first
        priorityCountries.forEach((country) => {
            const foundCountry = allCountries.find((c) => c.name === country);
            if (foundCountry) {
                this.countryItems.push({
                    name: foundCountry.name,
                    code: foundCountry.code,
                });
            }
        });

        // Add remaining countries
        allCountries.forEach((country) => {
            if (!priorityCountries.includes(country.name)) {
                this.countryItems.push({
                    name: country.name,
                    code: country.code,
                });
            }
        });
    }

    loadServices() {
        this.route.queryParams.subscribe((params) => {
            this.idUser = params['id'];
            this.modifyForm.patchValue({
                id: this.idUser,
            });
            this.userService.getUser(this.idUser).subscribe((user) => {
                this.companyId = user?.companies[0]?.id
                    ? user?.companies[0]?.id
                    : '';
                this.placesItems = user?.companies[0]?.places;
                // this.vehiclesItems = user?.companies[0]?.vehicles;
                const roleId = user?.roles[0]?.id ? user.roles[0].id : '';

                // const vehicleServiceSubscription = this.vehicleService
                //     .getAllVehicles(0)
                //     .subscribe((vehicles) => {
                //         this.vehiclesItems = vehicles;
                //     });
                // if (vehicleServiceSubscription && this.subscription)
                //     this.subscription.add(vehicleServiceSubscription);

                this.modifyForm.patchValue({
                    id: this.idUser,
                    name: user.name,
                    surname: user.surname,
                    fiscalCode: user.fiscalCode,
                    email: user.email,
                    cellphone: user.cellphone,
                    roleId: roleId,
                    companyId: this.companyId,
                    workerNumber: user.workerNumber,
                    associatedClient: user.associatedClient,
                    position: user.position,
                    address: user.address,
                    iban: user.iban,
                    birthCountry: user.birthCountry,
                    birthDate: user.birthDate,
                    status: user.status,
                });
            });
            const attendanceServiceSubscription = this.attendanceService
                .getAttendanceByUser(this.idUser)
                .subscribe((data) => {
                    this.attendanceData = data;
                    this.attendanceCheckIn = this.attendanceData?.attendance;
                });
            if (attendanceServiceSubscription && this.subscription)
                this.subscription.add(attendanceServiceSubscription);

            this.modifyForm.controls['roleId'].disable({
                onlySelf: true,
            });
            // this.modifyForm.controls['companyId'].disable({ onlySelf: true });
        });

        this.userService.getAllCeos().subscribe((ceos) => {
            this.ceosItems = ceos.map((ceo) => ({
                ...ceo,
                fullName: ceo.name + ' ' + ceo.surname,
            }));
        });
        this.roleService.getAllRoles().subscribe((roles) => {
            this.roles = roles;
        });
        this.companyService.getAllCompanies().subscribe((companies) => {
            this.companies = companies;
        });
    }

    selectAddress(place: any): void {}

    updateUser(): void {
        this.userService
            .patchUser(
                parseInt(this.modifyForm.value.id, 10),
                this.modifyForm.value.name,
                this.modifyForm.value.surname,
                this.modifyForm.value.fiscalCode,
                this.modifyForm.value.email,
                this.modifyForm.value.cellphone,
                this.modifyForm.value.roleId,
                this.modifyForm.value.companyId,
                this.modifyForm.value.workerNumber,
                this.modifyForm.value.associatedClient,
                this.modifyForm.value.position,
                this.modifyForm.value.address,
                this.modifyForm.value.iban,
                this.modifyForm.value.birthCountry,
                this.modifyForm.value.birthDate,
                this.modifyForm.value.status,
            )
            .subscribe((res) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Avviso',
                    detail: "Hai modificato l'utente con successo",
                });
                this.router.navigate([ROUTES.ROUTE_TABLE_USER]);
            });
    }
    goToTableUser() {
        this.router.navigate([ROUTES.ROUTE_TABLE_USER]);
    }

    //Password
    checkPasswords(group: FormGroup) {
        const newPassword = group.get('newPassword').value;
        const confirmPassword = group.get('confirmPassword').value;

        return newPassword === confirmPassword ? null : { notSame: true };
    }

    savePassword() {
        this.userService
            .saveNewPassword(
                parseInt(this.idUser, 10),
                this.changePasswordForm.value.newPassword,
            )
            .subscribe((res) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Avviso',
                    detail: 'Hai modificato la password con successo',
                });
                this.router.navigate([ROUTES.ROUTE_TABLE_USER]);
            });
    }

    onChangePlace(event) {
        this.selectedPlaceAddress = this.placesItems.find(
            (index) => index.id === this.selectedPlace,
        );
    }

    onChangeVehicle(event) {}

    manualCheckIn() {
        this.attendanceService
            .checkInAttendance(
                this.idUser,
                this.companyId,
                this.checkInForm.value.placeId,
                null,
            )
            .subscribe((res) => {
                this.router.navigate([ROUTES.ROUTE_TABLE_USER]);
            });
    }

    manualCheckOut() {
        this.attendanceService
            .checkOutAttendance(this.attendanceCheckIn?.id, this.idUser, null, null, null, null, null, null, null, null)
            .subscribe((res) => {
                this.router.navigate([ROUTES.ROUTE_TABLE_USER]);
            });
    }
}
