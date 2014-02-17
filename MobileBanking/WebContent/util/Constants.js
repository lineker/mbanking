jQuery.sap.declare("util.Constants");

util.Constants = {
        servicesUrl : 'proxy/mbanking/services/',
        SoapHeader : '<?xml version=\'1.0\' encoding=\'UTF-8\'?>\n<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" ' + 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns1="http://services.mbanking.sybase.com/schema" ' + 'xmlns:xsd="http://www.w3.org/2001/XMLSchema">\n ' + '<soapenv:Header/>\n<soapenv:Body>\n',
        SoapFooter : '</soapenv:Body></soapenv:Envelope>'
};