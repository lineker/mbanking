sap.ui.jsview("view.Accounts", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf view.Accounts
	*/ 
	getControllerName : function() {
		return "controller.Accounts";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf view.Accounts
	*/ 
	createContent : function(oController) {
	    this.accountsTemplate = new sap.m.StandardListItem({
            title: "{nickName}",
            description: "{balance}"
          });
	    
	    this.accountsList = new sap.m.List({
            id : "accountList"
        });
 		return new sap.m.Page({
			title: "Accounts",
			content: [
			    this.accountsList
			]
		});
	}

});