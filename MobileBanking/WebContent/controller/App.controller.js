sap.ui.controller("controller.App", {

loadPage: function(pageId) {
		
		var app = this.getView().app;
		
		// load page on demand. Assumes Master pages have the "Master" as substring
		var master = (pageId.indexOf("Master") != -1);
		if (app.getPage(pageId, master) === null) {
			var page = sap.ui.view({
				id : pageId,
				viewName : "view." + pageId,
				type : "JS"
			});
			page.getController().nav = this;
			app.addPage(page, master);
			jQuery.sap.log.info("app controller > loaded page: " + pageId);
		}
	},
	//assumes app is SplitApp
	to : function(pageId, oData, withBindings, isMaster) {
		//assumes app is SplitApp
		var app = this.getView().app;
		
		// load page on demand
		this.loadPage(pageId);
		
		// set data context on the page if available
		if(oData) {
			if (withBindings) {
				var page = app.getPage(pageId);
				page.setBindingContext(oData);
				// show the page with context binded
				if(isMaster) app.toMaster(pageId);
				else app.toDetail(pageId);
			} else {
				// show the page with data available on "beforeShow" event on the target page
				if(isMaster) app.toMaster(pageId,oData);
				else app.toMaster(pageId, oData);
			}
		} else {
			if(isMaster) app.toMaster(pageId);
			else app.toDetail(pageId);
		}
		
	},
	
	
	toMaster : function(pageId, oData, withBindings) {
		this.to(pageId, oData, withBindings, true);
	},
	
	/**
	 * Navigates to another page
	 * @param {string} pageId The id of the next page
	 * @param {sap.ui.model.Context} context The data context to be applied to the next page (optional)
	 */
	toDetail : function (pageId, oData, withBindings) {
		this.to(pageId, oData, withBindings, false);
	},
	
	/**
	 * Navigates back to a previous page
	 * @param {string} pageId The id of the next page
	 */
	back : function (pageId, oBackData) {
		this.getView().app.backToPage(pageId, oBackData);
	},
	
	backMaster : function(oBackData) {
		this.getView().app.backMaster(oBackData);
	},
	
	backDetail : function(oBackData) { 
		this.getView().app.backDetail(oBackData);
	},
	
	QueryString : function () {
		  // This function is anonymous, is executed immediately and 
		  // the return value is assigned to QueryString!
		  var query_string = {};
		  var query = window.location.search.substring(1);
		  var vars = query.split("&");
		  for (var i=0;i<vars.length;i++) {
		    var pair = vars[i].split("=");
		    	// If first entry with this name
		    if (typeof query_string[pair[0]] === "undefined") {
		      query_string[pair[0]] = pair[1];
		    	// If second entry with this name
		    } else if (typeof query_string[pair[0]] === "string") {
		      var arr = [ query_string[pair[0]], pair[1] ];
		      query_string[pair[0]] = arr;
		    	// If third or later entry with this name
		    } else {
		      query_string[pair[0]].push(pair[1]);
		    }
		  } 
		    return query_string;
		}

});