import { LightningElement, api } from 'lwc';
import iotTrigger from '@salesforce/apex/AfDemoManagerController.triggerIot';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
export default class AfDemoManager extends LightningElement {

    @api vinValue;
    @api iotValue;
    @api iotValueBad;

    iotGoodDisabled = false;
    iotBadDisabled = false;

    toastMessages = {
        good : {
            title : 'Successfully triggered event',
            message : '',
            variant : 'success'
        },
        bad : {
            title : 'Unable to trigger event',
            message : 'Investigate the debug logs',
            variant : 'error'
        }
    }

    triggerGood(){
        this.iotGoodDisabled = true;
        this.triggerEvent(false);
    }
    triggerBad(){
        this.iotBadDisabled = true;
        this.triggerEvent(true);
    }

    /**
     * Trigger platform event
     */
    triggerEvent(isBad){
        console.log(`this.iotValueBad: ${this.iotValueBad}, this.iotValue: ${this.iotValue}`);
        let currentValue = isBad? this.iotValueBad : this.iotValue;
        iotTrigger({
            vinValue: this.vinValue,
            iotValue: currentValue
        })
            .then(result => {
                console.log(result);
                isBad? this.iotBadDisabled = false : this.iotGoodDisabled = false;
                this.dispatchEvent(new ShowToastEvent(this.toastMessages.good)); 
            })
            .catch(error => {
                console.error(error);
                isBad? this.iotBadDisabled = false : this.iotGoodDisabled = false;
                this.dispatchEvent(new ShowToastEvent(this.toastMessages.bad)); 
            });
      
    }
}