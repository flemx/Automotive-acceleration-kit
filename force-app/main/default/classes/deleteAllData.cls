public class deleteAllData {
public static Boolean go() { 
    try{
        List<demo_setting__c> ds = [SELECT Id FROM demo_setting__c];
        List<Account> a = [SELECT Id FROM Account];
        List<Contact> c = [SELECT Id FROM Contact];
        List<Custom_Activity__c> ca = [SELECT Id FROM Custom_Activity__c];
        List<Asset> ass = [SELECT Id FROM Asset];
        List<Appointment__c> app = [SELECT Id FROM Appointment__c];
        List<Campaign> campaigns = [SELECT Id FROM Campaign ORDER BY CreatedDate DESC];
        List<Configuration__c> configs = [SELECT Id FROM Configuration__c];
        delete campaigns;
        delete configs;
        delete ds;
        delete app;
        delete ass;
        delete ca;
        delete c;
        delete a;
    } catch(Exception e){
        System.debug('Error deleting data');
        return false;
    }
   return true; 
}
}