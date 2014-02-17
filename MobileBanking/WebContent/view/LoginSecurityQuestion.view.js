sap.ui.jsview("view.LoginSecurityQuestion", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf view.Login
	*/ 
	getControllerName : function() {
		return "controller.LoginSecurityQuestion";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf view.Login
	*/ 
	createContent : function(oController) {
		
 		return new sap.m.Page({
 		    id : "LoginSecurityQuestionPage",
			title: "Login",
			content: [
			  new sap.m.VBox({
			      items:  [
                      new sap.m.Label({
                          text: 'Please identify yourself'
                      }), 
                    
                      new sap.m.Label({
                          text: 'Question:'
                      }), 
                      new sap.m.Label({
                          id : '',
                          text: '{USER>/multifactorSecurityInfo}'
                      }), 
                      new sap.m.Label({
                          text: 'Answer:'
                      }), 
                      new sap.m.Input({
                          id : 'securityQuestionAnswer',
                          type: sap.m.InputType.Text,
                          placeholder: 'Type your answer here...'
                      }),
                      new sap.m.Button({
                          text: "Continue Login",
                          press: [oController.continueLogin, oController]
                      })   
			      ]
			  })
			]
		});
	}
});