/* global hljs */

$(document).ready(function () {
    "use strict";
    //page loader
    Pace.on("done", function () {
        //console.log("finished");
        // $('.loader').fadeIn(1500);
    });

    //navbar add remove calss
    var header = $(".no-background");
    $(window).on('scroll', function () {
        var scroll = $(window).scrollTop();
        if (scroll >= 1) {
            header.removeClass('no-background').addClass("navbar-bg");
        } else {
            header.removeClass("navbar-bg").addClass('no-background');
        }
    });

    //multi dropdown
    $('.dropdown-menu a.dropdown-toggle').on('click', function (e) {
        var $el = $(this);
        var $parent = $(this).offsetParent(".dropdown-menu");
        if (!$(this).next().hasClass('show')) {
            $(this).parents('.dropdown-menu').first().find('.show').removeClass("show");
        }
        var $subMenu = $(this).next(".dropdown-menu");
        $subMenu.toggleClass('show');

        $(this).parent("li").toggleClass('show');

        $(this).parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function (e) {
            $('.dropdown-menu .show').removeClass("show");
        });

        if (!$parent.parent().hasClass('navbar-nav')) {
            $el.next().css({"top": $el[0].offsetTop, "left": $parent.outerWidth() - 4});
        }

        return false;
    });

    $('.faqLeftSidebar, .faqContent').theiaStickySidebar();


});



const sidebarMenu = document.getElementById("sidebarMenu");
let bar = false;

document.addEventListener("DOMContentLoaded", init);

