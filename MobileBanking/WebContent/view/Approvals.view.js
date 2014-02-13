sap.ui.jsview("view.Approvals", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf view.Approvals
	*/ 
	getControllerName : function() {
		return "controller.Approvals";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf view.Approvals
	*/ 
	createContent : function(oController) {
 		return new sap.m.Page({
			title: "Approvals",
			content: [
			new sap.m.Label({
				 text : "this is Approvals page"
			         })
			]
		});
	}

});