sap.ui.jsview("view.LoginPwd", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf view.Login
	*/ 
	getControllerName : function() {
		return "controller.LoginPwd";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf view.Login
	*/ 
	createContent : function(oController) {
		
 		return new sap.m.Page({
 		    id : "LoginPwds",
			title: "Password",
            showNavButton: true,                // page 2 should display a back button
            navButtonPress: [ oController.navButtonPress, oController ],
			content: [
			  
			]
		});
	}

});