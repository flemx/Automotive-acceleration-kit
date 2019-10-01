({
	openModalAction : function(c,e,h) {
        console.log("theme - open modal action");
        console.log("event intercepted, content:",e.getParam("content"));
	},
    
    init : function(c,e,h){
       
        let activepage = window.location.href.match(/\/[^\/]+$/);
        activepage ? activepage = activepage[0] : activepage = "/";
        c.set("v.currentSection",activepage);
        console.log("theme init done, active page = ", activepage);
    },
    clickMenuItem : function(c,e,h){
        h.navigateToUrl(c,e,h,e.currentTarget.dataset.item);
        c.set("v.currentSection",e.currentTarget.dataset.item);
    }
})