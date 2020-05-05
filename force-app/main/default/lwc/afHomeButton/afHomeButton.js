import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class AfHomeButton extends NavigationMixin(LightningElement) {

    openHome(){
         // Navigate to the home page
         this[NavigationMixin.Navigate]({
            type: 'standard__namedPage',
            attributes: {
                pageName: 'home'
            },
        });
    }
}