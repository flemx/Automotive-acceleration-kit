public class dealerJsonObject {
	
	public String app_id= 'b96786eb-5abd-467a-90d7-52c45f1f62cd';
    public String[] included_segments = new String[]{'Active Users'};
	public cls_headings headings;
	public cls_contents contents;
    
    public dealerJsonObject(){
        
    }
    public dealerJsonObject(String app_id, cls_headings heading, cls_contents content){
        this.app_id = app_id;
        headings = heading;
        contents = content;
    }

	class cls_headings {
		public String en = 'Customer Activity';
	}
	class cls_contents {
		public String en = 'John Fisher requested a test drive';
	}
	public static dealerJsonObject parse(String json){
		return (dealerJsonObject) System.JSON.deserialize(json, dealerJsonObject.class);
	}

	public static void testParse() {
		String json=		'{'+
		'  "app_id": "b96786eb-5abd-467a-90d7-52c45f1f62cd",'+
		'  "included_segments": ["Active Users"],'+
		'  "headings" : {"en": "Customer Activity"},'+
		'  "contents": {"en": "John Fisher requested a test drive"}'+
		'}';
		dealerJsonObject obj = parse(json);
		System.debug(obj);
	}
}