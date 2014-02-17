jQuery.sap.require("model.SapBeans");
jQuery.sap.require("util.sapconnectors.MBSecurityConnector");
sap.ui.controller("controller.Login", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf view.Login
*/
//	onInit: function() {
//
//	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf view.Login
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf view.Login
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf view.Login
*/
//	onExit: function() {
//
//	}
	
	processGetMultifactorSecurityInfoResponse : function (response, textStatus, jqXHR) {
		
		console.log("success");
		console.log(response);
		
		var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", { 
            id : "LoginSecurityQuestion"
        }); 
		
	},
	
	processHandleError : function(response) {
		console.log("error");
		console.log(response);
	},
	
    signIn :  function(oEvent) { 
        var user = new model.SapBeans.MBUser();
        user.userId = sap.ui.getCore().byId("userIDInput").getValue();
        user.backendUserId = sap.ui.getCore().byId("userIDInput").getValue();
        user.groupId  = sap.ui.getCore().byId("companyIDInput").getValue();
        user.locale = 'en_US';
        user.type = 'business';
        
        var extraMap = new model.SapBeans.MBExtraMap();
        var udid = uuid.v4();
        console.log(udid);
        extraMap.extra['uuid'] = udid;
        user.extra = extraMap;
        //When do we need to use enc_userid, enc_companyid, pmdata ?
        
        sap.ui.getCore().byId("Loginpage").addContent(new sap.m.Label({text : user.getXML()}));
        util.sapconnectors.MBSecurityConnector.sendGetMultifactorSecurityInfoRequest(user, this.processGetMultifactorSecurityInfoResponse, this.processHandleError);
        
        
        //sap.ui.getCore().byId("App").app.to("LoginPwd", 1);
        
    }
});