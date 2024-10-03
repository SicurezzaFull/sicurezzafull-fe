import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CreateClientComponent } from './create-client.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: CreateClientComponent,
            },
        ]),
    ],
    exports: [RouterModule],
})
export class CreateClientRoutingModule {}
