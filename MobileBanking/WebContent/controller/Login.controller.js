jQuery.sap.require("model.SapBeans");
jQuery.sap.require("util.mbanking");
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
		var xml = jqXHR.responseText;
		console.log(xml);
		var xmlDoc = $.parseXML(xml);
		var $xml = $(xmlDoc);
		var $challenge = $xml.find("ns0\\:challenge, challenge");
		//currentSession.question = $challenge.text();
		console.log( $challenge.text());
		var mbUser = new MBUser($(xmlDoc));
		console.log(mbUser);
		
		//currentSession.mbUser = mbUser;
		//localStorage.setItem('pmdata', currentSession.mbUser.extra.extra['enc_pmdata']);
		//hidePleaseWait();

		//if (currentSession.question) {
		//	$.mobile.changePage("#loginmfa");
		//} else if (mbUser.extra.extra['tokensBypassed'] === 'true') {
			//show error
		//	errormessage = "Your credentials cannot be verified at this time. Please log into Money Manager GPS or contact Client Services for further instructions.";
		//	$.mobile.changePage("#messagedialog", {
		//		role : "dialog",
		//		reverse : false
		//	});

		//} else {
		//	currentSession.imageUrl = mbUser.extra.extra['passmarkImgSrc'];
		//	currentSession.passphrase = mbUser.extra.extra['secretPhrase'];
		//	$.mobile.changePage("#loginpwd");
		//}
		
	},
	
	processHandleError : function(response) {
		console.log("error");
	},
	
    signIn :  function(oEvent) { 
        var user = new model.SapBeans.MBUser();
        user.userId = sap.ui.getCore().byId("companyIDInput").getValue();
        user.backendUserId = sap.ui.getCore().byId("companyIDInput").getValue();
        user.groupId  = sap.ui.getCore().byId("userIDInput").getValue();
        user.locale = 'en_US';
        user.type = 'business';
        
        //When do we need to use enc_userid, enc_companyid, pmdata, clientid ?
        
        sap.ui.getCore().byId("Loginpage").addContent(new sap.m.Label({text : user.getXML()}));
        
        util.sapconnectors.MBSecurityConnector.sendGetMultifactorSecurityInfoRequest(user,processGetMultifactorSecurityInfoResponse, processHandleError);
        
        
        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "to", { 
            id : "LoginPwd"
        }); 
        
        
        //sap.ui.getCore().byId("App").app.to("LoginPwd", 1);
        
    }
});