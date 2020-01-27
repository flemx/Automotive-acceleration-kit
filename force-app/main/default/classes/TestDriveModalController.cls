public class TestDriveModalController {
    
@AuraEnabled
    public static Test_Drive__c getTestdriveData(String tdid) {
        Test_Drive__c testDrive = [SELECT 
                    Date__c, 
                	Driver__r.MailingStreet,
                	Driver__r.MailingPostalCode,
                    Driver__r.MailingCity,
                	Driver__r.MailingCountry,
                    Status__c, 
                    Configuration__r.motor__c, 
                    Configuration__r.edition__c, 
                    Configuration__r.model__c, 
                    assigned_Vehicle__r.License_Plate__c 
                FROM Test_Drive__c 
                WHERE Id = :tdid 
                LIMIT 1];
        return testDrive;
    }
    
@AuraEnabled
    public static Test_Drive__c assignVehicle(String tdid){
        Id vid = [SELECT Id FROM Asset WHERE demo_key__c = 'asset_01' LIMIT 1].Id;
        Test_Drive__c td = [SELECT 
                    Date__c, 
                    Name,
                	Driver__r.MailingStreet,
                	Driver__r.MailingPostalCode,
                    Driver__r.MailingCity,
                	Driver__r.MailingCountry,
                    Status__c, 
                    Configuration__r.motor__c, 
                    Configuration__r.edition__c, 
                    Configuration__r.model__c, 
                    assigned_Vehicle__r.License_Plate__c 
                FROM Test_Drive__c 
                WHERE Id = :tdid 
                LIMIT 1];
        td.assigned_Vehicle__c = vid;
        update td;
        
        //push message
        general_message__e message = new general_message__e(
                    main_icon__c = 'custom:custom31',
                    headline__c = 'Test Drive Record updated',
                    category_1__c = 'Test Drive',
                    category_2__c = 'Change:',
                    icon_1__c = 'custom:custom31',
                    message_1__c = 'has updated fields.',
                    message_2__c = 'Vehicle assigned',
                    record_id_1__c = td.Id,
                    record_name_1__c = td.Name
                );
                EventBus.publish(message);
        
        return td;
    }

}