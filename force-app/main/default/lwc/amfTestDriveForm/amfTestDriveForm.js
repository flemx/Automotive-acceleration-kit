/**
 *  Automotive Test drive form component
 *  02-02-2020
 * @ Damien Fleminks
 */

import { LightningElement, track, api } from 'lwc';
import VEHICLE_ASSETS from '@salesforce/resourceUrl/autoforceFiles';
import { NavigationMixin } from 'lightning/navigation';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getDemoContact from '@salesforce/apex/TestDriveController.getContact';


//Lead object and fields
import LEAD_OBJECT from '@salesforce/schema/Lead';
import FIRSTNAME from '@salesforce/schema/Lead.FirstName';
import LASTNAME from '@salesforce/schema/Lead.LastName';
import EMAIL from '@salesforce/schema/Lead.Email';
import COMPANY from '@salesforce/schema/Lead.Company';
import PHONE from '@salesforce/schema/Lead.Phone';
import STREET from '@salesforce/schema/Lead.Street';
import POSTAL from '@salesforce/schema/Lead.PostalCode';
import CITY from '@salesforce/schema/Lead.City';
import SOURCE from '@salesforce/schema/Lead.LeadSource';
import TESTDRIVE from '@salesforce/schema/Lead.test_drive__c';
import TESTDATE from '@salesforce/schema/Lead.td_date_requested__c';
import CARTYPE from '@salesforce/schema/Lead.Vehicle_Type__c';
import VEHICLEID from '@salesforce/schema/Lead.Vehicle__c';

export default class amfTestDriveForm extends NavigationMixin(LightningElement) {
    @track isLoading = false;
    iconSwitch = VEHICLE_ASSETS + '/icons/symbols.svg#switch';

    // JSON Object to hold contact object
    @track demoContact = {
        FirstName : '',
        LastName : '',
        Email : '',
        Phone : '',
        MailingStreet : '',
        MailingCity : '',
        MailingCountry : '',
        MailingPostalCode : ''
    }
    @api useDemoContact;

    // API choices for vehicle names
    // @api model1;
    // @api model2;
    // @api model3;

    //Page redirect name - thankyou
    @api redirectPage;

    constructor(){
        super();
        getDemoContact()
            .then(result => {
                this.demoContact = result;
                console.log(this.demoContact);
            })
            .catch(error => {
                console.error(error);
            });
    }

    /**
     *  Toggle expansion element open/close
     * @param {*} event 
     */
    toggleSection(event){
        let el = event.target.closest(".slds-section");
        console.log(el);
        if(event.target.closest(".slds-section").classList.contains('slds-is-open')){
            el.classList.remove('slds-is-open');
        }else{
            el.classList.add('slds-is-open');
        }
    }

    /**
     *  Nxt button -> close current expansion and opens next one
     * @param { } event 
     */
    clickNext(event){
        let el = event.target.closest(".slds-section");
        event.target.closest(".nextButton").style.display = 'none';
         el.classList.remove('slds-is-open');
        //  console.log(el.nextElementSibling);
         el.nextElementSibling.classList.add('slds-is-open');
        // console.log(this.template.querySelector('.vehicleChoiceCmp').currentModel);
    }

    /**
     *  Upon submit create leead and redirect to chosen page
     */
    submit(){
        this.isLoading = true;
        const con = this.template.querySelector('.contactInfo');
        const fields = {};
        fields[FIRSTNAME.fieldApiName] = con.firstName;
        fields[LASTNAME.fieldApiName] = con.lastName;
        fields[EMAIL.fieldApiName] = con.email;
        fields[COMPANY.fieldApiName] = con.lastName + ' household';
        fields[PHONE.fieldApiName] = con.phone;
        fields[STREET.fieldApiName] = con.street;
        fields[POSTAL.fieldApiName] = con.postal;
        fields[CITY.fieldApiName] = con.city;
        fields[SOURCE.fieldApiName] = 'Website';
        fields[TESTDRIVE.fieldApiName] = true;
        fields[TESTDATE.fieldApiName] = this.template.querySelector('.testDriveTime').value;
        console.log('vehicleChoiceCmp: ', this.template.querySelector('.vehicleChoiceCmp').currentChoice.Id);
        fields[CARTYPE.fieldApiName] = this.template.querySelector('.vehicleChoiceCmp').currentChoice.Name;
        fields[VEHICLEID.fieldApiName] = this.template.querySelector('.vehicleChoiceCmp').currentChoice.Id;
        console.log('fields: ', fields);
        const recordInput = { apiName: LEAD_OBJECT.objectApiName, fields };

        createRecord(recordInput)
            .then(lead => {
                console.log(lead);
                this[NavigationMixin.Navigate]({
                    type: 'comm__namedPage',
                    attributes: {
                        pageName: this.redirectPage
                    },
                });
            })
            .catch(error => {
                this.isLoading = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating Lead',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
            });
          
        
    }
}