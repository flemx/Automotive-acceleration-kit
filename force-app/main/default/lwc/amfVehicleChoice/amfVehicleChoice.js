/**
 *  Used in amfTestDriveForm component to choose vehicle
 *  10-02-2010
 *  @ Damien Fleminks
 */

/* eslint-disable no-unused-expressions */
import { LightningElement, track, api } from 'lwc';
import VEHICLE_IMAGES from '@salesforce/resourceUrl/autoforceFiles';
import getVehicles from '@salesforce/apex/TestDriveController.getTestDriveVehicles';

export default class amfVehicleChoice extends LightningElement {

    @track vehicles = {
      v1 : {},
      v2 : {},
      v3 : {}
    };
    @track dataLoaded = false;
    @api currentChoice;


    constructor(){
      super();
      getVehicles()
          .then(result => {
            let comName = window.location.href.split("/")[3];
            console.log('getVehicles: ', result);
            for(let key in result){

              let newVehicle = {};
              newVehicle.image = 'background-image:url(/'+comName+result[key].Image_url__c+')';
              newVehicle.sourceImage = '/'+comName+result[key].Image_url__c;
              newVehicle.Name = result[key].Name;
              newVehicle.Id = result[key].Id;
              console.log('typeof key: '+typeof key+'Value: '+key);
              key === '0'? this.vehicles.v1 = newVehicle : null;
              key === '1'? this.vehicles.v2 = newVehicle : null;
              key === '2'? this.vehicles.v3 = newVehicle : null;
          
              console.log('Vehicle:', result[key]);
               
            }
            console.log(this.vehicles);
            this.currentChoice = this.vehicles.v1;
            console.log('this.currentChoice.image: ' + this.currentChoice.image);
            this.dataLoaded = true;
          })
          .catch(error => {
              console.error(error);
          });
  }

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
          let selected = this.template.querySelector('.selectedChoice');
         console.log(selected);
          selected.classList.remove('selectedChoice');
          selected.classList.add('drinkcard-cc');
          el.classList.remove('drinkcard-cc');
          el.classList.add('selectedChoice');
          //Set selected image
          if(el.getAttribute('data-id') === this.vehicles.v1.Id){
            this.currentChoice = this.vehicles.v1;
          }
          if(el.getAttribute('data-id') === this.vehicles.v2.Id){
            this.currentChoice = this.vehicles.v2;
          }
          if(el.getAttribute('data-id') === this.vehicles.v3.Id){
            this.currentChoice = this.vehicles.v3;
          }
      }
    }
}
