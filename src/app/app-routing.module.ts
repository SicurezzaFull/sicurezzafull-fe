import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from './shared/components/notfound/notfound.component';
import { AppLayoutComponent } from './layout/app.layout.component';
import { AuthGuard } from './services/auth.guard';

@NgModule({
    imports: [
        RouterModule.forRoot(
            [
                {
                    path: '',
                    component: AppLayoutComponent,
                    canActivate: [AuthGuard],
                    children: [
                        {
                            path: 'dashboard',
                            loadChildren: () =>
                                import(
                                    './pages/dashboard/dashboard.module'
                                ).then((m) => m.DashboardModule),
                            canActivate: [AuthGuard],
                            data: {
                                roles: ['ROLE_ADMIN', 'ROLE_MODERATOR'],
                            },
                        },
                        {
                            path: 'notification',
                            loadChildren: () =>
                                import(
                                    './pages/notification/notification.module'
                                ).then((m) => m.NotificationModule),
                            canActivate: [AuthGuard],
                            data: {
                                roles: ['ROLE_ADMIN', 'ROLE_MODERATOR'],
                            },
                        },
                        {
                            path: 'home',
                            loadChildren: () =>
                                import('./pages/home/home.module').then(
                                    (m) => m.HomeModule,
                                ),
                            canActivate: [AuthGuard],
                            data: {
                                roles: [
                                    'ROLE_WORKER',
                                    'ROLE_ADMIN',
                                    'ROLE_MODERATOR',
                                ],
                            },
                        },
                        {
                            path: 'company',
                            loadChildren: () =>
                                import('./pages/company/company.module').then(
                                    (m) => m.CompanyModule,
                                ),
                            canActivate: [AuthGuard],
                            data: {
                                roles: ['ROLE_ADMIN', 'ROLE_MODERATOR'],
                            },
                        },
                        {
                            path: 'client',
                            loadChildren: () =>
                                import('./pages/client/client.module').then(
                                    (m) => m.ClientModule,
                                ),
                            canActivate: [AuthGuard],
                            data: {
                                roles: ['ROLE_ADMIN', 'ROLE_MODERATOR'],
                            },
                        },
                        {
                            path: 'user',
                            loadChildren: () =>
                                import('./pages/user/user.module').then(
                                    (m) => m.UserModule,
                                ),
                            canActivate: [AuthGuard],
                            data: {
                                roles: ['ROLE_ADMIN', 'ROLE_MODERATOR'],
                            },
                        },
                        {
                            path: 'document',
                            loadChildren: () =>
                                import('./pages/document/document.module').then(
                                    (m) => m.DocumentModule,
                                ),
                            canActivate: [AuthGuard],
                            data: {
                                roles: ['ROLE_ADMIN', 'ROLE_MODERATOR'],
                            },
                        },
                        {
                            path: 'attendance',
                            loadChildren: () =>
                                import(
                                    './pages/attendance/attendance.module'
                                ).then((m) => m.AttendanceModule),
                            canActivate: [AuthGuard],
                            data: {
                                roles: ['ROLE_ADMIN', 'ROLE_MODERATOR'],
                            },
                        },
                        {
                            path: 'permission',
                            loadChildren: () =>
                                import(
                                    './pages/permission/permission.module'
                                ).then((m) => m.PermissionModule),
                            canActivate: [AuthGuard],
                            data: {
                                roles: ['ROLE_ADMIN', 'ROLE_MODERATOR'],
                            },
                        },
                        {
                            path: 'deadlines',
                            loadChildren: () =>
                                import(
                                    './pages/deadlines/deadlines.module'
                                ).then((m) => m.DeadlinesModule),
                            canActivate: [AuthGuard],
                            data: {
                                roles: ['ROLE_ADMIN', 'ROLE_MODERATOR', 'ROLE_ACCOUNTING'],
                            },
                        },
                        {
                            path: 'workforce',
                            loadChildren: () =>
                                import(
                                    './pages/workforce/workforce.module'
                                ).then((m) => m.WorkforceModule),
                            canActivate: [AuthGuard],
                            data: {
                                roles: ['ROLE_ADMIN', 'ROLE_MODERATOR', 'ROLE_ACCOUNTING'],
                            },
                        },
                        {
                            path: 'vehicle',
                            loadChildren: () =>
                                import('./pages/vehicle/vehicle.module').then(
                                    (m) => m.VehicleModule,
                                ),
                            canActivate: [AuthGuard],
                            data: {
                                roles: ['ROLE_ADMIN', 'ROLE_MODERATOR'],
                            },
                        },

                        {
                            path: 'uikit',
                            loadChildren: () =>
                                import(
                                    './shared/components/uikit/uikit.module'
                                ).then((m) => m.UIkitModule),
                        },
                        {
                            path: 'utilities',
                            loadChildren: () =>
                                import(
                                    './shared/components/utilities/utilities.module'
                                ).then((m) => m.UtilitiesModule),
                        },
                        {
                            path: 'documentation',
                            loadChildren: () =>
                                import(
                                    './shared/components/documentation/documentation.module'
                                ).then((m) => m.DocumentationModule),
                        },
                        {
                            path: 'blocks',
                            loadChildren: () =>
                                import(
                                    './shared/components/primeblocks/primeblocks.module'
                                ).then((m) => m.PrimeBlocksModule),
                        },
                        {
                            path: 'pages',
                            loadChildren: () =>
                                import(
                                    './shared/components/pages/pages.module'
                                ).then((m) => m.PagesModule),
                        },
                    ],
                },
                {
                    path: 'auth',
                    loadChildren: () =>
                        import('./pages/auth/auth.module').then(
                            (m) => m.AuthModule,
                        ),
                },

                { path: 'notfound', component: NotfoundComponent },
            ],
            {
                useHash: false,
                scrollPositionRestoration: 'enabled',
                anchorScrolling: 'enabled',
                onSameUrlNavigation: 'reload',
            },
        ),
    ],
    exports: [RouterModule],
    providers: [AuthGuard],
})
export class AppRoutingModule {}
