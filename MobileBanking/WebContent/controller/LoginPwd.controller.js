jQuery.sap.require("model.SapBeans");

sap.ui.controller("controller.LoginPwd", {

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
	processAuthenticateUserResponse : function (response, textStatus, jqXHR) {
		console.log("success");
		console.log(response);
		
		var xml = jqXHR.responseText;
		var xmlDoc = $.parseXML(xml);
		var $xml = $(xmlDoc);
		var $returnXml = $xml.find("ns1\\:return,return");
		var $extraMap = $xml.find("ns1\\:extraMap,extraMap");
		var $entries = $extraMap.find("ns1\\:entry,entry");
		var extra = new model.SapBeans.MBExtraMap($entries);
		var mbUser = sap.ui.getCore().getModel("USER").getData();
		mbUser.extra = extra;
		channelSessionId = $returnXml.find("ns1\\:channelSessionId,channelSessionId").text();
		mbUser.channelSessionId = channelSessionId;

		//var $moremenulist = $("#moremenulist li");

		mbUser.appGeoLegURL = extra.extra.AppGeoLegURL;
		mbUser.authenticated = $returnXml.find("ns1\\:authenticated,authenticated").text();

		if (extra.extra['unread_messages_count'] !== '' && extra.extra['unread_messages_count'] !== undefined && extra.extra['unread_messages_count'] !== null) {
			mbUser.unread_messages_count = Number(extra.extra['unread_messages_count']);
			delete extra.extra['unread_messages_count'];
			mbUser.isEntToMessages = true;
		} else {
			mbUser.isEntToMessages = false;
		}
		if (extra.extra['unread_alerts_count'] !== '' && extra.extra['unread_alerts_count'] !== undefined && extra.extra['unread_alerts_count'] !== null) {
			mbUser.unread_alerts_count = Number(extra.extra['unread_alerts_count']);
			delete extra.extra['unread_alerts_count'];
			mbUser.isEntToAlerts = true;
		} else {
			mbUser.isEntToAlerts = false;
		}

		//var $wiresmenu = $moremenulist.find("a:contains('WIRE RELEASE')");
		if (extra.extra['wires_release_count'] !== '' && extra.extra['wires_release_count'] !== undefined && extra.extra['wires_release_count'] !== null) {
			mbUser.wires_release_count = Number(extra.extra['wires_release_count']);
			delete extra.extra['wires_release_count'];
			mbUser.hasWires = true;
		} else {
			mbUser.hasWires = false;
		}
		if (extra.extra['pending_approvals_count'] !== '' && extra.extra['pending_approvals_count'] !== undefined && extra.extra['pending_approvals_count'] !== null) {
			mbUser.pending_approvals_count = Number(extra.extra['pending_approvals_count']);
			delete extra.extra['pending_approvals_count'];
			mbUser.hasApprovals = true;
		} else {
			mbUser.hasApprovals = false;
		}

		if (extra.extra['user_lock_count'] !== '' && extra.extra['user_lock_count'] !== undefined && extra.extra['user_lock_count'] !== null) {
			mbUser.user_lock_count = Number(extra.extra['user_lock_count']);
			mbUser.hasAdminUnlock = true;
			delete extra.extra['user_lock_count'];
		} else {
			mbUser.hasAdminUnlock = false;
		}

		if (extra.extra['can_create_wires'] !== '' && extra.extra['can_create_wires'] !== undefined && extra.extra['can_create_wires'] !== null) {
			mbUser.can_create_wires = Boolean(extra.extra['can_create_wires']);
			delete extra.extra['can_create_wires'];
		}

		if (extra.extra['hasEZDeposit'] !== '' && extra.extra['hasEZDeposit'] !== undefined && extra.extra['hasEZDeposit'] !== null) {
			mbUser.hasEZDeposit = Boolean(extra.extra['hasEZDeposit']);
			delete extra.extra['hasEZDeposit'];
		}

		if (extra.extra['ppayCount'] !== '' && extra.extra['ppayCount'] !== undefined && extra.extra['ppayCount'] !== null) {
			mbUser.ppayCount = Number(extra.extra['ppayCount']);
			mbUser.hasPPayDecision = true;
			delete extra.extra['ppayCount'];
		} else {
			mbUser.hasPPayDecision = false;
		}

		mbUser.pmdatac = mbUser.extra.extra['enc_pmdata'];

		mbUser.password = null;
		delete mbUser.extra.extra['token'];
		delete mbUser.extra.extra['globalMsg'];
		delete mbUser.extra.extra['lastLoginDate'];
		delete mbUser.extra.extra['secretPhrase'];
		delete mbUser.extra.extra['passmarkImgSrc'];
		
		var userModel = new sap.ui.model.json.JSONModel(mbUser);  
        sap.ui.getCore().setModel(userModel, "USER");
        
        console.log(mbUser);
        
        console.log("done");
		
	},
	
	processHandleError : function(response) {
		console.log("error");
		console.log(response);
	},
	
	signIn :  function() { 
    	
    	var mbUser = sap.ui.getCore().getModel("USER").getData();
    	mbUser.password = $.base64.encode(sap.ui.getCore().byId("password").getValue());
    	var extra = mbUser.extra;
		extra.extra["token"] = $('#token').val();
		currentSession.mbUser.extra = extra;

		util.sapconnectors.MBSecurityConnector.sendAuthenticateUserRequest(mbUser, this.processAuthenticateUserResponse, this.processHandleError);
    },
    
    navButtonPress : function(evt) { 
        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "back");
    } 

});