trigger contactAutoSetupTrigger on Contact (before insert) {
	for (Contact c : Trigger.New) {
    if(c.demo_key__c == 'Contact_01') {
        //if dealer account has been inserted, create related user and objects
        //get ProfileId
        Id pid = [SELECT Id FROM Profile WHERE Name='*Partners' LIMIT 1].Id;
		//set ContactId
		Id cid = c.Id;
		//set Account Id
		Id aid = c.AccountId;
        //get config object
        demo_setting__c config = [SELECT dealer_name__c, dealer_email__c FROM demo_setting__c WHERE demo_key__c='masterSetting' LIMIT 1];
        //create User
        User u = new User(
        	FirstName = c.FirstName,
            LastName = c.LastName,
            Username = config.dealer_name__c,
            Email = config.dealer_email__c,
            EmailPreferencesAutoBcc = true,
            EmailPreferencesAutoBccStayInTouch = false,
            EmailPreferencesStayInTouchReminder = true,
            Alias = c.FirstName.substring(0,1) + c.LastName ,
            CommunityNickname = c.FirstName+c.LastName,
            IsActive = true,
            TimeZoneSidKey = 'Europe/Berlin',
            LocaleSidKey = 'de_DE_EURO',
            ReceivesInfoEmails = false,
            ReceivesAdminInfoEmails = false,
            EmailEncodingKey = 'ISO-8859-1',
            LanguageLocaleKey = 'en_US',
            ForecastEnabled = true,
            UserPreferencesActivityRemindersPopup = true,
            UserPreferencesEventRemindersCheckboxDefault = true,
            UserPreferencesTaskRemindersCheckboxDefault = true,
            UserPreferencesNewLightningReportRunPageEnabled = true,
            ProfileId = pid,
            ContactId = cid
        );
        //insert User
        try{insert u;} catch(Exception e){System.debug('Error creating user. Did you set a unique user id?');
                                         System.debug('Error Details > ' + e.getMessage());}
        
        //assign Permissionset
        //get Permset ID
        Id psid = [SELECT Id FROM PermissionSet WHERE Name='VW_demo_pack' LIMIT 1].Id;
        PermissionSetAssignment psa = new PermissionSetAssignment(
        	AssigneeId=u.Id,
        	PermissionSetId=psid);
        insert psa;
        
        //create Dealer Portal Feed Items
        List<portal_feed_item__c> pfis = new List<portal_feed_item__c>();
        	pfis.add(new portal_feed_item__c(
                Contact__c = cid,
                type__c = 'announcement',
                title__c = 'Volkswagen presents the Dealer of Tomorrow',
                source__c = 'https://www.volklswagen-newsroom.com',
                text__c = 'Volkswagen is making its sales organization fit for the future. The brand is to fundementally realign its sales model together with its dealers. The new sales model is to be launched in Europe in April 2020. Today in Berlin, Volkswagen and the Eurpoean dealer Council presented their vision for the future world of...',
                image__c = 'https://427dp63llx7zmfivh1tezitj-wpengine.netdna-ssl.com/wp-content/uploads/2018/10/VW-dealer.jpg',
                date__c = DateTime.parse('2019-02-20T07:30:00.000+0000'),
                User__c = u.Id,
                SLA_active__c = false));
			pfis.add(new portal_feed_item__c(
                Contact__c = cid,
                type__c = 'news',
                title__c = 'Volkswagen ID electric hatchback 2020 prices, specs and release date',
                source__c = 'https=//www.theweek.co.uk',
                text__c = 'Volkswagen has released images of its upcoming all-electric hatchback. The new vehicle is undergoing testing in South Africa ahead of its world debut next year. The hatchback, which is often referred to as the ID Neo, will become the German car giant’s … first EV to be built on its new MEB platform. It has been designed from the ground up for the firm’s upcoming range of electric models.',
                image__c = 'https=//www.theweek.co.uk/sites/theweek/files/styles/gallery_adv/public/2018/12/db2018au00936_large.jpg',
                date__c = DateTime.parse('2019-02-19T09=00=00.000+0000'),
                User__c = u.Id,
                SLA_active__c = false));
        	pfis.add(new portal_feed_item__c(
            Contact__c = cid,
              type__c = 'competitive',
              title__c = 'Waymo launches self-driving car service Waymo One',
              source__c = 'techcrunch.com',
              text__c = 'Waymo,  the former Google self-driving project owned by parent company Alphabet, is launching a commercial robotaxi service in the Phoenix area. Dubbed Waymo One, this milestone for the company and nascent self-driving technology industry comes with caveats. The Waymo One self-driving car service, and … accompanying app, won’t be available to just anyone.',
              image__c = 'https=//waymo.com/static/images/waymo_banner.jpg',
              date__c = DateTime.parse('2019-02-18T09=30=00.000+0000'),
              User__c = u.Id,
              SLA_active__c = false));
        insert pfis;
    }
        
}
}