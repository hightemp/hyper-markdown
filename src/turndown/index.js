var TurndownService = require("turndown");

window.convertHtmlToMarkdown = function (htmlText) {
    let turndownService = new TurndownService.default({
        headingStyle: "atx",
        hr: "---",
        bulletListMarker: "-",
        codeBlockStyle: "fenced",
        fence: "```",
        linkStyle: "inlined"
    });

    turndownService.remove(["script", "style", "title"]);
    
    turndownService.addRule("strikethrough", {
        filter: ["del", "s"],
        replacement: function (e) {
            return "~~" + e + "~~"
        }
    });

    turndownService.addRule("highlight", {
        filter: ["mark"],
        replacement: function (e) {
            return "==" + e + "=="
        }
    });

    turndownService.addRule("taskListItems", {
        filter: function (e) {
            return e instanceof HTMLInputElement && e.type === "checkbox" && e.parentNode.nodeName === "LI";
        },
        replacement: function (e, t) {
            return t.checked ? "[x] " : "[ ] "
        }
    })

    var ab = {
        left: ":--",
        right: "--:",
        center: ":-:"
    };

    function sb(e) {
        if (!e) return !1;
        var t, n, i = e.parentNode;
        return "THEAD" === i.nodeName || i.firstChild === e && ("TABLE" === i.nodeName || (n = (t = i)
            .previousSibling, "TBODY" === t.nodeName && (!n || "THEAD" === n.nodeName &&
                /^\s*$/i.test(n.textContent)))) && Array.prototype.every.call(e.childNodes, (
            function (e) {
                return "TH" === e.nodeName
            }))
    }

    function lb(e) {
        var t = e.getAttribute("colspan");
        if (!t) return 0;
        var n = parseInt(t);
        return isNaN(n) ? 0 : Math.max(0, n - 1)
    }

    function cb(e, t) {
        return t.repeat(lb(e))
    }

    turndownService.addRule("tableRow", {
        filter: "tr",
        replacement: function (e, t) {
            var n = "";
            if (sb(t))
                for (var i = 0; i < t.cells.length; i++) {
                    var r = t.cells[i],
                        o = (r.getAttribute("align") || "").toLowerCase(),
                        a = ab[o] || "---";
                    n += (0 === i ? "|" : "") + a + "|" + cb(r, a + "|")
                }
            return "\n" + e + (n ? "\n" + n : "")
        }
    });
    
    turndownService.addRule("table", {
        filter: "table",
        replacement: function (e, t) {
            var n = t.rows[0];
            if (!sb(n)) {
                for (var i = n.cells.length, r = 0; r < n.cells.length; r++) i += lb(n
                    .cells[r]);
                e = "|" + "   |".repeat(i) + "\n|" + "---|".repeat(i) + "\n" + e.replace(
                    /^[\r\n]+/, "")
            }
            return "\n\n" + (e = e.replace(/[\r\n]+/g, "\n")) + "\n\n"
        }
    });

    turndownService.addRule("tableSection", {
        filter: ["thead", "tbody", "tfoot"],
        replacement: function (e) {
            return e
        }
    });

    turndownService.addRule("tableCell", {
        filter: ["th", "td"],
        replacement: function (e, t) {
            return (0 === Array.prototype.indexOf.call(t.parentNode.childNodes, t) ? "|" :
                "") + function (e) {
                return (e = e.trim().replace(/\|+/g, "\\|").replace(/\n\r?/g, "<br>")) +
                    "|"
            }(e) + cb(t, "   |")
        }
    });

    return turndownService.turndown(htmlText);
}