import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DetailClientComponent } from './detail-client.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: DetailClientComponent,
            },
        ]),
    ],
    exports: [RouterModule],
})
export class DetailClientRoutingModule {}
