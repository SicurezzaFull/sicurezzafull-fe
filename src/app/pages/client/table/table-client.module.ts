import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableClientComponent } from './table-client.component';
import { TableClientRoutingModule } from './table-client-routing.module';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { RippleModule } from 'primeng/ripple';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { SliderModule } from 'primeng/slider';
import { RatingModule } from 'primeng/rating';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { DefaultAutocompleteModule } from 'src/app/shared/components/default-autocomplete/default-autocomplete.module';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { MenuModule } from 'primeng/menu';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        CommonModule,
        TableClientRoutingModule,
        DefaultAutocompleteModule,
        DialogModule,
        ConfirmDialogModule,
        TableModule,
        RatingModule,
        SelectButtonModule,
        ButtonModule,
        SliderModule,
        InputTextModule,
        ToggleButtonModule,
        CalendarModule,
        ConfirmPopupModule,
        RippleModule,
        MultiSelectModule,
        DropdownModule,
        ProgressBarModule,
        MenuModule,
        FormsModule,
        TranslateModule,
        ReactiveFormsModule,
        ToastModule,
    ],
    declarations: [TableClientComponent],
})
export class TableClientModule {}
