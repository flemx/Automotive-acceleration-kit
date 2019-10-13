public class DemoUtils {

    public static void createRole() {
        //assign role to running user
        UserRole ceoRole = new UserRole(Name = 'Demo');
        Insert ceoRole;
    }
    
    public static void assignRole(){
        User runningUser = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
        UserRole ceoRole = [SELECT Id FROM UserRole WHERE Name = 'Demo' LIMIT 1];
        runningUser.UserRoleId = ceoRole.Id;
        update runningUser;
    }
    
    public static void createDealerPortalUser(){
        //if dealer account has been inserted, create related user and objects
        Contact c = [SELECT Id, FirstName, LastName, AccountId FROM Contact WHERE demo_key__c = 'Contact_01' LIMIT 1];
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
        try{insert psa;} catch(Exception e){System.debug('Error assigning Permset to new Portal user. ');
                                         System.debug('Error Details > ' + e.getMessage());}
        
        
        createAdditionalUserData(cid, u.Id);

    }
    @future
    public static void createAdditionalUserData(String cid, String uid){
        
        
        //create Dealer Portal Feed Items
        List<portal_feed_item__c> pfis = new List<portal_feed_item__c>();
        	pfis.add(new portal_feed_item__c(
                Contact__c = cid,
                type__c = 'announcement',
                title__c = 'Volkswagen presents the Dealer of Tomorrow',
                source__c = 'https://www.volklswagen-newsroom.com',
                text__c = 'Volkswagen is making its sales organization fit for the future. The brand is to fundementally realign its sales model together with its dealers. The new sales model is to be launched in Europe in April 2020. Today in Berlin, Volkswagen and the Eurpoean dealer Council presented their vision for the future world of...',
                image__c = 'https://427dp63llx7zmfivh1tezitj-wpengine.netdna-ssl.com/wp-content/uploads/2018/10/VW-dealer.jpg',
                date__c = Datetime.newInstance(2019, 2, 20, 7, 30, 2),
                User__c = uid,
                SLA_active__c = false));
			pfis.add(new portal_feed_item__c(
                Contact__c = cid,
                type__c = 'news',
                title__c = 'Volkswagen ID electric hatchback 2020 prices, specs and release date',
                source__c = 'https=//www.theweek.co.uk',
                text__c = 'Volkswagen has released images of its upcoming all-electric hatchback. The new vehicle is undergoing testing in South Africa ahead of its world debut next year. The hatchback, which is often referred to as the ID Neo, will become the German car giant’s … first EV to be built on its new MEB platform. It has been designed from the ground up for the firm’s upcoming range of electric models.',
                image__c = 'https=//www.theweek.co.uk/sites/theweek/files/styles/gallery_adv/public/2018/12/db2018au00936_large.jpg',
                date__c = Datetime.newInstance(2019, 2, 20, 9, 30, 2),
                User__c = uid,
                SLA_active__c = false));
        	pfis.add(new portal_feed_item__c(
            Contact__c = cid,
              type__c = 'competitive',
              title__c = 'Waymo launches self-driving car service Waymo One',
              source__c = 'techcrunch.com',
              text__c = 'Waymo,  the former Google self-driving project owned by parent company Alphabet, is launching a commercial robotaxi service in the Phoenix area. Dubbed Waymo One, this milestone for the company and nascent self-driving technology industry comes with caveats. The Waymo One self-driving car service, and … accompanying app, won’t be available to just anyone.',
              image__c = 'https=//waymo.com/static/images/waymo_banner.jpg',
              date__c = Datetime.newInstance(2019, 2, 18, 9, 30, 2),
              User__c = uid,
              SLA_active__c = false));
        insert pfis;
    }
}