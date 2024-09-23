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
import { InputSwitchModule } from 'primeng/inputswitch';
import { CalendarModule } from 'primeng/calendar';

import { NgxDropzoneModule } from 'ngx-dropzone';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ContrattoDocumentRoutingModule } from './contratto-document-routing.module';
import { ContrattoDocumentComponent } from './contratto-document.component';

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
        ContrattoDocumentRoutingModule,
        MultiSelectModule,
        ProgressBarModule,
        RatingModule,
        ReactiveFormsModule,
        PdfViewerModule,
        NgxExtendedPdfViewerModule,
        RippleModule,
        SliderModule,
        TableModule,
        ToastModule,
        DropzoneModule,
        NgxDropzoneModule,
        ToggleButtonModule,
    ],
    declarations: [ContrattoDocumentComponent],
})
export class ContrattoDocumentModule { }
