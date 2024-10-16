import { Component } from '@angular/core';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { StorageService } from './../../../services/storage.service';
import { MessageService } from 'primeng/api';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuthState } from '../../../stores/auth/authentication.reducer';
import { login } from '../../../stores/auth/authentication.actions';
import { FormArray, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoginRequest } from 'src/app/models/global.request';

import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
    //Global variables
    operatorPhoneNumber: any;

    constructor(
        public fb: FormBuilder,
        public layoutService: LayoutService,
        private messageService: MessageService,
        private store: Store<{ authState: any }>,
        private storageService: StorageService,
    ) {
        this.authState$ = store.select('authState');
        this.operatorPhoneNumber = environment?.operatorPhoneNumber;
    }
    hidePassword = true;

    signInForm = this.fb.group({
        fiscalCode: ['', [Validators.required]],
        password: ['', [Validators.required]],
    });
    authState$: Observable<AuthState>;
    isLoggedIn = false;
    errorMessage = '';
    roles: string[] = [];
    valCheck: string[] = ['remember'];
    currentFiscalCode;
    currentPassword;
    rememberPassword = false;
    currentDate: Date = new Date();

    ngOnInit(): void {
        if (this.storageService.isLoggedIn()) {
            this.isLoggedIn = true;
            this.roles = this.storageService.getUser().roles;
        }

        this.currentFiscalCode = localStorage.getItem('fiscalCode');
        this.currentPassword = localStorage.getItem('password');
    }

    get fiscalCode() {
        return this.signInForm.get('fiscalCode');
    }

    get password() {
        return this.signInForm.get('password');
    }

    togglePasswordVisibility(): void {
        this.hidePassword = !this.hidePassword;
    }

    openWhatsAppChatOperator() {
        if (this.operatorPhoneNumber) {
            const whatsappLink = `https://wa.me/${this.operatorPhoneNumber}`;
            window.open(whatsappLink, '_blank');
        }
    }

    onSubmitSignIn(): void {
        const fiscalCode = this.signInForm.value.fiscalCode || '';
        const password = this.signInForm.value.password || '';

        localStorage.setItem('fiscalCode', fiscalCode);
        localStorage.setItem('password', password);

        const signInData = new LoginRequest(fiscalCode, password);
        this.store.dispatch(login({ request: signInData }));
    }
    onFiscalCodeChange(value: string) {
        this.currentFiscalCode = value.toUpperCase().replace(/\s/g, ''); // Rimuovi gli spazi vuoti
    }
}
