import { LightningElement, api, track, wire } from 'lwc';
import VEHICLE_ASSETS from '@salesforce/resourceUrl/vwDemoPackFiles';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import { getRecord, } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';

const FIELDS = [
    'Asset.af_IoT_status__c'
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
            title : 'Tire pressure returned to normal',
            message : '',
            variant : 'success'
        },
        bad : {
            title : 'Low Tire pressure detected',
            message : 'Case created, please contact customer',
            variant : 'warning'
        }
    }

    @api recordId;
    @api title = 'Vehicle tire status';

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
            let iotStatus = result.data.fields.af_IoT_status__c.value;
        
            // this.startDiagnose(0);
            iotStatus ?  this.selectedImg = this.vehicleImages.bad : this.selectedImg = this.vehicleImages.good;
            console.log(`Typeof: ${typeof iotStatus} , value: ${iotStatus}`);

            //Check toast
                //Run toast
                if(!iotStatus === this.lastIoTStatus){
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
     
   }, 3000);
  }
 
  handleClick(){
    this.startDiagnose(0);
    //refreshApex(this.isRendered);
  }


}