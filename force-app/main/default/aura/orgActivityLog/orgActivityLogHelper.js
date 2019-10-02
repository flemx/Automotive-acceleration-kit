({
    urlify : function(text) {
        console.log("urlify text", text)
	var urlRegex = /(https?:\/\/[^\s]+)/g
    return text.replace(urlRegex, function(url) {
        return '<a href="' + url + '">' + url + '</a>';
    })
	}
    
})