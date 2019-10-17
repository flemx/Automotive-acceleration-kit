({
	init : function(component, event, helper) {
		// Init sign-pad canvas        
        helper.initPad(component);                
	},
    
    clear : function(component, event, helper) {
    	helper.clearPad(component);    
    }
})