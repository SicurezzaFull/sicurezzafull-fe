//Angular
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';

//PrimeNg

//Models

//Services
import { LayoutService } from 'src/app/layout/service/app.layout.service';

//Store
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { CompanyState } from 'src/app/stores/dropdown-select-company/dropdown-select-company.reducer';
import { AuthState } from 'src/app/stores/auth/authentication.reducer';

//Libraies
import * as moment from 'moment';

//Utils
import Formatter from 'src/app/utils/formatters';
import { AuthService } from '../../../services/auth.service';
import { AttendanceService } from 'src/app/services/attendance.service';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { ROUTES } from 'src/app/utils/constants';
import { UploadService } from 'src/app/services/upload.service';
import { FileUpload, FileUploadEvent, UploadEvent } from 'primeng/fileupload';

import { Howl } from 'howler';
import { MessageService } from 'primeng/api';
import { VehicleService } from 'src/app/services/vehicle.service';

@Component({
    templateUrl: './attendance-home.component.html',
    styleUrls: ['./attendance-home.component.scss'],
})
export class AttendanceHomeComponent implements OnInit, OnDestroy {
    @ViewChild('fileUpload') fileUpload: FileUpload;

    authState$: Observable<AuthState>;

    //Language
    locale: string;

    //Utils
    formatter!: Formatter;

    //Store
    subscription: Subscription;
    companyState$: Observable<CompanyState>;

    //Longiture latitude

    gpsLatitude;
    gpsLongitude;

    //Uplo

    //Variables

    menuItems: any;
    loading: boolean;
    attendanceData: any;

    storeUser: any;
    currentUser: any;
    currentCompany: any;

    selectedPlace: any;
    placesItems: any;

    selectedVehicle: any;
    selectedPlaceAddress: any;
    vehiclesItems: any;

    checkInForm = this.fb.group({
        placeId: null,
        // vehicleId: null,
        // includeFacchinaggio: null,
        // facchinaggioNameClient: '',
        // facchinaggioAddressClient: '',
        // facchinaggioValue: null,
        // includeViaggioExtra: null,
        // viaggioExtraNameClient: '',
        // viaggioExtraAddressClient: '',
        // viaggioExtraValue: null,
    });
    includeFacchinaggio: null;
    includeViaggioExtra: null;
    currentPlaceMap: any;
    currentAddress: string;
    distanceBetween: number;
    isNearDistance: boolean = false;

    disableButtonCheckIn: boolean = false;
    disableButtonCheckOut: boolean = false;

    attendanceCheckIn: any;

    uploadedFiles: any[] = [];
    private soundButton = new Howl({
        src: ['assets/sounds/button-press.mp3'],
    });

    constructor(
        public fb: FormBuilder,
        public layoutService: LayoutService,
        private attendanceService: AttendanceService,
        private userService: UserService,
        private uploadService: UploadService,
        private messageService: MessageService,
        private vehicleService: VehicleService,
        private router: Router,
        private store: Store<{ authState: AuthState }>,
    ) {
        //Init
        this.authState$ = store.select('authState');
        this.formatter = new Formatter();
    }

