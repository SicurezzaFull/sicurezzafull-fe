import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TableClientComponent } from './table-client.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: TableClientComponent,
            },
        ]),
    ],
    exports: [RouterModule],
    
})
export class TableClientRoutingModule {}