function init() {
    createNavLinks();
    initSidebar();


    const parentMenu = sidebarMenu.lastElementChild.lastElementChild;

    const propsMenu = document.createElement("li");
    propsMenu.innerHTML = `<a href="#" class="has-arrow">Properties</a><ul></ul>`;
    parentMenu.insertBefore(propsMenu, parentMenu.children[1]);

    const versions = document.querySelector(".sidebar-header").children[1].lastElementChild;
    const menuOverview = sidebarMenu.children[1];
    const menuOptions = parentMenu.children[0];
    const menuMethods = parentMenu.children[2];
    let menuEvents = parentMenu.children[3];

    if ( menuMethods.lastElementChild.nodeName !== "UL" ) {
        const ul = document.createElement("ul");
        menuMethods.appendChild(ul);
    }    

    if ( menuOptions.lastElementChild.nodeName !== "UL" ) {
        const ul = document.createElement("ul");
        menuOptions.appendChild(ul);
    }

    if ( menuEvents.lastElementChild.nodeName !== "UL" ) {
        const ul = document.createElement("ul");
        menuEvents.appendChild(ul);
    }

    const demosMenu = document.createElement("li");
    demosMenu.innerHTML = `<a href="#" class="has-arrow">Demos</a><ul></ul>`;
    sidebarMenu.appendChild(demosMenu);

    fetch("https://api.github.com/repos/Mobius1/NestableJS/releases").then(resp => resp.json()).then(json => {

        let latest = json[0].name;

        // const main = document.getElementById("main-js");
        // main.src = main.src.replace("latest", latest);

        versions.previousElementSibling.textContent = latest;

        const frag = document.createDocumentFragment();
        json.slice(0,10).forEach((item,i) => {
            const a = document.createElement("a");
            a.className = "dropdown-item";
            a.href = item.html_url;
            a.textContent = i < 1 ? "latest" : item.name;

            if ( i < 1 ) {
                a.classList.add("active");
            }

            frag.appendChild(a);
        });
        versions.innerHTML = "";
        versions.appendChild(frag);
    });


    menuOverview.lastElementChild.innerHTML = `<li><a href="https://mobius1.github.io/NestableJS/index.html">Introduction</a></li>
                                              <li><a href="https://mobius1.github.io/NestableJS/getting-started.html">Getting Started</a></li>
                                              <li><a href="https://mobius1.github.io/NestableJS/options.html">Options</a></li>
                                              <li><a href="https://mobius1.github.io/NestableJS/data-attributes.html">Data Attributes</a></li>
                                              <li><a href="https://mobius1.github.io/NestableJS/public-methods.html">Public Methods</a></li>
                                              <li><a href="https://mobius1.github.io/NestableJS/events.html">Events</a></li>
                                              <li><a href="https://mobius1.github.io/NestableJS/changelog.html">Changelog</a></li>`;

    menuOptions.lastElementChild.innerHTML = `<li><a href="https://mobius1.github.io/NestableJS/api/options/threshold.html">threshold</a></li>
                                            <li><a href="https://mobius1.github.io/NestableJS/api/options/animation.html">animation</a></li>
                                            <li><a href="https://mobius1.github.io/NestableJS/api/options/data.html">data</a></li>
                                            <li><a href="https://mobius1.github.io/NestableJS/api/options/collapseButtonContent.html">collapseButtonContent</a></li>
                                            <li><a href="https://mobius1.github.io/NestableJS/api/options/expandButtonContent.html">expandButtonContent</a></li>
                                            <li><a href="https://mobius1.github.io/NestableJS/api/options/maxDepth.html">maxDepth</a></li>
                                            <li><a href="https://mobius1.github.io/NestableJS/api/options/showPlaceholderOnMove.html">showPlaceholderOnMove</a></li>
                                            <li><a href="https://mobius1.github.io/NestableJS/api/options/nodes.html">nodes</a></li>
                                            <li><a href="https://mobius1.github.io/NestableJS/api/options/classes.html">classes</a></li>`;

    propsMenu.lastElementChild.innerHTML = `<li><a href="https://mobius1.github.io/NestableJS/api/properties/config.html">config</a></li>`;


    menuMethods.lastElementChild.innerHTML = `<li><a href="https://mobius1.github.io/NestableJS/api/methods/add.html">add()</a></li>
                                                <li><a href="https://mobius1.github.io/NestableJS/api/methods/bind.html">bind()</a></li>
                                                <li><a href="https://mobius1.github.io/NestableJS/api/methods/collapseAll.html">collapseAll()</a></li>
                                                <li><a href="https://mobius1.github.io/NestableJS/api/methods/expandAll.html">expandAll()</a></li>
                                                <li><a href="https://mobius1.github.io/NestableJS/api/methods/destroy.html">destroy()</a></li>
                                                <li><a href="https://mobius1.github.io/NestableJS/api/methods/disable.html">disable()</a></li>
                                                <li><a href="https://mobius1.github.io/NestableJS/api/methods/enable.html">enable()</a></li>
                                                <li><a href="https://mobius1.github.io/NestableJS/api/methods/init.html">init()</a></li>
                                                <li><a href="https://mobius1.github.io/NestableJS/api/methods/load.html">load()</a></li>
                                                <li><a href="https://mobius1.github.io/NestableJS/api/methods/off.html">off()</a></li>
                                                <li><a href="https://mobius1.github.io/NestableJS/api/methods/on.html">on()</a></li>
                                                <li><a href="https://mobius1.github.io/NestableJS/api/methods/remove.html">remove()</a></li>
                                                <li><a href="https://mobius1.github.io/NestableJS/api/methods/unbind.html">unbind()</a></li>
                                                <li><a href="https://mobius1.github.io/NestableJS/api/methods/update.html">update()</a></li>`;

    menuEvents.lastElementChild.innerHTML = `<li><a href="https://mobius1.github.io/NestableJS/api/events/init.html">init</a></li>
                                            <li><a href="https://mobius1.github.io/NestableJS/api/events/start.html">start</a></li>
                                            <li><a href="https://mobius1.github.io/NestableJS/api/events/move.html">move</a></li>
                                            <li><a href="https://mobius1.github.io/NestableJS/api/events/stop.html">stop</a></li>
                                            <li><a href="https://mobius1.github.io/NestableJS/api/events/nest.html">nest</a></li>
                                            <li><a href="https://mobius1.github.io/NestableJS/api/events/unnest.html">unnest</a></li>
                                            <li><a href="https://mobius1.github.io/NestableJS/api/events/reorder.html">reorder</a></li>
                                            <li><a href="https://mobius1.github.io/NestableJS/api/events/list.collapse.html">list.collapse</a></li>                                            
                                            <li><a href="https://mobius1.github.io/NestableJS/api/events/list.expand.html">list.expand</a></li>
                                            <li><a href="https://mobius1.github.io/NestableJS/api/events/error.maxdepth.html">error.maxdepth</a></li>
                                            <li><a href="https://mobius1.github.io/NestableJS/api/events/error.disabled.html">error.disabled</a></li>
                                            <li><a href="https://mobius1.github.io/NestableJS/api/events/error.collapsed.html">error.collapsed</a></li>
                                            <li><a href="https://mobius1.github.io/NestableJS/api/events/error.confined.html">error.confined</a></li>
                                            <li><a href="https://mobius1.github.io/NestableJS/api/events/error.nesting.disabled.html">error.nesting.disabled</a></li>
                                            <li><a href="https://mobius1.github.io/NestableJS/api/events/error.dragging.disabled.html">error.dragging.disabled</a></li>`;

    demosMenu.lastElementChild.innerHTML = ``;

    if ( !menuOptions.firstElementChild.classList.contains("has-arrow") ) {
        menuOptions.firstElementChild.classList.add("has-arrow");
    }

    if ( !menuMethods.firstElementChild.classList.contains("has-arrow") ) {
        menuMethods.firstElementChild.classList.add("has-arrow");
    }

    if ( !menuEvents.firstElementChild.classList.contains("has-arrow") ) {
        menuEvents.firstElementChild.classList.add("has-arrow");
    }

    if ( document.getElementById("optionsList") ) {
        document.getElementById("optionsList").innerHTML = menuOptions.lastElementChild.innerHTML; 
    }

    const activeBreadcrumb = document.querySelector(".breadcrumb-item.active");

    if ( activeBreadcrumb ) {
        const items = sidebarMenu.querySelectorAll("li");

        items.forEach(item => {
            const link = item.querySelector("a");
            const match = link.textContent === activeBreadcrumb.textContent;
            if (match) {
                document.head.getElementsByTagName("title")[0].textContent = `NestableJS - ${link.textContent}`;

                items.forEach(el => {
                    el.classList.toggle("open", el.contains(link));
                });
            }
            item.classList.toggle("active", match);
        });
    }
}

