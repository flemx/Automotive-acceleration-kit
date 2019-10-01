({
	init : function(c,e,h) {
		
	},
    clickLink : function(c,e,h) {
        const id = parseInt(e.target.dataset.menuitem);
        if(c.get("v.activeMenuItem")==id){
            c.set("v.activeMenuItem",undefined)
        } else {
            if(e.target.dataset.hassubmenu == "true"){
                c.set("v.activeMenuItem", id);
                c.set("v.menuItems",c.get("v.menuItems"));
                const submenu = c.find("submenu");
            }
            c.getSuper().navigate(id);
        }
        
    }
})