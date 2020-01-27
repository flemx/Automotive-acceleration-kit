import { LightningElement, track, api } from 'lwc';

export default class VwButton extends LightningElement {

      @api get fontSize(){
        return this.inlineStyle;
    }
    set fontSize(value){
        this.inlineStyle = `font-size:${value}`;
    }

    @api label;

    @api value;

    @api get buttonType(){
        return this.btnClass;
    }
    set buttonType(value){
        if(value === 'primary') this.btnClass = 'slds-button slds-button_brand';
        if(value === 'inverted')  this.btnClass = 'slds-button slds-button_outline-brand';
        if(value === 'secondary')  this.btnClass = 'slds-button slds-button_neutral';
    }
    
    @track btnClass = 'slds-button slds-button_brand';
    @track inlineStyle = 'font-size:0.75rem';

}