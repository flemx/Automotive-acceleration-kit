public class weDemoController {
    
@AuraEnabled
public static Boolean resetDemo(String demoDate, Decimal CLV) {
    Boolean success = true;
    
    //Find demo contact
    Contact john = [SELECT Id, Name FROM Contact WHERE demo_key__c = 'Contact_02' LIMIT 1];
    //Find demo dealer contact
    Contact dealer = [SELECT Id, Name FROM Contact WHERE demo_key__c = 'Contact_01' LIMIT 1];
    
    try{
        //delete all leads related to a testdrive
        List<Lead> leads = [SELECT Id, Name FROM Lead WHERE td_date_requested__c != Null];
        delete leads;
    } catch(DmlException e) {
        success = false;
    }
    
    try{
        //delete all test drives where John is the driver
        List<Test_Drive__c> tds = [SELECT Id, Name FROM Test_Drive__c WHERE Driver__c = :john.Id];
        delete tds;
    } catch(DmlException e) {
        success = false;
    }
    
    try{
        //delete all orders from John
        List<Order> orders = [SELECT Id, Name FROM Order WHERE Contact__c = :john.Id];
        delete orders;
    } catch(DmlException e) {
        success = false;
    }
    
    try{
        //delete all cases from John
        List<Case> cases = [SELECT Id FROM Case WHERE ContactId = :john.Id];
        delete cases;
    } catch(DmlException e) {
        success = false;
    }
    
    try{
        //set John Customer Lifetimevalue
        Contact c = [SELECT Id, Cust360_LTV__c FROM Contact WHERE Id = :john.Id]; 
        c.Cust360_LTV__c = CLV;
        update c;
    } catch(DmlException e) {
        success = false;
    }
    
    try{
        //delete all portal feed item actions from Daniel
        List<portal_feed_item__c> pfis = [SELECT Id FROM portal_feed_item__c WHERE Contact__c = :dealer.Id AND type__c = 'action required']; 
        delete pfis;
    } catch(DmlException e) {
        success = false;
    }
    
    try{
        //change date on events to demo date +1
        List<Event> events = [SELECT id,ActivityDate,ActivityDateTime FROM Event WHERE Subject = 'Don Arne Sales Conversation' OR Subject = 'Lunch']; 
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