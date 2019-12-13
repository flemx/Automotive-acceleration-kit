public class DealerPortalTriggerPush {

    @future(callout=true)
    public static void sendNotification(String appId, String  heading, String content){
        
        /**   EXAMPLE
         * String jsonBody = '{"app_id": "b96786eb-5abd-467a-90d7-52c45f1f62cd", '+
             '"included_segments": ["Active Users"],' +
 			 '"headings" : {"en": "Customer Activity"},' +
				'"contents": {"en": "John Fisher requested a test drive"}}';
		*/
      
        String jsonBody = '{"app_id": "'+ appId +'", '+
             '"included_segments": ["Active Users"],' +
 			 '"headings" : {"en": "'+ heading +'"},' +
				'"contents": {"en": "'+ content +'"}}';
        System.debug('jsonMaterials'+dealerJsonObject.parse(jsonBody));
        
        String endpoint = 'https://onesignal.com/api/v1/notifications';
        HttpRequest req = new HttpRequest();
        req.setEndpoint(endpoint);
        req.setMethod('POST');
       	req.setbody(JSON.serialize(dealerJsonObject.parse(jsonBody)));
        req.setHeader('Content-Type', 'application/json');
        req.setHeader('Authorization', 'Basic ZjBiODQ0YjMtYmQ3Zi00M2UzLTk2NTAtMGM3OGFkOTNjNmI3');
        Http http = new Http();
        HTTPResponse response = http.send(req); 
		System.debug(response.getBody());
    }
    

   
}