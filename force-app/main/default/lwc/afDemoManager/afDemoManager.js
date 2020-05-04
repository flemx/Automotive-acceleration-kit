import { LightningElement } from 'lwc';
import iotTrigger from '@salesforce/apex/AfDemoManagerController.triggerIot';

export default class AfDemoManager extends LightningElement {

    triggerEvent(){
        iotTrigger()
            .then(result => {
                console.log(result);  
            })
            .catch(error => {
                console.error(error);
            });
      
    }
}