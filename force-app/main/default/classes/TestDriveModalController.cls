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
                    assigned_Vehicle__r.Motor__c,
                    assigned_Vehicle__r.Edition__c,
                    assigned_Vehicle__r.Name,
                    assigned_Vehicle__r.Image_url__c,
                    assigned_Vehicle__r.License_Plate__c,
                    assigned_Vehicle__r.Vehicle_Version__c
                FROM Test_Drive__c 
                WHERE Id = :tdid 
                LIMIT 1];
        System.debug(testDrive.assigned_Vehicle__r.Image_url__c);
        return testDrive;
    }


    // @AuraEnabled
    // public static List<Vehicle_Type__c> getVehicleTypes(String AssetId) {
    //     List<Vehicle_Type__c> vehicleType = [SELECT 
    //                  Id, battery__c, color__c, edition__c, imgUrl__c, licensePlate__c, motor__c, Vehicle__c
    //             FROM Vehicle_Type__c 
    //             WHERE Id = :AssetId 
    //             LIMIT 1];
    //     return vehicleType;
    // }
    
    
@AuraEnabled
    public static Test_Drive__c assignVehicle(String tdid, String assetId){
        // Id vid = [SELECT Id FROM Asset WHERE Id = 'assignedId' LIMIT 1].Id;
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