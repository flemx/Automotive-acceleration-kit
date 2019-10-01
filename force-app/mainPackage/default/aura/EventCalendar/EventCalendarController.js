({
    created : function(component, event, helper) {
        console.log("HIT EventCalendar");
        helper.created(component, event);
    },
    nextbtn : function(component, event, helper) {
        var currdiv=component.get("v.currentdiv");
        component.set("v.currentdiv",currdiv+1);
        var action = component.get("c.getCon");
        action.setParams({ 
            "cid": component.get('v.conId')
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.con",response.getReturnValue());
                
                component.set('v.mapMarkers', [
                    {
                        location: {
                            Street: component.get('v.con.MailingStreet'),
                            City:component.get('v.con.MailingCity'),
                            State: component.get('v.con.MailingState')
                        },
                        
                        title:component.get('v.con.Name'),
                        description: 'Test Drive Location'
                    }
                ]);
                component.set('v.zoomLevel', 16);
            }
        });
        $A.enqueueAction(action);
    },
    prevbtn : function(component, event, helper) {
        var currdiv=component.get("v.currentdiv");
        component.set("v.currentdiv",currdiv-1);
    },
    /*SearchEvents : function(component, event, helper) {
        var accval=component.get("v.acc");
        $('#calendar').fullCalendar( 'destroy' );
        if(accval!='' && accval!=null){
            var action = component.get("c.searchevnts");
            
            action.setParams({ 
                "a": accval
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
        else{
            // alert('in else');
            helper.getEvents(component, event);
        }
    },*/
    renderCalendar : function(component, event, helper) {
        console.log("Events Loaded");
        var eventsMap = component.get("v.events");
        
        $(document).ready(function(){
            var eventArray = [];
            console.log('success render::');
            console.log(component.get("v.events"));
            $.each(eventsMap, function(index, value){
                var newEvent = {
                    id : value.Id,
                    title : value.title,
                    start : moment(value.startDateTime),
                    end : moment(value.endDateTime),
                    description : value.description,
                    owner : value.owner,
                    className: value.className,
                    conid: value.description
                    //url: '/'+value.Id
                }
                eventArray.push(newEvent);
            });
            var calendarButtons = component.get('v.calendarButtons');
            
            $('#calendar').fullCalendar({
                defaultView: 'agendaDay',
                header: {
                    left: 'today prev,next',
                    center: 'title',
                    right: calendarButtons
                    
                },
                
                defaultDate: moment().format("YYYY-MM-DD"),
                navLinks: true, // can click day/week names to navigate views
                editable: true,
                eventLimit: true, // allow "more" link when too many events
                weekends: component.get('v.weekends'),
                //  eventBackgroundColor: component.get('v.eventBackgroundColor'),
                //  eventBorderColor: component.get('v.eventBorderColor'),
                eventTextColor: 'white',
                events: eventArray,
                eventClick: function(calEvent, jsEvent, view) {
                 /*   <aura:attribute name="showModal" type="Boolean" default="false" />
    <aura:attribute name="modalContent" type="String" />
    <aura:attribute name="modalRecord" type="String" />
    <aura:attribute name="modalHeader" type="String" />
    <aura:attribute name="modalYesLiteral" type="String" />
	<aura:attribute name="modalNoLiteral" type="String" />
    <aura:attribute name="modalFiid" type="String" />*/
                    
                    component.set("v.showModal", true);
                    component.set("v.modalContent", "Testdrive");
                    component.set("v.modalRecord", calEvent.id);
                    component.set("v.modalYesLiteral", null);
                    component.set("v.modalNoLiteral", "Close");
                    component.set("v.modalHeader", "Test Drive Appointment");
                    
                },
                eventDrop: function(event, delta, revertFunc) {
                    var evObj = {
                        "Id" : event.id,
                        "title" : event.title,
                        "startDateTime" : moment(event.start._i).add(delta).format(),
                        "endDateTime" : moment(event.end._i).add(delta).format(),
                        "description" : event.description
                    };
                    helper.upsertEvent(component, evObj);
                },
                eventResize: function(event, delta, revertFunc) {
                    var evObj = {
                        "Id" : event.id,
                        "title" : event.title,
                        "startDateTime" : moment(event.start._i).format(),
                        "endDateTime" : moment(event.end._i).add(delta).format(),
                        "description" : event.description
                    };
                    helper.upsertEvent(component, evObj);
                },
                dayClick: function(date, jsEvent, view) {
                    if (date._f == "YYYY-MM-DD"){
                        component.set('v.startDateTimeVal', moment(date.format()).add(12, 'hours').format());
                        component.set('v.endDateTimeVal', moment(date.format()).add(14, 'hours').format());
                    } else {
                        component.set('v.startDateTimeVal', moment(date.format()).format());
                        component.set('v.endDateTimeVal', moment(date.format()).add(2, 'hours').format());
                    }
                    component.set('v.newOrEdit', 'New');
                    helper.openModal(component, event);
                }
            });
        });
    },
    createRecord : function(component, event, helper) {
        var action = component.get("c.saveVehicle");
        
        action.setParams({ 
            "vid":  component.find("vh").get("v.selectedRecord.Id") ,
            "td":component.get("v.idVal")
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                helper.closeModal(component, event);
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "type":"success",
                    "title": "Success!",
                    "message": "The vehicle has been assigned successfully."
                });
    toastEvent.fire();
            }
        });
        
         $A.enqueueAction(action);
       /* var evObj = {
            "title" : component.get('v.titleVal'),
            "startDateTime" : moment(component.get('v.startDateTimeVal')).format(),
            "endDateTime" : moment(component.get('v.endDateTimeVal')).format(),
            "description" : component.get('v.descriptionVal')
        };
        if (component.get('v.idVal')) {
            evObj.id = component.get('v.idVal');
            $('#calendar').fullCalendar( 'removeEvents', component.get('v.idVal') );
        }
        helper.upsertEvent(component, evObj, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log("New Event Created");
                var newEvent = {
                    id : response.getReturnValue().Id,
                    title : response.getReturnValue().title,
                    start : moment(response.getReturnValue().startDateTime),
                    end : moment(response.getReturnValue().endDateTime),
                    description : response.getReturnValue().description,
                    owner : response.getReturnValue().owner,
                    class: 'EventClass'
                }
                $('#calendar').fullCalendar( 'renderEvent', newEvent );
                helper.closeModal(component, event);
                component.set('v.titleVal','');
                component.set('v.idVal','');
                component.set('v.startDateTimeVal','');
                component.set('v.endDateTimeVal','');
                component.set('v.descriptionVal','');
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
        });*/
    },
    deleteRecord : function(component, event, helper) {
        helper.deleteEvent(component, event, event.getSource().get("v.value"), function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                $('#calendar').fullCalendar( 'removeEvents', response.getReturnValue());
                helper.closeModal(component, event);
                component.set('v.titleVal','');
                component.set('v.idVal','');
                component.set('v.startDateTimeVal','');
                component.set('v.endDateTimeVal','');
                component.set('v.descriptionVal','');
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
    },
    openModal : function(component, event, helper) {
        helper.openModal(component, event, helper);
    },
    closeModal : function(component, event, helper) {
		helper.closeModal(component, event, helper);
    }
})