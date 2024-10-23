import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { environment } from 'src/environments/environment';
import { ROUTES } from '../utils/constants';

import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html',
})
export class AppMenuComponent implements OnInit {
    model: any[] = [];
    constructor(
        private authService: AuthService,
        public router: Router,
        public layoutService: LayoutService,
        private translateService: TranslateService,
    ) { }

    userSectionTitle;
    isProduction: any;

    ngOnInit() {
        const userRoles = this.authService.getRoles();
        this.isProduction = environment?.production;
        if (
            userRoles.includes('ROLE_ADMIN') ||
            userRoles.includes('ROLE_MODERATOR')
        ) {
            this.model.push({
                label: 'Dashboard',
                translationCode: 'menu.routes.dashboard.menuTitle',
                items: [
                    {
                        label: 'Dashboard',
                        translationCode: 'menu.routes.dashboard.menuTitle',
                        icon: 'pi pi-fw pi-home',
                        routerLink: [ROUTES.ROUTE_DASHBOARD],
                    },
                ],
            });
            // this.model.push({
            //     label: 'Notification',
            //     translationCode: 'menu.routes.notification.menuTitle',
            //     items: [
            //         {
            //             label: 'Notification',
            //             translationCode: 'menu.routes.notification.menuTitle',
            //             icon: 'pi pi-fw pi-send',
            //             routerLink: [ROUTES.ROUTE_NOTIFICATION],
            //         },
            //     ],
            // });
            this.model.push({
                label: 'Attendances',
                translationCode: 'menu.routes.attendance.menuTitle',
                items: [
                    {
                        label: 'Attendance users list',
                        translationCode: 'menu.routes.attendance.users',
                        icon: 'pi pi-users',
                        routerLink: [ROUTES.ROUTE_USERS_ATTENDANCE],
                    },
                    {
                        label: 'Attendance list',
                        translationCode: 'menu.routes.attendance.table',
                        icon: 'pi pi-list',
                        routerLink: [ROUTES.ROUTE_TABLE_ATTENDANCE],
                    },
                ],
            });
            this.model.push({
                label: 'Permissions',
                translationCode: 'menu.routes.permission.menuTitle',
                items: [
                    {
                        label: 'Permission list',
                        translationCode: 'menu.routes.permission.table',
                        icon: 'pi pi-list',
                        routerLink: [ROUTES.ROUTE_TABLE_PERMISSION],
                    },
                ],
            });

            this.model.push({
                label: 'Users',
                translationCode: 'menu.routes.user.menuTitle',
                items: [
                    {
                        label: 'User list',
                        translationCode: 'menu.routes.user.table',
                        icon: 'pi pi-users',
                        routerLink: [ROUTES.ROUTE_TABLE_USER],
                    },
                    {
                        label: 'Add user',
                        translationCode: 'menu.routes.user.create',
                        icon: 'pi pi-user-plus',
                        routerLink: [ROUTES.ROUTE_CREATE_USER],
                    },
                ],
            });
            this.model.push({
                label: 'Documents',
                translationCode: 'menu.routes.documents.menuTitle',
                items: [
                    {
                        label: 'Upload documents',
                        translationCode: 'menu.routes.documents.create',
                        icon: 'pi pi-file',
                        routerLink: [ROUTES.ROUTE_CREATE_DOCUMENT],
                    },
                    {
                        label: 'Generate document',
                        translationCode: 'menu.routes.documents.generate',
                        icon: 'pi pi-file',
                        routerLink: [ROUTES.ROUTE_CREATE_CONTRATTI],
                    },
                ],
            });
            this.model.push({
                label: 'Aziende',
                translationCode: 'menu.routes.company.menuTitle',
                items: [
                    {
                        label: 'Lista aziende',
                        translationCode: 'menu.routes.company.table',
                        icon: 'pi pi-list',
                        routerLink: [ROUTES.ROUTE_TABLE_COMPANY],
                    },
                    {
                        label: 'Aggiungi azienda',
                        translationCode: 'menu.routes.company.create',
                        icon: 'pi pi-plus-circle',
                        routerLink: [ROUTES.ROUTE_CREATE_COMPANY],
                    },
                ],
            });
            this.model.push({
                label: 'Clienti',
                translationCode: 'menu.routes.client.menuTitle',
                items: [
                    {
                        label: 'Lista clienti',
                        translationCode: 'menu.routes.client.table',
                        icon: 'pi pi-list',
                        routerLink: [ROUTES.ROUTE_TABLE_CLIENT],
                    },
                    {
                        label: 'Aggiungi azienda',
                        translationCode: 'menu.routes.client.create',
                        icon: 'pi pi-plus-circle',
                        routerLink: [ROUTES.ROUTE_CREATE_CLIENT],
                    },
                ],
            });
            // this.model.push({
            //     label: 'Vehicles',
            //     translationCode: 'menu.routes.vehicle.menuTitle',
            //     items: [
            //         {
            //             label: 'Lista veicoli',
            //             translationCode: 'menu.routes.vehicle.table',
            //             icon: 'pi pi-list',
            //             routerLink: [ROUTES.ROUTE_TABLE_VEHICLE],
            //         },
            //         {
            //             label: 'Aggiungi veicolo',
            //             translationCode: 'menu.routes.vehicle.create',
            //             icon: 'pi pi-car',
            //             routerLink: [ROUTES.ROUTE_CREATE_VEHICLE],
            //         },
            //     ],
            // });
        }

        if (userRoles.includes('ROLE_CLIENTMANAGEMENT')) {
            this.model.push({
                label: 'Dashboard',
                translationCode: 'menu.routes.dashboard.menuTitle',
                items: [
                    {
                        label: 'Dashboard',
                        translationCode: 'menu.routes.dashboard.menuTitle',
                        icon: 'pi pi-fw pi-home',
                        routerLink: [ROUTES.ROUTE_DASHBOARD],
                    },
                ],
            });
            // this.model.push({
            //     label: 'Notification',
            //     translationCode: 'menu.routes.notification.menuTitle',
            //     items: [
            //         {
            //             label: 'Notification',
            //             translationCode: 'menu.routes.notification.menuTitle',
            //             icon: 'pi pi-fw pi-send',
            //             routerLink: [ROUTES.ROUTE_NOTIFICATION],
            //         },
            //     ],
            // });
            this.model.push({
                label: 'Attendances',
                translationCode: 'menu.routes.attendance.menuTitle',
                items: [
                    {
                        label: 'Attendance users list',
                        translationCode: 'menu.routes.attendance.users',
                        icon: 'pi pi-users',
                        routerLink: [ROUTES.ROUTE_USERS_ATTENDANCE],
                    },
                    {
                        label: 'Attendance list',
                        translationCode: 'menu.routes.attendance.table',
                        icon: 'pi pi-list',
                        routerLink: [ROUTES.ROUTE_TABLE_ATTENDANCE],
                    },
                ],
            });
            this.model.push({
                label: 'Permissions',
                translationCode: 'menu.routes.permission.menuTitle',
                items: [
                    {
                        label: 'Permission list',
                        translationCode: 'menu.routes.permission.table',
                        icon: 'pi pi-list',
                        routerLink: [ROUTES.ROUTE_TABLE_PERMISSION],
                    },
                ],
            });

            this.model.push({
                label: 'Users',
                translationCode: 'menu.routes.user.menuTitle',
                items: [
                    {
                        label: 'User list',
                        translationCode: 'menu.routes.user.table',
                        icon: 'pi pi-users',
                        routerLink: [ROUTES.ROUTE_TABLE_USER],
                    },
                    {
                        label: 'Add user',
                        translationCode: 'menu.routes.user.create',
                        icon: 'pi pi-user-plus',
                        routerLink: [ROUTES.ROUTE_CREATE_USER],
                    },
                ],
            });
            this.model.push({
                label: 'Documents',
                translationCode: 'menu.routes.documents.menuTitleCustomer',
                items: [
                    {
                        label: 'Generate document',
                        translationCode: 'menu.routes.documents.generate',
                        icon: 'pi pi-file',
                        routerLink: [ROUTES.ROUTE_CREATE_CONTRATTI],
                    },
                ],
            });
            this.model.push({
                label: 'Aziende',
                translationCode: 'menu.routes.company.menuTitle',
                items: [
                    {
                        label: 'Lista aziende',
                        translationCode: 'menu.routes.company.table',
                        icon: 'pi pi-list',
                        routerLink: [ROUTES.ROUTE_TABLE_COMPANY],
                    },
                    // {
                    //     label: 'Aggiungi azienda',
                    //     translationCode: 'menu.routes.company.create',
                    //     icon: 'pi pi-plus-circle',
                    //     routerLink: [ROUTES.ROUTE_CREATE_COMPANY],
                    // },
                ],
            });
            this.model.push({
                label: 'Clienti',
                translationCode: 'menu.routes.client.menuTitle',
                items: [
                    {
                        label: 'Lista clienti',
                        translationCode: 'menu.routes.client.table',
                        icon: 'pi pi-list',
                        routerLink: [ROUTES.ROUTE_TABLE_CLIENT],
                    },
                    {
                        label: 'Aggiungi azienda',
                        translationCode: 'menu.routes.client.create',
                        icon: 'pi pi-plus-circle',
                        routerLink: [ROUTES.ROUTE_CREATE_CLIENT],
                    },
                ],
            });
            // this.model.push({
            //     label: 'Vehicles',
            //     translationCode: 'menu.routes.vehicle.menuTitle',
            //     items: [
            //         {
            //             label: 'Lista veicoli',
            //             translationCode: 'menu.routes.vehicle.table',
            //             icon: 'pi pi-list',
            //             routerLink: [ROUTES.ROUTE_TABLE_VEHICLE],
            //         },
            //         {
            //             label: 'Aggiungi veicolo',
            //             translationCode: 'menu.routes.vehicle.create',
            //             icon: 'pi pi-car',
            //             routerLink: [ROUTES.ROUTE_CREATE_VEHICLE],
            //         },
            //     ],
            // });
        }
        if (
            userRoles.includes('ROLE_ADMIN') ||
            userRoles.includes('ROLE_MODERATOR') ||
            userRoles.includes('ROLE_ACCOUNTING')
        ) {
            // this.model.push({
            //     label: 'Deadlines',
            //     translationCode: 'menu.routes.deadlines.menuTitle',
            //     items: [
            //         {
            //             label: 'Deadlines list',
            //             translationCode: 'menu.routes.deadlines.table',
            //             icon: 'pi pi-list',
            //             routerLink: [ROUTES.ROUTE_TABLE_DEADLINES],
            //         },
            //     ],
            // });
            // this.model.push({
            //     label: 'Workforce',
            //     translationCode: 'menu.routes.workforce.menuTitle',
            //     items: [
            //         {
            //             label: 'Workforce list',
            //             translationCode: 'menu.routes.workforce.table',
            //             icon: 'pi pi-calendar',
            //             routerLink: [ROUTES.ROUTE_TABLE_WORKFORCE],
            //         },
            //     ],
            // });
        }

        if (
            userRoles.includes('ROLE_WORKER') ||
            userRoles.includes('ROLE_ADMIN') ||
            userRoles.includes('ROLE_CLIENTMANAGEMENT')
        ) {
            this.model.push({
                label: 'Landing',
                translationCode: 'menu.routes.landing.menuTitle',
                items: [
                    {
                        label: 'Landing',
                        translationCode: 'menu.routes.landing.menuTitle',
                        icon: 'pi pi-fw pi-home',
                        routerLink: [ROUTES.ROUTE_LANDING_HOME],
                    },
                    {
                        label: 'Permission',
                        translationCode: 'menu.routes.landing.permission',
                        icon: 'pi pi-fw pi-sign-out',
                        routerLink: [ROUTES.ROUTE_PERMISSION_HOME],
                    },
                    {
                        label: 'Malattia',
                        translationCode: 'menu.routes.landing.medical',
                        icon: 'pi pi-fw pi-plus',
                        routerLink: [ROUTES.ROUTE_MEDICAL_HOME],
                    },
                    {
                        label: 'My Attendances',
                        translationCode: 'menu.routes.landing.attendances',
                        icon: 'pi pi-fw pi-list',
                        routerLink: [ROUTES.ROUTE_MYATTENDANCES_HOME],
                    },
                    {
                        label: 'Documents',
                        translationCode: 'menu.routes.landing.documents',
                        icon: 'pi pi-fw pi-file',
                        routerLink: [ROUTES.ROUTE_DOCUMENTS_HOME],
                    },
                ],
            });
        }
        if (this.isProduction === false) {
            this.model.push({
                label: 'UI Components',
                items: [
                    {
                        label: 'Form Layout',
                        icon: 'pi pi-fw pi-id-card',
                        routerLink: ['/uikit/formlayout'],
                    },
                    {
                        label: 'Input',
                        icon: 'pi pi-fw pi-check-square',
                        routerLink: ['/uikit/input'],
                    },
                    {
                        label: 'Float Label',
                        icon: 'pi pi-fw pi-bookmark',
                        routerLink: ['/uikit/floatlabel'],
                    },
                    {
                        label: 'Invalid State',
                        icon: 'pi pi-fw pi-exclamation-circle',
                        routerLink: ['/uikit/invalidstate'],
                    },
                    {
                        label: 'Button',
                        icon: 'pi pi-fw pi-box',
                        routerLink: ['/uikit/button'],
                    },
                    {
                        label: 'Table',
                        icon: 'pi pi-fw pi-table',
                        routerLink: ['/uikit/table'],
                    },
                    {
                        label: 'List',
                        icon: 'pi pi-fw pi-list',
                        routerLink: ['/uikit/list'],
                    },
                    {
                        label: 'Tree',
                        icon: 'pi pi-fw pi-share-alt',
                        routerLink: ['/uikit/tree'],
                    },
                    {
                        label: 'Panel',
                        icon: 'pi pi-fw pi-tablet',
                        routerLink: ['/uikit/panel'],
                    },
                    {
                        label: 'Overlay',
                        icon: 'pi pi-fw pi-clone',
                        routerLink: ['/uikit/overlay'],
                    },
                    {
                        label: 'Media',
                        icon: 'pi pi-fw pi-image',
                        routerLink: ['/uikit/media'],
                    },
                    {
                        label: 'Menu',
                        icon: 'pi pi-fw pi-bars',
                        routerLink: ['/uikit/menu'],
                        routerLinkActiveOptions: {
                            paths: 'subset',
                            queryParams: 'ignored',
                            matrixParams: 'ignored',
                            fragment: 'ignored',
                        },
                    },
                    {
                        label: 'Message',
                        icon: 'pi pi-fw pi-comment',
                        routerLink: ['/uikit/message'],
                    },
                    {
                        label: 'File',
                        icon: 'pi pi-fw pi-file',
                        routerLink: ['/uikit/file'],
                    },
                    {
                        label: 'Chart',
                        icon: 'pi pi-fw pi-chart-bar',
                        routerLink: ['/uikit/charts'],
                    },
                    {
                        label: 'Misc',
                        icon: 'pi pi-fw pi-circle',
                        routerLink: ['/uikit/misc'],
                    },
                ],
            });
            this.model.push({
                label: 'Prime Blocks',
                items: [
                    {
                        label: 'Free Blocks',
                        icon: 'pi pi-fw pi-eye',
                        routerLink: ['/blocks'],
                        badge: 'NEW',
                    },
                    {
                        label: 'All Blocks',
                        icon: 'pi pi-fw pi-globe',
                        url: ['https://www.primefaces.org/primeblocks-ng'],
                        target: '_blank',
                    },
                ],
            });
            this.model.push({
                label: 'Utilities',
                items: [
                    {
                        label: 'PrimeIcons',
                        icon: 'pi pi-fw pi-prime',
                        routerLink: ['/utilities/icons'],
                    },
                    {
                        label: 'PrimeFlex',
                        icon: 'pi pi-fw pi-desktop',
                        url: ['https://www.primefaces.org/primeflex/'],
                        target: '_blank',
                    },
                ],
            });
            this.model.push({
                label: 'Pages',
                icon: 'pi pi-fw pi-briefcase',
                items: [
                    {
                        label: 'Home',
                        icon: 'pi pi-fw pi-globe',
                        routerLink: ['/home'],
                    },
                    {
                        label: 'Auth',
                        icon: 'pi pi-fw pi-user',
                        items: [
                            {
                                label: 'Login',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['/auth/login'],
                            },
                            {
                                label: 'Error',
                                icon: 'pi pi-fw pi-times-circle',
                                routerLink: ['/auth/error'],
                            },
                            {
                                label: 'Access Denied',
                                icon: 'pi pi-fw pi-lock',
                                routerLink: ['/auth/access'],
                            },
                        ],
                    },
                    {
                        label: 'Crud',
                        icon: 'pi pi-fw pi-pencil',
                        routerLink: ['/pages/crud'],
                    },
                    {
                        label: 'Timeline',
                        icon: 'pi pi-fw pi-calendar',
                        routerLink: ['/pages/timeline'],
                    },
                    {
                        label: 'Not Found',
                        icon: 'pi pi-fw pi-exclamation-circle',
                        routerLink: ['/notfound'],
                    },
                    {
                        label: 'Empty',
                        icon: 'pi pi-fw pi-circle-off',
                        routerLink: ['/pages/empty'],
                    },
                ],
            });
            this.model.push({
                label: 'Hierarchy',
                items: [
                    {
                        label: 'Submenu 1',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            {
                                label: 'Submenu 1.1',
                                icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    {
                                        label: 'Submenu 1.1.1',
                                        icon: 'pi pi-fw pi-bookmark',
                                    },
                                    {
                                        label: 'Submenu 1.1.2',
                                        icon: 'pi pi-fw pi-bookmark',
                                    },
                                    {
                                        label: 'Submenu 1.1.3',
                                        icon: 'pi pi-fw pi-bookmark',
                                    },
                                ],
                            },
                            {
                                label: 'Submenu 1.2',
                                icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    {
                                        label: 'Submenu 1.2.1',
                                        icon: 'pi pi-fw pi-bookmark',
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        label: 'Submenu 2',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            {
                                label: 'Submenu 2.1',
                                icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    {
                                        label: 'Submenu 2.1.1',
                                        icon: 'pi pi-fw pi-bookmark',
                                    },
                                    {
                                        label: 'Submenu 2.1.2',
                                        icon: 'pi pi-fw pi-bookmark',
                                    },
                                ],
                            },
                            {
                                label: 'Submenu 2.2',
                                icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    {
                                        label: 'Submenu 2.2.1',
                                        icon: 'pi pi-fw pi-bookmark',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
            this.model.push({
                label: 'Get Started',
                items: [
                    {
                        label: 'Documentation',
                        icon: 'pi pi-fw pi-question',
                        routerLink: ['/documentation'],
                    },
                ],
            });
        }
        this.translateMenuItems();

        this.translateService.onLangChange.subscribe(
            (event: LangChangeEvent) => {
                this.translateService.use(event.lang);
                this.translateMenuItems();
            },
        );
    }

    translateMenuItems() {
        this.model = this.model.map((item) => {
            if (item.label && item.translationCode) {
                item.label = this.translateService.instant(
                    item.translationCode,
                );
            }
            if (item.items) {
                for (let el of item.items) {
                    if (el.translationCode) {
                        el.label = this.translateService.instant(
                            el.translationCode,
                        );
                    }
                }
            }
            return item;
        });
    }
}
