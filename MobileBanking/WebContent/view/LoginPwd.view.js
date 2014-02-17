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
 		    showNavButton: true,
 		    navButtonTap: function() {
                var oEventBus = sap.ui.getCore().getEventBus();
                oEventBus.publish("nav", "back");
            },
 		    id : "LoginPwdPage", 
            title: "Login",
            content: [
              new sap.m.VBox({
                  items:  [
                      new sap.m.Image({ 
                          src : "{USER>/imageUrl}", 
                          width : "100px",
                          height : "100px",
                          layoutData : new sap.m.FlexItemData({growFactor: 1})}
                       ),
                      new sap.m.Label({
                          text: '{USER>/passphrase}'
                      }), 
                    
                      new sap.m.Label({
                           text: 'Password:'
                      }), 
                      new sap.m.Input("Password", {
                          type: sap.m.InputType.Password,
                          placeholder: 'Enter Password ...'
                      }),
                      new sap.m.Label({
                          text: 'Token'
                      }), 
                      new sap.m.Input("Token", {
                          type: sap.m.InputType.Password,
                          placeholder: 'Enter Token ...'
                      }),
                      new sap.m.Button({
                          text: "Login",
                          press: [oController.login, oController]
                      })   
                  ]
              })
            ]
		 });
	 } 

});