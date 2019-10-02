public class naviController {

    
@AuraEnabled
    public static Boolean startTestDrive() {
        //get latest testdrive for data
        Test_Drive__c td = [SELECT Id, Name FROM Test_Drive__c ORDER BY CreatedDate DESC LIMIT 1];
        
                //create dealer message (portal feed item)
                portal_feed_item__c pfi = new portal_feed_item__c(
                	action_no__c = 'Cancel',
                    action_yes__c = 'Start Process',
                    category_1__c = 'Test drive',
                    Contact__c = '0031t0000025d6KAAQ',
                    date__c = Datetime.now(),
                    icon_2__c = 'standard:contact',
                    icon_1__c = 'custom:custom31',
                    message_1__c = 'is about to begin. Please initiate consent process with',
                    message_2__c = '.',
                    record_id_2__c = '0031t00000AEpK0AAL',
                    record_id_1__c = td.Id,
                    record_name_2__c = 'John Fisher',
                    record_name_1__c = 'Testdrive',
                    SLA_active__c = true,
                    SLA_in_minutes__c = 10,
                    title__c = 'Test Drive starting',
                    type__c = 'action required',
                    User__c = '0051t000000SXZ0AAO'
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
                    record_id_2__c = '0031t00000AEpK0AAL',
                    record_name_1__c = td.Name,
                    record_name_2__c = 'John Fisher'
                );
                EventBus.publish(message);
        
        	return true;
    }

}