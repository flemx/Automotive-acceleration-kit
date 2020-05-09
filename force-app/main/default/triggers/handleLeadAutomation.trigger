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
                // demo_setting__c demoSetting = [SELECT dealer_name__c, dealer_email__c FROM demo_setting__c WHERE demo_key__c = 'masterSetting' LIMIT 1];
                
                // System.debug('TEST1');
                // System.debug([SELECT dealer_name__c, dealer_email__c FROM demo_setting__c WHERE demo_key__c = 'masterSetting' LIMIT 1]);
                // System.debug([SELECT dealer_name__c, dealer_email__c FROM demo_setting__c WHERE demo_key__c = 'masterSetting' LIMIT 1].dealer_name__c);
                
                //get Dealer Contact
                Contact dealer = [SELECT Id, Name, Account.Name FROM Contact WHERE demo_key__c = 'Contact_01' LIMIT 1];
    

                // Id dealerUser_id = [SELECT Id FROM User WHERE Id = :demoSetting.dealer_name__c LIMIT 1].Id;
                Id dealerUser_id = UserInfo.getUserId();
                //get Driver Contact
                Contact driver = [SELECT Id, Name FROM Contact WHERE demo_key__c = 'Contact_02' LIMIT 1];
                //get Configuration
                Id config_id = [SELECT Id FROM Configuration__c WHERE demo_key__c = 'Config_1' LIMIT 1].Id;

                Asset vehicle = [SELECT Id FROM Asset where Id = :l.Vehicle__c];
                //create test drive record if testdrive date is set
                Test_Drive__c td = new Test_Drive__c(
                    Date__c = l.td_date_requested__c,
                    Dealer__c = dealer.Id,
                    Driver__c = driver.Id,
                    assigned_Vehicle__c = vehicle.Id,
                    Status__c = 'Requested',
                    Vehicle__c = vehicle.Name,
                    Lead_Source__c = l.Id,
                    OwnerId = dealerUser_id
                );
                insert td;
                //get record name
                Test_Drive__c td2 = [SELECT Name FROM Test_Drive__c WHERE Id = :td.Id LIMIT 1];
                //Send message to bus
                MessageLibrary.testDriveRecordCreated(td2, driver);
                
                //send Message Lead created
                MessageLibrary.testDriveLeadCreated(l, dealer.Account);
                
                //Send message config created
                MessageLibrary.configCreated(config_id, driver);
                
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
                    message_2__c = 'on ' + d.format() + ' with home pickup in a vehicle with the following',
                    record_id_1__c = driver.Id,
                    record_id_2__c = td2.Id,
                    // record_id_3__c = config_id,
                    record_name_1__c = driver.Name,
                    record_name_2__c = 'Testdrive',
                    // record_name_3__c = 'configuration',
                    SLA_active__c = true,
                    SLA_in_minutes__c = 480,
                    title__c = 'New Test Drive Request',
                    type__c = 'action required',
                    User__c = dealerUser_id
                );
                insert pfi;
                
                //send message to Daniel
                // String appId = '9e39deb3-2e1e-4d2f-968e-ed4640292a9a';
                // String  heading = 'New Test Drive Request';
                // String  content = 'Contact ' + driver.Name + ' has requested a test drive with home pickup. You have 8hrs to respond.' ;
                // //TODO make asynchronous
                // //DealerPortalTriggerPush.sendNotification(appId, heading, content);
                
                // //send message journey start
                // MessageLibrary.journeyStart('Testdrive journey');
                
                //set lead score
                SetLeadScore.setScore('84', ''+l.Id);
            }
        }
    }
}