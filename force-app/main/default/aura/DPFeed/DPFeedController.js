({
	"init" : function(component, e, h) {
        


        //get username
        var action = component.get('c.getUserData');
        
        // Variables for google news api
        let googleList = [];
        const gToken = component.get('v.googleNewsToken');
        const gSearch = component.get('v.googleNewSearchKey');
        

        
        
        action.setParams({"userid": $A.get('$SObjectType.CurrentUser.Id')});
        console.log("id",$A.get('$SObjectType.CurrentUser.Id'))
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                
                let data = [];
                data = response.getReturnValue();
                console.log("data = ", data);
                component.set("v.username",data.FirstName);
                
                var action2 = component.get('c.getFeedItems');
        		action2.setParams({"userid": $A.get('$SObjectType.CurrentUser.Id')});
                action2.setCallback(this, function(response) {
                    var state = response.getState();
                    if (state === "SUCCESS") {
                        var data = response.getReturnValue();
                        //parse response and create dates in date format
                        for(var d of data){
                            //add javascript Date to object
                            d.jsdate = new Date(d.date__c);
                            //add display percentage
                            if(d.SLA_in_minutes__c){
                                var elapsedTime = (new Date() - d.jsdate)/60000;
                                var remainingTime = d.SLA_in_minutes__c - elapsedTime;
                                if(elapsedTime < d.SLA_in_minutes__c){
                                    d.sla_display_percentage = (elapsedTime/d.SLA_in_minutes__c)*360;
                                    d.sla_assistive_text = "Please accept or reject this request within " + parseInt(remainingTime/60) + " hours and " + parseInt(remainingTime%60) + " minutes."; 
                                } else {
                                    d.sla_display_percentage = 360;
                                }
                                
                                
                            };
                            //add SLA achieved since as js date
                            if(d.SLA_achieved_since__c){
                                console.log("got date yo - ", d.SLA_achieved_since__c);
                                var slaDateTime = d.SLA_achieved_since__c;
                                d.SLA_achieved_since = new Date(slaDateTime);
                                
                                
                                
                            }
                            
                        }
                        // If Google news api is enabled add newsitems for all returnes articles
                        //Fetch the google news data (Max 10) -> set the data variable inside callout
                        try{
                            fetch('https://gnews.io/api/v3/search?q='+gSearch+'&image=required&token='+gToken)
                            .then(function (response) {
                                return response.json();
                            })
                            .then(function (responseData) {
                                if(component.get('v.googleNewEnabled') === 'true' && responseData.articles !== undefined){
                                    for(let newsItem of responseData.articles){
                                        let newNewsItem = {};
                                        newNewsItem.title__c = newsItem.title;
                                        newNewsItem.text__c = newsItem.description;
                                        newNewsItem.source__c = newsItem.source.url;
                                        newNewsItem.sourceArticle__c = newsItem.url;
                                        newNewsItem.image__c = newsItem.image;
                                        newNewsItem.date__c = newsItem.publishedAt;
                                        newNewsItem.type__c = 'googlenews';
                                        data.push(newNewsItem);
                                    }
                                }
                                document.getElementById("spinner").parentNode.removeChild(document.getElementById("spinner"));
                                document.getElementById("content").classList.remove("slds-hide");
                                console.log("data = ", data);
                                component.set("v.fil",data);
                            });
                        }catch(e){
                            console.log(e);
                            document.getElementById("spinner").parentNode.removeChild(document.getElementById("spinner"));
                            document.getElementById("content").classList.remove("slds-hide");
                            console.log("data = ", data);
                            component.set("v.fil",data);
                        }
                       


                        
                       
                 
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
        
        //set greeting according to time of day
        var today = new Date();
        var h = today.getHours();
        var greeting = "";
        switch (true) {
            case (h>4 && h<12):
                greeting = "Good morning"
                break;
            case (h>=12 && h<17):
                greeting = "Good afternoon"
                break;
            case (h>=17 && h<23):
                greeting = "Good evening"
                break;
            case (h>=0 && h<=4) || (h>=23 && h<=24) :
                greeting = "Good night"
                break;
            default:
                greeting = "Good day"
                break;
        };
        component.set("v.greeting", greeting);
        
        //set interval to recalculate time remaining each minute
        setInterval(() => {

          
            let data = [];
            try{
                data = component.get("v.fil");
                if(Array.isArray(data)){
                    for(var d of data){
                        //add display percentage
                        if(d.SLA_in_minutes__c){
                            var elapsedTime = (new Date() - d.jsdate)/60000;
                            var remainingTime = d.SLA_in_minutes__c - elapsedTime;
                            if(elapsedTime < d.SLA_in_minutes__c){
                                d.sla_display_percentage = (elapsedTime/d.SLA_in_minutes__c)*360;
                                d.sla_assistive_text = "Please accept or reject this request within " + parseInt(remainingTime/60) + " hours and " + parseInt(remainingTime%60) + " minutes."; 
                            } else {
                                d.sla_display_percentage = 360;
                            }
                            
                            
                        }
                        
                    }
                    component.set("v.fil",data);
                }
            }catch(e){
                console.error("Error logged: ");
                console.error(e);
            }
            
            
        },5000);
    
    },
    
    filter: function(c,e,h){
        let values = e.getParam('value');
        let options = c.get('v.feedOptions');
        
        for(let option of options){
            let isFound = false;
            if(values.includes(option.value)){
                c.set("v."+option.value,true);
			}else{
                c.set("v."+option.value,false);
            }
        }
    },
    
    setFilterList: function(c,e,h){
        c.get("v.filter_list") ? c.set("v.filter_list", false) : c.set("v.filter_list", true)
    },
    
    
    yo: function(c,e,h){
        console.log("hallo, event received", e.getParam("content"));
        
    },
    
    viewDetails: function(c,e,h){
        h.viewDetails(c,e,h);
    },
    
    closeModal: function(c,e,h){
        h.closeModal(c,e,h);
    },
    
    accept: function(c,e,h){
        //TODO: make real
        c.get("v.showModal") ? h.closeModal(c,e,h) : "";
        h.accept(c,e,h);
        
    },
    
    modalYes: function(c,e,h){
        //TODO: make real
        console.log("click yes");
        h.accept(c,e,h);
        h.closeModal(c,e,h);
    },
    modalNo: function(c,e,h){
        //TODO: make real
        h.closeModal(c,e,h);
    }
    
    
    
    
})