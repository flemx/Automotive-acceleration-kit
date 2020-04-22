import { LightningElement } from 'lwc';
import VEHICLE_ASSETS from '@salesforce/resourceUrl/autoforceFiles';

export default class amfTestDriveLocation extends LightningElement {
    

    iconHome = VEHICLE_ASSETS + '/icons/symbols.svg#home';
    iconDealer = VEHICLE_ASSETS + '/icons/symbols.svg#travel_and_places';
    iconCheck = VEHICLE_ASSETS + '/icons/symbols.svg#check';
}