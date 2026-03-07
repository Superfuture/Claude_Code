location.querystring = (function() {

    // The return is a collection of key/value pairs

    var queryStringDictionary = {};

    // Gets the query string, starts with '?'

    var querystring = decodeURI(location.search);

    // document.location.search is empty if no query string

    if (!querystring) {
        return {};
    }

    // Remove the '?' via substring(1)

    querystring = querystring.substring(1);

    // '&' seperates key/value pairs

    var pairs = querystring.split("&");

    // Load the key/values of the return collection

    for (var i = 0; i < pairs.length; i++) {
        var keyValuePair = pairs[i].split("=");
        queryStringDictionary[keyValuePair[0]]
                = keyValuePair[1];
    }

    // toString() returns the key/value pairs concatenated

    queryStringDictionary.toString = function() {

        if (queryStringDictionary.length == 0) {
            return "";
        }

        var toString = "?";

        for (var key in queryStringDictionary) {
            toString += key + "=" +
                queryStringDictionary[key];
        }

        return toString;
    };

    // Return the key/value dictionary

    return queryStringDictionary;
})();
