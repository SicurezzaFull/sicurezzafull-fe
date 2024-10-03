import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ModifyClientComponent } from './modify-client.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: ModifyClientComponent,
            },
        ]),
    ],
    exports: [RouterModule],
})
export class ModifyClientRoutingModule {}
