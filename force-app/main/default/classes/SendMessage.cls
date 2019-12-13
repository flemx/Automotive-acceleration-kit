@RestResource(urlMapping='/sendmessage/*')
global with sharing class SendMessage {
    @HttpPost
    global static Boolean createMessage(String mid, String payload) {
        if(mid == null){
			 
        }
        
        switch on mid {
    when 'td-contact-activity' {		
        MessageLibrary.tdContactActivity();
    }	
    when 'td-dealer-activity' {		
        MessageLibrary.tdDealerActivity();
    }
    when 'td-scheduler-request' {		
        MessageLibrary.tdSchedulerRequest(payload);
    }
    when 'browser-interaction' {		
        MessageLibrary.desktopInteractionPointMessage(payload);
    }
    when 'browser-interaction-click' {		
        MessageLibrary.desktopInteractionPointClickMessage(payload);
    }
    when 'mobile-interaction' {		
        MessageLibrary.mobileInteractionPointMessage(payload);
    }
    when 'contact-cookie-merge' {		
        MessageLibrary.matchCookieMessage();
    }
    when 'journey-start' {		
        MessageLibrary.journeyStart(payload);
    }
    when 'ar-app-checkin' {
        MessageLibrary.workOrderStart(payload);
        }
    when 'ar-app-start' {
        MessageLibrary.arAppStart();        
            }
   	when 'ar-app-checkout' {
     	MessageLibrary.workOrderDoneWithId(payload);           
            }
    when 'register-device-to-unlock' {
     	MessageLibrary.mobileKeyActivate();           
            }
    when else {		  // default block, optional
        MessageLibrary.plaintest();        
    }
}

        return true;
    }
}