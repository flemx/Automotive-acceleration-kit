({
    // Sets an empApi error handler on component initialization
    onInit: function (component, event, helper) {
        // Get the empApi component
        const empApi = component.find('empApi');

        // Uncomment below line to enable debug logging (optional)
        empApi.setDebugFlag(true);

        // Register error listener and pass in the error handler function
        empApi.onError($A.getCallback(error => {
            // Error can be any type of error (subscribe, unsubscribe...)
            console.error('EMP API error: ', error);
            console.error('message: ', error.message);
        }));
    },

    // Invokes the subscribe method on the empApi component
    subscribe: function (component, event, helper) {
        // Get the channel from the input box
        let channel = component.find('channel').get('v.value');
        console.log("channel is ", channel)
        //set event type variable
        component.set("v.eventType", channel);
        
        // Get the empApi component
        const empApi = component.find('empApi');
        
        
        // Replay option to get new events
        const replayId = -1;

        // Subscribe to an event
        if (empApi.isEmpEnabled) {
            console.log("EMP API is enabled");
        }
        empApi.subscribe(channel, replayId, $A.getCallback(eventReceived => {
         
            console.log('Received event ', JSON.stringify(eventReceived));
            // Process event (this is called each time we receive an event)
            //resolve image resource
            let img = eventReceived.data.payload.image_resource_name__c;
            if(img){
            console.log("img = ",img);
            if(img.includes("/") && !img.includes("/sfc")) {
            	console.log("image is path = ", img);
            	let path = img.split("/");
            	console.log("path = ", path);
            	//check if we have a resource url or a real url
           
                let bundle = path.shift();
                    console.log("bundle = ", bundle);
                    let imgsrc = "";
                    console.log("image path = ", imgsrc);
                    path.forEach((item,index,p) => {
                        if(index+1<p.length){
                        imgsrc = imgsrc + item + "/";
                        } else {
                          imgsrc = imgsrc + item + ".png";                                   
                        }
                    });
                    console.log("image path = ", imgsrc);
                    eventReceived.data.payload.image_resource_name__c = $A.get('$Resource.' + bundle) + "/" + imgsrc; 
            
            	
        } else {
            	
            if(img.includes("/sfc")){
                console.log("real image path, so no changes");
            } else {
                console.log("plain image resource reference")
                eventReceived.data.payload.image_resource_name__c = $A.get('$Resource.' + img);                                                           
                    
        }
            	
            
            	                                           }

        	}
                let events = component.get("v.events") || [];
                events.unshift(eventReceived);
                component.set("v.events", events);
                
            console.log("channel: ",component.get("v.eventType"));
            }))
            .then(subscription => {
                // Confirm that we have subscribed to the event channel.
                // We haven't received an event yet.
                console.log('Subscribed to channel ', subscription.channel);
                // Save subscription to unsubscribe later
                component.set('v.subscription', subscription);
            });
    },

    // Invokes the unsubscribe method on the empApi component
    unsubscribe: function (component, event, helper) {
        // Get the empApi component
        const empApi = component.find('empApi');
        // Get the subscription that we saved when subscribing
        const subscription = component.get('v.subscription');

        // Unsubscribe from event
        empApi.unsubscribe(subscription, $A.getCallback(unsubscribed => {
            // Confirm that we have unsubscribed from the event channel
            console.log('Unsubscribed from channel ' + unsubscribed.subscription);
            component.set('v.subscription', null);
        }));
    },
    firetestevent: function (c,e,h){
        var action = c.get("c.fireTestEvent");
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log("message sent = ",response.getReturnValue());
            }
            else if (state === "INCOMPLETE") {
                // do something
            }
            else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " +
                                 errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });
        $A.enqueueAction(action);
    },

    linkToRecordHome: function (c,e,h){
        var navEvt = $A.get("e.force:navigateToSObject");
		navEvt.setParams({
            "recordId": e.currentTarget.dataset.value
        });
        navEvt.fire();
	},
            closeModal: function (c,e,h){
                console.log("close");
                c.set("v.modal", false);
            },
            openModal: function (c,e,h){
                console.log("open");
                let value = "";
                try {
                      value = e.getSource().get("v.value");
                }
                catch(error) {
                    value = e.currentTarget.dataset.value;
                    //console.error(error);
                    // expected output: ReferenceError: nonExistentFunction is not defined
                    // Note - error messages will vary depending on browser
                }
                console.log("value = ", value)
                c.set("v.modalImage",value);
                c.set("v.modal", true);
            }
            // ,
            // toggleVehicleInspector: function (c,e,h){
            //     c.get("v.showVehicleInspector") ? (c.set("v.showVehicleInspector", false)) : (c.set("v.showVehicleInspector", true));
            // }
})