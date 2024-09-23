import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        RouterModule.forChild([
            
            {
                path: 'create',
                data: { breadcrumb: 'Create' },
                loadChildren: () =>
                    import('./create/create-document.module').then(
                        (m) => m.CreateDocumentModule
                    ),
            },
            {
                path: 'generate',
                data: { breadcrumb: 'Contratto' },
                loadChildren: () =>
                    import('./contratto/contratto-document.module').then(
                        (m) => m.ContrattoDocumentModule
                    ),
            }

        ]),
    ],
    exports: [RouterModule],
})
export class DocumentRoutingModule {}
