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

        //window.addEventListener("hashchange",h.handleHashChange(location.hash));

    },
    clickMenuItem : function(component,event){
        let url = window.location.href;
        if(url.includes('salesdesk') || url.includes('lead')){
            component.set("v.currentSection", '/salesdesk');
        }else{
            component.set("v.currentSection", '/');
        }
    }
})