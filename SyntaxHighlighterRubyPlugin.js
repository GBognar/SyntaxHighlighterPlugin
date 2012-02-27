/***
|''Name''|SyntaxHighlighterRubyPlugin|
|''Description''|Enables syntax highlighting|
|''Author''|GBognar|
|''Version''|0.1.0|
|''Status''|@@experimental@@|
|''Source''||
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''CoreVersion''|2.6.5|
|''Requires''|ShCore.js|
|''Keywords''|syntax highlighting color code Ruby|
!Description
Enables syntax highlighting for <pre> and <code> blocks. Adds a new formatter for {{{<code class='brush:???'>}}}. 
!Documentation
See: [[SyntaxHighlighterRubyPluginInfo]]
!Configuration options
<<<
|''Guess syntax:''| <<option chkGuessSyntax>>|

|''Expert mode:''| <<option chkExpertSyntax>>|
 
If the {{{Expert mode}}} option __is activated__, the syntax highlighting for contents between //block braces// will be according to the parameters set below
|Content between """{{{""" and """}}}""" will be highlighted using| <<option txtShText>>|e.g.: {{{brush:text; gutter: false}}}|sets the option {{{txtShText}}}|
|Content between """/""""""*{{{*""""""/""" and """/""""""*}}}*""""""/""" will be highlighted using| <<option txtShCss>>|e.g.: {{{brush:css; tab-size: 4}}}|sets the option {{{txtShCss}}}|
|Content between """<!--{{{-->""" and """<!--}}}-->""" will be highlighted using| <<option txtShXml>>|e.g.: {{{brush:xml; tab-size:4}}}|sets the option {{{txtShXml}}}|
|Content between """//{{{""" and """//}}}""" will be highlighted  using|<<option txtShPlugin>>|e.g.: {{{brush:js; tab-size:4}}}|sets the option {{{txtShPlugin}}}|
|Content between """={{{""" and """=}}}""" will be highlighted  using|<<option txtShRuby>>|e.g.: {{{brush:ruby; tab-size:2}}}|sets the option {{{txtShRuby}}}|
<<<
!Revision History
<<<
*V 0.1.0 2012-02-27
**Initial release
<<<
/***
!Code
***/
//{{{
/* For jslint
jslint --predef=SyntaxHighlighter \
--predef=version --predef=config --predef=story --predef=createTiddlyElement --predef=merge \
--predef=$ --predef=jQuery \
--predef=alert --predef=window --predef=document \
--plusplus --regexp --sloppy --vars <nameOfPluginAsScript>
*/
if (!version.extensions.SyntaxHighlighterRubyPlugin) {
    // ensure the plugin is only installed once
    version.extensions.SyntaxHighlighterRubyPlugin = {
        major: 0,
        minor: 1,
        revision: 0,
        date: new Date(2012, 2, 27)
    };
    // Patching default monospacedByLine formatter
    (function (nameOfFormatterToBePatched) {
        var formatter, index;
        for (index = 1; index < config.formatters.length; index++) {
            if (config.formatters[index].name === nameOfFormatterToBePatched) {
                formatter = config.formatters[index];
                break;
            }
        }
        if (formatter !== undefined) {
            formatter.match = "^(?:/\\*\\{\\{\\{\\*/" +
                "|\\{\\{\\{|//\\{\\{\\{" +
                "|<!--\\{\\{\\{-->" +
                "|=\\{\\{\\{)\\n";
            formatter.handler = function (w) {
                switch (w.matchText) {
                case "/*{{{*/\n": // CSS
                    this.lookaheadRegExp = /\/\*\{\{\{\*\/\n*((?:^[^\n]*\n)+?)(\n*^\f*\/\*\}\}\}\*\/$\n?)/mg;
                    break;
                case "{{{\n": // monospaced block
                    this.lookaheadRegExp = /^\{\{\{\n((?:^[^\n]*\n)+?)(^\f*\}\}\}$\n?)/mg;
                    break;
                case "//{{{\n": // plugin
                    this.lookaheadRegExp = /^\/\/\{\{\{\n\n*((?:^[^\n]*\n)+?)(\n*^\f*\/\/\}\}\}$\n?)/mg;
                    break;
                case "<!--{{{-->\n": //template
                    this.lookaheadRegExp = /<!--\{\{\{-->\n*((?:^[^\n]*\n)+?)(\n*^\f*<!--\}\}\}-->$\n?)/mg;
                    break;
                case "={{{\n": //ruby
                    this.lookaheadRegExp = /=\{\{\{\n*((?:^[^\n]*\n)+?)(\n*^\f*=\}\}\}$\n?)/mg;
                    break;
                default:
                    break;
                }
                config.formatterHelpers.enclosedTextHelper.call(this, w);
            };//end of formatter.handler
        } else {
            alert("SyntaxHighlight was NOT enabled, as no formatter was found named '"
                + nameOfFormatterToBePatched + "'.");
        }
    }('monospacedByLine'));

    (function ($) {
        if (!window.SyntaxHighlighter) {
            throw "Missing dependency: SyntaxHighlighter";
        }

        config.macros.highlightSyntax = {
            getElementsByClass: function (searchClass, node, tag) {
                var classElements = [];
                if (node === null) {
                    node = document;
                }
                if (tag === null) {
                    tag = '*';
                }

                var els = node.getElementsByTagName(tag);
                var elsLen = els.length;
                var pattern = new RegExp("(^|\\s)" + searchClass + "(:|\\s|$)");
                var i, j;
                for (i = 0, j = 0; i < elsLen; i++) {
                    if (pattern.test(els[i].className)) {
                        classElements[j] = els[i];
                        j++;
                    }
                }
                return classElements;
            }, //end of getElementsByClass
            handler: function (place, macroName, params, wikifier, paramString, tiddler) {
                // the configured tagName can be temporarily overwritten by the macro.
                var tagName = params[0] || SyntaxHighlighter.config.tagName;
                var arr = this.getElementsByClass('brush', story.findContainingTiddler(place), tagName);
                var i;
                for (i = 0; i < arr.length; i++) {
                    SyntaxHighlighter.highlight(null, arr[i]);
                }
            } //end of handler
        };
    }(jQuery));
    config.formatters.push({
        name: "highlightSyntax",
        match: "^<code[\\s]+[^>]+>\\n",
        element: "pre",
        handler: function (w) {
            this.lookaheadRegExp = /<code[\s]+class.*=.*["'](.*)["'].*>\n((?:^[^\n]*\n)+?)(^<\/code>$\n?)/img;
            this.lookaheadRegExp.lastIndex = w.matchStart;
            var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
            if (lookaheadMatch && lookaheadMatch.index === w.matchStart) {
                var options = lookaheadMatch[1];
                var text = lookaheadMatch[2];
                if (config.browser.isIE) {
                    text = text.replace(/\n/g, "\r");
                }
                var element = createTiddlyElement(w.output, this.element, null, options, text);
                SyntaxHighlighter.highlight(null, element);
                w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
            }
        }
    });
    (function (formatters) { // set up alias
        var helper = {};
        helper.enclosedTextHelper = function (w) {
            var attr;
            var co = config.options;
            var expert = (co.chkExpertSyntax !== undefined) ? co.chkExpertSyntax : false;
            var guess = (co.chkGuessSyntax !== undefined) ? co.chkGuessSyntax : true;

            this.lookaheadRegExp.lastIndex = w.matchStart;
            var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
            if (lookaheadMatch && lookaheadMatch.index === w.matchStart) {
                var text = lookaheadMatch[1];
                if (config.browser.isIE) {
                    text = text.replace(/\n/g, "\r");
                }
                switch (w.matchText) {
                case "{{{\n": // text
                    attr = (expert) ? (co.txtShText) ? (co.txtShText) : 'brush:text' : 'brush:text';
                    break;
                case "/*{{{*/\n": // CSS
                    attr = (expert) ? (co.txtShCss) ? (co.txtShCss) : 'brush:css' : 'brush:css';
                    break;
                case "//{{{\n": // plugin
                    attr = (expert) ? (co.txtShPlugin) ? (co.txtShPlugin) : 'brush:js' : 'brush:js';
                    break;
                case "<!--{{{-->\n": //template
                    attr =  (expert) ? (co.txtShXml) ? (co.txtShXml) : 'brush:xml' : 'brush:xml';
                    break;
                case "={{{\n": // Ruby
                    attr = (expert) ? (co.txtShRuby) ? (co.txtShRuby) : 'brush:ruby' : 'brush:ruby';
                    break;
                }
                var element = createTiddlyElement(w.output, this.element, null, attr, text);
                if (guess || expert) {
                    SyntaxHighlighter.highlight(null, element);
                }

                w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
            }
        };
        // merge the new helper function into formatterHelpers.
        merge(config.formatterHelpers, helper);

    }(config.formatters)); //# end of alias
} //# end of install only once
//}}}
