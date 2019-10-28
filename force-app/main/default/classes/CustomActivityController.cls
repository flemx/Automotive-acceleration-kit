public class CustomActivityController {
	
    @AuraEnabled
    public static List <Custom_Activity__c> getActivities(Id recordId) {
        
                
        List<Custom_Activity__c> a = [
            SELECT Id,Name,message__c,icon__c,days_ago__c,time__c,order__c
            FROM Custom_Activity__c
            WHERE contact__c = :recordId
            ORDER BY days_ago__c,order__c DESC
            
        ];
        
        return a;
    }  
    
    
}