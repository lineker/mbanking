sap.ui.jsview("view.Login", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mobilebanking.App
	*/ 
	getControllerName : function() {
		return "controller.Login";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mobilebanking.App
	*/ 
	createContent : function(oController) {
	    return new sap.m.Button({
            text: "Accept",
            type: sap.m.ButtonType.Accept,
            press: function(oEvent) {
                alert(oEvent);
            },
            layoutData: new sap.m.FlexItemData({growFactor: 1})
          });
	}
});
