({
    handleUploadFinished: function (component, event) {
        var baseURL = $(location).attr('pathname');
        baseURL.indexOf(1);
        baseURL.toLowerCase();
        baseURL = baseURL.split("/")[1];
        component.set("v.prefixURL", '/' + baseURL + '/sfc/servlet.shepherd/version/');
        console.log('prefix url is: ');
        var uploadedFiles = event.getParam("files");
        console.log("upload files",uploadedFiles );
        
        component.set("v.contentId",uploadedFiles[0].documentId);
        console.log("thedocId",uploadedFiles[0].documentId);
        
        var action = component.get("c.getDocumentId");
        
        action.setParams({
			cId: component.get("v.contentId")
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
               component.set("v.contentId", "renditionDownload?rendition=ORIGINAL_Jpeg&versionId=" + response.getReturnValue() + "&operationContext=CHATTER&contentId=" + event.getParam("files")[0].documentId);
               console.log('contentId is: ' + component.get("v.contentId"));
            }
            
            else {
                console.log("error");
            }
        });
        $A.enqueueAction(action);
        
         $(".theContainer").hide();
         $(".theUploadedImage").show();
        
    }
})