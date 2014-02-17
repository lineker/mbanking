jQuery.sap.require("model.SapBeans");
jQuery.sap.require("util.sapconnectors.MBAccountConnector");

sap.ui.controller("controller.Accounts", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf view.Accounts
*/
	onInit: function() {
		var user = sap.ui.getCore().getModel("USER").getData();
		util.sapconnectors.MBAccountConnector.sendGetAccountsRequest(user, this.processGetAccountsResponse, this.processHandleError);
	},

	processGetAccountsResponse : function(response, textStatus, jqXHR) {
		
		var xml = jqXHR.responseText;
		console.log(xml);
		var xmlDoc = $.parseXML(xml);
		var $xml = $(xmlDoc);
		var $accounts = $xml.find("ns1\\:return,return");
		var arrayAccounts = new Array();
		$accounts.each(function() {
			arrayAccounts.push(new model.SapBeans.MBAccount($(this)));
		});
		
		var accModel = new sap.ui.model.json.JSONModel(arrayAccounts);  
        sap.ui.getCore().setModel(accModel, "ACCOUNTS");
        
        console.log(arrayAccounts);
	},
	
	processHandleError : function(response) {
		console.log("error");
		console.log(response);
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