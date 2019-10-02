({
    
    init: function (c,e,h) {
        console.log("init");
    	c.set('v.today', $A.localizationService.formatDate(new Date(), "YYYY-MM-DD"));
    },
    resetDemoButtonClick: function (c,e,h){
        var action = c.get("c.resetDemo");
        //Date demoDate, Decimal CLV
        console.log("CLV = ",c.find("CLV").get("v.value"));
		console.log("demo_date = ",c.find("demo_date").get("v.value"));
        action.setParams({ CLV : c.find("CLV").get("v.value"),demoDate : c.find("demo_date").get("v.value") });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var data = response.getReturnValue();
                console.log("data = ", data);
                c.find('notification').showToast({
                    "title": "Demo Reset",
                    "message": "All Records have been removed and the demo is fresh",
                    "variant": "success"
                    });
            }
            else if (state === "INCOMPLETE") {
                // do something
            }
            else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        c.find('notification').showToast({
                            "title": "Demo Reset failed",
                            "message": "check the console for errors",
                            "variant": "error"
                        });
                            
                        console.log("Error message: " +
                                 errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });
        $A.enqueueAction(action);
    }
})