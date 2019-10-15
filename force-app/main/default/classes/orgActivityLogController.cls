public with sharing class orgActivityLogController {
@AuraEnabled
public static Boolean fireTestEvent() {
    //get Dealer Account
    Account dealer = [SELECT Id, Name FROM Account WHERE demo_key__c = 'Account_01' LIMIT 1];
    MessageLibrary.test(dealer);
    return true;
}
}