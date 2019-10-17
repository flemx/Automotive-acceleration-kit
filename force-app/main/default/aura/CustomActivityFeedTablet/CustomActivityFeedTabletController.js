({
	doInit : function(component, event, helper) {
        
        console.log("whaaat?")
        
        if(component.get("v.recordId")){
            var action = component.get('c.getActivities');
       		var contactId = component.get('v.recordId');
        
            action.setParams( {recordId : contactId} ); 
                    
            action.setCallback(this, function(response){
            	var state = response.getState();
                if (component.isValid() && state === "SUCCESS"){
                    
                  component.set("v.activities", response.getReturnValue());
                  console.log(response.getReturnValue());
                  
                  
                }
                else {
                  console.log("Failed with state" + state);
                }
          })
          $A.enqueueAction(action);
          
        }
        
        
        	
        
        
	},
	newActivity : function(component, event, helper){
        var actionAPI = component.find("quickActionAPI");
        var args = { actionName :"Contact.New_Activity" };
        actionAPI.selectAction(args).then(function(result) {
            // Action selected; show data and set field values
        }).catch(function(e) {
            if (e.errors) {
                // If the specified action isn't found on the page, 
                // show an error message in the my component 
            }
        });
    },
    gotoActivityList : function (component, event, helper) {
        var relatedListEvent = $A.get("e.force:navigateToRelatedList");
        relatedListEvent.setParams({
            "relatedListId": "Custom_Activities__r",
            "parentRecordId": component.get("v.recordId")
        });
        relatedListEvent.fire();
    }    
    
})