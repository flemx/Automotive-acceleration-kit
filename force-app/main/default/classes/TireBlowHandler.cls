public class TireBlowHandler {

	@InvocableMethod
    public static void triggerService(List<String> assetIds){
        //List<String> assetIds = new List<String>();
        //assetIds.add('WVWZZZ1JZ3W140003');
        List<Asset> assets = [SELECT Id, ContactId, operational__c FROM Asset WHERE VIN__c in :assetIds ];

        for(Asset a : assets){
            //check if the vehicle was operational. If it was, go ahead
            if(a.operational__c){
                //set operational trigger to false, so that multiple events will still create only one service appointment
                //a.operational__c = false;
                //update a;
                //get related Contact
                //Contact c = [SELECT Id FROM Contact WHERE Id = :a.ContactId LIMIT 1];
                // Map<String, Object> params = new Map<String, Object>();
                // params.put('strWTName', 'Break-Fix');
                // params.put('contactRecordId', a.ContactId);
                // Flow.Interview.AF_Rider_Create_SA saFlow = new Flow.Interview.AF_Rider_Create_SA(params);
                // saFlow.start();
                // //get Service Technician (TODO remove hard coded name reference)
                // ServiceResource sr = [SELECT Id, Name FROM ServiceResource WHERE Name = 'Andy James' LIMIT 1];
                // //get Service Appointment
                // String saSource = (String)saFlow.getVariableValue('objSARecordId');
                // ServiceAppointment sa = [SELECT Id, Duration, SchedStartTime, SchedEndTime FROM ServiceAppointment WHERE Id = :saSource LIMIT 1];
                // sa.SchedStartTime = DateTime.now().addMinutes(120);
                // sa.SchedEndTime = sa.SchedStartTime.addMinutes((Integer)sa.Duration);
                // System.debug('SA.ID = ' + sa.Id);
                // System.debug('SchedStartTime = ' + sa.SchedStartTime);
                // update sa;
                // AssignedResource ar = new AssignedResource(
                //    ServiceAppointmentId = sa.Id,
                //    ServiceResourceId = sr.Id
                // );
                // Insert ar;
                //create case
                BusinessHours bh = [select id from businesshours where IsDefault=true];
                Case newCase = new Case( Subject = 'Tire Issue detected',
                                       Description = 'IOT Sensor detected a flat tire. Tire needs to be changed. Initiating WorkOrder for field service technician.',
                                       ContactId = a.ContactId,
                                       AssetId = a.Id,
                                       BusinessHoursId = bh.Id);
                insert newCase;
                
                //send messages
                MessageLibrary.issueDetected();
                MessageLibrary.customerPushNotification('We have detected an issue with your vehicle: flat tire front left.');
                MessageLibrary.caseCreated(newCase.Id);
            }
        }
       

    }
}