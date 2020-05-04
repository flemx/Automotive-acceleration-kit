public with sharing class orgActivityLogController {
@AuraEnabled
public static Boolean fireTestEvent() {
    //get Dealer Account
    Account dealer = [SELECT Id, Name FROM Account WHERE demo_key__c = 'Account_01' LIMIT 1];
    MessageLibrary.test(dealer);
    return true;
}

@AuraEnabled
public static String getVehicle(String vinId) {
    //get Dealer Account
    Asset dealer = [SELECT Id FROM Asset WHERE VIN__c = :vinId LIMIT 1];
    return dealer.Id;
}
}