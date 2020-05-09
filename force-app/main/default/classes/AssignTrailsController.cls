public with sharing class AssignTrailsController {
    public string query{get; set;}
 
	/* To determine the records to perform the bulk action on, extract the SAQL query */
    public PageReference init() {
        query = ApexPages.currentPage().getParameters().get('query');
        return null;
    }
    @RemoteAction
    public static Boolean assign(Integer ListSize){
        Boolean rv = false;
        MessageLibrary.assignTrails(ListSize);
        //get Config
        // demo_setting__c demoSetting = [SELECT dealer_name__c, dealer_email__c FROM demo_setting__c WHERE demo_key__c = 'masterSetting' LIMIT 1];
        //get Dealer Contact
        Contact dealer = [SELECT Id, Name, Account.Name FROM Contact WHERE demo_key__c = 'Contact_01' LIMIT 1];
        //get Dealer User
        // Id dealerUser_id = [SELECT Id FROM User WHERE UserName = :demoSetting.dealer_name__c LIMIT 1].Id;
        Id dealerUser_id = UserInfo.getUserId();        
        //create Dealer Trail Assignment message
        Datetime d = DateTime.now();
                //create dealer message (portal feed item)
                portal_feed_item__c pfi = new portal_feed_item__c(
                    action_no__c = 'Decline',
                    action_yes__c = 'Launch Trail',
                    category_1__c = 'Trail',
                    Contact__c = dealer.Id,
                    date__c = Datetime.now(),
                    icon_1__c = 'standard:trailhead',
                    icon_2__c = '',
                    icon_3__c = '',
                    message_1__c = 'has been assigned to you.',
                    message_2__c = 'you have 2 weeks to complete this assignment.',
                    record_id_1__c = dealer.Id,
                    record_name_1__c = 'Become a Functions on Demand Rockstar',
                    record_name_2__c = '',
                    record_name_3__c = '',
                    SLA_active__c = true,
                    SLA_in_minutes__c = 24*60*14,
                    title__c = 'New mandatory Trail Assignment',
                    type__c = 'action required',
                    User__c = dealerUser_id
                );
                insert pfi;
        rv = true;
        return rv;
    }
}