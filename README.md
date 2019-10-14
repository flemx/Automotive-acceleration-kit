Add Basic Data

1. push source

sfdx force:source:push -u <targetusername>

1. assign permset to user

sfdx force:user:permset:assign -n VW_demo_pack -u <targetusername>

1. Set the username of the dealer account in the setting json

sfdx-out > john > demo_setting__cs.json

1. Run the following command:

sfdx force:data:tree:import -p sfdx-out/john/John-Plan.json -u <targetusername>

1. Run the following command to create the Dealer Portal User:

sfdx force:apex:execute -f setRoleCall.txt -u <targetusername>

1. Publish Dealer Community
2. Reset Daniel Password


In case you run into an error, you can delete all data that has been accidentally created by calling

sfdx force:apex:execute -f deleteAllDataCall.txt -u <targetOrg>

