({
	init : function(c, e, h) {
        let comName = window.location.href.split("/")[3];
        c.set('v.comName', comName);
        if(c.get("v.tdid")){
        var action = c.get('c.getTestdriveData');
        		action.setParams({"tdid": c.get("v.tdid")});
                action.setCallback(this, function(response) {
                    var state = response.getState();
                    if (state === "SUCCESS") {
                        var data = response.getReturnValue();
                        console.log("test drive data = ", data);
                        console.log("Address = ", data.Driver__r.MailingStreet);
                        var testDriveDate = null;
                        if(data.Date__c){
                            testDriveDate = new Date(data.Date__c)
                        }
                        if(testDriveDate){
                            data.Date = new Date(testDriveDate);
                            // format Date
                            data.EndDate = testDriveDate.setHours(testDriveDate.getHours()+1); 
                            let dateString = new Date(data.Date).toUTCString();
                            data.dateFormatted = dateString.split(' ').slice(0, 4).join(' ');

                            //Format times
                            let startTime = new Date(data.Date).toUTCString();
                            startTime = startTime.split(' ').slice(4, 5).join(' ');
                            startTime = startTime.split(':').slice(0,2).join(':');

                            let endTime = new Date(data.EndDate).toUTCString();
                            endTime = endTime.split(' ').slice(4, 5).join(' ');
                            endTime = endTime.split(':').slice(0,2).join(':');
                            data.timeframe = startTime + ' - ' + endTime;
                        }
                        c.set("v.testdrive",data);
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
        }



	
        
        },
    
    callAssignVehicle: function(c,e,h){
        c.set("v.modalHeader", "Assign Vehicle");
        c.set("v.modalYesLiteral", "Assign Vehicle");        
        c.set("v.modalNoLiteral", "Cancel");  
        c.set("v.showModal", true);
        
    },
    
    closeModal: function(c,e,h){
        c.set("v.showModal", false);
    },
    
    assign: function(c,e,h){

        let veh = c.get('v.testdrive.assigned_Vehicle__r');
        console.log(veh);      

        // //call db update
        // var action = c.get('c.assignVehicle');
        // console.log("assign testdrive id = ", c.get("v.testdrive.Id"));
        // action.setParams({"tdid": c.get("v.testdrive.Id"), "assetId":  c.get("v.testdrive.Id")});
        // action.setCallback(this, function(response) {
        //     var state = response.getState();
        //     if (state === "SUCCESS") {
        //         var data = response.getReturnValue();
        //         console.log("test drive data = ", data);
        //         var testDriveDate = null;
        //         if(data.Date__c){
        //             testDriveDate = new Date(data.Date__c)
        //         }
        //         if(testDriveDate){
        //             data.Date = new Date(testDriveDate);
        //             // format Date
        //             data.EndDate = testDriveDate.setHours(testDriveDate.getHours()+1); 
        //             let dateString = new Date(data.Date).toUTCString();
        //             data.dateFormatted = dateString.split(' ').slice(0, 4).join(' ');

        //             //Format times
        //             let startTime = new Date(data.Date).toUTCString();
        //             startTime = startTime.split(' ').slice(4, 5).join(' ');
        //             startTime = startTime.split(':').slice(0,2).join(':');

        //             let endTime = new Date(data.EndDate).toUTCString();
        //             endTime = endTime.split(' ').slice(4, 5).join(' ');
        //             endTime = endTime.split(':').slice(0,2).join(':');
        //             data.timeframe = startTime + ' - ' + endTime;
        //         }
        //         data.assigned_Vehicle__r.License_Plate__c = "B DV 990E"
        //         c.set("v.testdrive",data);
        //         h.closeModal(c,e,h);
        //     }
        //     else if (state === "INCOMPLETE") {
        //         // do something
        //     }
        //         else if (state === "ERROR") {
        //             var errors = response.getError();
        //             if (errors) {
        //                 if (errors[0] && errors[0].message) {
        //                     console.log("Error message: " +
        //                                 errors[0].message);
        //                 }
        //             } else {
        //                 console.log("Unknown error");
        //             }
        //         }
        // });
        // $A.enqueueAction(action);  
        
        
        
        
    }
		
	
})