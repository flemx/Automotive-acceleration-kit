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
}