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

	    var oPage = new sap.m.Page({
	        title: "Page",
	        enableScrolling: false,
	        subHeader: new sap.m.Bar({
	          contentMiddle : [
	            new sap.m.Button({
	              text: "Default",
	              press: fnPress
	            }),
	            new sap.m.Button({
	              type: "Reject",
	              text: "Reject",
	              press: fnPress
	            }),
	            new sap.m.Button({
	              icon: "sap-icon://action",
	              press: fnPress
	            })
	          ]
	        }),
	        content: [
	          new sap.m.HBox({
	            items: [
	              new sap.m.Button({
	                text: "Default",
	                press: fnPress,
	                layoutData: new sap.m.FlexItemData({growFactor: 1})
	              }),
	              new sap.m.Button({
	                text: "Accept",
	                type: sap.m.ButtonType.Accept,
	                press: fnPress,
	                layoutData: new sap.m.FlexItemData({growFactor: 1})
	              }),
	              new sap.m.Button({
	                text: "Reject",
	                type: sap.m.ButtonType.Reject,
	                press: fnPress,
	                layoutData: new sap.m.FlexItemData({growFactor: 1})
	              })
	            ]
	          }),
	          util.UiFactory.createDescription(this.getId())
	        ],
	        headerContent: [
	          new sap.m.Button({
	            icon: "sap-icon://action",
	            press: fnPress
	          })
	        ],
	        footer: new sap.m.Bar({
	          contentMiddle: [
	            new sap.m.Button({
	              text: "Default",
	              press: fnPress
	            }),
	            new sap.m.Button({
	              text: "Emphasized",
	              type: sap.m.ButtonType.Emphasized,
	              press: fnPress
	            }),
	            new sap.m.Button({
	              icon: "sap-icon://action",
	              press: fnPress
	            })
	          ]
	        })
	      }).addStyleClass("marginBoxContent");
	    
	    return oPage;
	}
});
