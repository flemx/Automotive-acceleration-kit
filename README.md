# Automotive Demo Pack


## Setup Dashboard

1. Deploy metadata

```
sfdx force:mdapi:deploy -w 5 -d mdapi/autoDashboard
```

2. upload datasets 
```
sfdx shane:analytics:dataset:upload -n demo_data_df_testdrives --async -f data/analytics/demo_data_df_testdrives.csv -a DF19_Demo -m data/analytics/demo_data_df_testdrives.json
sfdx shane:analytics:dataset:upload -n demo_data_df_preped --async -f data/analytics/DemoDataDFPreped.csv -a DF19_Demo -m data/analytics/DemoDataDFPreped.json
sfdx shane:analytics:dataset:upload -n demo_data_df_service --async -f data/analytics/demo_data_df_service.csv -a DF19_Demo -m data/analytics/demo_data_df_service.json
sfdx shane:analytics:dataset:upload -n demo_data_df_trails --async -f data/analytics/demo_data_df_trails.csv -a DF19_Demo -m data/analytics/demo_data_df_trails.json

```

## Add exception for Lead Duplication rule (Only for Demo Org)

1. Deploy metadata

````
sfdx force:mdapi:deploy -w 5 -d mdapi/LeadDuplicate
````


## Setting up project with Basic Data
1. Deploy source
```
sfdx force:source:deploy -p force-app/
```
2. assign permset to user
```
sfdx force:user:permset:assign -n autoforce_demo_pack
```
3. Run the following command:
```
sfdx force:apex:execute -f data/scripts/setDemosetting.txt
```
4. Run the following command to import data:
```
sfdx force:data:tree:import -p data/sfdx-out/John-Plan.json
```
5. Run the following commands to create the Dealer Portal User and assign the customer contact owner:
```
sfdx force:apex:execute -f data/scripts/setRoleCall.txt
sfdx force:apex:execute -f data/scripts/setContactOwner.txt
```

1. Publish Dealer, Test Drive Form & Autoforce Manager Community
2. Reset Daniel Password


In case you run into an error, you can delete all data that has been accidentally created by calling
WARNING, this will delete most data in the ORG
```
sfdx force:apex:execute -f  data/scripts/deleteAllDataCall.txt -u <targetOrg>
```




