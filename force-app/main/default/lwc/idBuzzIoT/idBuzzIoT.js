/**
 * idBuzzIoT
 * @ Damien Fleminks
 * 07-11-2019
 */

import { LightningElement, track, api } from 'lwc';
import { subscribe } from 'lightning/empApi';
import ASSETS from '@salesforce/resourceUrl/idBuzzFilesIOT';


export default class idBuzzIoT extends LightningElement {


    // Get inital variables from page builder setup
    // @api isFake;
    // @api tirePressureEvent;
    // @api yLength;
    // @api yStep;
    // @api fakeMin;
    // @api fakeMax;
    // @api yellowStatus;
    // @api redStatus;
    @api tirePressureEvent;
    @api minPressure;
    @api eventParameter;

    isLastSend;

    //The platform event value
    @api eventValue;

    // Variable to handle onMouseout after click
    notClicked = true;

    //keep track of current active button
    activeBtn = 'tires-btn';

    //run code in renderedCallback once
    IsInitialized = false;

    //Variable to track if Chart or battery is displayed in the template
    @track swapChart = true;

    // Track if Warning is shown
    @track isWarning = false;
    
    //Resource variables
    images;
    @track imgStart;
    @track imgBattery;
    @track imgDoors;
    @track imgTires = this.images + '/tires.png';
    @track imgLights;
    batteryChart;
    warningCard;

    // Variable to hold the time interval instance
    fakeInterval;
    


    renderedCallback(){
        if (this.IsInitialized) {
            return;
        }

        try{
            this.images = ASSETS + '/vehicleIOT';
            this.imgStart = this.images + '/4-tires.jpg';
            this.imgBattery = this.images + '/battery.png';
            this.imgDoors = this.images + '/doors.png';
            this.imgTires = this.images + '/tires.png';
            this.imgLights = this.images + '/lights.png';
            this.batteryChart = this.images + '/battery-chart.png'
            this.warningCard = this.images + '/warning.png'
            this.eventValue = 0;
            this.IsInitialized = true;


            
            //Handle platform events 
            const messageCallback = (response) => {
                console.log('Tirepressure is : ', response.data.payload[this.eventParameter]);
                this.eventValue = response.data.payload[this.eventParameter];
                //window.myVar = this.eventValue;
                this.setTirestatusButton();
                // Response contains the payload of the new message received
            };
    
            // Invoke subscribe method of empApi. Pass reference to messageCallback
            subscribe(this.tirePressureEvent, -1, messageCallback).then(response => {
                // Response contains the subscription information on successful subscribe call
                console.log('Successfully subscribed to : ', JSON.stringify(response.channel));
                this.subscription = response;
            });
        }catch(e){
            console.error(e);
        }
        
         

    }



    /**
     *  Set the tire status button accordingly to the value parameters 
     */
    setTirestatusButton(){
        console.log('setTirestatusButton executed');
        let minPressure = Number(this.minPressure);
        console.log("this.eventValue: " + this.eventValue + ", this.eventValue:" + typeof this.eventValue);
        console.log("minPressure: " + minPressure + ", minPressure:" + typeof minPressure);
        if(this.eventValue < minPressure){
            this.isWarning = true;
            this.imgTires =  this.images + '/tires-red.png';
            this.imgStart = this.images + '/4-tires-warning.jpg';
        }
        if(this.eventValue > minPressure){
            this.isWarning = false;
            this.imgStart = this.images + '/4-tires.jpg';
            this.imgTires =  this.images + '/tires.png';            
        }  
    }

    /**
     *  Event listener for hover effect, change vehicle image
     * @param {*} event 
     */
    hoverEffect(event){
        let className = event.target.classList[0];
        this.setImgStart(className);
    }

    /**
     *  Set vehicle image back on mouseout
     */
    hoverBack(){
        let className = this.template.querySelector('.isActive').classList[0];
        if(this.notClicked){
            this.setImgStart(className);
        }else{
            this.notClicked = true;
        }
    }

    /**
     * Set vehicle image based on classname of button
     * @param {*} className 
     */
    setImgStart(className){
        if(className === 'door-btn')
            this.imgStart = this.images + '/2-doors.jpg';
        if(className === 'tires-btn')
            if(this.isWarning){
                this.imgStart = this.images + '/4-tires-warning.jpg';
            }else{
                this.imgStart = this.images + '/4-tires.jpg';
            }
           
        if(className === 'battery-btn')
            this.imgStart = this.images + '/3-battery.jpg';
        if(className === 'lights-btn')
            this.imgStart = this.images + '/1-lights.jpg';
    }

    /**
     * Set vehicle image and chart on click event, this.notClicked to prevent hoverBAck() from executing
     * @param {*} event 
     */
    handleClick(event){
        let className = event.target.classList[0];
        console.log('Clicked on:' + className + ',  Length is: ' + event.target.classList.length);

        if(event.target.classList.length === 1){
            event.target.classList.add('isActive');
            if(className === 'tires-btn'){
                this.imgStart = this.images + '/4-tires.jpg';
                this.template.querySelector('.battery-btn').classList.remove('isActive');
                this.swapChart = true;
            }
            if(className === 'battery-btn'){
                this.imgStart = this.images + '/3-battery.jpg';
                this.template.querySelector('.tires-btn').classList.remove('isActive');
                this.swapChart = false;
            }
            this.notClicked = false;
        }
    }

    
    /**
     * Toggle fake data on hidden button press
     */
    toggleFake(){
        if(this.isWarning){
            this.isWarning = false;
            this.imgStart = this.images + '/4-tires.jpg';
            this.imgTires =  this.images + '/tires.png';       

        }else{
            this.isWarning = true;
            this.imgTires =  this.images + '/tires-red.png';
            this.imgStart = this.images + '/4-tires-warning.jpg';
        }
    }





}