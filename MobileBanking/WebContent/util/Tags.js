jQuery.sap.declare("util.Tags");
util.Tags = {
	addTag : function (obj, tagName) {
				if (obj !== null) {
					var val = obj[tagName];
					if (val !== undefined && val !== null && val !== '') {
						if (tagName === 'amount') {
							//TODO: create accounting library
							//val = accounting.unformat(val);//unformatAmount(val, obj['currencyCode']);
						}
						return '<ns1:' + tagName + '>' + val + '</ns1:' + tagName + '>';
					}
				}
				return '';
			},

	addTags : function (obj, tagNames) {
		var xml = '';
		if (obj !== null) {
			for (var i = 0; i < tagNames.length; i++) {
				xml += this.addTag(obj, tagNames[i]);
			}
		}
		return xml;
	}
}