Webruntime.moduleRegistry.define('webruntimegenerated/view__mainLayout', ['lwc', 'webruntime/routerContainer'], function (lwc, _webruntimeRouterContainer) { 'use strict';

    _webruntimeRouterContainer = _webruntimeRouterContainer && _webruntimeRouterContainer.hasOwnProperty('default') ? _webruntimeRouterContainer['default'] : _webruntimeRouterContainer;

    function stylesheet(hostSelector, shadowSelector, nativeShadow) {
      return "\n" + (nativeShadow ? (":host {display: block;min-height: 100vh;background: url('/assets/images/mountain.svg') bottom left no-repeat,\n                radial-gradient(circle, #fbfbfb, #b0cdf3);}") : (hostSelector + " {display: block;min-height: 100vh;background: url('/assets/images/mountain.svg') bottom left no-repeat,\n                radial-gradient(circle, #fbfbfb, #b0cdf3);}")) + "\n@media (min-width: 1920px) {\n" + (nativeShadow ? (":host {background-size: contain;}") : (hostSelector + " {background-size: contain;}")) + "\n}.skip-link" + shadowSelector + " {color: #fff;}\n";
    }
    var _implicitStylesheets = [stylesheet];

    function tmpl($api, $cmp, $slotset, $ctx) {
      const {
        s: api_slot
      } = $api;
      return [api_slot("header", {
        attrs: {
          "name": "header"
        },
        key: 2
      }, [], $slotset), api_slot("", {
        key: 3
      }, [], $slotset), api_slot("footer", {
        attrs: {
          "name": "footer"
        },
        key: 4
      }, [], $slotset)];
    }

    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.slots = ["header", "", "footer"];
    tmpl.stylesheets = [];

    if (_implicitStylesheets) {
      tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
    }
    tmpl.stylesheetTokens = {
      hostAttribute: "localdevserver-layout_layout-host",
      shadowAttribute: "localdevserver-layout_layout"
    };

    class Layout extends lwc.LightningElement {}

    var _localdevserverLayout = lwc.registerComponent(Layout, {
      tmpl: _tmpl
    });

    function stylesheet$1(hostSelector, shadowSelector, nativeShadow) {
      return "\n" + (nativeShadow ? (":host {display: block;background: #16325c;}") : (hostSelector + " {display: block;background: #16325c;}")) + "\n.container" + shadowSelector + " {height: 80px;}\n.logo" + shadowSelector + " {padding-right: 1rem;}\nh1" + shadowSelector + " {font-family: 'Neutraface Display';font-size: .75rem;text-transform: uppercase;color: #fff;text-align: center;}\n@media (min-width: 21em) {h1" + shadowSelector + " {font-size: 1rem;}\n}@media (min-width: 48em) {.logo" + shadowSelector + " {padding-right: 20px;margin-right: 20px;border-right: 1px solid #fff;box-sizing: content-box;}\nh1" + shadowSelector + " {font-size: 1.25rem;text-align: left;}\n}.slds-badge" + shadowSelector + " {margin-top: -3px;display: none;}\n@media (min-width: 30em) {.slds-badge" + shadowSelector + " {display: inline-block;}\n}";
    }
    var _implicitStylesheets$1 = [stylesheet$1];

    function stylesheet$2(hostSelector, shadowSelector, nativeShadow) {
      return "\n" + (nativeShadow ? (":host {display: block;margin-left: auto;margin-right: auto;padding-left: .5rem;padding-right: .5rem;max-width: 80rem;}") : (hostSelector + " {display: block;margin-left: auto;margin-right: auto;padding-left: .5rem;padding-right: .5rem;max-width: 80rem;}")) + "\n\n" + (nativeShadow ? (":host.main-content {margin-top: 1rem;padding-bottom: 3rem;}") : (hostSelector + ".main-content {margin-top: 1rem;padding-bottom: 3rem;}")) + "\n@media (min-width: 48em) {\n" + (nativeShadow ? (":host.main-content {margin-top: 3rem;}") : (hostSelector + ".main-content {margin-top: 3rem;}")) + "\n}";
    }
    var _implicitStylesheets$2 = [stylesheet$2];

    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {
        s: api_slot
      } = $api;
      return [api_slot("", {
        key: 2
      }, [], $slotset)];
    }

    var _tmpl$1 = lwc.registerTemplate(tmpl$1);
    tmpl$1.slots = [""];
    tmpl$1.stylesheets = [];

    if (_implicitStylesheets$2) {
      tmpl$1.stylesheets.push.apply(tmpl$1.stylesheets, _implicitStylesheets$2);
    }
    tmpl$1.stylesheetTokens = {
      hostAttribute: "localdevserver-layoutSection_layoutSection-host",
      shadowAttribute: "localdevserver-layoutSection_layoutSection"
    };

    /**
     * Used to enforce a consistent max-width and auto margins for
     * top-level layout sections.
     */

    class LayoutSection extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.mainContent = void 0;
      }

      connectedCallback() {
        if (this.mainContent) {
          this.classList.add('main-content');
        }
      }

    }

    lwc.registerDecorators(LayoutSection, {
      publicProps: {
        mainContent: {
          config: 0
        }
      }
    });

    var _localdevserverLayoutSection = lwc.registerComponent(LayoutSection, {
      tmpl: _tmpl$1
    });

    function tmpl$2($api, $cmp, $slotset, $ctx) {
      const {
        h: api_element,
        t: api_text,
        c: api_custom_element
      } = $api;
      return [api_custom_element("localdevserver-layout-section", _localdevserverLayoutSection, {
        key: 2
      }, [api_element("div", {
        classMap: {
          "container": true,
          "slds-grid": true,
          "slds-grid_vertical-align-center": true
        },
        key: 3
      }, [api_element("img", {
        classMap: {
          "logo": true
        },
        attrs: {
          "src": "/assets/images/logo.svg",
          "alt": "Salesforce Logo",
          "width": "142",
          "height": "44"
        },
        key: 4
      }, []), api_element("h1", {
        key: 5
      }, [api_text("Welcome to the Local Development Server")]), api_element("span", {
        classMap: {
          "slds-badge": true,
          "slds-theme_warning": true,
          "slds-m-left_small": true
        },
        key: 6
      }, [api_text("Beta")])])])];
    }

    var _tmpl$2 = lwc.registerTemplate(tmpl$2);
    tmpl$2.stylesheets = [];

    if (_implicitStylesheets$1) {
      tmpl$2.stylesheets.push.apply(tmpl$2.stylesheets, _implicitStylesheets$1);
    }
    tmpl$2.stylesheetTokens = {
      hostAttribute: "localdevserver-header_header-host",
      shadowAttribute: "localdevserver-header_header"
    };

    class Header extends lwc.LightningElement {}

    var _localdevserverHeader = lwc.registerComponent(Header, {
      tmpl: _tmpl$2
    });

    function tmpl$3($api, $cmp, $slotset, $ctx) {
      const {
        c: api_custom_element
      } = $api;
      return [api_custom_element("localdevserver-layout", _localdevserverLayout, {
        key: 2
      }, [api_custom_element("localdevserver-header", _localdevserverHeader, {
        attrs: {
          "slot": "header"
        },
        key: 3
      }, []), api_custom_element("webruntime-router-container", _webruntimeRouterContainer, {
        key: 4
      }, [])])];
    }

    var html = lwc.registerTemplate(tmpl$3);
    tmpl$3.stylesheets = [];
    tmpl$3.stylesheetTokens = {
      hostAttribute: "webruntimegenerated-view__mainLayout_view__mainLayout-host",
      shadowAttribute: "webruntimegenerated-view__mainLayout_view__mainLayout"
    };

    var view__mainLayout = {
      "html": html,
      "attributes": cmp => ({})
    };

    return view__mainLayout;

});
