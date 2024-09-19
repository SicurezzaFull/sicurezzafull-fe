//Angular
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';

//Prime NG
import { MessageService } from 'primeng/api';

//Services
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { UserService } from 'src/app/services/user.service';
import { PermissionService } from 'src/app/services/permission.service';
import { EmailService } from 'src/app/services/email.service';
//Store
import { Observable, Subscription, identity } from 'rxjs';
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
    templateUrl: './detail-medical-home.component.html',
    styleUrls: ['./detail-medical-home.component.scss'],
})
export class DetailMedicalHomeComponent implements OnInit {
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

    dates: Date[] | undefined;

    medicalForm = this.fb.group({
        name: [''],
        surname: [''],
        typology: [''],
        dates: [''],
        note: [''],
        protocolNumber: ['', [Validators.required]],
    });

    selectedCurrentMonth: any;
    adminEmails: any;
    routes: any;
    permission: any;
    idPermission: string;
    constructor(
        public fb: FormBuilder,
        public layoutService: LayoutService,
        private permissionService: PermissionService,
        private route: ActivatedRoute,
        private emailService: EmailService,
        private router: Router,
        private messageService: MessageService,
        private store: Store<{ authState: AuthState }>,
    ) {
        //Init
        this.authState$ = store.select('authState');
        this.adminEmails = environment?.adminEmails;
        this.formatter = new Formatter();
        this.routes = ROUTES;
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe((params) => {
            this.idPermission = params.get('id');
            this.loadServices(this.idPermission);
        });
        const layourServiceSubscription =
            this.layoutService.configUpdate$.subscribe(() => {
                this.loadServices(this.idPermission);
            });
        if (this.subscription) {
            this.subscription.add(layourServiceSubscription);
        }
    }

    loadServices(idPermission) {
        const permissionServiceSubscription = this.permissionService
            .getPermissionById(idPermission)
            .subscribe((permission) => {
                this.permission = permission;
                this.medicalForm.patchValue({
                    name: this.permission.user?.name,
                    surname: this.permission.user?.surname,
                    typology: this.permission.typology,
                    dates: this.permission.dates,
                    note: this.permission.note,
                    protocolNumber: this.permission.protocolNumber,
                });
                this.medicalForm.controls['name'].disable({
                    onlySelf: true,
                });
                this.medicalForm.controls['surname'].disable({
                    onlySelf: true,
                });
                this.medicalForm.controls['typology'].disable({
                    onlySelf: true,
                });
                this.medicalForm.controls['dates'].disable({
                    onlySelf: true,
                });
            });

        if (permissionServiceSubscription && this.subscription)
            this.subscription.add(permissionServiceSubscription);
    }

    updatePermission() {
        let datesInString;

        this.permissionService
            .addProtocolNumberPermission(
                this.idPermission,
                this.medicalForm.value.note,
                this.medicalForm.value.protocolNumber,
            )
            .subscribe((res) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Avviso',
                    detail: 'Hai salvato il numero protocollo con successo',
                });

                this.router.navigate([ROUTES.ROUTE_MEDICAL_HOME]);
            });
        this.sendMailAdmin();
        this.sendMailUser();
    }
    sendMailAdmin() {
        let messageEmail = '';
        messageEmail +=
            "L'utente " +
            this.permission.user?.name +
            ' ' +
            this.permission.user?.surname +
            ', ha aggiunto il numero protocollo: <br>';
        messageEmail += this.medicalForm.value.protocolNumber + '<br>';
        messageEmail +=
            '<strong>Giorno/i</strong>: <br>' + this.permission.dates + +'<br>';

        if (this.medicalForm.value.note)
            messageEmail +=
                '<strong>Note</strong>: <br>' +
                this.medicalForm.value.note +
                '<br>';
        this.emailService
            .sendEmail(
                this.adminEmails,
                'SICUREZZAFULL - Numero protocollo malattia - ' +
                    this.medicalForm.value.protocolNumber +
                    ' ' +
                    this.permission.user?.name +
                    ' ' +
                    this.permission.user?.name,
                messageEmail,
            )
            .subscribe(
                (risposta) =>
                    console.log('Email inviata con successo:', risposta),
                (errore) =>
                    console.error("Errore durante l'invio dell'email:", errore),
            );
    }
    sendMailUser() {
        let messageEmail = '';
        messageEmail +=
            'Ciao ' +
            this.permission.user?.name +
            ' ' +
            this.permission.user?.surname +
            ', hai notificato il numero protocollo: <br>';
        messageEmail += this.medicalForm.value.protocolNumber + '<br>';
        messageEmail +=
            '<strong>Giorno/i</strong>: <br>' + this.permission.dates + '<br>';

        if (this.medicalForm.value.note)
            messageEmail +=
                '<strong>Note</strong>: <br>' +
                this.medicalForm.value.note +
                '<br>';
        if (this.permission.user?.email)
            this.emailService
                .sendEmail(
                    this.permission.user?.email,
                    'SICUREZZAFULL - Numero protocollo malattia - ' +
                        this.medicalForm.value.protocolNumber +
                        ' ' +
                        this.permission.user?.name +
                        ' ' +
                        this.permission.user?.surname,
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
