var fs = require("fs");

visibleChildren = function(page) {
    var count = 0;
    page.children.forEach(function(child) {
        if (child.hidden == undefined && !child.hidden) {
            count++;
        }
    });
    return count;
}

getMenubar = function(pages) {

    var menus = "";

    if (pages != null) {
        menus += "<div class='menubar_child noselect'>";
        pages.children.forEach(function(page) {
            if (page.hidden == undefined && !page.hidden) {
                if (visibleChildren(page) == 0) {
                    menus += "<div class='themeLeft category' onclick='window.location=\"/app/" + page.name + "\";'>";
                    menus += "<a href='/app/" + page.name + "'>" + page.name + "</a>"
                    menus += "</div>";
                } else {
                    var id = Math.random();
                    menus += "<div class='themeLeft category' onclick='javascript:theme.toggleMenu(event,\"" + id + "\");'>"
                    menus += "<div>";
                    menus += page.name
                    menus += "</div>";
                    menus += "<div id='" + id + "' class='hidden menu'>";
                    menus += "<div>";
                    menus += "<a href='/app/" + page.name + "'>" + page.name + "</a>";
                    page.children.forEach(function(childpage) {
                        menus += "<a href='/app/" + page.name + "/" + childpage.name + "'>" + childpage.name + "</a>";
                    });
                    menus += "</div>";
                    menus += "</div>";
                    menus += "</div>";
                }
            }
        });


        menus += "<div class='themeClear'></div>";
        menus += "</div>";
    }

    return menus;
}

getHeader = function(pages) {
    var header = fs.readFileSync('./theme/mono/header.html').toString();

    var menus = getMenubar(pages);
    var render = require("fly-template")(header);

    return render({menubar: menus});
}

getFooter = function() {
    return fs.readFileSync('./theme/mono/footer.html').toString();;
}


exports.getHeader = getHeader;
exports.getFooter = getFooter;