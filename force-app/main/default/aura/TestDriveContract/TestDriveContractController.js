({
    doInit : function(component, event, helper) {
        var action = component.get("c. ");
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log('Contact is:', response.getReturnValue());
                component.set("v.contact", response.getReturnValue());
                //  let url = 'https://polar-peak-30148.herokuapp.com/';
                // fetch(url, {mode: "no-cors"}) // Call the fetch function passing the url of the API as a parameter
                //     .then(function(res) {
                //         console.log(res);                    
                //     })
                //     .catch(function(err) {
                //         console.error(err);
                //     });
                //     }
            }
            else {
                console.log("error");
            }
        });
        $A.enqueueAction(action);
        
        var action2 = component.get("c.getTestDrive");
        action2.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.testDrive", response.getReturnValue());
            }
            
            else {
                console.log("error");
            }
        });
        $A.enqueueAction(action2);
    },
    
    handlePrevious: function (cmp, event, helper) {
        var theAcc = cmp.get("v.accordion");
        var theAcc2 = parseInt(theAcc);
        
        if((theAcc2-1) <= 3){
            console.log(theAcc2);
            cmp.set("v.accordion", (theAcc2-1).toString());
        }
        
        var theProgress = cmp.get("v.progressStep");
        var theProgress2 = parseInt(theProgress);
        
        if((theProgress2-1) <= 3){
            console.log(theProgress2);
            cmp.set("v.progressStep", (theProgress2-1).toString());
        }
    },
    
    handleNext: function (cmp) {
        var theAcc = cmp.get("v.accordion");
        var theAcc2 = parseInt(theAcc);
        
        if((theAcc2+1) <= 3){
            console.log(theAcc2);
            cmp.set("v.accordion", (theAcc2+1).toString());
        }
        
        if(theAcc2 == 2){
            $(".theBtns").hide();
            $(".theSubmitBtn").show();
        }
        
        var theProgress = cmp.get("v.progressStep");
        var theProgress2 = parseInt(theProgress);
        
        if((theProgress2+1) <= 3){
            console.log(theProgress2);
            cmp.set("v.progressStep", (theProgress2+1).toString());
        }
    },
    
    handleSubmit:function (cmp, event, helper) {
        console.log("submit testdrive prep form");
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "type": "success",
            "message": "Congratulations! Your test drive contract is completed!"
        });
        toastEvent.fire();

        $A.get('e.force:refreshView').fire();
        $A.get("e.force:closeQuickAction").fire();
    
        
        // let tesDriveId= cmp.get('v.testDrive.Id');
        // console.log("tesDriveId: " + tesDriveId);
        // let url = 'https://polar-peak-30148.herokuapp.com/update/' + tesDriveId;
        // fetch(url, {mode: "no-cors"}) // Call the fetch function passing the url of the API as a parameter
        //     .then(function(res) {
        //         console.log(res);                    
        //             console.log("action sent");
        //             var toastEvent = $A.get("e.force:showToast");
        //                 toastEvent.setParams({
        //                     "type": "success",
        //                     "message": "Congratulations! Your test drive contract is completed!"
        //                 });
        //                 toastEvent.fire();
                
        //             $A.get('e.force:refreshView').fire();
        //             $A.get("e.force:closeQuickAction").fire();
        //     })
        //     .catch(function(err) {
        //         console.error(err);
        //     });
        
        /*
        var action3 = cmp.get("c.updatePfi");
        	action3.setCallback(this,(response) => {
            		var state = response.getState();
                    if (state === "SUCCESS") {
        			console.log("update action feed item successful = ", response.getReturnValue());
            
            console.log("action sent");
			var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "type": "success",
                    "message": "Congratulations! Your test drive contract is completed!"
                });
                toastEvent.fire();
        
            $A.get('e.force:refreshView').fire();
            $A.get("e.force:closeQuickAction").fire();
                
            }else {
    		// Parse custom error data & report it
			let errorData = JSON.parse(response.error.message);
			console.error(errorData.name +" (code "+ errorData.code +"): "+ errorData.message);
    		console.log("error: ", response.getError)
 			}
            
			} 
            
        );
        	$A.enqueueAction(action3);
		*/
        
        
        
    },
    closeModal: function(c,e,h){
        c.set("v.showModal", false);
    }
})