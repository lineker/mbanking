jQuery.sap.declare("Application");

sap.ui.app.Application.extend("Application", {

	init : function() {	
		
	},
	main : function() {
		var root = this.getRoot();
		sap.ui.jsview("app", "view.App").placeAt(root);
	}
});