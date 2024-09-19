//Angular
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';

//Prime NG
import { MessageService } from 'primeng/api';

//Services
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { UserService } from 'src/app/services/user.service';
import { PermissionService } from 'src/app/services/permission.service';
import { EmailService } from 'src/app/services/email.service';
//Store
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { CompanyState } from 'src/app/stores/dropdown-select-company/dropdown-select-company.reducer';
import { AuthState } from 'src/app/stores/auth/authentication.reducer';

//Libraies
import * as moment from 'moment';

//Utils
import Formatter from 'src/app/utils/formatters';
import { ROUTES } from 'src/app/utils/constants';

//Environments
import { environment } from 'src/environments/environment';

@Component({
    templateUrl: './list-medical-home.component.html',
    styleUrls: ['./list-medical-home.component.scss'],
})
export class ListMedicalHomeComponent implements OnInit {
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

    medicalForm = this.fb.group({
        typology: ['Malattia'],
        dates: ['', [Validators.required]],
        note: [''],
    });

    myMedicalsForm = this.fb.group({
        currentYear: [''],
        currentMonth: [''],
    });
    selectedCurrentMonth: any;
    monthsItems = [];

    permissions: any;
    adminEmails: any;
    minimumDate: any;
    routes: any;
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

        this.medicalForm.patchValue({
            typology: 'Malattia',
        });
        this.routes = ROUTES;
    }

    ngOnInit(): void {
        //Current year
        moment.locale('it');

        this.myMedicalsForm.patchValue({
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
            parseInt(this.myMedicalsForm.value.currentYear, 10) || '';
        const currentMonth = this.selectedCurrentMonth?.code || '';

        const permissionServiceSubscription = this.permissionService
            .getMyMedicalLeave(currentUser.id, currentYear, currentMonth)
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

        for (let date of this.medicalForm.value.dates) {
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
                this.medicalForm.value.typology,
                datesInString,
                0,
                this.medicalForm.value.note,
            )
            .subscribe((res) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Avviso',
                    detail: 'Hai notificato la malattia con successo',
                });

                this.router.navigate([ROUTES.ROUTE_LANDING_HOME]);
            });
        this.sendMailAdmin(datesInString);
        this.sendMailUser(datesInString);
    }
    sendMailAdmin(datesInString) {
        let messageEmail = '';
        messageEmail +=
            "L'utente " +
            this.currentUser?.name +
            ' ' +
            this.currentUser?.surname +
            ', ha notificato la sua malattia: <br>';
        messageEmail += '<strong>' + datesInString + '</strong><br>';

        this.emailService
            .sendEmail(
                this.adminEmails,
                'SICUREZZAFULL - Avviso malattia - ' +
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
    sendMailUser(datesInString) {
        let messageEmail = '';
        messageEmail +=
            'Ciao ' +
            this.currentUser?.name +
            ' ' +
            this.currentUser?.surname +
            ', hai notificato la tua malattia: <br>';
        messageEmail += '<strong>' + datesInString + '</strong><br>';

        if (this.currentUser.email)
            this.emailService
                .sendEmail(
                    this.currentUser.email,
                    'SICUREZZAFULL - Avviso malattia - ' +
                        this.currentUser?.name +
                        ' ' +
                        this.currentUser?.surname,
                    messageEmail,
                )
                .subscribe(
                    (risposta) =>
                        console.log('Email inviata con successo:', risposta),
                    (errore) =>
                        console.error(
                            "Errore durante l'invio dell'email:",
                            errore,
                        ),
                );
    }
}
