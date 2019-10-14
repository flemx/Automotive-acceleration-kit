trigger handleLeadAutomation on Lead (after insert) {
    if(Trigger.isAfter){
        for(Lead l : Trigger.new) {
            if (l.test_drive__c) {
                //add Campaign Member
                //get Campaign
                Id campaign_id = [SELECT Id FROM Campaign WHERE demo_key__c = 'Campaign_01' LIMIT 1].Id;
                CampaignMember cm = new CampaignMember (campaignId=campaign_id, leadid=l.id);
                insert cm;
                //get Config
                demo_setting__c demoSetting = [SELECT dealer_name__c, dealer_email__c FROM demo_setting__c WHERE demo_key__c = 'masterSetting' LIMIT 1];
                //get Dealer Contact
                Contact dealer = [SELECT Id, Name FROM Contact WHERE demo_key__c = 'Contact_01' LIMIT 1];
                //get Dealer User
                Id dealerUser_id = [SELECT Id FROM User WHERE UserName = :demoSetting.dealer_name__c LIMIT 1].Id;
                //get Driver Contact
                Contact driver = [SELECT Id, Name FROM Contact WHERE demo_key__c = 'Contact_02' LIMIT 1];
                //get Configuration
                Id config_id = [SELECT Id FROM Configuration__c WHERE demo_key__c = 'Config_1' LIMIT 1].Id;
                //create test drive record if testdrive date is set
                Test_Drive__c td = new Test_Drive__c(
                    Date__c = l.td_date_requested__c,
                    Dealer__c = dealer.Id,
                    Driver__c = driver.Id,
                    Configuration__c = config_id,
                    Status__c = 'Requested',
                    Vehicle__c = 'I.D. Buzz',
                    Lead_Source__c = l.Id,
                    OwnerId = dealerUser_id
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
                    record_id_2__c = driver.Id,
                    record_name_1__c = td2.Name,
                    record_name_2__c = driver.Name
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
                    record_id_1__c = config_id,
                    record_id_2__c = driver.Id,
                    record_name_1__c = 'Testdrive config web',
                    record_name_2__c = driver.Name
                );
                EventBus.publish(message_config_created);
                
                Datetime d = l.td_date_requested__c;
                //create dealer message (portal feed item)
                portal_feed_item__c pfi = new portal_feed_item__c(
                    action_no__c = 'Reject',
                    action_yes__c = 'Accept',
                    category_1__c = 'Contact',
                    Contact__c = dealer.Id,
                    date__c = Datetime.now(),
                    icon_1__c = 'standard:contact',
                    icon_2__c = 'custom:custom31',
                    icon_3__c = 'standard:custom',
                    message_1__c = 'has requested a',
                    message_2__c = 'on ' + d.format() + ' with home pickup in an I.D. Crozz with the following',
                    record_id_1__c = driver.Id,
                    record_id_2__c = td2.Id,
                    record_id_3__c = config_id,
                    record_name_1__c = driver.Name,
                    record_name_2__c = 'Testdrive',
                    record_name_3__c = 'configuration',
                    SLA_active__c = true,
                    SLA_in_minutes__c = 480,
                    title__c = 'New Test Drive Request',
                    type__c = 'action required',
                    User__c = dealerUser_id
                );
                insert pfi;
                
                //set lead score
                SetLeadScore.setScore('84', ''+l.Id);
            }
        }
    }
}