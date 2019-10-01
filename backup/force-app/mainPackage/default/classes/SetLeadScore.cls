public class SetLeadScore {

    @future(callout=true)
    public static void setScore(String score, String lid){
        //create Score
                //create Score
                String leadScore = '{"BaseId" : "' + 
                    lid + 
                    '","LastModifiedTimeOnRecord" : "' + 
                    Datetime.now().format('yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'') + 
                    '","Score" : "' + 
                    score + 
                    '"}';
        		System.debug('leadScore = ' + leadScore);
                Http http = new Http();
                HttpRequest request = new HttpRequest();
                request.setEndpoint('https://ohana-cab.my.salesforce.com/services/data/v45.0/sobjects/ScoreIntelligence');
                request.setHeader('Content-Type', 'application/json; charset=UTF-8' );
        		request.setHeader('Authorization', 'Bearer '+ UserInfo.getSessionId() );
                request.setMethod('POST');
                request.setBody(leadScore);
				HttpResponse response = http.send(request);
                // If the request is successful, parse the JSON response.
                if (response.getStatusCode() == 200 || response.getStatusCode() == 201) {
                    //anything to do upon success?
                    
                } else {
                    //handle error
                    System.debug('Error posting leadScore');
                    System.debug(response.getStatusCode()+'');
                }
        		setInsight(lid);
    }
    
     public static void setReason(String lid, String FactorId){
                
                //create Lead Insight
                String ModelFactor = '{"ScoreCorrelation":0.5,"ConversionCorrelation":0.5,"Factor1":"Lead.test_drive__c","Factor2":"","SourceField1":"Lead.test_drive__c","SourceField2":"","ExternalId":"' + FactorId + '","Type":"IS_EQUAL","Value":"ModelFactorValue","Version":1}';
        		System.debug('ModelFactor = ' + ModelFactor);
                Http http = new Http();
                HttpRequest request = new HttpRequest();
                request.setEndpoint('https://ohana-cab.my.salesforce.com/services/data/v45.0/sobjects/ModelFactor');
                request.setHeader('Content-Type', 'application/json' );
        		request.setHeader('Authorization', 'Bearer '+ UserInfo.getSessionId() );
                request.setMethod('POST');
                request.setBody(ModelFactor);
				HttpResponse response = http.send(request);
                // If the request is successful, parse the JSON response.
                if (response.getStatusCode() == 200 || response.getStatusCode() == 201) {
                    //if inserting the factor worked, insert the insight
                    
                } else {
                    //handle error
                    System.debug('Error posting ModelFactor');
                    System.debug(response.getStatusCode()+'');
                    System.debug(response.getBody() +'');
                }
         		
    }
    
     public static void setInsight(String lid){
         		//create FactorId
                String FactorId = generateRandomId();
                //create Lead Insight
                String leadInsight = '{"Intensity":1,"IntensityLevel":"HIGH_POS","ExtractionTime":"'+ 
                    Datetime.now().format('yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'') +
                    '","ModelFactor":"' + FactorId +
                    '","ParentId":"' + lid +
                    '","ExternalId":"' + FactorId +'_' + lid + 
                    '","Value":"true","LastModifiedTimeOnRecord":"' + Datetime.now().format('yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'') + 
                    '"}';
        		System.debug('leadInsight = ' + leadInsight);
                Http http = new Http();
                HttpRequest request = new HttpRequest();
                request.setEndpoint('https://ohana-cab.my.salesforce.com/services/data/v45.0/sobjects/LeadInsight');
                request.setHeader('Content-Type', 'application/json; charset=UTF-8' );
        		request.setHeader('Authorization', 'Bearer '+ UserInfo.getSessionId() );
                request.setMethod('POST');
                request.setBody(leadInsight);
				HttpResponse response = http.send(request);
                // If the request is successful, parse the JSON response.
                if (response.getStatusCode() == 200) {
                    //anything to do upon success?
                } else {
                    //handle error
                    System.debug('Error posting leadInsight');
                    System.debug(response.getStatusCode()+'');
                }
         		setReason(lid, FactorId);
    }
    
    public static String generateRandomId() {
    String template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    final String chars = '0123456789abcdef';
    String randStr = '';
        while(randStr.length()<template.length()){
            	Integer i = randStr.length();
                if(template.substring(i,i+1) == 'x'){
                    Integer idx = Math.mod(Math.abs(Crypto.getRandomInteger()), chars.length());
                    randStr += chars.substring(idx, idx+1);
                } else {
                    randStr += template.substring(i,i+1);
                }
        
                        
        
            }

    return randStr; 
}
}