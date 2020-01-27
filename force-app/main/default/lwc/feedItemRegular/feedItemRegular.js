import { LightningElement, api } from 'lwc';

/**
 * @author Damien Fleminks
 * 18-10-2019
 */
export default class FeedItemRegular extends LightningElement {
    
    name;
    days;
    backgroundVar;

    @api title;
    @api description;
    @api sourceUrl; 
    @api type;

    @api get image(){
        return this.backgroundVar;
    }
    set image(value){
        //console.log('set image: ', value);
        this.backgroundVar = `background: url(${value});background-size:cover`;
    }

    
    @api get sourceName(){
        return this.name;
    }
    set sourceName(value){
        this.name = value.replace(/(^\w+:|^)\/\//, '');
    }

    @api get sourceDate(){
        return this.days;
    }
    set sourceDate(value){
        //console.log('souurceDate executed', value);
        let fromDate = new Date(value);
        let now = new Date();
        let Difference_In_Time = now.getTime() - fromDate.getTime(); 
        let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24); 
        this.days = Math.round(Difference_In_Days);
    }

}