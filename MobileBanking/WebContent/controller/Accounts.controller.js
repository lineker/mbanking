sap.ui.controller("controller.Accounts", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf view.Accounts
*/
	onInit: function() {
	    var view = this.getView();
	    //Bind the data
	    //  template ->  view.accountsTemplate
	    //  list     ->  view.accountsList
	    // bindPth = "";
	    // view.accountsList.bindItems(bindPath, this.getView().orderListTemplate);

	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf view.Accounts
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf view.Accounts
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf view.Accounts
*/
//	onExit: function() {
//
//	}

});