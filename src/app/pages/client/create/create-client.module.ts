//Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

//PrimeNG
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { SliderModule } from 'primeng/slider';
import { RatingModule } from 'primeng/rating';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';

//AutoComplete Google
import { DefaultAutocompleteModule } from '../../../shared/components/default-autocomplete/default-autocomplete.module';

// Components
import { CreateClientComponent } from './create-client.component';
import { CreateClientRoutingModule } from './create-client-routing.module';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CalendarModule } from 'primeng/calendar';

@NgModule({
    imports: [
        ButtonModule,
        CommonModule,
        ConfirmDialogModule,
        DefaultAutocompleteModule,
        DialogModule,
        DropdownModule,
        FormsModule,
        CalendarModule,
        InputTextModule,
        InputTextareaModule,
        InputSwitchModule,
        CreateClientRoutingModule,
        MultiSelectModule,
        ProgressBarModule,
        RatingModule,
        ReactiveFormsModule,
        RippleModule,
        SliderModule,
        TableModule,
        ToastModule,
        ToggleButtonModule,
    ],
    declarations: [CreateClientComponent],
})
export class CreateClientModule {}
