var async = require("asyncawait/async");
var await = require("asyncawait/await");

executeMethod = function(request, response) {
    var YQL = require('yqlp');

    if (request.plugin_argument == undefined) {
        location = "DEN";
    } else {
        location = request.plugin_argument;
    }

    var query = "select * from weather.forecast where woeid in (select woeid from geo.places(1) where text='" + location +"')";

    return YQL.execp(query);
    
}

execute = async(function(request, response) {

    var result = "";
    var data = await(executeMethod(request, response));
    var location = data.query.results.channel.location;
    var wind = data.query.results.channel.wind;
    var units = data.query.results.channel.units;
    var condition = data.query.results.channel.item.condition;

    // http://climate.umn.edu/snow_fence/components/winddirectionanddegreeswithouttable3.htm
    var direction = "";
    if (parseFloat(wind.direction) < 11.25) {
        direction = "N";
    }
    if (parseFloat(wind.direction) >= 11.25 && parseFloat(wind.direction) < 33.75) {
        direction = "NNE";
    }
    if (parseFloat(wind.direction) >= 33.75 && parseFloat(wind.direction) < 56.25) {
        direction = "NE";
    }
    if (parseFloat(wind.direction) >= 56.25 && parseFloat(wind.direction) < 78.75) {
        direction = "ENE";
    }
    if (parseFloat(wind.direction) >= 78.75 && parseFloat(wind.direction) < 101.25) {
        direction = "E";
    }
    if (parseFloat(wind.direction) >= 101.25 && parseFloat(wind.direction) < 123.75) {
        direction = "ESE";
    }
    if (parseFloat(wind.direction) >= 123.75 && parseFloat(wind.direction) < 146.25) {
        direction = "SE";
    }
    if (parseFloat(wind.direction) >= 146.25 && parseFloat(wind.direction) < 168.75) {
        direction = "SSE";
    }
    if (parseFloat(wind.direction) >= 168.75 && parseFloat(wind.direction) < 191.25) {
        direction = "S";
    }
    if (parseFloat(wind.direction) >= 191.25 && parseFloat(wind.direction) < 213.75) {
        direction = "SSW";
    }
    if (parseFloat(wind.direction) >= 213.75 && parseFloat(wind.direction) < 236.25) {
        direction = "SW";
    }
    if (parseFloat(wind.direction) >= 236.25 && parseFloat(wind.direction) < 258.75) {
        direction = "WSW";
    }
    if (parseFloat(wind.direction) >= 258.75 && parseFloat(wind.direction) < 281.25) {
        direction = "W";
    }
    if (parseFloat(wind.direction) >= 281.25 && parseFloat(wind.direction) < 303.75) {
        direction = "WNW";
    }
    if (parseFloat(wind.direction) >= 303.75 && parseFloat(wind.direction) < 326.25) {
        direction = "NW";
    }
    if (parseFloat(wind.direction) >= 326.25 && parseFloat(wind.direction) < 348.75) {
        direction = "NNW";
    }
    if (parseFloat(wind.direction) >= 348.75) {
        direction = "N";
    }

    result += "<div style='padding:5px'>";
    result += "<div style='width: 100%; text-align: center; font-weight: 900; font-size: 1.25em; padding-bottom: 5px;'>Yahoo Weather</div>";
    result += '<div>The current weather in ' + location.city + ', ' + location.region + ' is ' + condition.temp + '&deg;' + units.temperature + '. ';
    result += "But, it feels like " + wind.chill + "&deg;" + units.temperature + " due to " + wind.speed + units.speed + " winds from the " + direction + ".</div>";
    result += "<img style='float:right; margin-top:10px' src='" + data.query.results.channel.image.url + "'>";
    result += "</div>"
    result += "<div class='themeClear'></div>";
    return result; 
});

exports.execute = execute;
