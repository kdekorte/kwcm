var async = require("asyncawait/async");
var await = require("asyncawait/await");

executeMethod = function(request, response) {
    var YQL = require('yqlp');
    var query = "select * from weather.forecast where woeid in (select woeid from geo.places(1) where text='DEN')";

    return YQL.execp(query);
    
}

execute = async(function(request, response) {

    var result = "";
    var data = await(executeMethod(request, response));
    var location = data.query.results.channel.location;
    var condition = data.query.results.channel.item.condition;

    result = '<div>The current weather in ' + location.city + ', ' + location.region + ' is ' + condition.temp + ' degrees.</div>';
    
    return result; 
});

exports.execute = execute;