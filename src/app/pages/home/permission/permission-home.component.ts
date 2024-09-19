//Angular
import { Component, OnInit } from '@angular/core';

//Services
import { LayoutService } from 'src/app/layout/service/app.layout.service';

//Store
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { CompanyState } from 'src/app/stores/dropdown-select-company/dropdown-select-company.reducer';
import { AuthState } from 'src/app/stores/auth/authentication.reducer';

//Libraies
import * as moment from 'moment';

//Utils
import Formatter from 'src/app/utils/formatters';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { ROUTES } from 'src/app/utils/constants';
import { PermissionService } from 'src/app/services/permission.service';
import { MessageService } from 'primeng/api';
import { EmailService } from 'src/app/services/email.service';
import { environment } from 'src/environments/environment';

@Component({
    templateUrl: './permission-home.component.html',
    styleUrls: ['./permission-home.component.scss'],
})
export class PermissionHomeComponent implements OnInit {
    authState$: Observable<AuthState>;

    //Language
    locale: string;

    //Utils
    formatter!: Formatter;

    //Store
    subscription: Subscription;
    companyState$: Observable<CompanyState>;

    //Variables

    menuItems: any;
    loading: boolean;
    attendanceData: any;

    storeUser: any;
    currentUser: any;
    currentCompany: any;

    dates: Date[] | undefined;

    permissionForm = this.fb.group({
        typology: ['', [Validators.required]],
        dates: ['', [Validators.required]],
        hours: [''],
        note: [''],
    });

    myPermissionsForm = this.fb.group({
        currentYear: [''],
        currentMonth: [''],
    });
    selectedCurrentMonth: any;
    monthsItems = [];

    tipologyPermissionsItems: any = [
        {
            name: 'Permesso ROL',
            value: 'Permesso ROL',
        },
        {
            name: 'Ferie',
            value: 'Ferie',
        },
        {
            name: 'Giorno non retribuito',
            value: 'Giorno non retribuito',
        },
    ];
    permissions: any;
    adminEmails: any;
    minimumDate: any;
    constructor(
        public fb: FormBuilder,
        public layoutService: LayoutService,
        private permissionService: PermissionService,
        private messageService: MessageService,
        private userService: UserService,
        private emailService: EmailService,
        private router: Router,
        private store: Store<{ authState: AuthState }>,
    ) {
        //Init
        this.authState$ = store.select('authState');
        this.adminEmails = environment?.adminEmails;
        this.formatter = new Formatter();
        this.minimumDate = new Date();
    }

    ngOnInit(): void {
        //Current year
        moment.locale('it');
        
        this.myPermissionsForm.patchValue({
            currentYear: moment().year() + '',
        });

        this.selectedCurrentMonth = {
            name: moment().format('MMMM'),
            code: moment().month(),
        };

        //Current month
        this.monthsItems.push({
            name: moment().format('MMMM'),
            code: moment().month(),
        });

        //Previous month
        this.monthsItems.push({
            name: moment().subtract(1, 'month').format('MMMM'),
            code: moment().subtract(1, 'month').month(),
        });

        this.authState$.subscribe((authS) => {
            this.currentUser = authS?.user || '';
            this.loadServices(this.currentUser);
        });
        const layourServiceSubscription =
            this.layoutService.configUpdate$.subscribe(() => {
                this.loadServices(this.currentUser);
            });
        if (this.subscription) {
            this.subscription.add(layourServiceSubscription);
        }
    }

    onChangeMonth(event) {
        this.loadServices(this.currentUser);
    }

    loadServices(currentUser) {
        const currentYear =
            parseInt(this.myPermissionsForm.value.currentYear, 10) || '';
        const currentMonth = this.selectedCurrentMonth?.code || '';

        const permissionServiceSubscription = this.permissionService
            .getMyPermissions(currentUser.id, currentYear, currentMonth)
            .subscribe((permissions) => {
                this.permissions = permissions;
                this.permissions = permissions.map((permission) => ({
                    ...permission,
                    datesText: permission?.dates,
                    dates: permission?.dates.split(','),
                }));
                this.loading = false;
            });
        const userServiceSubscription = this.userService
            .getUser(currentUser.id)
            .subscribe((data) => {
                this.currentUser = data;
                this.currentCompany = data?.companies[0];
            });

        if (permissionServiceSubscription && this.subscription)
            this.subscription.add(permissionServiceSubscription);

        if (userServiceSubscription && this.subscription)
            this.subscription.add(userServiceSubscription);
    }

    savePermission() {
        let datesInString;

        for (let date of this.permissionForm.value.dates) {
            if (datesInString != null) {
                datesInString =
                    datesInString + ',' + moment(date).format('DD-MM-YYYY');
            } else {
                datesInString = moment(date).format('DD-MM-YYYY');
            }
        }
        this.permissionService
            .createPermission(
                this.currentUser?.id,
                this.currentCompany?.id,
                this.permissionForm.value.typology,
                datesInString,
                this.permissionForm.value.hours,
                this.permissionForm.value.note,
            )
            .subscribe((res) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Permesso',
                    detail: 'Hai fatto richiesta con successo',
                });

                this.router.navigate([ROUTES.ROUTE_LANDING_HOME]);
            });
        let messageEmail = '';
        messageEmail += "E' stato richiesto la tua approvazione: <br>";
        messageEmail += '<strong>' + datesInString + '</strong><br>';

        this.emailService
            .sendEmail(
                this.adminEmails,
                'SICUREZZAFULL - Richiesta permesso - ' +
                this.currentUser?.name +
                ' ' +
                this.currentUser?.surname,
                messageEmail,
            )
            .subscribe(
                (risposta) =>
                    console.log('Email inviata con successo:', risposta),
                (errore) =>
                    console.error("Errore durante l'invio dell'email:", errore),
            );
    }
}
