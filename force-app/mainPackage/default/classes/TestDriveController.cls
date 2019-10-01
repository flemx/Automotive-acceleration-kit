public class TestDriveController {
	@AuraEnabled
    public static Contact getContact() {
        Contact theContact =[SELECT Id, Email,FirstName,LastName,Phone FROM Contact WHERE LastName = 'Fisher'];

        return theContact;
    }
   
    @AuraEnabled
    public static Test_Drive__c getTestDrive() {
        Test_Drive__c theTest =[SELECT Date__c,assigned_Vehicle__r.VIN__c,Vehicle__c FROM Test_Drive__c WHERE Driver__c = '0031t00000AEpK0AAL' LIMIT 1];

        return theTest;
    }
    
    
    @AuraEnabled
    public static String getDocumentId(String cId) {
        String theContent = [SELECT Id FROM ContentVersion WHERE ContentDocumentId =: cId].Id;
        return theContent;
    }
}