#!/bin/bash

sfdx force:mdapi:deploy -w 5 -d mdapi/autoDashboard
sfdx shane:analytics:dataset:upload -n demo_data_df_testdrives --async -f data/analytics/demo_data_df_testdrives.csv -a DF19_Demo -m data/analytics/demo_data_df_testdrives.json
sfdx shane:analytics:dataset:upload -n demo_data_df_preped --async -f data/analytics/DemoDataDFPreped.csv -a DF19_Demo -m data/analytics/DemoDataDFPreped.json 
sfdx shane:analytics:dataset:upload -n demo_data_df_service --async -f data/analytics/demo_data_df_service.csv -a DF19_Demo -m data/analytics/demo_data_df_service.json 
sfdx shane:analytics:dataset:upload -n demo_data_df_trails --async -f data/analytics/demo_data_df_trails.csv -a DF19_Demo -m data/analytics/demo_data_df_trails.json 

sfdx force:source:deploy -p force-app/

sfdx force:apex:execute -f data/scripts/setPermissionSet.txt
sfdx force:apex:execute -f data/scripts/setDemosetting.txt
sfdx force:data:tree:import -p data/sfdx-out/John-Plan.json 
sfdx force:apex:execute -f data/scripts/setRoleCall.txt
sfdx force:apex:execute -f data/scripts/setContactOwner.txt

sfdx force:mdapi:deploy -w 5 -d mdapi/LeadDuplicate

sfdx force:apex:execute -f data/scripts/sendEmail.txt
sfdx force:org:open