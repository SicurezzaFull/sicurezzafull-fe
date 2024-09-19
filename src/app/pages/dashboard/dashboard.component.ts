//Angular
import { Component, OnInit, OnDestroy } from '@angular/core';

//Services
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AttendanceService } from 'src/app/services/attendance.service';

//Store
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { CompanyState } from 'src/app/stores/dropdown-select-company/dropdown-select-company.reducer';

//Libraies
import * as moment from 'moment';

//Utils
import Formatter from 'src/app/utils/formatters';
import { PermissionService } from 'src/app/services/permission.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EmailService } from 'src/app/services/email.service';

@Component({
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    providers: [MessageService, ConfirmationService],
})
export class DashboardComponent implements OnInit, OnDestroy {
    //Chart
    barDataAttendances: any;
    barOptionsAttendances: any;

    //Language
    locale: string;

    //Utils
    formatter!: Formatter;

    //Store
    subscription: Subscription;
    companyState$: Observable<CompanyState>;

    //Variables
    usersNumber: any;
    vehiclesNumber: any;
    attendances: {
        arrayCountCheck: any[];
        arrayCountMissing: any[];
        arrayDates: any[];
    };
    selectedCompany: any;
    idCompany: any;
    loading: boolean;
    permissions: any;

    constructor(
        public layoutService: LayoutService,
        public translateService: TranslateService,
        public attendaceService: AttendanceService,
        public permissionService: PermissionService,
        public emailService: EmailService,
        private store: Store<{ companyState: CompanyState }>,
    ) {
        //Init
        this.formatter = new Formatter();
        this.companyState$ = store.select('companyState');
    }
    ngOnInit(): void {
        const companyServiceSubscription = this.companyState$.subscribe(
            (company) => {
                this.selectedCompany = company?.currentCompany;
                this.loadServices(this.selectedCompany);
            },
        );

        const translateServiceSubscription =
            this.translateService.onLangChange.subscribe(
                (langChangeEvent: LangChangeEvent) => {
                    this.locale = langChangeEvent.lang;
                    moment.locale(this.locale);
                    this.loadServices(this.selectedCompany);
                },
            );
        const layourServiceSubscription =
            this.layoutService.configUpdate$.subscribe(() => {
                this.loadServices(this.selectedCompany);
            });
        if (this.subscription) {
            this.subscription.add(companyServiceSubscription);
            this.subscription.add(layourServiceSubscription);
            this.subscription.add(translateServiceSubscription);
        }
    }

    loadServices(currentCompany) {
        const attendanceServiceSubscription = this.attendaceService
            .getDataAttendances(currentCompany?.id | 0)
            .subscribe((data) => {
                this.attendances = this.formatter.formatCheckins(
                    data,
                    this.locale,
                );

                this.usersNumber = data.usersNumber;
                this.vehiclesNumber = data.vehiclesNumber;

                const documentStyle = getComputedStyle(
                    document.documentElement,
                );
                this.barDataAttendances = {
                    labels: this.attendances?.arrayDates,
                    datasets: [
                        {
                            label: 'CheckIn Fatto',
                            backgroundColor:
                                documentStyle.getPropertyValue('--green-200'),
                            borderColor:
                                documentStyle.getPropertyValue('--green-200'),
                            data: this.attendances?.arrayCountCheck,
                        },
                        {
                            label: 'Mancante',
                            backgroundColor:
                                documentStyle.getPropertyValue('--red-200'),
                            borderColor:
                                documentStyle.getPropertyValue('--red-200'),
                            data: this.attendances?.arrayCountMissing,
                        },
                    ],
                };
            });

        const permissionServiceSubscription = this.permissionService
            .getAllPermissions(currentCompany.id | 0)
            .subscribe((permissions) => {
                this.permissions = permissions;
                this.permissions = permissions.map((permission) => ({
                    ...permission,
                    datesText: permission?.dates,
                    dates: permission?.dates.split(','),
                }));
                this.loading = false;
            });
        if (this.subscription && permissionServiceSubscription)
            this.subscription.add(permissionServiceSubscription);
        if (this.subscription && attendanceServiceSubscription)
            this.subscription.add(attendanceServiceSubscription);
    }

    approvePermission(permission) {
        this.permissionService
            .approvePermission(permission?.id, permission?.user?.id)
            .subscribe((res) => {
                if (permission?.user?.email) {
                    let messageEmail = '';
                    messageEmail +=
                        'Ciao, ' +
                        permission?.user?.name +
                        ' ' +
                        permission?.user?.surname +
                        '. <br>';
                    messageEmail += "E' stato approvata la sua richiesta: <br>";
                    messageEmail +=
                        '<strong>' + permission?.datesText + '</strong><br>';

                    this.emailService
                        .sendEmail(
                            permission?.user?.email,
                            'Sicurezza Full - Permesso approvato - ' + permission?.id,
                            messageEmail,
                        )
                        .subscribe(
                            (risposta) =>
                                console.log(
                                    'Email inviata con successo:',
                                    risposta,
                                ),
                            (errore) =>
                                console.error(
                                    "Errore durante l'invio dell'email:",
                                    errore,
                                ),
                        );
                }

                this.loadServices(this.selectedCompany);
            });
    }

    rejectPermission(permission) {
        this.permissionService
            .rejectPermission(permission?.id, permission?.user?.id)
            .subscribe((res) => {
                if (permission?.user?.email) {
                    this.emailService
                        .sendEmail(
                            permission?.user?.email,
                            'Sicurezza Full - Permesso Negato - ' + permission?.id,
                            "E' stato negato il suo permesso",
                        )
                        .subscribe(
                            (risposta) =>
                                console.log(
                                    'Email inviata con successo:',
                                    risposta,
                                ),
                            (errore) =>
                                console.error(
                                    "Errore durante l'invio dell'email:",
                                    errore,
                                ),
                        );
                }
                this.loadServices(this.selectedCompany);
            });
    }

    ngOnDestroy() {
        if (this.subscription) this.subscription.unsubscribe();
    }
}
