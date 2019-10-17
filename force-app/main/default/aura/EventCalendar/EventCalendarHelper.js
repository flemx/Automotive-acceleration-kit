({
    editRecord : function(component, event, recordId) {
        console.log("in Edit");
        var editRecordEvent = $A.get("e.force:editRecord");
        editRecordEvent.setParams({
            "recordId": recordId
        });
        editRecordEvent.fire();
    },
    createRecord : function (component, event, helper) {
        var createRecordEvent = $A.get("e.force:createRecord");
        createRecordEvent.setParams({
            "entityApiName": component.get("v.sObjectName")
        });
        createRecordEvent.fire();
    },
    upsertEvent : function(component, evObj, callback) {
        var action = component.get("c.upsertEvents");
        
        action.setParams({ 
            "sEventObj": JSON.stringify(evObj),
            "sObjectName" : component.get("v.sObjectName"),
            "titleField" : component.get("v.titleField"),
            "startDateTimeField" : component.get("v.startDateTimeField"),
            "endDateTimeField" : component.get("v.endDateTimeField"),
            "descriptionField" : component.get("v.descriptionField"),
            "userField" : component.get("v.userField")
        });
        if (callback) {
            action.setCallback(this, callback);
        }
        $A.enqueueAction(action);
    },
    deleteEvent : function(component, event, eventId, callback){
        var action = component.get("c.deleteEvent");
        console.log('Delete Event');
        action.setParams({ 
            "eventId": eventId,
            "sObjectName" : component.get("v.sObjectName"),
            "titleField" : component.get("v.titleField"),
            "startDateTimeField" : component.get("v.startDateTimeField"),
            "endDateTimeField" : component.get("v.endDateTimeField"),
            "descriptionField" : component.get("v.descriptionField"),
            "userField" : component.get("v.userField")
        });
        if (callback) {
            action.setCallback(this, callback);
        }
        $A.enqueueAction(action);
    },
    closeModal: function(c,e,h){
        c.set("v.showModal", false);
    },
    openModal: function(c,e,h){
        c.set("v.showModal", true);
    },
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
                component.set("v.events",response.getReturnValue());
                console.log('success::');
                console.log(component.get("v.events"));
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