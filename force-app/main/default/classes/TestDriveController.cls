public without sharing class TestDriveController {
	@AuraEnabled
    public static Contact getContact() {
        Contact theContact =[SELECT Id, Email,Phone,MailingStreet,MailingCity,MailingCountry,MailingPostalCode,FirstName,LastName FROM Contact WHERE demo_key__c = 'Contact_02' LIMIT 1];
        return theContact;
    }
 
    @AuraEnabled
    public static Test_Drive__c getTestDrive() {
        //get Test Drive Driver
        Contact driver = [SELECT Id, Name FROM Contact WHERE demo_key__c = 'Contact_02' LIMIT 1];
        Test_Drive__c theTest =[SELECT Date__c,assigned_Vehicle__r.VIN__c,Vehicle__c FROM Test_Drive__c WHERE Driver__c = :driver.Id LIMIT 1];

        return theTest;
    }
 
    
    @AuraEnabled
    public static String getDocumentId(String cId) {
        System.debug('cId is: ' + cId);
        String theContent = [SELECT Id FROM ContentVersion WHERE ContentDocumentId =: cId].Id;
        return theContent;
    }
    
   @AuraEnabled
       public static String updatePfi(){
        system.debug('updatePfi on TestDriveController'); 
        String returnstring = 'success';
        Portal_feed_item__c pfi = [SELECT Id, SLA_achieved_since__c, SLA_active__c FROM Portal_feed_item__c WHERE SLA_active__c = true LIMIT 1];
        pfi.SLA_achieved_since__c = DateTime.now();
        pfi.SLA_active__c = false;
        try{update pfi;} catch (Exception e) {
            returnstring = 'error' + e.getMessage();
        }
        //set testdrive status to completed
        Contact driver = [SELECT Id, Name FROM Contact WHERE demo_key__c = 'Contact_02' LIMIT 1];
        Test_Drive__c td =[SELECT Date__c,Status__c FROM Test_Drive__c WHERE Driver__c = :driver.Id LIMIT 1];
		td.Status__c = 'Completed';
        update td;
        
        return returnstring;
    }

    @AuraEnabled
    public static List<Asset> getTestDriveVehicles(){
        List<String> keys = new List<String>{'asset_01','asset_02','asset_03'};
        return [SELECT 
            Id, 
            Name, 
            Image_url__c,
            Motor__c,
            Color__c,
            Edition__c,
            License_Plate__c,
            battery__c,
            Vehicle_Version__c
            FROM Asset where demo_key__c in :keys];
    }

    @AuraEnabled
    public static Test_Drive__c assignVehicle(String tdid, String assetId){
        // Id vid = [SELECT Id FROM Asset WHERE Id = 'assignedId' LIMIT 1].Id;
        System.debug('tdid" ' + tdid + ', assetId: ' + assetId);
         Test_Drive__c td = [SELECT 
                    Date__c, 
                    Driver__r.MailingStreet,
                    Driver__r.MailingPostalCode,
                    Driver__r.MailingCity,
                    Driver__r.MailingCountry,
                    Status__c,
                    assigned_Vehicle__r.Motor__c,
                    assigned_Vehicle__r.Edition__c,
                    assigned_Vehicle__r.Name,
                    assigned_Vehicle__r.Image_url__c,
                    assigned_Vehicle__r.License_Plate__c,
                    assigned_Vehicle__r.Vehicle_Version__c
                FROM Test_Drive__c 
                WHERE Id = :tdid 
                LIMIT 1];
        td.assigned_Vehicle__c = assetId;
        update td;
        return td;
    }
  
}