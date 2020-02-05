Webruntime.moduleRegistry.define('c/amfVehicleChoice', ['lwc'], function (lwc) { 'use strict';

   function stylesheet(hostSelector, shadowSelector, nativeShadow) {
     return ".container" + shadowSelector + "{margin: 2%;}\n.choiceCon" + shadowSelector + "{width: 100%;display: flex;align-items: center;justify-content: center;}\n.choiceCon" + shadowSelector + " img" + shadowSelector + "{height: 300px;}\n.choiceSet" + shadowSelector + "{width: 90%;margin-left:5%;}\n.choiceCol" + shadowSelector + "{width: 100%;}\n.choiceSet" + shadowSelector + " .slds-col" + shadowSelector + "{margin-top: 3%;height: 70px;width: 100%;display: flex;flex-direction: column;align-items: center;justify-content: center;}\n.imgCon" + shadowSelector + "{background-position: center;background-size:contain;background-repeat:no-repeat;display:inline-block;width:100%;height:70px;}\n.choiceCol" + shadowSelector + " h3" + shadowSelector + "{text-align: center;}\n.selectedChoice" + shadowSelector + "{-webkit-filter: brightness(1.2) grayscale(.1) opacity(.9);-moz-filter: brightness(1.2) grayscale(.1) opacity(.9);filter: brightness(1.2) grayscale(.1) opacity(.9);}\n.drinkcard-cc" + shadowSelector + "{cursor:pointer;-webkit-transition: all 100ms ease-in;-moz-transition: all 100ms ease-in;transition: all 100ms ease-in;-webkit-filter: brightness(1.8) grayscale(1) opacity(.7);-moz-filter: brightness(1.8) grayscale(1) opacity(.7);filter: brightness(1.8) grayscale(1) opacity(.7);}\n.drinkcard-cc:hover" + shadowSelector + "{-webkit-filter: brightness(1.2) grayscale(.1) opacity(.9);-moz-filter: brightness(1.2) grayscale(.1) opacity(.9);filter: brightness(1.2) grayscale(.1) opacity(.9);}\n.modelType" + shadowSelector + "{position: absolute;bottom: -8%;left: 0%;}\n.modelTypeNone" + shadowSelector + "{position: absolute;bottom: -2%;left: 0%;}\n";
   }
   var _implicitStylesheets = [stylesheet];

   function tmpl($api, $cmp, $slotset, $ctx) {
     const {
       h: api_element,
       t: api_text,
       b: api_bind
     } = $api;
     const {
       _m0,
       _m1,
       _m2
     } = $ctx;
     return [api_element("div", {
       classMap: {
         "container": true
       },
       key: 2
     }, [api_element("div", {
       classMap: {
         "choiceCon": true
       },
       key: 3
     }, [api_element("img", {
       attrs: {
         "src": $cmp.currentChoice
       },
       key: 4
     }, [])]), api_element("div", {
       classMap: {
         "choiceSet": true,
         "slds-grid": true,
         "slds-gutters": true
       },
       key: 5
     }, [api_element("div", {
       classMap: {
         "slds-col": true
       },
       key: 6
     }, [api_element("div", {
       classMap: {
         "choiceCol": true,
         "selectedChoice": true
       },
       attrs: {
         "data-id": "img1"
       },
       key: 7,
       on: {
         "click": _m0 || ($ctx._m0 = api_bind($cmp.handleChoice))
       }
     }, [api_element("div", {
       classMap: {
         "imgCon": true
       },
       style: $cmp.img1,
       key: 8
     }, []), api_element("h3", {
       key: 9
     }, [api_text("Model 1")])])]), api_element("div", {
       classMap: {
         "slds-col": true
       },
       key: 10
     }, [api_element("div", {
       classMap: {
         "choiceCol": true,
         "drinkcard-cc": true
       },
       attrs: {
         "data-id": "img2"
       },
       key: 11,
       on: {
         "click": _m1 || ($ctx._m1 = api_bind($cmp.handleChoice))
       }
     }, [api_element("div", {
       classMap: {
         "imgCon": true
       },
       style: $cmp.img2,
       key: 12
     }, []), api_element("h3", {
       key: 13
     }, [api_text("Model 2")])])]), api_element("div", {
       classMap: {
         "slds-col": true
       },
       key: 14
     }, [api_element("div", {
       classMap: {
         "choiceCol": true,
         "drinkcard-cc": true
       },
       attrs: {
         "data-id": "img3"
       },
       key: 15,
       on: {
         "click": _m2 || ($ctx._m2 = api_bind($cmp.handleChoice))
       }
     }, [api_element("div", {
       classMap: {
         "imgCon": true
       },
       style: $cmp.img3,
       key: 16
     }, []), api_element("h3", {
       key: 17
     }, [api_text("Model 3")])])])])])];
   }

   var _tmpl = lwc.registerTemplate(tmpl);
   tmpl.stylesheets = [];

   if (_implicitStylesheets) {
     tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
   }
   tmpl.stylesheetTokens = {
     hostAttribute: "lwc-amfVehicleChoice_amfVehicleChoice-host",
     shadowAttribute: "lwc-amfVehicleChoice_amfVehicleChoice"
   };

   class amfVehicleChoice extends lwc.LightningElement {
     constructor(...args) {
       super(...args);
       this.img1Url = 'https://www.maseratifl.com/wp-content/uploads/2019/08/ghibli_side.png.png.png';
       this.img2Url = 'https://www.ufodrive.com/images/articles/ufo_car-tesla-model1.png';
       this.img3Url = 'https://img.rawpixel.com/s3fs-private/rawpixel_images/website_content/p-3d-psd3d2-car-jj-0040.png?auto=&bg=transparent&con=3&cs=srgb&dpr=1&fm=png&ixlib=php-3.1.0&mark=rawpixel-watermark.png&markalpha=90&markpad=13&markscale=10&markx=25&q=75&usm=15&vib=3&w=1400&s=6d115a550dbef6728b64fac539c3eb4e';
       this.img1 = `background-image:url(${this.img1Url})`;
       this.img2 = `background-image:url(${this.img2Url})`;
       this.img3 = `background-image:url(${this.img3Url})`;
       this.currentChoice = this.img1Url;
     }

     radioCheck(event) {
       //event.target.style.filter = 'none';
       let el = event.target.closest(".drinkcard-cc");
       el.style.filter = 'none';
       this.template.querySelector('.modelType').className = 'modelTypeNone';
       console.log(el);
       console.log(el.previousElementSibling);
     }

     handleChoice(event) {
       let el = event.target.closest(".choiceCol");

       if (el.classList.contains('drinkcard-cc')) {
         console.log(el);
         let selected = this.template.querySelector('.selectedChoice');
         console.log(selected);
         selected.classList.remove('selectedChoice');
         selected.classList.add('drinkcard-cc');
         el.classList.remove('drinkcard-cc');
         el.classList.add('selectedChoice'); //Set selected image

         el.getAttribute('data-id') === 'img1' ? this.currentChoice = this.img1Url : null;
         el.getAttribute('data-id') === 'img2' ? this.currentChoice = this.img2Url : null;
         el.getAttribute('data-id') === 'img3' ? this.currentChoice = this.img3Url : null;
       }
     }

   }

   lwc.registerDecorators(amfVehicleChoice, {
     track: {
       currentChoice: 1
     }
   });

   var amfVehicleChoice$1 = lwc.registerComponent(amfVehicleChoice, {
     tmpl: _tmpl
   });

   return amfVehicleChoice$1;

});
