public with sharing class orgActivityLogController {
@AuraEnabled
public static Boolean fireTestEvent() {
    //get Dealer Account
    Account dealer = [SELECT Id, Name FROM Account WHERE demo_key__c = 'Account_01' LIMIT 1];
                
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
        record_name_3__c = ''
    );
    EventBus.publish(message);
    return true;
}
}