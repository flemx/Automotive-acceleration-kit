({
	navigateToUrl : function(c, e, h,url) {
        console.log("Navigate to URL: ", url);
    const urlEvent = $A.get("e.force:navigateToURL");
    urlEvent.setParams({
      "url": url,
      "isredirect" :false
    });
    urlEvent.fire();
  	}
})