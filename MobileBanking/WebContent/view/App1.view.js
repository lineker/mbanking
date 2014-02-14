sap.ui.jsview("view.App", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mobilebanking.App
	*/ 
	getControllerName : function() {
		return "controller.App";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mobilebanking.App
	*/ 
	createContent : function(oController) {

		// to avoid scroll bars on desktop the root view must be set to block display
		this.setDisplayBlock(true);
		 
		//var page = sap.ui.view({id:"Main", viewName:"view.Main", type:sap.ui.core.mvc.ViewType.JS});
		//var	app = new sap.m.App({initialPage:"Main"});
		//page.getController().nav = this.getController();
		//app.addPage(page);
		
		var oSplitApp = new sap.m.SplitApp("mySplitApp", {});
		
		this.app = oSplitApp;
		
		var mainMaster = sap.ui.view({id:"MainMaster", viewName:"view.MainMaster", type:sap.ui.core.mvc.ViewType.JS});
		mainMaster.getController().nav = this.getController();
		
		var homeMaster = sap.ui.view({id:"HomeMaster", viewName:"view.HomeMaster", type:sap.ui.core.mvc.ViewType.JS});
		homeMaster.getController().nav = this.getController();
		
		var messagesPage = sap.ui.view({id:"Messages", viewName:"view.Messages", type:sap.ui.core.mvc.ViewType.JS});
		messagesPage.getController().nav = this.getController();
		
		var approvalsPage = sap.ui.view({id:"Approvals", viewName:"view.Approvals", type:sap.ui.core.mvc.ViewType.JS});
		approvalsPage.getController().nav = this.getController();
		
		var homeDetailPage = sap.ui.view({id:"HomeDetail", viewName:"view.HomeDetail", type:sap.ui.core.mvc.ViewType.JS});
		homeDetailPage.getController().nav = this.getController();
		
		var loginPage = sap.ui.view({id:"Login", viewName:"view.Login", type:sap.ui.core.mvc.ViewType.JS});
		loginPage.getController().nav = this.getController();
		
		//add the master pages to the splitapp control
		oSplitApp.addMasterPage(homeMaster).addMasterPage(mainMaster);

		//add the detail pages to the splitapp control
		oSplitApp.addDetailPage(messagesPage).addDetailPage(approvalsPage).addDetailPage(loginPage).addDetailPage(homeDetailPage);
		
		oSplitApp.setInitialDetail("Login");
		oSplitApp.setInitialMaster("MainMaster");
		
 		return oSplitApp;
	}
});
