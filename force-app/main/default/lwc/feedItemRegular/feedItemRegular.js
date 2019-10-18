import { LightningElement, track, api } from 'lwc';


export default class FeedItemRegular extends LightningElement {
    @track image = 'https://lh3.googleusercontent.com/proxy/eR2YADnHUgnf759W5vR1m8yLGiLb1IoqbwgJsvKCxwtqIpHbyZrNiKEd0hE4M0aPoVyLZOUFOI6krMNPhaa2XXR8v6ni7pvRZRKZM-1IGlGSTxSxYAQ5lloJagrbali3uJcSSCeZYMkQeRVjZLdCtcSws3kTrfIsL_uNymhGPEtD_O0OgPFB2OyAlhl8jc8HwOq5LRviU8WFt8xqxIshbKw=-c';

    @track title = "22 states join California to sue the Trump admin over emissions standards";

    @track description = `A group of 22 states have joined California in suing the Trump administration,
     which revoked that state's right to set`;

    /*
    its own emissions standards. On Thursday, 
     the Environmental Protection Agency and National Highway Traffic Safety Administration announced,
      22 states have joined California in suing the Trump administration,
     which revoked that state's right to set its own emissions standards. On Thursday, 
     the Environmental Protection Agency and National Highway Traffic Safety Administration announce
     */

    @track days;

    @track sourceName = "TechCrunch";

    @track sourceUrl = "http://techcrunch.com/2019/10/15/for-164-jaguar-will-let-you-co-pilot-its-i-pace-race-taxi-around-the-nurburgring/"; 

    @track type = 'NEWS';

    @track backgroundVar = `background: url(${this.image});background-size:cover`;


    constructor(){
        super();
        let from =  {"publishedAt": "2019-09-30T10:16:57Z"};
        let fromDate = new Date(from.publishedAt);
        let now = new Date();
        let Difference_In_Time = now.getTime() - fromDate.getTime(); 
        let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24); 
        this.days = Math.round(Difference_In_Days);
    }

}