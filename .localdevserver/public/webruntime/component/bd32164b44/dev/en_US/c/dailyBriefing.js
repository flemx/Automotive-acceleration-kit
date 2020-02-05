Webruntime.moduleRegistry.define('c/dailyBriefing', ['lwc', 'force/empApiInternal', 'lightning/navigation'], function (lwc, empApiInternal, navigation) { 'use strict';

    function stylesheet(hostSelector, shadowSelector, nativeShadow) {
      return ".image-container" + shadowSelector + "{background-image: url(/resource/1573573753000/dailyBriefing);height: 80vh;width: 100%;background-repeat: no-repeat;background-size: cover;}\n";
    }
    var _implicitStylesheets = [stylesheet];

    function tmpl($api, $cmp, $slotset, $ctx) {
      const {
        h: api_element
      } = $api;
      return [api_element("div", {
        classMap: {
          "image-container": true
        },
        key: 2
      }, [])];
    }

    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];

    if (_implicitStylesheets) {
      tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
    }
    tmpl.stylesheetTokens = {
      hostAttribute: "lwc-dailyBriefing_dailyBriefing-host",
      shadowAttribute: "lwc-dailyBriefing_dailyBriefing"
    };

    /**
     * Exposes the EmpJs Streaming API library which subscribes to a streaming channel and listens to event messages using a shared CometD
     * connection.
     * This component requires API version 44.0 or later.
     *
     */

    /**
     * Subscribes to a given channel and returns a promise that holds a subscription object, which you use to unsubscribe later.
     *
     * @param {String} channel - The channel name to subscribe to.
     * @param {Number} replayId - Indicates what point in the stream to replay events from.
     *                            Specify -1 to get new events from the tip of the stream,
     *                            -2 to replay from the last saved event,
     *                            or a specific event replay ID to get all saved and new events after that ID.
     * @param {Function} callback - A callback function that's invoked for every event received.
     */

    const subscribe = empApiInternal._subscribe;

    class dailyBriefing extends navigation.NavigationMixin(lwc.LightningElement) {
      constructor(...args) {
        super(...args);
        this.platformEvent = void 0;
        this.eventParameter = void 0;
      }

      renderedCallback() {
        if (this.IsInitialized) {
          return;
        } //Handle platform events 


        const messageCallback = response => {
          console.log('Event received with value : ', response.data.payload[this.eventParameter]);

          if (response.data.payload[this.eventParameter]) {
            this.openDashboard();
          }
        }; // Invoke subscribe method of empApi. Pass reference to messageCallback


        subscribe(this.platformEvent, -1, messageCallback).then(response => {
          // Response contains the subscription information on successful subscribe call
          console.log('Successfully subscribed to : ', JSON.stringify(response.channel));
          this.subscription = response;
        });
      }

      openDashboard() {
        console.log('Open Sales_Dashboard..');
        this[navigation.NavigationMixin.Navigate]({
          "type": "standard__navItemPage",
          "attributes": {
            "apiName": "Sales_Dashboard"
          }
        });
      }

    }

    lwc.registerDecorators(dailyBriefing, {
      publicProps: {
        platformEvent: {
          config: 0
        },
        eventParameter: {
          config: 0
        }
      }
    });

    var dailyBriefing$1 = lwc.registerComponent(dailyBriefing, {
      tmpl: _tmpl
    });

    return dailyBriefing$1;

});
