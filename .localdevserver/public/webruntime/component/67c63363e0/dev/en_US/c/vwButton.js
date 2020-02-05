Webruntime.moduleRegistry.define('c/vwButton', ['lwc'], function (lwc) { 'use strict';

    function stylesheet(hostSelector, shadowSelector, nativeShadow) {
      return ".c-button" + shadowSelector + " {-webkit-box-shadow: none;box-shadow: none;font-family: VWTextWeb,Helvetica,Arial,sans-serif;font-weight: 400;text-align: center;-webkit-transition: .2s ease-in-out;transition: .2s ease-in-out;color: #001e50;text-decoration: underline;text-decoration: none;padding: 10px 40px;}\n.c-button--primary" + shadowSelector + " {border-radius: 2em;color: white;background: #001e50;}\n.c-button--primary.is-current" + shadowSelector + ",.c-button--primary:focus" + shadowSelector + ",.c-button--primary:hover" + shadowSelector + ",.m-action-card-module.is-current" + shadowSelector + " .c-button--primary" + shadowSelector + ",.m-action-card-module:focus" + shadowSelector + " .c-button--primary" + shadowSelector + ",.m-action-card-module:hover" + shadowSelector + " .c-button--primary" + shadowSelector + "{background:rgb(6,64,194);}\n.c-button--primary-inverted" + shadowSelector + "{text-decoration:none;border-radius:2em;background:transparent;border:2px solid #001e50;color: #001e50;}\n.c-button--primary-inverted.is-current" + shadowSelector + ",.c-button--primary-inverted:focus" + shadowSelector + ",.c-button--primary-inverted:hover" + shadowSelector + "{border:2px solid rgb(6,64,194);color: rgb(6,64,194);}\n.c-button--secondary" + shadowSelector + "{text-decoration:none;border-radius:2em;background:white;color:#001e50}\n.c-button--secondary.is-current" + shadowSelector + ",.c-button--secondary:focus" + shadowSelector + ",.c-button--secondary:hover" + shadowSelector + "{background:rgb(81,198,242);}\n";
    }
    var _implicitStylesheets = [stylesheet];

    function tmpl($api, $cmp, $slotset, $ctx) {
      const {
        d: api_dynamic,
        h: api_element
      } = $api;
      return [api_element("a", {
        className: $cmp.buttonType,
        style: $cmp.fontSize,
        attrs: {
          "href": "#0"
        },
        key: 2
      }, [api_dynamic($cmp.label)])];
    }

    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];

    if (_implicitStylesheets) {
      tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
    }
    tmpl.stylesheetTokens = {
      hostAttribute: "lwc-vwButton_vwButton-host",
      shadowAttribute: "lwc-vwButton_vwButton"
    };

    class VwButton extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.label = void 0;
        this.value = void 0;
        this.btnClass = 'slds-button slds-button_brand';
        this.inlineStyle = 'font-size:0.75rem';
      }

      get fontSize() {
        return this.inlineStyle;
      }

      set fontSize(value) {
        this.inlineStyle = `font-size:${value}`;
      }

      get buttonType() {
        return this.btnClass;
      }

      set buttonType(value) {
        if (value === 'primary') this.btnClass = 'slds-button slds-button_brand';
        if (value === 'inverted') this.btnClass = 'slds-button slds-button_outline-brand';
        if (value === 'secondary') this.btnClass = 'slds-button slds-button_neutral';
      }

    }

    lwc.registerDecorators(VwButton, {
      publicProps: {
        fontSize: {
          config: 3
        },
        label: {
          config: 0
        },
        value: {
          config: 0
        },
        buttonType: {
          config: 3
        }
      },
      track: {
        btnClass: 1,
        inlineStyle: 1
      }
    });

    var vwButton = lwc.registerComponent(VwButton, {
      tmpl: _tmpl
    });

    return vwButton;

});
