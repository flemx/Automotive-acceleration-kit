sfdx force:mdapi:deploy -d mdapi/autoDashboard
sfdx shane:analytics:dataset:upload -n demo_data_df_raw -f data/analytics/demo_data_df_raw.csv
sfdx shane:analytics:dataflow:start -n DF_Data_Prep
sfdx shane:analytics:dataset:upload -n Demo_Data_DF_Preped -f data/analytics/DemoDataDFPreped.csv
sfdx shane:analytics:dataset:upload -n demo_data_df_service -f data/analytics/demo_data_df_service.csv
sfdx shane:analytics:dataset:upload -n demo_data_df_trails -f data/analytics/demo_data_df_trails.csv

sfdx force:source:deploy -p force-app/
sfdx force:user:permset:assign -n autoforce_demo_pack
sfdx force:apex:execute -f data/scripts/setDemosetting.txt
sfdx force:data:tree:import -p data/sfdx-out/John-Plan.json 
sfdx force:apex:execute -f data/scripts/setRoleCall.txt

