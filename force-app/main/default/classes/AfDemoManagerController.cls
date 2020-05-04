public  class AfDemoManagerController {
    
    @AuraEnabled
    public static boolean triggerIot(String vinValue, Integer iotValue){
        try{
            Autoforce_vehicle__e iot = new Autoforce_vehicle__e(
                deviceId__c = vinValue,
                air_pressure__c = iotValue,
                ts__c = Datetime.now()
            );
            EventBus.publish(iot);
            System.debug(iot);
            return true;
        }catch(Exception e){
            System.debug(e.getMessage());
            return false;
        }
    }
}
