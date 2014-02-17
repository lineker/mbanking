jQuery.sap.require("model.SapBeans");
jQuery.sap.require("util.sapconnectors.MBSecurityConnector");
sap.ui.controller("controller.LoginSecurityQuestion", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf view.Login
*/
//	onInit: function() { 
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
	
	processAnswerMultifactorSecurityInfoResponse : function(response, textStatus, jqXHR) {
		console.log("success");
		console.log(response);
		
		var xml = jqXHR.responseText;
		var xmlDoc = $.parseXML(xml);
		var $xml = $(xmlDoc);
		var mbUser = new model.SapBeans.MBUser($xml);
		var $extraMap = $xml.find("ns1\\:extraMap,extraMap");
		var $entries = $extraMap.find("ns1\\:entry,entry");
		$entries.each(function() {
			var value = $(this).text();
			var mapKey = '';
			$.each(this.attributes, function() {
				if ($(this).val() != "xsd:string") {
					mapKey = $(this).val();
					if (mapKey === 'secretPhrase') {
						mbUser.passphrase = value;
					} else if (mapKey === 'passmarkImgSrc') {
						mbUser.imageUrl = value;
					}
				}
			});
		});
		var $challenge = $xml.find("ns0\\:challenge,challenge");
		var question2 = $challenge.text();
		
		mbUser.pmdata = mbUser.extra.extra['enc_pmdata'];
		var userModel = new sap.ui.model.json.JSONModel(mbUser);  
        sap.ui.getCore().setModel(userModel, "USER");
        console.log(mbUser);
		if (question2) {
			currentSession.question = question2;
			//$.mobile.changePage("#loginmfa");
			//not sure where this goes.
		} else {
			//go to last page
			var bus = sap.ui.getCore().getEventBus();
	        bus.publish("nav", "to", { 
	            id : "LoginPwd"
	        });
		}
	},
	
	processHandleError : function(response) {
		console.log("error");
		console.log(response);
	},
	
	continueLogin :  function(oEvent) { 
        var user = sap.ui.getCore().getModel("USER").getData();
        console.log(user);
        user.multifactorInfo[0].response = sap.ui.getCore().byId("securityQuestionAnswer").getValue();
        user.multifactorInfo[0].enumClass = 'ChallengeQuestion';
        user.multifactorInfo[0].extra.extra['regDevice'] = 'false';
        util.sapconnectors.MBSecurityConnector.answerMultifactorSecurityInfo(user, this.processAnswerMultifactorSecurityInfoResponse, this.processHandleError);
    },
    navButtonPress : function(evt) { 
        var bus = sap.ui.getCore().getEventBus();
        bus.publish("nav", "back");
    } 
});