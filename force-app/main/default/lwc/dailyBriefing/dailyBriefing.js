import { LightningElement, api } from 'lwc';
import { subscribe } from 'lightning/empApi';
import { NavigationMixin } from 'lightning/navigation';

export default class dailyBriefing extends NavigationMixin(LightningElement) {

    @api platformEvent;
    @api eventParameter;

    renderedCallback(){
        if (this.IsInitialized) {
            return;
        }
        
         //Handle platform events 
         const messageCallback = (response) => {
             console.log('Event received with value : ', response.data.payload[this.eventParameter]);
             if(response.data.payload[this.eventParameter]){
                 this.openDashboard();
             }
         };
 
         // Invoke subscribe method of empApi. Pass reference to messageCallback
         subscribe(this.platformEvent, -1, messageCallback).then(response => {
             // Response contains the subscription information on successful subscribe call
             console.log('Successfully subscribed to : ', JSON.stringify(response.channel));
             this.subscription = response;
         });
         

    }


    openDashboard(){
        console.log('Open Sales_Dashboard..');
        this[NavigationMixin.Navigate]({
            "type": "standard__navItemPage",
            "attributes": {
                "apiName": "Sales_Dashboard"    
            }
        });
    }
    
}