    ngOnInit(): void {
        this.authState$.subscribe((authS) => {
            this.storeUser = authS?.user || '';
            this.getLocation(this.storeUser);
        });
        // this.checkInForm.get('includeFacchinaggio').valueChanges.subscribe((includeFacchinaggio) => {
        //     if (includeFacchinaggio) {
        //         // Set validators for required fields when includeFacchinaggio is true
        //         this.checkInForm.get('facchinaggioNameClient').setValidators([Validators.required]);
        //         this.checkInForm.get('facchinaggioAddressClient').setValidators([Validators.required]);
        //         this.checkInForm.get('facchinaggioValue').setValidators([Validators.required]);
        //     } else {
        //         // Remove validators when includeFacchinaggio is false
        //         this.checkInForm.get('facchinaggioNameClient').clearValidators();
        //         this.checkInForm.get('facchinaggioAddressClient').clearValidators();
        //         this.checkInForm.get('facchinaggioValue').clearValidators();
        //         this.checkInForm.patchValue({
        //             facchinaggioNameClient: null,
        //             facchinaggioAddressClient: null,
        //             facchinaggioValue: null
        //         });

        //     }
        //     // Update form controls validity
        //     this.checkInForm.get('facchinaggioNameClient').updateValueAndValidity();
        //     this.checkInForm.get('facchinaggioAddressClient').updateValueAndValidity();
        //     this.checkInForm.get('facchinaggioValue').updateValueAndValidity();
        // });

        // this.checkInForm.get('includeViaggioExtra').valueChanges.subscribe((includeViaggioExtra) => {
        //     if (includeViaggioExtra) {
        //         // Set validators for required fields when includeViaggioExtra is true
        //         this.checkInForm.get('viaggioExtraNameClient').setValidators([Validators.required]);
        //         this.checkInForm.get('viaggioExtraAddressClient').setValidators([Validators.required]);
        //         this.checkInForm.get('viaggioExtraValue').setValidators([Validators.required]);
        //     } else {
        //         // Remove validators when includeViaggioExtra is false
        //         this.checkInForm.get('viaggioExtraNameClient').clearValidators();
        //         this.checkInForm.get('viaggioExtraAddressClient').clearValidators();
        //         this.checkInForm.get('viaggioExtraValue').clearValidators();
        //         this.checkInForm.patchValue({
        //             viaggioExtraNameClient: null,
        //             viaggioExtraAddressClient: null,
        //             viaggioExtraValue: null
        //         });
        //     }
        //     // Update form controls validity
        //     this.checkInForm.get('viaggioExtraNameClient').updateValueAndValidity();
        //     this.checkInForm.get('viaggioExtraAddressClient').updateValueAndValidity();
        //     this.checkInForm.get('viaggioExtraValue').updateValueAndValidity();
        // });

        const layourServiceSubscription =
            this.layoutService.configUpdate$.subscribe(() => {
                this.loadServices(this.currentUser);
            });
        if (this.subscription) {
            this.subscription.add(layourServiceSubscription);
        }
    }

