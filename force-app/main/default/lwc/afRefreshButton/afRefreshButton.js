import { LightningElement } from 'lwc';

export default class AfRefreshButton extends LightningElement {


    reloadbutton(){
        location.reload(true);
    }
   
}