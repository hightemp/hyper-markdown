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

    return turndownService.turndown(htmlText);
}