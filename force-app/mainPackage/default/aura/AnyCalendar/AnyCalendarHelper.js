({
	getEvents : function(component, event) {
		var action = component.get("c.getEvents");
        
        action.setParams({ 
            sObjectName : component.get("v.sObjectName"),
            titleField : component.get("v.titleField"),
            startDateTimeField : component.get("v.startDateTimeField"),
            endDateTimeField : component.get("v.endDateTimeField"),
            descriptionField : component.get("v.descriptionField"),
            userField : component.get("v.userField"),
            filterByUserField : component.get("v.filterByUserField")
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            
            if (state === "SUCCESS") {
                component.set("v.eventsMap",response.getReturnValue());
                
            } else if (state === "INCOMPLETE") {
                // do something
            } else if (state === "ERROR") {
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
	}
})