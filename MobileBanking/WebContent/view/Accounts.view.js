sap.ui.jsview("view.Accounts", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf view.Accounts
	*/ 
	getControllerName : function() {
		return "view.Accounts";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf view.Accounts
	*/ 
	createContent : function(oController) {
 		return new sap.m.Page({
			title: "Title",
			content: [
                new sap.m.List({
                    id : "accountList",
                    items: [
                      new sap.m.StandardListItem({
                          title: "Item E",
                          description: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr",
                          icon: "sap-icon://competitor",
                          info: "Confirmed",
                          infoState: sap.ui.core.ValueState.Success
                        })
                    ]
                  })

			]
		});
	}

});