({
    navToActivity : function(component, event, helper) {
        var id = component.get('v.id');
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
          "recordId": id,
          "slideDevName": "details"

        });
        navEvt.fire();
        console.log('navigated to activity: ' + id);
		
	}
})