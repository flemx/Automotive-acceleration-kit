Webruntime.moduleRegistry.define('c/feedItemRegular', ['lwc'], function (lwc) { 'use strict';

   function stylesheet(hostSelector, shadowSelector, nativeShadow) {
     return ".feed-container" + shadowSelector + "{box-sizing: border-box;height: 180px;width: 740px;display: flex;flex-direction: row;border-radius: 4px;margin: 20px;background-color: white;border: 1px solid #DFE4E0;box-shadow: 0 0 8px 1px rgba(15,34,80,0.05);position: relative;}\n.img-container" + shadowSelector + "{height: 180px;width: 200px;margin: 0;border-top-left-radius: 4px;border-bottom-left-radius: 4px;background-color: white;position: relative;}\n.img-container" + shadowSelector + " span" + shadowSelector + "{position: absolute;bottom: 15px;left:15px;background-color: #00B0F0;color: white;padding: 6px 15px;text-transform: uppercase;}\n.content" + shadowSelector + "{width: 500px;margin: 0;padding: 15px;display: flex;flex-direction: column;}\n.header" + shadowSelector + "{display: flex;flex-direction: row;justify-content: space-between;margin-bottom: 10px;height: 40px;overflow: hidden;}\n.header" + shadowSelector + " .header-left" + shadowSelector + "{width: 320px;font-size: 0.9rem;font-weight: bold;}\n.header" + shadowSelector + " .header-right" + shadowSelector + "{width: 130px;display: flex;flex-direction: column;text-align: right;color: rgba(0,0,0,0.85);font-size: 12px;font-weight: 300;line-height: 15px;}\n.header" + shadowSelector + " .source" + shadowSelector + "{color: rgba(0,0,0,0.5);}\n.body" + shadowSelector + "{overflow: hidden;position: relative;line-height: 1.4em;max-height: 5.6em;font-size: 13px;padding-right: 100px;}\n.body" + shadowSelector + "::after{content: \"\";font-size: 11px;color: #4a90e2;text-align: right;position: absolute;bottom: 0;right: 13px;width: 23%;height: 1.4em;background: linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1) 50%);}\n.footer" + shadowSelector + "{position: absolute;bottom: 15px;right: 15px;}\n.footer" + shadowSelector + " a" + shadowSelector + "{color: black;text-decoration: none;font-size: 1.1rem;}\n.footer" + shadowSelector + " span" + shadowSelector + "{text-decoration: underline;font-size: 0.75rem;margin-right: 10px;}\n";
   }
   var _implicitStylesheets = [stylesheet];

   function tmpl($api, $cmp, $slotset, $ctx) {
     const {
       d: api_dynamic,
       h: api_element,
       t: api_text
     } = $api;
     return [api_element("div", {
       classMap: {
         "feed-container": true
       },
       key: 2
     }, [api_element("div", {
       classMap: {
         "img-container": true
       },
       style: $cmp.image,
       key: 3
     }, [api_element("span", {
       key: 4
     }, [api_dynamic($cmp.type)])]), api_element("div", {
       classMap: {
         "content": true
       },
       key: 5
     }, [api_element("div", {
       classMap: {
         "header": true
       },
       key: 6
     }, [api_element("h2", {
       classMap: {
         "header-left": true
       },
       key: 7
     }, [api_dynamic($cmp.title)]), api_element("div", {
       classMap: {
         "header-right": true
       },
       key: 8
     }, [api_element("span", {
       key: 9
     }, [api_text("Posted "), api_dynamic($cmp.sourceDate), api_text(" days ago")]), api_element("span", {
       classMap: {
         "source": true
       },
       key: 10
     }, [api_dynamic($cmp.sourceName)])])]), api_element("div", {
       classMap: {
         "body": true
       },
       key: 11
     }, [api_element("p", {
       key: 12
     }, [api_dynamic($cmp.description)])]), api_element("div", {
       classMap: {
         "footer": true
       },
       key: 13
     }, [api_element("a", {
       attrs: {
         "href": $cmp.sourceUrl,
         "target": "_blank"
       },
       key: 14
     }, [api_element("span", {
       key: 15
     }, [api_text("Read More")]), api_text(" >  ")])])])])];
   }

   var _tmpl = lwc.registerTemplate(tmpl);
   tmpl.stylesheets = [];

   if (_implicitStylesheets) {
     tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
   }
   tmpl.stylesheetTokens = {
     hostAttribute: "lwc-feedItemRegular_feedItemRegular-host",
     shadowAttribute: "lwc-feedItemRegular_feedItemRegular"
   };

   /**
    * @author Damien Fleminks
    * 18-10-2019
    */

   class FeedItemRegular extends lwc.LightningElement {
     constructor(...args) {
       super(...args);
       this.name = void 0;
       this.days = void 0;
       this.backgroundVar = void 0;
       this.title = void 0;
       this.description = void 0;
       this.sourceUrl = void 0;
       this.type = void 0;
     }

     get image() {
       return this.backgroundVar;
     }

     set image(value) {
       //console.log('set image: ', value);
       this.backgroundVar = `background: url(${value});background-size:cover`;
     }

     get sourceName() {
       return this.name;
     }

     set sourceName(value) {
       this.name = value.replace(/(^\w+:|^)\/\//, '');
     }

     get sourceDate() {
       return this.days;
     }

     set sourceDate(value) {
       //console.log('souurceDate executed', value);
       let fromDate = new Date(value);
       let now = new Date();
       let Difference_In_Time = now.getTime() - fromDate.getTime();
       let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
       this.days = Math.round(Difference_In_Days);
     }

   }

   lwc.registerDecorators(FeedItemRegular, {
     publicProps: {
       title: {
         config: 0
       },
       description: {
         config: 0
       },
       sourceUrl: {
         config: 0
       },
       type: {
         config: 0
       },
       image: {
         config: 3
       },
       sourceName: {
         config: 3
       },
       sourceDate: {
         config: 3
       }
     }
   });

   var feedItemRegular = lwc.registerComponent(FeedItemRegular, {
     tmpl: _tmpl
   });

   return feedItemRegular;

});
