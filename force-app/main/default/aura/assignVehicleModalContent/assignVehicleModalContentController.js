({
	"init" : function(c, event, helper) {
		
		let comName = window.location.href.split("/")[3];
		c.set('v.comName', comName);
		

        var action2 = c.get('c.getTestDriveVehicles');

		
		action2.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
				var data = response.getReturnValue();
				let selectedV = c.get('v.selectedVehicle');	
				console.log('selected vehicle is: ', selectedV);
				for(let i =0; i < data.length; i++){
					data[i].Id === selectedV.Id? data[i].checked = true : data[i].checked = false;
				}
				console.log("Test drive vehicles:", data);
                c.set("v.vehicles",data);
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

		$A.enqueueAction(action2);

	},
	setSelected :  function(c,e){
		let selected =  e.currentTarget.getAttribute('data-id');
		let data = c.get('v.vehicles');
		let selectedV = {};
		for(let key in data){
			if(data[key].Id === selected){
				selectedV = data[key];
				break;
			}
		}

		console.log(selectedV);
		c.set('v.selectedVehicle', selectedV);
		
		for(let i =0; i < data.length; i++){
			data[i].Id === selectedV.Id? data[i].checked = true : data[i].checked = false;
		}
		c.set("v.vehicles",data);
		console.log('testDriveId: ' + c.get("v.testDriveId") + ', selectedV.Id: ' + selectedV.Id);
        // //call db update
        var action = c.get('c.assignVehicle');
        action.setParams({"tdid": c.get("v.testDriveId"), "assetId":  selectedV.Id});
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var data = response.getReturnValue();
                console.log("test drive data = ", data);
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
})