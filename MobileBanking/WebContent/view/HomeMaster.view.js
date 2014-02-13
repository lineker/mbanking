sap.ui.jsview("view.HomeMaster", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mbanking.main
	*/ 
	getControllerName : function() {
		return "controller.HomeMaster";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mbanking.main
	*/ 
	createContent : function(oController) {
 		
		var list = new sap.m.List({
			mode:"SingleSelectMaster",
			select: function(oEv) {
				   if(oEv.getParameter("listItem").getId() == "listMessages") {
					   oController.nav.toDetail("Messages");
				}else if(oEv.getParameter("listItem").getId() == "listApprovals") {
					oController.nav.toDetail("Approvals");
				}else if(oEv.getParameter("listItem").getId() == "listLogout") {
					oController.nav.backMaster();
				} else {
					
					oController.nav.toDetail("HomeDetail");
				}
			},
			items : [ new sap.m.StandardListItem("listHome",{
			      title : "Home"
			}),new sap.m.StandardListItem("listMessages",{
				      title : "Messages"
				}), new sap.m.StandardListItem("listApprovals",{
				     title : "Approvals"
			}), new sap.m.StandardListItem("listLogout",{
				     title : "Logout"
			}) ]
		});
		
		return new sap.m.Page({
			title: "My Banking",
			navButtonPress : function() {
				oController.nav.backMaster();
			          },
			content: [
			       list
			]
		});
	}

});