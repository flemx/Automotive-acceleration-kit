trigger WorkOrderEnhancements on WorkOrder (before insert, after update) {
    if(Trigger.isBefore && Trigger.isInsert ){
        for(WorkOrder wo : Trigger.New){
        if(wo.Subject == 'Tire Change'){
            Asset a = [SELECT Id FROM Asset WHERE demo_key__c = 'asset_01'];
            wo.Status = 'Assigned';
            //wo.AR_Position__c = 'Wheel Front Left';
            wo.AssetId = a.Id;
        }
    }
    }
    if(Trigger.isAfter && Trigger.isUpdate ){
        
        
        //set asset back to operational state again
        for(WorkOrder wo : Trigger.new){
            //get old WorkOrder
            WorkOrder oldWo = Trigger.oldMap.get(wo.Id);
            //check if status field has changed
            System.debug('old WO status = ' + oldWo.Status);
            System.debug('new WO status = ' + wo.Status);
            if(oldWo.Status != wo.Status){
                //check if status is completed
                if(wo.Status == 'Completed'){
                    Asset a = [SELECT Id, operational__c FROM Asset WHERE Id = :wo.AssetId ];
                    a.operational__c = true;
                    update a;
                    //create success message
                    //MessageLibrary.workOrderDone(wo.WorkOrderNumber);
                    //send email to John
                    //get john record
                    //get Driver Contact
                    Contact driver = [SELECT Id, Name, email FROM Contact WHERE demo_key__c = 'Contact_02' LIMIT 1];
                    //
                    // Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
                    //    message.setTargetObjectId(driver.id); 
                    //    message.setSenderDisplayName('SDO'); 
                    //    message.setReplyTo('sdo@salesforce.com');
                    //    message.setUseSignature(false); 
                    //    message.setBccSender(false); 
                    //    message.setSaveAsActivity(false); 
                    //   EmailTemplate emailTemplate = [Select Id,Subject,Description,HtmlValue,DeveloperName,Body from EmailTemplate where Id = '00X3X0000035i1sUAA'];
                    //   message.setTemplateID(emailTemplate.Id); 
                    //   message.setWhatId(wo.Id); //This is important for the merge fields in template to work
                    //   message.toAddresses = new String[] { driver.email};
                    //   Messaging.SingleEmailMessage[] messages = new List<Messaging.SingleEmailMessage> {message};
                    //   Messaging.SendEmailResult[] results = Messaging.sendEmail(messages);
                     
                    //  if (results[0].success) 
                    //  {
                    //    System.debug('The email was sent successfully.');
                    //  } else {
                    //    System.debug('The email failed to send: ' +  results[0].errors[0].message);
                    //  }
                        
                }
            }

        }
    }
    
}