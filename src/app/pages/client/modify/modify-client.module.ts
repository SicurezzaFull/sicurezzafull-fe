//Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

//PrimeNG
import { Button, ButtonModule } from 'primeng/button';
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
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';

//AutoComplete Google
import { DefaultAutocompleteModule } from '../../../shared/components/default-autocomplete/default-autocomplete.module';
import { ModifyClientComponent } from './modify-client.component';
import { ModifyClientRoutingModule } from './modify-client-routing.module';

// Components

@NgModule({
    imports: [
        ButtonModule,
        CommonModule,
        ConfirmDialogModule,
        DefaultAutocompleteModule,
        DialogModule,
        DropdownModule,
        FormsModule,
        InputTextModule,
        InputTextareaModule,
        InputSwitchModule,
        ModifyClientRoutingModule,
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
    declarations: [ModifyClientComponent],
})
export class ModifyClientModule {}
