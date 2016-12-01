var connect = require("connect");
var http = require("http");
var session = require("express-session");
var dispatch = require("dispatch");
var compression = require("compression");
var reload = require("require-nocache")(module);

var theme = require("./theme/default/theme");
var util = require("./util");

mergePageProperties = function(parent) {
    for (var i = 0; i < parent.children.length; i++) {
        child = parent.children[i];
        if (child.theme == null) {
            child.theme = parent.theme;
        }
        mergePageProperties(child);
    }
}

reloadPages = function() {

    var pages = reload("./data/pages.json");
    mergePageProperties(pages);

    return pages;
}

var pages = reloadPages();

//console.log(JSON.stringify(pages));

var app = connect();
app.use(compression());
app.use(session({
  secret: 'app',
  resave: false,
  saveUninitialized: true,
  cookie: {}
}));

app.use('/theme/', function(request, response, next) {
    var filename = require('path').join(__dirname, "/theme" + request.url);
    var errorListener = this.errorListener;
    require('fs').readFile(filename, function(err, file) {
        if(err) {
            errorListener(req, res);
            return;
        }
        response.writeHeader(200, {
            "Content-Type": require('mime').lookup(filename)
        });
        response.write(file, 'binary');
        response.end();
    });      
});

app.use('/resources/', function(request, response, next) {
    var filename = require('path').join(__dirname, "/resources" + request.url);
    var errorListener = this.errorListener;
    require('fs').readFile(filename, function(err, file) {
        if(err) {
            errorListener(req, res);
            return;
        }
        response.writeHeader(200, {
            "Content-Type": require('mime').lookup(filename)
        });
        response.write(file, 'binary');
        response.end();
    });      
});

app.use('/app', function(request, response, next) {
    util.assemblePage(pages, util.findPage(pages, request.url), request, response);
});

app.use("/api/render", function(request, response, next) {
    return util.renderContent(request.params)
});


app.use('/content', function(request, response, next) {
    console.log("content");
    var item = request.url;
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(theme.getHeader());
    response.write("<div>Item requested: " + item + "</div>");
    response.write(theme.getFooter());
    response.end();
});

app.use(function(request, response, next) {
    console.log('in default handler');
    response.writeHead(301, { Location: '/app'});
    response.end();
});


app.listen(8081, function() {
    console.log('Server running at http://127.0.0.1:8081/');
});

