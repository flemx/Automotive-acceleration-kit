public class naviController {

    
@AuraEnabled
    public static Boolean startTestDrive(Test_Drive__c td) {
        //get latest testdrive for data
        // Test_Drive__c td = [SELECT Id, Name FROM Test_Drive__c where Id = :tid];
        System.debug(td);
        //get Config
                demo_setting__c demoSetting = [SELECT dealer_name__c, dealer_email__c FROM demo_setting__c WHERE demo_key__c = 'masterSetting' LIMIT 1];
                
        //get Driver Contact
                Contact driver = [SELECT Id, Name FROM Contact WHERE demo_key__c = 'Contact_02' LIMIT 1];
                 //get Dealer Contact
                Contact dealer = [SELECT Id, Name FROM Contact WHERE demo_key__c = 'Contact_01' LIMIT 1];
                //get Dealer User
                Id dealerUser_id = [SELECT Id FROM User WHERE UserName = :demoSetting.dealer_name__c LIMIT 1].Id;

                //create dealer message (portal feed item)
                portal_feed_item__c pfi = new portal_feed_item__c(
                	action_no__c = 'Cancel',
                    action_yes__c = 'Start Process',
                    category_1__c = 'Test drive',
                    Contact__c = driver.Id,
                    date__c = Datetime.now(),
                    icon_2__c = 'standard:contact',
                    icon_1__c = 'custom:custom31',
                    message_1__c = 'is about to begin. Please initiate consent process with',
                    message_2__c = '.',
                    record_id_2__c = driver.Id,
                    record_id_1__c = td.Id,
                    record_name_2__c = driver.Name,
                    record_name_1__c = 'Testdrive',
                    SLA_active__c = true,
                    SLA_in_minutes__c = 10,
                    title__c = 'Test Drive starting',
                    type__c = 'action required',
                    User__c = dealerUser_id
                );
                insert pfi;   
        
        //Send message to bus
                general_message__e message = new general_message__e(
                    main_icon__c = 'custom:custom31',
                    headline__c = 'Test Drive in progress',
                    category_1__c = 'Test Drive',
                    category_2__c = 'Driver:',
                    icon_1__c = 'custom:custom31',
                    icon_2__c = 'standard:contact',
                    message_1__c = 'in progress.',
                    message_2__c = '',
                    record_id_1__c = td.id,
                    record_id_2__c = driver.Id,
                    record_name_1__c = td.Name,
                    record_name_2__c = driver.Name
                );
                EventBus.publish(message);
        
        	return true;
    }

}