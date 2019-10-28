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
    when else {		  // default block, optional
        MessageLibrary.plaintest();        
    }
}

        return true;
    }
}