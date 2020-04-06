public class TireBlowHandler {


    public static void triggerService(String assetId){
        Asset a = [SELECT Id, ContactId, operational__c FROM Asset WHERE Id = :assetId LIMIT 1];

            //check if the vehicle was operational. If it was, go ahead
            if(a.operational__c){
                //set operational trigger to false, so that multiple events will still create only one service appointment
                a.operational__c = false;
                update a;
                //get related Contact
                Contact c = [SELECT Id FROM Contact WHERE Id = :a.ContactId LIMIT 1];
                Map<String, Object> params = new Map<String, Object>();
                params.put('strWTName', 'Tire Change');
                params.put('objContactIN', c);
                Flow.Interview.AF_Rider_Create_SA saFlow = new Flow.Interview.AF_Rider_Create_SA(params);
                saFlow.start();
                //get Service Technician (TODO remove hard coded name reference)
                ServiceResource sr = [SELECT Id, Name FROM ServiceResource WHERE Name = 'Jerome Castan' LIMIT 1];
                //get Service Appointment
                ServiceAppointment saSource = (ServiceAppointment)saFlow.getVariableValue('objSA');
                ServiceAppointment sa = [SELECT Id, Duration FROM ServiceAppointment WHERE Id = :saSource.Id LIMIT 1];
                sa.SchedStartTime = DateTime.now().addMinutes(120);
                sa.SchedEndTime = sa.SchedStartTime.addMinutes((Integer)sa.Duration);
                System.debug('SA.ID = ' + sa.Id);
                System.debug('SchedStartTime = ' + sa.SchedStartTime);
                update sa;
                AssignedResource ar = new AssignedResource(
                   ServiceAppointmentId = sa.Id,
                   ServiceResourceId = sr.Id
                );
                Insert ar;
                //create case
                BusinessHours bh = [select id from businesshours where IsDefault=true];
                Case newCase = new Case( Subject = 'Tire Issue detected',
                                       Description = 'IOT Sensor detected a flat tire. Tire needs to be changed. Initiating WorkOrder for field service technician.',
                                       ContactId = c.Id,
                                       BusinessHoursId = bh.Id);
                insert newCase;
                //send messages
                // MessageLibrary.issueDetected();
                // MessageLibrary.customerPushNotification('We have detected an issue with your vehicle: flat tire front left.');
                // MessageLibrary.caseCreated(newCase.Id);
                // MessageLibrary.issueSolved();
                // MessageLibrary.customerPushNotification('Always Mobile Solution: we have reserved a we share 2 minutes away. Start navigation now.');            
            }

    }
}
