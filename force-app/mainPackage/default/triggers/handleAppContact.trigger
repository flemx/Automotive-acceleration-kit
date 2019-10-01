trigger handleAppContact on Contact (before insert) {
for (Contact c : Trigger.New) {
    if(c.AccountId == null) {
        Account a = new Account();
        a.name = c.Lastname;
        insert a;
        c.AccountId = a.Id;
        c.Cust360_LTV__c = 0;
        c.Cust360_CSAT__c = 99;
        c.Cust360_ChurnRisk__c = 50;
        c.Cust360_Loyalty__c = 'Bronze';
    }
}
}