function initSidebar() {
    sidebarMenu.addEventListener("click", toggleMenu, false);
    initBar();
    initSearch();
}

function initBar() {
    const link = document.createElement("link");
    link.href = "https://unpkg.com/minibarjs@latest/dist/minibar.min.css";
    link.rel = "stylesheet";
    link.type = "text/css";

    document.head.appendChild(link);
    document.head.insertBefore(link, document.head.querySelector("link"));

    const script = document.createElement("script");
    script.src = "https://unpkg.com/minibarjs@latest/dist/minibar.min.js";
    script.type ="text/javascript";

    document.body.insertBefore(script, document.body.querySelector("script"));

    script.async = true;
    script.onload = function(){
        bar = new MiniBar(sidebarMenu);

        document.querySelectorAll(".output").forEach(el => {
            new MiniBar(el, {
                alwaysShowBars: true
            });
        });
    };    
}

function toggleMenu(e) {
    const a = e.target.closest(".has-arrow");

    if ( a ) {
        e.preventDefault();
        const li = e.target.closest("li");
        li.classList.toggle("open");

        if ( bar ) {
            bar.update();
        }        
    }
}

function createNavLinks() {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/tocbot/4.4.2/tocbot.min.js";
    script.type ="text/javascript";

    document.body.insertBefore(script, document.body.querySelector("script"));

    script.async = true;
    script.onload = function(){
        tocbot.init({
          // Where to render the table of contents.
          tocSelector: '#section-nav',
          // Where to grab the headings to build the table of contents.
          contentSelector: '.content-wrapper',
          // Which headings to grab inside of the contentSelector element.
          headingSelector: 'h2, h3, h4, h5, h6',
          // listClass: '',
          listItemClass: 'toc-entry',
        });
    };  

    let ticking = false;
    const stickyNav = document.getElementById("section-nav");
    window.addEventListener('scroll', function(e) {
        scrollPos = window.pageYOffset || document.documentElement.scrollTop;
        if (!ticking) {
            requestAnimationFrame(function() {
                dockHeader();
                ticking = false;
            });
        }
        ticking = true;
    });

    function dockHeader() {
        var scrollY = window.scrollY;
        if ( scrollY > 0 ) {
            stickyNav.classList.add('docked');
        } else {
            stickyNav.classList.remove('docked');
        }
    }
}

function initSearch() {
    const old = document.querySelector(".has-search");
    const template = `<form class="form-group has-search" action="https://mobius1.github.io/NestableJS/search.html">
                        <span class="ti-search form-control-feedback"></span>
                        <input type="text" class="form-control" placeholder="Search docs ..." name="q">
                     </form>`;
    const div = document.createElement("div");
    div.innerHTML = template;

    old.parentNode.replaceChild(div.firstElementChild, old);
}