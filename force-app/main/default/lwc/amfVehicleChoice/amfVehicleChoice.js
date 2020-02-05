import { LightningElement, track } from 'lwc';

export default class amfVehicleChoice extends LightningElement {


    img1Url = 'https://www.maseratifl.com/wp-content/uploads/2019/08/ghibli_side.png.png.png';
    img2Url = 'https://www.ufodrive.com/images/articles/ufo_car-tesla-model1.png';
    img3Url = 'https://img.rawpixel.com/s3fs-private/rawpixel_images/website_content/p-3d-psd3d2-car-jj-0040.png?auto=&bg=transparent&con=3&cs=srgb&dpr=1&fm=png&ixlib=php-3.1.0&mark=rawpixel-watermark.png&markalpha=90&markpad=13&markscale=10&markx=25&q=75&usm=15&vib=3&w=1400&s=6d115a550dbef6728b64fac539c3eb4e';
    img1 = `background-image:url(${this.img1Url})`;
    img2 = `background-image:url(${this.img2Url})`;
    img3 = `background-image:url(${this.img3Url})`;
    @track currentChoice = this.img1Url;

    radioCheck(event){
        //event.target.style.filter = 'none';
        let el = event.target.closest(".drinkcard-cc"); 
        el.style.filter = 'none';
        this.template.querySelector('.modelType').className = 'modelTypeNone';
        console.log(el);
        console.log(el.previousElementSibling);
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
          el.getAttribute('data-id') === 'img1' ? this.currentChoice = this.img1Url : null ;
          el.getAttribute('data-id') === 'img2' ? this.currentChoice = this.img2Url : null ;
          el.getAttribute('data-id') === 'img3' ? this.currentChoice = this.img3Url : null ;
      }
    }
}
