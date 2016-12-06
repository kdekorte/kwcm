
var async = require("asyncawait/async");
var await = require("asyncawait/await");



execute = async(function(request, response, arguments) {

    if (arguments == undefined || arguments.cache == undefined) {
        return "<div>Cache is currently undefined</div>";
    } else {
        var result = "<div style='margin:5px'>";
        result += "<div style='width:75%;float:left;font-weight:bold'>Key</div><div style='width:20%;float:left; font-weight:bold'>Size</div>";
        arguments.cache.rforEach(function(value, key, cache){
            result += "<div style='width:75%;float:left'>" + key + "</div><div style='width:20%;float:left'>" + value.length + "</div>";
        });

        result += "</div>";
        return result;
    }

});

exports.execute = execute;