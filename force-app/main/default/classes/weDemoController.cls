public class weDemoController {
    
@AuraEnabled
public static Boolean resetDemo(String demoDate, Decimal CLV) {
    Boolean success = true;
    
    try{
        //delete all leads related to John
        List<Lead> leads = [SELECT Id, Name FROM Lead WHERE Email = 'john.fisher-demo@gmail.com'];
        delete leads;
    } catch(DmlException e) {
        success = false;
    }
    
    try{
        //delete all test drives where John is the driver
        List<Test_Drive__c> tds = [SELECT Id, Name FROM Test_Drive__c WHERE Driver__c = '0031t00000AEpK0AAL'];
        delete tds;
    } catch(DmlException e) {
        success = false;
    }
    
    try{
        //delete all orders from John
        List<Order> orders = [SELECT Id, Name FROM Order WHERE Contact__c = '0031t00000AEpK0AAL'];
        delete orders;
    } catch(DmlException e) {
        success = false;
    }
    
    try{
        //delete all cases from John
        List<Case> cases = [SELECT Id FROM Case WHERE ContactId = '0031t00000AEpK0AAL'];
        delete cases;
    } catch(DmlException e) {
        success = false;
    }
    
    try{
        //set John Customer Lifetimevalue
        Contact c = [SELECT Id, Cust360_LTV__c FROM Contact WHERE Id = '0031t00000AEpK0AAL']; 
        c.Cust360_LTV__c = CLV;
        update c;
    } catch(DmlException e) {
        success = false;
    }
    
    try{
        //delete all portal feed item actions from Daniel
        List<portal_feed_item__c> pfis = [SELECT Id FROM portal_feed_item__c WHERE Contact__c = '0031t0000025d6KAAQ' AND type__c = 'action required']; 
        delete pfis;
    } catch(DmlException e) {
        success = false;
    }
    
    try{
        //change date on events to demo date +1
        //lunch = 00U1t000006WNA4EAO
        //sales conversation = 00U1t000006WdcREAS
        List<Event> events = [SELECT id,ActivityDate,ActivityDateTime FROM Event WHERE id = '00U1t000006WNA4EAO' OR id = '00U1t000006WdcREAS']; 
        for(Event e : events){
            e.ActivityDate = Date.valueOf(demoDate).addDays(1);
            e.ActivityDateTime = Datetime.newInstance(e.ActivityDate.year(), e.ActivityDate.month(), e.ActivityDate.day(), e.ActivityDateTime.hour(), e.ActivityDateTime.minute(), e.ActivityDateTime.second());
            System.debug('New Activity Date: '+e.ActivityDate);
            System.debug('New Activity DateTime: '+e.ActivityDateTime);
        }
        
        update events;
    } catch(DmlException e) {
        success = false;
    }
    
    return success;
}
}