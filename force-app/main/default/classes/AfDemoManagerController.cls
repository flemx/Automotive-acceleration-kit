public  class AfDemoManagerController {
    
    @AuraEnabled
    public static boolean triggerIot(){
        System.debug('It works');
        return true;
    }
}
