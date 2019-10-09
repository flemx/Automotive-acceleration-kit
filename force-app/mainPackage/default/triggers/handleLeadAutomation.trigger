trigger handleLeadAutomation on Lead (after insert) {
    
    for(Lead l : Trigger.new) {
            if (l.test_drive__c) {
                //create test drive record if campaign is linked
                Test_Drive__c td = new Test_Drive__c(
                    Date__c = l.td_date_requested__c,
                    Dealer__c = '0031t0000025d6KAAQ',
                    Driver__c = '0031t00000AEpK0AAL',
                    Configuration__c = 'a751t000000GpK4AAK',
                    Status__c = 'Requested',
                    Vehicle__c = 'I.D. Crozz',
                    Lead_Source__c = l.Id,
                    OwnerId = '0051t000000SXZ0AAO'
                );
                insert td;
                //get record name
                Test_Drive__c td2 = [SELECT Name FROM Test_Drive__c WHERE Id = :td.Id LIMIT 1];
                //Send message to bus
                general_message__e message = new general_message__e(
                    main_icon__c = 'custom:custom31',
                    headline__c = 'New Test Drive Record created',
                    category_1__c = 'Test Drive',
                    category_2__c = 'Driver:',
                    icon_1__c = 'custom:custom31',
                    icon_2__c = 'standard:contact',
                    message_1__c = 'created.',
                    message_2__c = '',
                    record_id_1__c = td.id,
                    record_id_2__c = '0031t00000AEpK0AAL',
                    record_name_1__c = td2.Name,
                    record_name_2__c = 'John Fisher'
                );
                EventBus.publish(message);
                
                //Send message config created
                general_message__e message_config_created = new general_message__e(
                    main_icon__c = 'custom:custom83',
                    headline__c = 'New Configuration Record created',
                    category_1__c = 'Configuration',
                    category_2__c = 'Contact:',
                    icon_1__c = 'custom:custom83',
                    icon_2__c = 'standard:contact',
                    message_1__c = 'created.',
                    message_2__c = '',
                    record_id_1__c = 'a751t000000GpK4AAK',
                    record_id_2__c = '0031t00000AEpK0AAL',
                    record_name_1__c = 'Testdrive config web',
                    record_name_2__c = 'John Fisher'
                );
                EventBus.publish(message_config_created);
                
                Datetime d = l.td_date_requested__c;
                //create dealer message (portal feed item)
                portal_feed_item__c pfi = new portal_feed_item__c(
                    action_no__c = 'Reject',
                    action_yes__c = 'Accept',
                    category_1__c = 'Contact',
                    Contact__c = '0031t0000025d6KAAQ',
                    date__c = Datetime.now(),
                    icon_1__c = 'standard:contact',
                    icon_2__c = 'custom:custom31',
                    icon_3__c = 'standard:custom',
                    message_1__c = 'has requested a',
                    message_2__c = 'on ' + d.format() + ' with home pickup in an I.D. Crozz with the following',
                    record_id_1__c = '0031t00000AEpK0AAL',
                    record_id_2__c = td2.Id,
                    record_id_3__c = 'a751t000000GpK4AAK',
                    record_name_1__c = 'John Fisher',
                    record_name_2__c = 'Testdrive',
                    record_name_3__c = 'configuration',
                    SLA_active__c = true,
                    SLA_in_minutes__c = 480,
                    title__c = 'New Test Drive Request',
                    type__c = 'action required',
                    User__c = '0051t000000SXZ0AAO'
                );
                insert pfi;
                
                //set lead score
                SetLeadScore.setScore('84', ''+l.Id);
            }
    }
    
}