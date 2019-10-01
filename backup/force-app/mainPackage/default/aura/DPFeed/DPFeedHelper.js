({
	accept: function(c,e,h){
        console.log("accept");
        //set modal information in case a modal needs to be opened
        var data = c.get("v.fil");
        var fi = null;
            for(var d of data){
                if(d.Id == e.getSource().get("v.value")){
                    fi = d;
                }
            }
        c.set("v.modalRecord", fi.record_id_2__c);
        c.set("v.modalFiid", fi.Id);
        //TODO: make dynamic
        console.log("label = ", e.getSource().get("v.label"));
        console.log("value = ", e.getSource().get("v.value"));
        if(e.getSource().get("v.label") == "Accept"){
	        h.testDriveCompleted(c,e,h)   
            fi.SLA_achieved_since = new Date();
            fi.SLA_active__c = false;
            c.set("v.fil",data);
        } 
        
        if(e.getSource().get("v.label") == "Start Process"){
            c.set("v.showModal", true);
            c.set("v.modalContent", fi.record_name_2__c);
            c.set("v.modalYesLiteral", fi.action_yes__c);
            c.set("v.modalNoLiteral", fi.action_no__c);
        }
        
        
        
    },
    closeModal: function(c,e,h){
        c.set("v.showModal", false);
    },
    pushMessage: function(c,e,h){
        var action = c.get("c.pushEventMessage");
        //create message
        var message = [];
        action.setParams({"msg" : message});
        action.setCallback(this,() => {
            
        });
		$A.enqueueAction(action);
    },
    testDriveCompleted: function(c,e,h){
		console.log("td completed start db update");
        var action = c.get("c.updateStatusWithMessage");
        action.setParams({"oid" : c.get("v.modalRecord"),
                          "field" : "Status__c",
                          "value" : "Scheduled",
                          "icon" : "custom:custom31",
                          "headline" : "Test drive record updated"
                         });
        action.setCallback(this,(response) => {
            var state = response.getState();
                    if (state === "SUCCESS") {
        	console.log("update test drive successful = ", response.getReturnValue());
            //updateStatus(Id oid, String field, String value)
        		//Update Feeditem
            var action2 = c.get("c.updateStatus");
        	action2.setParams({"oid" : c.get("v.modalFiid"),
                          "field" : "SLA_active__c",
                          "value" : "false"
                         });
        	action2.setCallback(this,(response) => {
            		var state = response.getState();
                    if (state === "SUCCESS") {
        			console.log("update action feed item successful = ", response.getReturnValue());
            
            //updateStatus SLA_achieved_since__c 
            var action3 = c.get("c.updateStatus");
        	action3.setParams({"oid" : c.get("v.modalFiid"),
                          "field" : "SLA_achieved_since__c",
                          "value" : "ACTION:setDate"
                         });
        	action3.setCallback(this,(response) => {
            		var state = response.getState();
                    if (state === "SUCCESS") {
        			console.log("update action feed item successful = ", response.getReturnValue());
            
            //updateStatus SLA_achieved_since__c 
            
            
        	}
            
        });
        $A.enqueueAction(action3);
    	}
		});
		
		$A.enqueueAction(action2);
        }
        });
		$A.enqueueAction(action);
        
		//a update Lead updateTestDriveLead
		var action4 = c.get("c.updateTestDriveLead");
        	action4.setParams({"tid" : c.get("v.modalRecord") });
        	action4.setCallback(this,(response) => {
            		var state = response.getState();
                    if (state === "SUCCESS") {
        			console.log("Lead updated successful (", response.getReturnValue());
            
            //updateStatus SLA_achieved_since__c 
            
            
        	}
            
        });
        $A.enqueueAction(action4);
        
    },
    viewDetails: function(c,e,h){
        c.set("v.showModal", true);
      	c.set("v.modalContent", e.target.dataset.record);
        c.set("v.modalRecord", e.target.dataset.id);
        c.set("v.modalFiid", e.target.dataset.fiid);
        //get some information from the feeditem
        var YesLiteral = null;
        var NoLiteral = "Close";
        for(var fi of c.get("v.fil")){
            if(fi.Id == e.target.dataset.fiid && fi.SLA_active__c){
                YesLiteral = fi.action_yes__c ;
                NoLiteral = fi.action_no__c;
            }
        }
        c.set("v.modalYesLiteral", YesLiteral);
        c.set("v.modalNoLiteral", NoLiteral);
        e.target.dataset.record == "Testdrive" ? c.set("v.modalHeader", "Test Drive Appointment") : "";
    },

})