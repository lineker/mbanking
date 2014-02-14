sap.ui.jsview("view.Login", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf view.Login
	*/ 
	getControllerName : function() {
		return "controller.Login";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf view.Login
	*/ 
	createContent : function(oController) {
		
 		return new sap.m.Page({
 		    id : "Loginpage",
			title: "Login",
			content: [
			  new sap.m.Label({
                  text: 'Company ID'
              }),
              new sap.m.Input({
                  id : 'companyIDInput',
                  type: sap.m.InputType.Text,
                  placeholder: 'Enter Company ID ...'
              }),
              new sap.m.Label({
                  text: 'User ID'
              }),
              new sap.m.Input({
                  id : 'userIDInput',
                  type: sap.m.InputType.Text,
                  placeholder: 'Enter User ID ...'
              }),
              new sap.m.Button({
                  text: "Sign In",
                  press: [oController.signIn, oController]
                }),
			]
		});
	}

});