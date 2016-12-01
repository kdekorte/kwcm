var fs = require("fs");
var reload = require("require-nocache")(module);

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

    var query = url.replace(/(.*)\?/,"");
    params = query.split("=");
    if (params[0] == "data") {
        var content = reload(params[1]);
        var presentation = fs.readFileSync(content.presentation).toString();
        var render = require("fly-template")(presentation);
        return render({at: content});

    }

    return "";
}

renderItem = function(data) {

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

}


assemblePage = function(pages, page, request, response) {
    if (page.redirect != null) {
        response.writeHead(301, { Location: page.redirect});
        response.end();
        return;
    }

    var theme = require("./theme/" + page.theme + "/theme");
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(theme.getHeader(pages));

    if (page.layout != null) {
        var layout = reload(page.layout);
        layout.rows.forEach(function(row) {
            row.columns.forEach(function(column){
                response.write("<div id='" + column.id + "' name='" + column.name + "' class='" + column.style + "'>");
                
                page.data.forEach(function(data){
                    if (data.container == column.id) {
                        if (data.content == "argument") {
                            response.write(renderArgument(request.url));
                        } else {
                            response.write(renderItem(data.content));
                        }
                    }
                });

                response.write("</div>");
            }); 

        });
 
    } else {
        response.write("Missing layout");
    }
    response.write(theme.getFooter());
    response.end();

}

copyPage = function(sourcePage) {
    var page = {};
    page.name = sourcePage.name;
    page.data = sourcePage.data;
    page.theme = sourcePage.theme;
    page.layout = sourcePage.layout;
    page.redirect = sourcePage.redirect;
    page.hidden = sourcePage.hidden;

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