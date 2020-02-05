import { LightningElement, api } from 'lwc';

export default class amfContactDetails extends LightningElement {


    @api firstName = "";
    @api lastName = "";
    @api street = "";
    @api postal = "";
    @api city = "";
    @api country = "";
    @api email = "";
    @api phone = "";


}