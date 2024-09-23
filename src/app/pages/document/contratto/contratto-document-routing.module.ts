import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ContrattoDocumentComponent } from './contratto-document.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: ContrattoDocumentComponent,
            },
        ]),
    ],
    exports: [RouterModule],
})
export class ContrattoDocumentRoutingModule { }
