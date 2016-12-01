
if(typeof theme === "undefined" || !theme) theme = {};

if (typeof console == "undefined") {
    this.console = {
        log : function() {
        },
        info : function() {
        },
        error : function() {
        },
        warn : function() {
        }
    };
}

if (console) {
    console.log("loading theme.js");
}

theme.hasClass = function(ele,cls) {
    return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}
theme.addClass = function(ele,cls) {
    if (!theme.hasClass(ele,cls)) ele.className += " "+cls;
}
theme.removeClass = function(ele,cls) {
    if (theme.hasClass(ele,cls)) {
        var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
        ele.className=ele.className.replace(reg,' ');
    }
}

theme.toggleMenu = function(event, id) {
    var menu = document.getElementById(id);
    if (theme.hasClass(menu,"hidden")) {
        theme.removeClass(menu, "hidden");
    } else {
        theme.addClass(menu, "hidden");
    }
    
    if (event && event.stopPropagation){
			event.stopPropagation();
	} else if(window.event){
			window.event.cancelBubble=true;
	}
}

theme.hideMenus = function(event) {
    var menus = document.getElementsByClassName("menu");
    for (var i = 0 ; i < menus.length; i++) {
        theme.addClass(menus[i], "hidden");
    }
}

