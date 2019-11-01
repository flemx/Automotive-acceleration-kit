public with sharing class MessageLibrary {

    //just a test message
    public static void test(Account dealer) {
        general_message__e message = new general_message__e(
            main_icon__c = 'standard:person_account',
            headline__c = 'Dealer Activity',
            category_1__c = 'Dealer',
            category_2__c = 'Strategy:',
            category_3__c = 'Context:',
            icon_1__c = 'standard:person_account',
            icon_2__c = '',
            icon_3__c = '',
            message_1__c = 'matched to test drive scheduling request',
            message_2__c = 'Zip code proximity match',
            message_3__c = 'Test Drive Request Form on https://www.volkswagen.de/app/formulare/vw-de/probefahrt',
            record_id_1__c = dealer.Id,
            record_id_2__c = '',
            record_id_3__c = '',
            record_name_1__c = dealer.Name,
            record_name_2__c = '',
            record_name_3__c = '',
            image_resource_name__c = 'idbuzzconfig'
        );
        EventBus.publish(message);
    }

    // Lead created with Test Drive Request
    public static void testDriveLeadCreated(Lead l, Account dealer){
    general_message__e message = new general_message__e(
                main_icon__c = 'standard:lead',
                headline__c = 'New Lead captured',
                category_1__c = 'Lead',
                category_2__c = 'Context:',
                category_3__c = 'Assigned to:',
                icon_1__c = 'standard:lead',
                icon_3__c = 'standard:person_account',
                message_1__c = 'captured. Test drive with home pickup request. Vehicle I.D. Buzz.',
                message_2__c = 'Test Drive Request Form on https://www.volkswagen.de/app/formulare/vw-de/probefahrt',
                message_3__c = '(this lead needs to be accepted within 8 hours)',
                record_id_1__c = l.id,
                record_id_3__c = dealer.Id,
                record_name_1__c = l.Name,
                record_name_3__c = dealer.Name
            );
            EventBus.publish(message);
    }

    // Test Drive Record created
    public static void testDriveRecordCreated(Test_Drive__c td2, Contact driver){
        general_message__e message = new general_message__e(
                    main_icon__c = 'custom:custom31',
                    headline__c = 'New Test Drive Record created',
                    category_1__c = 'Test Drive',
                    category_2__c = 'Driver:',
                    icon_1__c = 'custom:custom31',
                    icon_2__c = 'standard:contact',
                    message_1__c = 'created.',
                    message_2__c = '',
                    record_id_1__c = td2.id,
                    record_id_2__c = driver.Id,
                    record_name_1__c = td2.Name,
                    record_name_2__c = driver.Name
                );
                EventBus.publish(message);
    }

    //Config created
    public static void configCreated(String config_id, Contact driver){
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
    }
    
    // Test Drive Form Messages
      //td-contact-activity	
      public static void tdContactActivity(){
            Contact driver = [SELECT Id, Name FROM Contact WHERE demo_key__c = 'Contact_02' LIMIT 1];
            general_message__e msg = new general_message__e(
                main_icon__c = 'standard:contact',
                headline__c = 'Contact Activity',
                category_1__c = 'Contact',
                category_2__c = 'Context:',
                icon_1__c = 'standard:contact',
                icon_2__c = 'standard:contact',
                message_1__c = 'logged in via VW ID',
                message_2__c = 'Test Drive Request Form on https://www.volkswagen.de/app/formulare/vw-de/probefahrt',
                record_id_1__c = driver.Id,
                record_id_2__c = '',
                record_name_1__c = driver.Name,
                record_name_2__c = ''
            );
            EventBus.publish(msg);
    	}
      //td-dealer-activity	
		public static void tdDealerActivity(){
            Account dealer = [SELECT Id, Name FROM Account WHERE Demo_Key__c = 'Account_01' LIMIT 1];
            general_message__e msg = new general_message__e(
                main_icon__c = 'standard:person_account',
                headline__c = 'Dealer Activity',
                category_1__c = 'Dealer',
                category_2__c = 'Strategy:',
                category_3__c = 'Context:',
                icon_1__c = 'standard:person_account',
                icon_2__c = 'standard:contact',
                message_1__c = 'matched to test drive scheduling request',
                message_2__c = 'Zip code proximity match',
                message_3__c = 'Test Drive Request Form on https://www.volkswagen.de/app/formulare/vw-de/probefahrt',
                record_id_1__c = dealer.Id,
                record_id_2__c = '',
                record_name_1__c = dealer.Name,
                record_name_2__c = ''
            );
            EventBus.publish(msg);
    	}
    
      //td-scheduler-request
      		public static void tdSchedulerRequest(String appointment){
            Account dealer = [SELECT Id, Name FROM Account WHERE Demo_Key__c = 'Account_01' LIMIT 1];
            general_message__e msg = new general_message__e(
                main_icon__c = 'standard:event',
                headline__c = 'Scheduler Request',
                category_1__c = 'Dealer',
                category_2__c = 'Context:',
                icon_1__c = 'standard:person_account',
                message_1__c = '- schedule request for ' + appointment + ' -  return free slots for activity \"test drive\"',
                message_2__c = 'Test Drive Request Form on https://www.volkswagen.de/app/formulare/vw-de/probefahrt',
                record_id_1__c = dealer.Id,
                record_id_2__c = '',
                record_name_1__c = dealer.Name,
                record_name_2__c = ''
            );
            EventBus.publish(msg);
    	}
     
        //just a test message
    public static void plaintest() {
        general_message__e message = new general_message__e(
            main_icon__c = 'standard:person_account',
            headline__c = 'Dealer Activity',
            category_1__c = 'Dealer',
            category_2__c = 'Strategy:',
            category_3__c = 'Context:',
            icon_1__c = 'standard:person_account',
            icon_2__c = '',
            icon_3__c = '',
            message_1__c = 'matched to test drive scheduling request',
            message_2__c = 'Zip code proximity match',
            message_3__c = 'Test Drive Request Form on https://www.volkswagen.de/app/formulare/vw-de/probefahrt',
            record_id_1__c = '',
            record_id_2__c = '',
            record_id_3__c = '',
            record_name_1__c = 'dealer.Name',
            record_name_2__c = '',
            record_name_3__c = '',
            image_resource_name__c = 'idbuzzconfig'
        );
        EventBus.publish(message);
    }

    public static void appOrder(Order o){
            //get related contact info
            Contact c = [SELECT Id, Name FROM Contact WHERE Id =:o.Contact__c LIMIT 1];
            general_message__e msg = new general_message__e(
                main_icon__c = 'standard:orders',
                headline__c = 'Order created',
                category_1__c = 'New Order',
                category_2__c = 'Customer: ',
                icon_1__c = 'standard:orders',
                message_1__c = 'received.',
                message_2__c = '',
                record_id_1__c = o.Id,
                record_id_2__c = c.Id,
                record_name_1__c = o.Name,
                record_name_2__c = c.Name
            );
            EventBus.publish(msg);
    	}



    //when user triggers interaction point in Browser
    public static void desktopInteractionPointMessage(String source){
        general_message__e msg = new general_message__e(
            headline__c = 'Browse',
            main_icon__c = 'custom:custom21',
            image_resource_name__c = '',
            category_1__c = 'Activity recorded in',
            icon_1__c = 'custom:custom21',
            record_name_1__c = 'Chrome Browser',
            record_id_1__c = '123456789012345678',
            message_1__c = 'for unknown user with',
            category_2__c = 'cookie Id',
            icon_2__c = 'custom:custom111',
            record_name_2__c = '81db4322-810a-dc9b-19b5-7cc045674746',
            record_id_2__c = '',
            message_2__c = '',
            category_3__c = 'Interaction Point',
            icon_3__c = 'standard:actions_and_buttons',
            record_name_3__c = source,
            record_id_3__c = '123456789012345678',
            message_3__c = ''
        );
        EventBus.publish(msg);
    }
    
    //when user triggers interaction point in Browser
    public static void desktopInteractionPointClickMessage(String source){
        general_message__e msg = new general_message__e(
            headline__c = 'Click',
            main_icon__c = 'standard:actions_and_buttons',
            image_resource_name__c = 'click_screenshots/' + source,
            category_1__c = 'Click recorded in',
            icon_1__c = 'custom:custom21',
            record_name_1__c = 'Chrome Browser',
            record_id_1__c = '123456789012345678',
            message_1__c = 'for unknown user with',
            category_2__c = 'cookie Id',
            icon_2__c = 'custom:custom111',
            record_name_2__c = '81db4322-810a-dc9b-19b5-7cc045674746',
            record_id_2__c = '',
            message_2__c = '',
            category_3__c = 'Interaction Point',
            icon_3__c = 'standard:actions_and_buttons',
            record_name_3__c = source,
            record_id_3__c = '123456789012345678',
            message_3__c = 'Button'
        );
        EventBus.publish(msg);
    }

    //when user triggers interaction point from mobile
    public static void mobileInteractionPointMessage(String source){
        general_message__e msg = new general_message__e(
            headline__c = 'Interaction',
            main_icon__c = 'custom:custom28',
            image_resource_name__c = '',
            category_1__c = 'Activity recorded on',
            icon_1__c = 'custom:custom28',
            record_name_1__c = 'iPhone XS',
            record_id_1__c = '123456789012345678',
            message_1__c = 'for unknown user with',
            category_2__c = 'cookie Id',
            icon_2__c = 'custom:custom111',
            record_name_2__c = '81db4322-810a-dc9b-19b5-7cc045674746',
            record_id_2__c = '',
            message_2__c = '',
            category_3__c = 'Interaction Point',
            icon_3__c = 'standard:actions_and_buttons',
            record_name_3__c = source,
            record_id_3__c = '123456789012345678',
            message_3__c = ''
        );
        EventBus.publish(msg);
    }

    //when user enters email and known and unknown get connects
    public static void matchCookieMessage(){
        //get main customer contact
        Contact customer = [SELECT Id, Name FROM Contact WHERE demo_key__c = 'Contact_02' LIMIT 1];
        general_message__e msg = new general_message__e(
            headline__c = 'Data Merge',
            main_icon__c = 'standard:branch_merge',
            image_resource_name__c = '',
            category_1__c = 'Known contact connected with unknown cookies: ',
            icon_1__c = 'standard:contact',
            record_name_1__c = customer.Name,
            record_id_1__c = customer.Id,
            message_1__c = 'has been matched to',
            category_2__c = 'cookie Id',
            icon_2__c = 'custom:custom111',
            record_name_2__c = '81db4322-810a-dc9b-19b5-7cc045674746',
            record_id_2__c = '',
            message_2__c = '',
            category_3__c = 'The contact will be updated accordingly.',
            icon_3__c = '',
            record_name_3__c = '',
            message_3__c = ''
        );
        EventBus.publish(msg);
    }
    
   	//when user is added to a journey
    public static void journeyStart(String JourneyName){
        //get customer contact
        Contact customer = [SELECT Id, Name FROM Contact WHERE demo_key__c = 'Contact_02' LIMIT 1];
        general_message__e msg = new general_message__e(
            headline__c = 'Journey start',
            main_icon__c = 'custom:custom106',
            image_resource_name__c = 'journeyStart',
            category_1__c = 'Contact',
            icon_1__c = 'standard:contact',
            record_name_1__c = customer.Name,
            record_id_1__c = customer.Id,
            message_1__c = 'has been added to a',
            category_2__c = 'Journey',
            icon_2__c = 'custom:custom106',
            record_name_2__c = JourneyName,
            record_id_2__c = '',
            message_2__c = '',
            category_3__c = '',
            icon_3__c = '',
            record_name_3__c = '',
            record_id_3__c = '',
            message_3__c = ''
        );
        EventBus.publish(msg);
    }

    //************************
    //************************
    //*** template message ***
    //************************
    //************************
    /*
    //comment
    public static void functionName(){
            general_message__e msg = new general_message__e(
                headline__c = '',
                main_icon__c = '',
                image_resource_name__c = '',
                category_1__c = '',
                icon_1__c = '',
                record_name_1__c = '',
                record_id_1__c = '',
                message_1__c = '',
                category_2__c = '',
                icon_2__c = '',
                record_name_2__c = '',
                record_id_2__c = '',
                message_2__c = '',
                category_3__c = '',
                icon_3__c = '',
                record_name_3__c = '',
                message_3__c = ''
            );
            EventBus.publish(msg);
    	}
    */

}