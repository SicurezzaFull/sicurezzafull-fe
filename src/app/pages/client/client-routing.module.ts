import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'table',
                data: { breadcrumb: 'Table' },
                loadChildren: () =>
                    import('./table/table-client.module').then(
                        (m) => m.TableClientModule
                    ),
            },
            {
                path: 'create',
                data: { breadcrumb: 'Create' },
                loadChildren: () =>
                    import('./create/create-client.module').then(
                        (m) => m.CreateClientModule
                    ),
            },
            {
                path: 'modify',
                data: { breadcrumb: 'Modify' },
                loadChildren: () =>
                    import('./modify/modify-client.module').then(
                        (m) => m.ModifyClientModule
                    ),
            },
            {
                path: 'detail',
                data: { breadcrumb: 'Detail' },
                loadChildren: () =>
                    import('./detail/detail-client.module').then(
                        (m) => m.DetailClientModule
                    ),
            },

        ]),
    ],
    exports: [RouterModule],
})
export class ClientRoutingModule { }
