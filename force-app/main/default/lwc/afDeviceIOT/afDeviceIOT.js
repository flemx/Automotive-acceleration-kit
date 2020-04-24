import { LightningElement, api, track, wire } from 'lwc';
import VEHICLE_ASSETS from '@salesforce/resourceUrl/autoforceFiles';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import { getRecord, } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';

const FIELDS = [
    'Asset.operational__c'
  ];

export default class afDeviceIOT extends LightningElement {

    isRrendered = false;
    // checkWire = false;
    // diagnosticTracker = true;

    lastIoTStatus;ç

    vehicleImages = {
        good : VEHICLE_ASSETS + '/images/iot/iot-good.png',
        bad : VEHICLE_ASSETS + '/images/iot/iot-FL.png'
    }

    toastMessages = {
        good : {
            title : '',
            message : '',
            variant : 'success'
        },
        bad : {
            title : '',
            message : '',
            variant : 'warning'
        }
    }

    /**
     *  Set recordId to assetId value if value is set in design attribute
     */
    @api get assetId(){
        return this.recordId;
    }
    set assetId(value){
        !value === 'Set Record ID'? this.recordId = value : null;
    }

    @api recordId;

    @api title = 'Vehicle tire status';
    @api showToast;

    /** Set Toast messages from design attributes */
    @api get toastGood(){
        return this.toastMessages.good.title;
    }
    set toastGood(value){
        this.toastMessages.good.title = value;
    }
    @api get toastBad(){
        return this.toastMessages.bad.title;
    }
    set toastBad(value){
        this.toastMessages.bad.title = value;
    }

    //Current selected image
    @track selectedImg = this.vehicleImages.good;


    wiredAssetResult;
    
    renderedCallback(){

        if(this.isRrendered){
            return;
        }
       
        this.isRrendered = true;
        this.startDiagnose(0);
    
      }

    @wire(getRecord, { recordId: '$recordId' , fields: FIELDS})
    assetRecord(result){
        this.wiredAssetResult  = result;
        if(result.data){
            // console.log(result.data);
            let iotStatus = !result.data.fields.operational__c.value;
        
            // this.startDiagnose(0);
            iotStatus ?  this.selectedImg = this.vehicleImages.bad : this.selectedImg = this.vehicleImages.good;
            console.log(`Typeof: ${typeof this.showToast} , value: ${this.showToast}`);

            //Check toast
                //Run toast
                if(!iotStatus === this.lastIoTStatus && this.showToast){
                    let toastVar = {}
                    if(iotStatus){
                        toastVar = this.toastMessages.bad;
                    }
                    if(!iotStatus){
                        toastVar = this.toastMessages.good;
                    }
                   this.dispatchEvent(new ShowToastEvent(toastVar));
                }
            this.lastIoTStatus = iotStatus;
         }
           
        }




  startDiagnose(num){
    // eslint-disable-next-line @lwc/lwc/no-async-operation
   setTimeout(()=>{ 
     num++;
     console.log(num);
     refreshApex(this.wiredAssetResult);
     this.startDiagnose(num);
     
   }, 1500);
  }
 

}