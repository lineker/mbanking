sap.ui.jsview("view.MainMaster", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf view.LoginMaster
	*/ 
	getControllerName : function() {
		return "controller.MainMaster";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf view.LoginMaster
	*/ 
	createContent : function(oController) {
 		
		var list = new sap.m.List({
			items : [ new sap.m.StandardListItem({
				title : "Login",
				type : "Navigation",
				press : function() {
					oController.nav.toDetail("Login");
				}
			}), 
			new sap.m.StandardListItem({
				title : "to Home",
				type : "Navigation",
				press : function() {
					oController.nav.toMaster("HomeMaster");
				}
			})]
		});
		
		
		return new sap.m.Page({
			title: "Welcome",
			content: [
			          list
			]
		});
	}

});