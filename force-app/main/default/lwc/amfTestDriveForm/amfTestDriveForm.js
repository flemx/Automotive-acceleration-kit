import { LightningElement } from 'lwc';

export default class amfTestDriveForm extends LightningElement {
    toggleSection(event){
        let el = event.target.closest(".slds-section");
        console.log(el);
        if(event.target.closest(".slds-section").classList.contains('slds-is-open')){
            el.classList.remove('slds-is-open');
        }else{
            el.classList.add('slds-is-open');
        }
    }

    clickNext(event){
        let el = event.target.closest(".slds-section");
        event.target.closest(".nextButton").style.display = 'none';
         el.classList.remove('slds-is-open');
         console.log(el.nextElementSibling);
         el.nextElementSibling.classList.add('slds-is-open');
    }
}