public class DemoUtils {
    
    public static void createDemoSetting(){
        User u = [select Id, username, Email from User where Id = :UserInfo.getUserId()][0];
        demo_setting__c setting = new demo_setting__c(
        	dealer_name__c = 'daniel-' + u.username,
            dealer_email__c = u.Email,
            Name = 'Initial Demo Setting',
            demo_key__c = 'masterSetting'
        );
 		insert setting;
    }



    public static void setPermSet(){
        PermissionSet ps = [SELECT Id FROM PermissionSet WHERE Name = 'autoforce_demo_pack'];
        List<PermissionSetAssignment> psas = new List<PermissionSetAssignment>();
        for (Id uid: new List<Id>{UserInfo.getUserId()}) {
            psas.add(new PermissionSetAssignment(AssigneeId = uid, PermissionSetId = ps.Id));
        }
        insert psas;
    }

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

    public static void createServiceUser(){
        
    }

    
    public static void createDealerPortalUser(){
        //if dealer account has been inserted, create related user and objects
        Contact c = [SELECT Id, FirstName, LastName, AccountId, Email FROM Contact WHERE demo_key__c = 'Contact_01' LIMIT 1];
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
        Id psid = [SELECT Id FROM PermissionSet WHERE Name='autoforce_demo_pack' LIMIT 1].Id;
        PermissionSetAssignment psa = new PermissionSetAssignment(
        	AssigneeId=u.Id,
        	PermissionSetId=psid);
        try{insert psa;} catch(Exception e){System.debug('Error assigning Permset to new Portal user. ');
                                         System.debug('Error Details > ' + e.getMessage());}
        
        // c.OwnerId = u.Id;
        // update c;

        createAdditionalUserData(cid, u.Id);
        
    }

    public static void setContactOwner(){
        Contact c = [SELECT Id, FirstName, LastName, AccountId, Email FROM Contact WHERE demo_key__c = 'Contact_02' LIMIT 1];
        demo_setting__c config = [SELECT dealer_name__c, dealer_email__c FROM demo_setting__c WHERE demo_key__c='masterSetting' LIMIT 1];
        System.debug(config.dealer_name__c);
        System.debug([SELECT Id FROM User where Username = :config.dealer_name__c LIMIT 1]);
        User dealer = [SELECT Id FROM User where Username = :config.dealer_name__c LIMIT 1];
        c.OwnerId = dealer.Id;
        update c;
    }


    
    public static void triggerTestdrive(Contact con, String testDay){
        Lead testDrive = new Lead(
        	Salutation = con.Salutation,
            FirstName = con.FirstName,
            LastName = con.LastName,
            Email = con.Email,
            Company = con.LastName + ' household',
            Phone = con.Phone,
            Street = con.MailingStreet,
            PostalCode = con.MailingPostalCode,
            City = con.MailingCity,
            Leadsource = 'Website',
            td_date_requested__c = Datetime.valueOf(testDay),
            test_drive__c = true
        );
        
        insert testDrive;
    }


    /**
     * Send email with installation statistics
     */
    public static void sendInstallationEmail(){
        String orgId = UserInfo.getOrganizationId();
        String userName = UserInfo.getUserName();
        //DateTime getDate = Date.Now();
        String installDate = DateTime.Now().format('YYYY-MM-dd');
        Messaging.reserveSingleEmailCapacity(2);
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        String[] toAddresses = new String[] {'dfleminks@salesforce.com'}; 
        // Assign the addresses for the To and CC lists to the mail object.
        mail.setToAddresses(toAddresses);
        mail.setReplyTo('autoforce@fleminks.com');
        // Specify the name used as the display name.
        mail.setSenderDisplayName('autoforce analytics');
        // Specify the subject line for your email address.
        mail.setSubject('New autoforce installation; ' + userName + ',' + orgId + ',' +  installDate);
        mail.setBccSender(false);
        // Specify the text content of the email.
        mail.setPlainTextBody('');
        // Send the email you have created.
        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
    }
    
    
    
    @future
    public static void createAdditionalUserData(String cid, String uid){
        
        
        //create Dealer Portal Feed Items
        List<portal_feed_item__c> pfis = new List<portal_feed_item__c>();
        	pfis.add(new portal_feed_item__c(
                Contact__c = cid,
                type__c = 'announcement',
                title__c = 'Automotive Minute: electron motors redesigns the locomotive',
                source__c = 'Salesforce',
                sourceArticle__c = 'https://salesforce.com',
                text__c = 'electron motors is taking the notion of being a comfortable commuter car a step further with a bold redesign that borrows from the recent refresh of the Sonata.',
                image__c = 'https://i.imgur.com/xYQsjNE.png',
                date__c = Datetime.Now(),
                User__c = uid,
                SLA_active__c = false));
			pfis.add(new portal_feed_item__c(
                Contact__c = cid,
                type__c = 'news',
                title__c = 'Motors b.v ID electric hatchback prices, specs and release date',
                source__c = 'The Week',
                sourceArticle__c = 'https://theweek.co.uk',
                text__c = 'Motors b.v has released images of its upcoming all-electric hatchback. The new vehicle is undergoing testing in South Africa ahead of its world debut next year. The hatchback, which is often referred to as the ID Neo, will become the German car giant’s … first EV to be built on its new MEB platform. It has been designed from the ground up for the firm’s upcoming range of electric models.',
                image__c = 'https://i.imgur.com/OCey8bv.jpg',
                date__c = Datetime.Now(),
                User__c = uid,
                SLA_active__c = false));
        	pfis.add(new portal_feed_item__c(
            Contact__c = cid,
              type__c = 'competitive',
              title__c = 'Yowamo launches self-driving car service Yowamo One',
              source__c = 'Techcrunch',
              sourceArticle__c = 'https://techcrunch.com',
              text__c = 'Yowamo,  the former Google self-driving project owned by parent company Alphabet, is launching a commercial robotaxi service in the Phoenix area. Dubbed Yowamo One, this milestone for the company and nascent self-driving technology industry comes with caveats. The Yowamo One self-driving car service, and … accompanying app, won’t be available to just anyone.',
              image__c = 'https://i.imgur.com/fchs8D8.jpg',
              date__c = Datetime.Now(),
              User__c = uid,
              SLA_active__c = false));
        insert pfis;
    }
}