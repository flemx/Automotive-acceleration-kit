/**
 *  Used in amfTestDriveForm component to choose vehicle
 *  10-02-2010
 *  @ Damien Fleminks
 */

/* eslint-disable no-unused-expressions */
import { LightningElement, track, api } from 'lwc';
import VEHICLE_IMAGES from '@salesforce/resourceUrl/vwDemoPackFiles';

export default class amfVehicleChoice extends LightningElement {


    img1Url = VEHICLE_IMAGES + '/images/vehicles/model1.jpg';
    img2Url = VEHICLE_IMAGES + '/images/vehicles/model2.jpg';
    img3Url = VEHICLE_IMAGES + '/images/vehicles/model3.jpg';
    img1 = `background-image:url(${this.img1Url})`;
    img2 = `background-image:url(${this.img2Url})`;
    img3 = `background-image:url(${this.img3Url})`;
    @track currentChoice = this.img1Url;
    @api model1;
    @api model2;
    @api model3;
    @api currentModel = this.model1;

    radioCheck(event){
        //event.target.style.filter = 'none';
        let el = event.target.closest(".drinkcard-cc"); 
        el.style.filter = 'none';
        this.template.querySelector('.modelType').className = 'modelTypeNone';
        // console.log(el);
        // console.log(el.previousElementSibling);
    }

    handleChoice(event){
      let el = event.target.closest(".choiceCol"); 
      
      if(el.classList.contains('drinkcard-cc')){
          console.log(el);
          let selected = this.template.querySelector('.selectedChoice');
         console.log(selected);
          selected.classList.remove('selectedChoice');
          selected.classList.add('drinkcard-cc');
          el.classList.remove('drinkcard-cc');
          el.classList.add('selectedChoice');
          //Set selected image
          if(el.getAttribute('data-id') === 'img1'){
            this.currentChoice = this.img1Url;
            this.currentModel = this.model1;
          }
          if(el.getAttribute('data-id') === 'img2'){
            this.currentChoice = this.img2Url;
            this.currentModel = this.model2;
          }
          if(el.getAttribute('data-id') === 'img3'){
            this.currentChoice = this.img3Url;
            this.currentModel = this.model3;
            console.log(this.currentModel);
          }
      }
    }
}
