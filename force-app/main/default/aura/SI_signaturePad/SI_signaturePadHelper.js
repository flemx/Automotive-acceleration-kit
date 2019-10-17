({
    signPad : null,
    
    // Initializes canvas signature pad
	initPad : function(cmp) {
		// Init sign-pad canvas
		var canvas = document.getElementById("sign-pad");
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        console.log('width: ', canvas.width);
        console.log('height: ', canvas.height);        

        var signature_pad = new SignaturePad(canvas, {
        	backgroundColor: "#fff"
        });
        
        this.signPad = signature_pad;
        
        // Prevent scroll of page on touchmove event for canvas
        document.getElementById('sign-pad').addEventListener('touchmove', function(e) {
        	e.stopPropagation();
        }, false);
	},
    
    // Converts canvas signature to base64 encoded string
    // Use this function if you want to upload the signature 
    // to an apex controller to save as a record (attachment, document)
    // and tie it to another record.
    getSignatureData : function(cmp) {
      if (this.signPad.isEmpty()) {
          // Populate dom with alert message
          document.getElementById("warning").style.opacity = 1;
          setTimeout(function() {
              document.getElementById("warning").style.opacity = 0;
          }, 3000);
      } else {
          return this.signPad.toDataURL();
      } 
    },
    
    // Erases the signature pad
    clearPad: function(cmp) {
        this.signPad.clear();
    }
})