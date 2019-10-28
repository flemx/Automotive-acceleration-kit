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
        if(value === 'primary') this.btnClass = 'c-button c-button--primary';
        if(value === 'inverted')  this.btnClass = 'c-button c-button--primary-inverted';
        if(value === 'secondary')  this.btnClass = 'c-button c-button--secondary';
    }
    
    @track btnClass = 'c-button c-button--primary';
    @track inlineStyle = 'font-size:0.75rem';

}