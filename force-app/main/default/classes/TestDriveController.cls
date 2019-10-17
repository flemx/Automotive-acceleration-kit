public class TestDriveController {
	@AuraEnabled
    public static Contact getContact() {
        Contact theContact =[SELECT Id, Email,FirstName,LastName,Phone FROM Contact WHERE LastName = 'Fisher'];

        return theContact;
    }
   
    @AuraEnabled
    public static Test_Drive__c getTestDrive() {
        //get Test Drive Driver
        Contact driver = [SELECT Id, Name FROM Contact WHERE demo_key__c = 'Contact_1' LIMIT 1];
        Test_Drive__c theTest =[SELECT Date__c,assigned_Vehicle__r.VIN__c,Vehicle__c FROM Test_Drive__c WHERE Driver__c = :driver.Id LIMIT 1];

        return theTest;
    }
    
    
    @AuraEnabled
    public static String getDocumentId(String cId) {
        String theContent = [SELECT Id FROM ContentVersion WHERE ContentDocumentId =: cId].Id;
        return theContent;
    }
}