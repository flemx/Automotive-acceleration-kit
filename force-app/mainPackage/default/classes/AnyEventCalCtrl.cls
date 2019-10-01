public class AnyEventCalCtrl {
    @AuraEnabled
    public static Test_Drive__c  saveVehicle(String vid,String td){
        Test_Drive__c  tdrec=[Select Name,assigned_Vehicle__c  from Test_Drive__c  where Id=:td];
        tdrec.assigned_Vehicle__c =vid;
        update tdrec;
        System.debug('tdrec'+tdrec);
        return tdrec;
    } 
    
   @AuraEnabled
    public static Contact getCon(String cid){
        Contact con=[Select Id,Name,FirstName,LastName,MailingStreet,MailingCity,MailingState,MailingCountry,MailingPostalCode from Contact where Id=:cid];
        return con;
    }
    @AuraEnabled
    public static List<EventObj> searchevnts(String a){
        System.debug('hello');
        List<EventObj> eventRecords = new List<EventObj>();
        List<Event> events=[SELECT Id, Subject,StartDateTime,EndDateTime,Description,OwnerId,AccountId,WhoId from Event  WHERE   AccountId =:a];
        List<WorkOrder> woList=[Select Id, EndDate , StartDate , OwnerId, Status ,Subject , Description ,AccountId from WorkOrder where  AccountId =:a];
        for (Event e : events) {
            EventObj newEv = new EventObj(e.Id,e.Subject,e.StartDateTime,e.EndDateTime,
                                          e.Description,
                                          e.OwnerId,
                                          String.valueOf(e.get('WhoId')),
                                          'EventClass'
                                         );
            eventRecords.add(newEv);
        }
        for (WorkOrder wo : woList){
            if(wo.Status=='New'){
                EventObj newEv = new EventObj(wo.Id,
                                              String.valueOf(wo.Subject),
                                              DateTime.valueOf(wo.StartDate),
                                              DateTime.valueOf(wo.EndDate),
                                              String.valueOf(wo.Description),
                                              String.valueOf(wo.OwnerId),
                                              '',
                                              'WOClassNew'
                                             );
                eventRecords.add(newEv);
            }
            else if(wo.Status=='Scheduled' || wo.Status=='Completed'){
                EventObj newEv = new EventObj(wo.Id,
                                              String.valueOf(wo.Subject),
                                              DateTime.valueOf(wo.StartDate),
                                              DateTime.valueOf(wo.EndDate),
                                              String.valueOf(wo.Description),
                                              String.valueOf(wo.OwnerId),
                                              '',
                                              'WOClassDone'
                                             );
                eventRecords.add(newEv);
            }
            else{
                EventObj newEv = new EventObj(wo.Id,
                                              String.valueOf(wo.Subject),
                                              DateTime.valueOf(wo.StartDate),
                                              DateTime.valueOf(wo.EndDate),
                                              String.valueOf(wo.Description),
                                              String.valueOf(wo.OwnerId),
                                              '',
                                              'WOClass'
                                             );
                eventRecords.add(newEv);
            }
    }
        System.debug('accs::'+eventRecords);
        return eventRecords; 
    }
    @AuraEnabled
    public static List<EventObj> getEvents(String sObjectName, String titleField, String startDateTimeField, String endDateTimeField, String descriptionField, String userField, Boolean filterByUserField){
        /*String q = 'SELECT Id,' + 
            titleField + ',' + 
            startDateTimeField + ',' +
            endDateTimeField + ',' +
            descriptionField + ',' +
            userField + ' FROM ' + 
            sObjectName + ' WHERE ' + 
            userField + ' = \'' + UserInfo.getUserId() + '\'';
        if (!filterByUserField) {
            q = 'SELECT Id,' + 
                titleField + ',' + 
                startDateTimeField + ',' +
                endDateTimeField + ',' +
                descriptionField + ',' +
                userField + ' FROM ' + 
                sObjectName;
        } */
       String  q = 'SELECT Id,' + 
                titleField + ',' + 
                startDateTimeField + ',' +
                endDateTimeField + ',' +
                descriptionField + ',' +
                'WhoId,'+
                userField + ' FROM ' + 
                sObjectName;
        
        List<sObject> sObjectList = Database.query(q);
        List<EventObj> eventRecords = new List<EventObj>();
        List<Test_Drive__c> woList=[Select Id, Name, Date__c,Driver__r.Name, OwnerId,Status__c, Dealer__c, Driver__c,Dealer__r.Name   from Test_Drive__c where OwnerId=: UserInfo.getUserId()];
        for (sObject obj : sObjectList) {
            EventObj newEv = new EventObj(obj.Id,
                                          String.valueOf(obj.get(titleField)),
                                          DateTime.valueOf(obj.get(startDateTimeField)),
                                          DateTime.valueOf(obj.get(endDateTimeField)),
                                          String.valueOf(obj.get(descriptionField)),
                                          String.valueOf(obj.get(userField)),
                                          String.valueOf(obj.get('WhoId')),
                                          'EventClass'
                                         );
            eventRecords.add(newEv);
        }
        for (Test_Drive__c wo : woList){
            if(wo.Status__c=='New'){
                EventObj newEv = new EventObj(wo.Id,
                                              String.valueOf(wo.Driver__r.Name),
                                              DateTime.valueOf(wo.Date__c),
                                              DateTime.valueOf(wo.Date__c).addHours(1),
                                              String.valueOf(wo.Driver__c),
                                              String.valueOf(wo.OwnerId),
                                              String.valueOf(wo.Dealer__c),
                                              'WOClassNew'
                                             );
                eventRecords.add(newEv);
            }
            else if(wo.Status__c=='Scheduled' || wo.Status__c=='Completed'){
                EventObj newEv = new EventObj(wo.Id,
                                              String.valueOf(wo.Driver__r.Name),
                                              DateTime.valueOf(wo.Date__c),
                                              DateTime.valueOf(wo.Date__c).addHours(1) ,
                                              String.valueOf(wo.Driver__c),
                                              String.valueOf(wo.OwnerId),
                                              String.valueOf(wo.Dealer__c),
                                              'WOClassDone'
                                             );
                eventRecords.add(newEv);
            }
            else{
                EventObj newEv = new EventObj(wo.Id,
                                              String.valueOf(wo.Name),
                                              DateTime.valueOf(wo.Date__c),
                                              DateTime.valueOf(wo.Date__c),
                                              String.valueOf(wo.Name),
                                              String.valueOf(wo.OwnerId),
                                              String.valueOf(wo.Dealer__c),
                                              'WOClass'
                                             );
                eventRecords.add(newEv);
            }
        }
        return eventRecords;
    }
    @AuraEnabled
    public static EventObj upsertEvents(String sEventObj, String sObjectName, String titleField, String startDateTimeField, String endDateTimeField, String descriptionField, String userField){
        EventObj upsertingEvent = (EventObj)JSON.deserialize(sEventObj, EventObj.class);
        System.debug('sEventObj: '+sEventObj); 
        Event newRecord = new Event(); 
        if (upsertingEvent.Id != null){
            newRecord.put('Id',upsertingEvent.Id);
        }
        newRecord.put('Subject' , upsertingEvent.title);
        newRecord.put('StartDateTime' , upsertingEvent.startDateTime);
        newRecord.put('EndDateTime', upsertingEvent.endDateTime);
        newRecord.put('Description', upsertingEvent.description);
        try {
            upsert newRecord;
            EventObj newEv = new EventObj(newRecord.Id,
                                          String.valueOf(newRecord.get('Subject')),
                                          DateTime.valueOf(newRecord.get('StartDateTime')),
                                          DateTime.valueOf(newRecord.get('EndDateTime')),
                                          String.valueOf(newRecord.get('Description')),
                                          String.valueOf(newRecord.get('OwnerId')),
                                          String.valueOf(newRecord.get('WhoId')),
                                          'EventClass'
                                         );
            return newEv;
        } catch (Exception e) {
            System.debug(e.getMessage());
            return null;
        }
        
    }
    @AuraEnabled
    public static String deleteEvent(String eventId, String sObjectName, String titleField, String startDateTimeField, String endDateTimeField, String descriptionField, String userField){
        String q = 'SELECT Id,' + 
            titleField + ',' + 
            startDateTimeField + ',' +
            endDateTimeField + ',' +
            descriptionField + ',' +
            userField + ' FROM ' + 
            sObjectName + ' WHERE Id = \'' + eventId  + '\'';
        System.debug('q: '+q);
        List<sObject> sObjectList = Database.query(q);
        try {
            delete sObjectList;
            return eventId;
        } catch (Exception e) {
            System.debug(e.getMessage());
            return null;
        }
        
    }
    public class EventObj {
        @AuraEnabled
        public String Id {get;set;}
        @AuraEnabled
        public String title {get;set;}
        @AuraEnabled
        public DateTime startDateTime {get;set;}
        @AuraEnabled
        public DateTime endDateTime {get;set;}
        @AuraEnabled
        public String description {get;set;}
        @AuraEnabled
        public String owner {get;set;}
        @AuraEnabled
        public String className {get;set;}
         @AuraEnabled
        public String WhoId {get;set;}
        
        public EventObj(String i,String t, DateTime s, DateTime e, String d, String o,String w,String c){
            this.Id = i;
            this.title = t;
            this.startDateTime = s;
            this.endDateTime = e;
            this.description = d;
            this.owner = o;
            this.className=c;
            this.WhoId=w;
        }
    }
}