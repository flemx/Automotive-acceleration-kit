# Volkswagen Demo Pack

### Original package:
- https://git.soma.salesforce.com/dfleminks/volkswagen-demo-pack

## Setting up project with Basic Data

1. push source
```
sfdx force:source:push -u <targetusername>
```
2. assign permset to user
```
sfdx force:user:permset:assign -n VW_demo_pack -u <targetusername>
```
3. Run the following command:
```
sfdx force:apex:execute -f data/scripts/setDemosetting.txt -u <targetusername>
```
4. Run the following command to import data:
```
sfdx force:data:tree:import -p data/sfdx-out/John-Plan.json -u <targetusername>
```
5. Run the following command to create the Dealer Portal User:
```
sfdx force:apex:execute -f data/scripts/setRoleCall.txt -u <targetusername>
```
1. Publish Dealer Community
2. Reset Daniel Password


In case you run into an error, you can delete all data that has been accidentally created by calling
```
sfdx force:apex:execute -f  data/scripts/deleteAllDataCall.txt -u <targetOrg>
```
