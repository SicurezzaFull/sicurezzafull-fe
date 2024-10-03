import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
} from '@angular/core';
import { Representative } from '../../../models/customer';
import { Product } from '../../../models/product';
import { Table } from 'primeng/table';
import {
    MessageService,
    ConfirmationService,
    MenuItem,
} from 'primeng/api';
import { Client } from 'src/app/models/client';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user';
import { NgxGpAutocompleteService } from '@angular-magic/ngx-gp-autocomplete';

import { ROUTES } from 'src/app/utils/constants';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ClientService } from 'src/app/services/client.service';

interface expandedRows {
    [key: string]: boolean;
}

@Component({
    templateUrl: './table-client.component.html',
    styleUrls: ['./table-client.component.scss'],
    providers: [MessageService, ConfirmationService],
})
export class TableClientComponent implements OnInit {
    clients: Client[] = [];

    ceos: User[] = [];

    selectedClients1: Client[] = [];

    selectedClient: Client = {};

    representatives: Representative[] = [];

    products: Product[] = [];

    rowGroupMetadata: any;

    expandedRows: expandedRows = {};

    activityValues: number[] = [0, 100];

    isExpanded: boolean = false;

    idFrozen: boolean = false;

    loading: boolean = true;

    display: boolean;

    actionsFrozen: boolean = true;

    items: MenuItem[] | undefined;

    sizes!: any[];

    selectedSize: any = '';
    selectedItem: any = null;

    @ViewChild('filter') filter!: ElementRef;

    constructor(
        private router: Router,
        private ngxGpAutocompleteService: NgxGpAutocompleteService,
        public translateService: TranslateService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private clientService: ClientService,
        private userService: UserService
    ) {
        this.ngxGpAutocompleteService.setOptions({
            componentRestrictions: { country: ['IT'] },
            types: ['geocode'],
        });
    }

    selectAddress(place: any): void { }

    ngOnInit() {
        this.items = [
            {
                label: 'Options',
                items: [
                    {
                        label: 'Dettagli',
                        icon: 'pi pi-search',
                        command: () => {
                            this.goToDetailClient(this.selectedItem.id);
                        },
                    },
                    {
                        label: 'Modifica',
                        icon: 'pi pi-pencil',
                        command: () => {
                            this.goToModifyClient(this.selectedItem.id);
                        },
                    },
                    {
                        label: 'Delete',
                        icon: 'pi pi-trash',
                        command: () => {
                            this.confirmErase(this.selectedItem.id);
                        },
                    },
                ],
            },
        ];
        this.sizes = [
            {
                name: 'S',
                class: 'p-datatable-sm',
            },
            {
                name: 'M',
                class: '',
            },
            {
                name: 'L',
                class: 'p-datatable-lg',
            },
        ];
        this.loadServices();
    }

    loadServices() {
        this.clientService.getAllClients().subscribe((clients) => {
            this.clients = clients;
            this.loading = false;
        });

        this.userService.getAllCeos().subscribe((ceos) => {
            this.ceos = ceos;
        });
    }

    confirmErase(idClient) {
        this.confirmationService.confirm({
            message: 'Do you want to delete this record?',
            header: 'Delete Confirmation',
            icon: 'pi pi-info-circle',
            accept: () => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Confermato',
                    detail: 'Hai accettato',
                });
                this.clientService
                    .deleteClient(idClient)
                    .subscribe((res) => this.loadServices());
            },
            reject: (type) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Rejected',
                    detail: 'You have rejected',
                });
            },
        });
    }
    //Change route

    goToModifyClient(idClient) {
        this.router.navigate([ROUTES.ROUTE_MODIFY_CLIENT], {
            queryParams: { id: idClient },
        });
    }

    goToDetailClient(idClient) {
        this.router.navigate([ROUTES.ROUTE_DETAIL_CLIENT], {
            queryParams: { id: idClient },
        });
    }

    //Table methods

    onSort() {
        this.updateRowGroupMetaData();
    }

    updateRowGroupMetaData() {
        this.rowGroupMetadata = {};
    }

    expandAll() {
        if (!this.isExpanded) {
            this.products.forEach((product) =>
                product && product.name
                    ? (this.expandedRows[product.name] = true)
                    : ''
            );
        } else {
            this.expandedRows = {};
        }
        this.isExpanded = !this.isExpanded;
    }

    formatCurrency(value: number) {
        return value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal(
            (event.target as HTMLInputElement).value,
            'contains'
        );
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }
    //Actions
}
