Webruntime.moduleRegistry.define('c/amfTestDriveForm', ['lwc', 'webruntime/configProvider'], function (lwc, configProvider) { 'use strict';

    function stylesheet(hostSelector, shadowSelector, nativeShadow) {
      return ".container" + shadowSelector + "{background-color: white;min-width: 800px;}\n.titleCon" + shadowSelector + "{font-size: 1.6rem;display: flex;align-items: center;justify-content: center;}\n.nextButton" + shadowSelector + " {margin-top: 5%;padding-right: 2rem;padding-left: 2rem;}\n.slds-section__title-action" + shadowSelector + "{height: 50px;}\n.sectionContent" + shadowSelector + "{width: 94%;margin-left: 3%;margin-bottom: 2%;}\n.btnContainer" + shadowSelector + "{margin-top: 3%;display: flex;align-items: center;justify-content: center;}\n";
    }
    var _implicitStylesheets = [stylesheet];

    function stylesheet$1(hostSelector, shadowSelector, nativeShadow) {
      return ".container" + shadowSelector + "{margin: 2%;}\n.choiceCon" + shadowSelector + "{width: 100%;display: flex;align-items: center;justify-content: center;}\n.choiceCon" + shadowSelector + " img" + shadowSelector + "{height: 270px;}\n.choiceSet" + shadowSelector + "{width: 90%;margin-left:5%;}\n.choiceCol" + shadowSelector + "{width: 100%;}\n.choiceSet" + shadowSelector + " .slds-col" + shadowSelector + "{margin-top: 3%;height: 70px;width: 100%;display: flex;flex-direction: column;align-items: center;justify-content: center;}\n.imgCon" + shadowSelector + "{background-position: center;background-size:contain;background-repeat:no-repeat;display:inline-block;width:100%;height:70px;}\n.choiceCol" + shadowSelector + " h3" + shadowSelector + "{text-align: center;}\n.selectedChoice" + shadowSelector + "{-webkit-filter: brightness(1.2) grayscale(.1) opacity(.9);-moz-filter: brightness(1.2) grayscale(.1) opacity(.9);filter: brightness(1.2) grayscale(.1) opacity(.9);}\n.drinkcard-cc" + shadowSelector + "{cursor:pointer;-webkit-transition: all 100ms ease-in;-moz-transition: all 100ms ease-in;transition: all 100ms ease-in;-webkit-filter: brightness(1.8) grayscale(1) opacity(.7);-moz-filter: brightness(1.8) grayscale(1) opacity(.7);filter: brightness(1.8) grayscale(1) opacity(.7);}\n.drinkcard-cc:hover" + shadowSelector + "{-webkit-filter: brightness(1.2) grayscale(.1) opacity(.9);-moz-filter: brightness(1.2) grayscale(.1) opacity(.9);filter: brightness(1.2) grayscale(.1) opacity(.9);}\n.modelType" + shadowSelector + "{position: absolute;bottom: -8%;left: 0%;}\n.modelTypeNone" + shadowSelector + "{position: absolute;bottom: -2%;left: 0%;}\n";
    }
    var _implicitStylesheets$1 = [stylesheet$1];

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

    if (_implicitStylesheets$1) {
      tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets$1);
    }
    tmpl.stylesheetTokens = {
      hostAttribute: "lwc-amfVehicleChoice_amfVehicleChoice-host",
      shadowAttribute: "lwc-amfVehicleChoice_amfVehicleChoice"
    };

    var VEHICLE_IMAGES = `${configProvider.getBasePath()}/assets/5188a6118b/vwDemoPackFiles`;

    class amfVehicleChoice extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.img1Url = VEHICLE_IMAGES + '/images/vehicles/model1.jpg';
        this.img2Url = VEHICLE_IMAGES + '/images/vehicles/model2.jpg';
        this.img3Url = VEHICLE_IMAGES + '/images/vehicles/model3.jpg';
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

    var _cAmfVehicleChoice = lwc.registerComponent(amfVehicleChoice, {
      tmpl: _tmpl
    });

    function stylesheet$2(hostSelector, shadowSelector, nativeShadow) {
      return ".mainContainer" + shadowSelector + "{display: flex;align-items: center;justify-content: center;width: 80%;margin-left: 10%;margin-top: 5%;max-width: 1000px;}\n.choiceCon" + shadowSelector + "{width: 300px;}\n";
    }
    var _implicitStylesheets$2 = [stylesheet$2];

    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {
        gid: api_scoped_id,
        h: api_element,
        t: api_text
      } = $api;
      return [api_element("fieldset", {
        classMap: {
          "slds-form-element": true,
          "mainWrapper": true
        },
        key: 2
      }, [api_element("div", {
        classMap: {
          "slds-form-element__control": true,
          "mainContainer": true
        },
        key: 3
      }, [api_element("div", {
        classMap: {
          "slds-visual-picker": true
        },
        key: 4
      }, [api_element("input", {
        attrs: {
          "type": "radio",
          "id": api_scoped_id("visual-picker-87"),
          "name": "options"
        },
        props: {
          "value": "visual-picker-86"
        },
        key: 5
      }, []), api_element("label", {
        attrs: {
          "for": `${api_scoped_id("visual-picker-87")}`
        },
        key: 6
      }, [api_element("span", {
        classMap: {
          "slds-visual-picker__figure": true,
          "slds-visual-picker__text": true,
          "slds-align_absolute-center": true
        },
        key: 7
      }, [api_element("div", {
        classMap: {
          "slds-media__figure": true,
          "slds-media__figure_fixed-width": true,
          "slds-align_absolute-center": true,
          "slds-m-left_xx-small": true
        },
        key: 8
      }, [api_element("span", {
        classMap: {
          "slds-icon_container": true,
          "slds-icon-utility-knowledge_base": true
        },
        key: 9
      }, [api_element("svg", {
        classMap: {
          "slds-icon": true,
          "slds-icon-text-default": true
        },
        attrs: {
          "aria-hidden": "true"
        },
        key: 10
      }, [api_element("use", {
        attrs: {
          "xlink:href": lwc.sanitizeAttribute("use", "http://www.w3.org/2000/svg", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#home")
        },
        key: 11
      }, [])])])]), api_element("div", {
        classMap: {
          "slds-media__body": true,
          "slds-border_left": true,
          "slds-p-around_small": true,
          "choiceCon": true
        },
        key: 12
      }, [api_element("h2", {
        classMap: {
          "slds-truncate": true,
          "slds-text-heading_small": true
        },
        attrs: {
          "title": "Share the knowledge"
        },
        key: 13
      }, [api_text("home pick-up")]), api_element("p", {
        classMap: {
          "slds-m-top_small": true
        },
        key: 14
      }, [api_text("A dealer near you will bring the car to your doorstep, so that you can enjoy the ride.")])])]), api_element("span", {
        classMap: {
          "slds-icon_container": true,
          "slds-visual-picker__text-check": true
        },
        key: 15
      }, [api_element("svg", {
        classMap: {
          "slds-icon": true,
          "slds-icon-text-check": true,
          "slds-icon_x-small": true
        },
        attrs: {
          "aria-hidden": "true"
        },
        key: 16
      }, [api_element("use", {
        attrs: {
          "xlink:href": lwc.sanitizeAttribute("use", "http://www.w3.org/2000/svg", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#check")
        },
        key: 17
      }, [])])])])]), api_element("div", {
        classMap: {
          "slds-visual-picker": true
        },
        key: 18
      }, [api_element("input", {
        attrs: {
          "type": "radio",
          "id": api_scoped_id("visual-picker-86"),
          "name": "options"
        },
        props: {
          "value": "visual-picker-86"
        },
        key: 19
      }, []), api_element("label", {
        attrs: {
          "for": `${api_scoped_id("visual-picker-86")}`
        },
        key: 20
      }, [api_element("span", {
        classMap: {
          "slds-visual-picker__figure": true,
          "slds-visual-picker__text": true,
          "slds-align_absolute-center": true
        },
        key: 21
      }, [api_element("div", {
        classMap: {
          "slds-media__figure": true,
          "slds-media__figure_fixed-width": true,
          "slds-align_absolute-center": true,
          "slds-m-left_xx-small": true
        },
        key: 22
      }, [api_element("span", {
        classMap: {
          "slds-icon_container": true,
          "slds-icon-utility-knowledge_base": true
        },
        key: 23
      }, [api_element("svg", {
        classMap: {
          "slds-icon": true,
          "slds-icon-text-default": true
        },
        attrs: {
          "aria-hidden": "true"
        },
        key: 24
      }, [api_element("use", {
        attrs: {
          "xlink:href": lwc.sanitizeAttribute("use", "http://www.w3.org/2000/svg", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#travel_and_places")
        },
        key: 25
      }, [])])])]), api_element("div", {
        classMap: {
          "slds-media__body": true,
          "slds-border_left": true,
          "slds-p-around_small": true,
          "choiceCon": true
        },
        key: 26
      }, [api_element("h2", {
        classMap: {
          "slds-truncate": true,
          "slds-text-heading_small": true
        },
        attrs: {
          "title": "Share the knowledge"
        },
        key: 27
      }, [api_text("Go to dealer")]), api_element("p", {
        classMap: {
          "slds-m-top_small": true
        },
        key: 28
      }, [api_text("You get to the dealer. You will be directly in car heaven.")])])]), api_element("span", {
        classMap: {
          "slds-icon_container": true,
          "slds-visual-picker__text-check": true
        },
        key: 29
      }, [api_element("svg", {
        classMap: {
          "slds-icon": true,
          "slds-icon-text-check": true,
          "slds-icon_x-small": true
        },
        attrs: {
          "aria-hidden": "true"
        },
        key: 30
      }, [api_element("use", {
        attrs: {
          "xlink:href": lwc.sanitizeAttribute("use", "http://www.w3.org/2000/svg", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#check")
        },
        key: 31
      }, [])])])])])])])];
    }

    var _tmpl$1 = lwc.registerTemplate(tmpl$1);
    tmpl$1.stylesheets = [];

    if (_implicitStylesheets$2) {
      tmpl$1.stylesheets.push.apply(tmpl$1.stylesheets, _implicitStylesheets$2);
    }
    tmpl$1.stylesheetTokens = {
      hostAttribute: "lwc-amfTestDriveLocation_amfTestDriveLocation-host",
      shadowAttribute: "lwc-amfTestDriveLocation_amfTestDriveLocation"
    };

    class amfTestDriveLocation extends lwc.LightningElement {}

    var _cAmfTestDriveLocation = lwc.registerComponent(amfTestDriveLocation, {
      tmpl: _tmpl$1
    });

    function tmpl$2($api, $cmp, $slotset, $ctx) {
      return [];
    }

    var _tmpl$2 = lwc.registerTemplate(tmpl$2);
    tmpl$2.stylesheets = [];
    tmpl$2.stylesheetTokens = {
      hostAttribute: "lwc-amfContactDetails_amfContactDetails-host",
      shadowAttribute: "lwc-amfContactDetails_amfContactDetails"
    };

    class amfContactDetails extends lwc.LightningElement {}

    var _cAmfContactDetails = lwc.registerComponent(amfContactDetails, {
      tmpl: _tmpl$2
    });

    function tmpl$3($api, $cmp, $slotset, $ctx) {
      const {
        t: api_text,
        h: api_element,
        gid: api_scoped_id,
        b: api_bind,
        c: api_custom_element
      } = $api;
      const {
        _m0,
        _m1,
        _m2,
        _m3,
        _m4,
        _m5
      } = $ctx;
      return [api_element("div", {
        classMap: {
          "container": true
        },
        key: 2
      }, [api_element("div", {
        classMap: {
          "titleCon": true
        },
        key: 3
      }, [api_element("h1", {
        key: 4
      }, [api_text("Request a Test Drive")])]), api_element("div", {
        classMap: {
          "slds-section": true,
          "slds-is-open": true,
          "vehicleChoice": true
        },
        key: 5
      }, [api_element("h3", {
        classMap: {
          "slds-section__title": true
        },
        key: 6,
        on: {
          "click": _m0 || ($ctx._m0 = api_bind($cmp.toggleSection))
        }
      }, [api_element("button", {
        classMap: {
          "slds-button": true,
          "slds-section__title-action": true
        },
        attrs: {
          "aria-controls": `${api_scoped_id("expando-unique-id")}`,
          "aria-expanded": "true"
        },
        key: 7
      }, [api_element("svg", {
        classMap: {
          "slds-section__title-action-icon": true,
          "slds-button__icon": true,
          "slds-button__icon_left": true
        },
        attrs: {
          "aria-hidden": "true"
        },
        key: 8
      }, [api_element("use", {
        attrs: {
          "xlink:href": lwc.sanitizeAttribute("use", "http://www.w3.org/2000/svg", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#switch")
        },
        key: 9
      }, [])]), api_element("span", {
        classMap: {
          "slds-truncate": true
        },
        attrs: {
          "title": "Section Title"
        },
        key: 10
      }, [api_text("Select a car")])])]), api_element("div", {
        classMap: {
          "slds-section__content": true
        },
        attrs: {
          "aria-hidden": "false"
        },
        key: 11
      }, [api_element("div", {
        classMap: {
          "sectionContent": true
        },
        key: 12
      }, [api_custom_element("c-amf-vehicle-choice", _cAmfVehicleChoice, {
        key: 13
      }, []), api_element("div", {
        classMap: {
          "btnContainer": true
        },
        key: 14
      }, [api_element("button", {
        classMap: {
          "slds-button": true,
          "slds-button_brand": true,
          "nextButton": true
        },
        key: 15,
        on: {
          "click": _m1 || ($ctx._m1 = api_bind($cmp.clickNext))
        }
      }, [api_text("Next")])])])])]), api_element("div", {
        classMap: {
          "slds-section": true
        },
        key: 16
      }, [api_element("h3", {
        classMap: {
          "slds-section__title": true
        },
        key: 17,
        on: {
          "click": _m2 || ($ctx._m2 = api_bind($cmp.toggleSection))
        }
      }, [api_element("button", {
        classMap: {
          "slds-button": true,
          "slds-section__title-action": true
        },
        attrs: {
          "aria-controls": `${api_scoped_id("expando-unique-id")}`,
          "aria-expanded": "false"
        },
        key: 18
      }, [api_element("svg", {
        classMap: {
          "slds-section__title-action-icon": true,
          "slds-button__icon": true,
          "slds-button__icon_left": true
        },
        attrs: {
          "aria-hidden": "true"
        },
        key: 19
      }, [api_element("use", {
        attrs: {
          "xlink:href": lwc.sanitizeAttribute("use", "http://www.w3.org/2000/svg", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#switch")
        },
        key: 20
      }, [])]), api_element("span", {
        classMap: {
          "slds-truncate": true
        },
        attrs: {
          "title": "Section Title"
        },
        key: 21
      }, [api_text("Test drive location")])])]), api_element("div", {
        classMap: {
          "slds-section__content": true
        },
        attrs: {
          "aria-hidden": "true"
        },
        key: 22
      }, [api_element("div", {
        classMap: {
          "sectionContent": true
        },
        key: 23
      }, [api_custom_element("c-amf-test-drive-location", _cAmfTestDriveLocation, {
        key: 24
      }, []), api_element("div", {
        classMap: {
          "btnContainer": true
        },
        key: 25
      }, [api_element("button", {
        classMap: {
          "slds-button": true,
          "slds-button_brand": true,
          "nextButton": true
        },
        key: 26,
        on: {
          "click": _m3 || ($ctx._m3 = api_bind($cmp.clickNext))
        }
      }, [api_text("Next")])])])])]), api_element("div", {
        classMap: {
          "slds-section": true
        },
        key: 27
      }, [api_element("h3", {
        classMap: {
          "slds-section__title": true
        },
        key: 28,
        on: {
          "click": _m4 || ($ctx._m4 = api_bind($cmp.toggleSection))
        }
      }, [api_element("button", {
        classMap: {
          "slds-button": true,
          "slds-section__title-action": true
        },
        attrs: {
          "aria-controls": `${api_scoped_id("expando-unique-id")}`,
          "aria-expanded": "false"
        },
        key: 29
      }, [api_element("svg", {
        classMap: {
          "slds-section__title-action-icon": true,
          "slds-button__icon": true,
          "slds-button__icon_left": true
        },
        attrs: {
          "aria-hidden": "true"
        },
        key: 30
      }, [api_element("use", {
        attrs: {
          "xlink:href": lwc.sanitizeAttribute("use", "http://www.w3.org/2000/svg", "xlink:href", "/assets/icons/utility-sprite/svg/symbols.svg#switch")
        },
        key: 31
      }, [])]), api_element("span", {
        classMap: {
          "slds-truncate": true
        },
        attrs: {
          "title": "Section Title"
        },
        key: 32
      }, [api_text("Contact details")])])]), api_element("div", {
        classMap: {
          "slds-section__content": true
        },
        attrs: {
          "aria-hidden": "true"
        },
        key: 33
      }, [api_element("div", {
        classMap: {
          "sectionContent": true
        },
        key: 34
      }, [api_custom_element("c-amf-contact-details", _cAmfContactDetails, {
        key: 35
      }, []), api_element("div", {
        classMap: {
          "btnContainer": true
        },
        key: 36
      }, [api_element("button", {
        classMap: {
          "slds-button": true,
          "slds-button_brand": true,
          "nextButton": true
        },
        key: 37,
        on: {
          "click": _m5 || ($ctx._m5 = api_bind($cmp.clickNext))
        }
      }, [api_text("Next")])])])])])])];
    }

    var _tmpl$3 = lwc.registerTemplate(tmpl$3);
    tmpl$3.stylesheets = [];

    if (_implicitStylesheets) {
      tmpl$3.stylesheets.push.apply(tmpl$3.stylesheets, _implicitStylesheets);
    }
    tmpl$3.stylesheetTokens = {
      hostAttribute: "lwc-amfTestDriveForm_amfTestDriveForm-host",
      shadowAttribute: "lwc-amfTestDriveForm_amfTestDriveForm"
    };

    class amfTestDriveForm extends lwc.LightningElement {
      toggleSection(event) {
        let el = event.target.closest(".slds-section");
        console.log(el);

        if (event.target.closest(".slds-section").classList.contains('slds-is-open')) {
          el.classList.remove('slds-is-open');
        } else {
          el.classList.add('slds-is-open');
        }
      }

      clickNext(event) {
        let el = event.target.closest(".slds-section");
        event.target.closest(".nextButton").style.display = 'none';
        el.classList.remove('slds-is-open');
        console.log(el.nextElementSibling);
        el.nextElementSibling.classList.add('slds-is-open');
      }

    }

    var amfTestDriveForm$1 = lwc.registerComponent(amfTestDriveForm, {
      tmpl: _tmpl$3
    });

    return amfTestDriveForm$1;

});