    getLocation(currentUser) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position: any) => {
                    if (position) {
                        this.gpsLatitude = position.coords.latitude;
                        this.gpsLongitude = position.coords.longitude;
                        this.loadServices(currentUser);
                        new google.maps.Geocoder()
                            .geocode({
                                location: {
                                    lat: position.coords.latitude,
                                    lng: position.coords.longitude,
                                },
                            })
                            .then((response) => {
                                if (response.results[0]) {
                                    this.currentAddress =
                                        response.results[0].formatted_address;
                                } else {
                                    console.log('No results found');
                                }
                            })
                            .catch((e) =>
                                console.log('Geocoder failed due to: ' + e),
                            );
                    }
                },
                (error: any) => console.log(error),
            );
        } else {
            console.log('Geolocation is not supported by this browser.');
        }
    }
    loadServices(storeUser) {
        const userServiceSubscription = this.userService
            .getUser(storeUser?.id)
            .subscribe((data) => {
                this.currentUser = data;
                this.currentCompany = data?.companies[0];
                this.placesItems = data?.companies[0]?.places;
                // this.vehiclesItems = data?.companies[0]?.vehicles;
                this.loading = false;
                const attendanceServiceSubscription =
                    this.attendanceService
                        .getAttendanceByUser(storeUser.id)
                        .subscribe((data) => {
                            this.attendanceData = data;
                            this.attendanceCheckIn =
                                this.attendanceData?.attendance;

                            let savedSelectionPlace = parseInt(
                                localStorage.getItem('selectedPlace'),
                                10,
                            );
                            if (savedSelectionPlace) {
                                this.checkInForm.patchValue({
                                    placeId: savedSelectionPlace,
                                });
                                this.calculateDistance(
                                    savedSelectionPlace,
                                );
                            }

                            if (this.attendanceCheckIn?.placeId) {
                                this.checkInForm.patchValue({
                                    placeId:
                                        this.attendanceCheckIn?.placeId,
                                });
                            }
                            if (this.attendanceCheckIn) {
                                this.checkInForm.controls[
                                    'placeId'
                                ].disable({
                                    onlySelf: true,
                                });
                            }

                            this.loading = false;
                        });
                if (attendanceServiceSubscription && this.subscription)
                    this.subscription.add(
                        attendanceServiceSubscription,
                    );
                this.loading = false;

                // const vehicleServiceSubscription = this.vehicleService
                //     .getAllVehicles(0)
                //     .subscribe((vehicles) => {
                //         this.vehiclesItems = vehicles;

                //     });
                // if (vehicleServiceSubscription && this.subscription)
                //     this.subscription.add(vehicleServiceSubscription);
            });

        if (userServiceSubscription && this.subscription)
            this.subscription.add(userServiceSubscription);
    }
    onChangePlace(event) {
        localStorage.setItem('selectedPlace', this.selectedPlace);
        this.selectedPlaceAddress = this.placesItems.find(
            (index) => index.id === this.selectedPlace,
        );

        this.calculateDistance(event.value);
    }

    // onChangeVehicle(event) {
    //     localStorage.setItem('selectedVehicle', this.selectedVehicle);
    // }

    calculateDistance(placeId) {

        this.currentPlaceMap = this.placesItems.filter(
            (place) => place.id == placeId,
        )[0];

        this.distanceBetween = this.getDistanceFromLatLonInKm(
            this.gpsLatitude,
            this.gpsLongitude,
            this.currentPlaceMap?.latitude,
            this.currentPlaceMap?.longitude,
        );

        this.isNearDistance = this.distanceBetween < 0.3; //300 metri

        this.disableButtonCheckIn =
            !this.isNearDistance ||
            this.selectedPlace === null ||
            this.selectedVehicle === null;
    }

    getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = this.deg2rad(parseFloat(lat2) - parseFloat(lat1)); // deg2rad below
        var dLon = this.deg2rad(parseFloat(lon2) - parseFloat(lon1));

        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) *
            Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    saveCheckIn() {
        // if (!this.checkInForm.value.vehicleId) {
        //     this.messageService.add({
        //         severity: 'error',
        //         summary: 'Errore',
        //         detail: 'Scegliere veicolo',
        //         life: 3000,
        //     });
        // }
        // && this.checkInForm.value.vehicleId
        if (
            this.checkInForm.value.placeId
        ) {
            this.attendanceService
                .checkInAttendance(
                    this.currentUser?.id,
                    this.currentCompany?.id,
                    this.checkInForm.value.placeId,
                    null,
                )
                .subscribe((res) => {
                    this.playSoundButton();
                    this.router.navigate([ROUTES.ROUTE_LANDING_HOME]);
                });
        }
    }
    saveCheckOut() {
        const formData = new FormData();

        const checkInId = this.attendanceCheckIn?.id;
        formData.append('checkInId', checkInId);
        this.attendanceService
            .checkOutAttendance(
                this.attendanceCheckIn?.id,
                this.currentUser?.id,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
            )
            .subscribe((res) => {
                this.playSoundButton();
                this.router.navigate([ROUTES.ROUTE_LANDING_HOME]);
            });
    }

    //Upload Image
    uploadFiles(event) {
        for (let file of event.files) {
            this.uploadedFiles.push(file);
        }
    }
    remove(event: Event, file: any) {
        const index: number = this.uploadedFiles.indexOf(file);
        this.fileUpload.remove(event, index);
    }

    //Sounds
    playSoundButton() {
        this.soundButton.play();
    }

    ngOnDestroy() {
        if (this.subscription) this.subscription.unsubscribe();
    }
}
