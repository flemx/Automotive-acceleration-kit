trigger weOrderTrigger on Order (before insert, after insert) {
    if(Trigger.isBefore){
        List<Order> ol = Trigger.new;
    for(Order o : ol){
        if(o.Name == 'I.D. Buzz' || o.Name == 'always mobile package'){
            //get demo customer contact
            Contact c = [SELECT Id, Cust360_LTV__c, Account.Id FROM Contact WHERE demo_key__c = 'Contact_02'];
            //set contact and account on order
            o.AccountId = c.Account.Id;
            o.Contact__c = c.Id;

            //adjust customer lifetime values
            if(o.Name == 'I.D. Buzz'){
            c.Cust360_LTV__c = c.Cust360_LTV__c + 68190;
            }
            if(o.Name == 'always mobile package'){
            c.Cust360_LTV__c = c.Cust360_LTV__c + 228;  
            }
            update c;


        }
    }
    }
    if(Trigger.isAfter){
        //send messages
        for(Order o : Trigger.new){
            MessageLibrary.appOrder(o);
            if(o.Name == 'I.D. Buzz'){
                MessageLibrary.journeyStart('I.D. Buzz Purchase Journey');
            }
        }
    }
}