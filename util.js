var fs = require("fs");
var reload = require("require-nocache")(module);
var async = require("asyncawait/async");
var await = require("asyncawait/await");
var URL = require("url");
var LRU = require("lru-cache");
var options = {max:500};
var cache = LRU(options);

renderContent = function(content) {

    var presentation = fs.readFileSync(content.presentation).toString();
    var render = require("fly-template")(presentation);
    return render({at: content});

}

renderQuery = function(queryspec) {

    var result = queryspec.header;
    var presentation = fs.readFileSync(queryspec.itempresentation).toString();
    var render = require("fly-template")(presentation);

    var files = fs.readdirSync(queryspec.query);
    files.sort(function(a,b){
        if (queryspec.sortby == "publishdate") {
            aj = reload(queryspec.query + "/" + a);
            bj = reload(queryspec.query + "/" + b);
            if (queryspec.sortorder == "desc") {
                return aj.publishdate < bj.publishdate;
            } else {
                return aj.publishdate > bj.publishdate;
            }
        }
    });
    
    files.forEach(function(file) {
        var item = reload(queryspec.query + "/" + file);
        item.link = queryspec.detailpage + "?data=" + queryspec.query + "/" + file;
        result += render({at: item}); 
    });
    result += queryspec.footer;
    return result;


}

renderArgument = function(url) {

    var urlObject = URL.parse(url, true, true);
    if (urlObject.query != null && urlObject.query.data != null) {
        var content = reload(urlObject.query.data);
        var presentation = fs.readFileSync(content.presentation).toString();
        var render = require("fly-template")(presentation);
        return render({at: content});
   }

    return "";
}

renderItem = async(function(data) {

    var item = null;
    try {
        item = reload(data);
    } catch(e) {
        console.log("renderItem exception:" + e);
    }

    if (item.content != null) {
        return renderContent(item);
    }

    if (item.query != null) {
        return renderQuery(item);
    }

    if (item.plugin != null) {
        var plugin = reload("./plugins/" + item.plugin + "/plugin");
        return await(plugin.execute());
    }

});


assemblePage = async(function(pages, page, request, response) {
 
    var result = "";

    if (page.layout != null) {
        var layout = reload(page.layout);
        layout.rows.forEach(function(row) {
            row.columns.forEach(function(column){
                result += "<div id='" + column.id + "' name='" + column.name + "' class='" + column.style + "'>";
                
                page.data.forEach(function(data){
                    if (data.container == column.id) {
                        if (data.content == "argument") {
                            result += renderArgument(request.url);
                        } else {
                            var output = "";
                            if (data.cache != null) {
                                var cacheKey = data.cache.id + "_" + data.cache.type;
                                if (cache.has(cacheKey)) {
                                    output = cache.get(cacheKey);
                                    console.log("fetched " + cacheKey + " from cache");
                                } else {
                                    output = await(renderItem(data.content));
                                    cache.set(cacheKey, output, data.cache.duration * 1000);
                                    console.log("set " + cacheKey);
                                }
                            } else {
                                output = await(renderItem(data.content));
                            }
                            result += output;
                        }
                    }
                });

                result += "</div>";
            }); 

        });
 
    } else {
        result = "Missing layout";
    }
    return result;

});

copyPage = function(sourcePage) {
    var page = Object.assign({}, sourcePage);
    return page;
}

findPage = function(pages, url) {
    var page = {};

    if (url != null && url.startsWith("/")) {
        url = url.substring(1);
    }
    if (url == null || url == "") {
        page = copyPage(pages);
    } else {
        url = url.replace(/\?.*/, "");
        var pathElements = url.split("/");
        var name = pathElements.shift();
        var newUrl = pathElements.join("/");
        for (var i = 0; i < pages.children.length; i++) {
            if (pages.children[i].name == name) {
                page = findPage(pages.children[i], newUrl);
            }
        }
    }

    return page;
}


exports.assemblePage = assemblePage;
exports.findPage = findPage;