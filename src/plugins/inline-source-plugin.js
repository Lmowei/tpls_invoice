/*
 * @Description: my self custorm inline source
 * @Author: JasonYang
 * @Date: 2019-08-25 22:37:48
 * @LastEditTime: 2019-08-26 00:32:48
 */
'use strict';
var assert = require('assert');
var escapeRegex = require('escape-string-regexp');
var path = require('path');
var slash = require('slash');
var sourceMapUrl = require('source-map-url');

function HtmlWebpackInlineSourcePlugin(options) {
    assert.equal(options, undefined, 'The HtmlWebpackInlineSourcePlugin does not accept any options');
}

HtmlWebpackInlineSourcePlugin.prototype.apply = function (compiler) {
    var self = this;

    // Hook into the html-webpack-plugin processing

    (compiler.hooks ?
        compiler.hooks.compilation.tap.bind(compiler.hooks.compilation, 'html-webpack-inline-source-plugin') :
        compiler.plugin.bind(compiler, 'compilation'))(function (compilation) {
        (compilation.hooks ?
            compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync.bind(compilation.hooks.htmlWebpackPluginAlterAssetTags, 'html-webpack-inline-source-plugin') :
            compilation.plugin.bind(compilation, 'html-webpack-plugin-alter-asset-tags'))(function (htmlPluginData, callback) {
            if (!htmlPluginData.plugin.options.inlineSource) {
                return callback(null, htmlPluginData);
            }

            var regexStr = htmlPluginData.plugin.options.inlineSource;

            

            var result = self.processTags(compilation, regexStr, htmlPluginData);

            

            callback(null, result);
        });
    });
};

HtmlWebpackInlineSourcePlugin.prototype.processTags = function (compilation, regexStr, pluginData) {
    var self = this;

    var body = [];
    var head = [];

    var regex = new RegExp(regexStr);

    

    pluginData.head.forEach(function (tag) {
        head.push(self.processTag(compilation, regex, tag));
    });

    pluginData.body.forEach(function (tag) {
        body.push(self.processTag(compilation, regex, tag));
    });

    return {
        head: head,
        body: body,
        plugin: pluginData.plugin,
        chunks: pluginData.chunks,
        outputName: pluginData.outputName
    };
};

HtmlWebpackInlineSourcePlugin.prototype.resolveSourceMaps = function (compilation, assetName, asset) {
    var source = asset.source();
    var out = compilation.outputOptions;
    // Get asset file absolute path
    var assetPath = path.join(out.path, assetName);
    // Extract original sourcemap URL from source string
    if (typeof source !== 'string') {
        source = source.toString();
    }
    var mapUrlOriginal = sourceMapUrl.getFrom(source);
    // Return unmodified source if map is unspecified, URL-encoded, or already relative to site root
    if (!mapUrlOriginal || mapUrlOriginal.indexOf('data:') === 0 || mapUrlOriginal.indexOf('/') === 0) {
        return source;
    }
    // Figure out sourcemap file path *relative to the asset file path*
    var assetDir = path.dirname(assetPath);
    var mapPath = path.join(assetDir, mapUrlOriginal);
    var mapPathRelative = path.relative(out.path, mapPath);
    // Starting with Node 6, `path` module throws on `undefined`
    var publicPath = out.publicPath || '';
    // Prepend Webpack public URL path to source map relative path
    // Calling `slash` converts Windows backslashes to forward slashes
    var mapUrlCorrected = slash(path.join(publicPath, mapPathRelative));
    // Regex: exact original sourcemap URL, possibly '*/' (for CSS), then EOF, ignoring whitespace
    var regex = new RegExp(escapeRegex(mapUrlOriginal) + '(\\s*(?:\\*/)?\\s*$)');
    // Replace sourcemap URL and (if necessary) preserve closing '*/' and whitespace
    return source.replace(regex, function (match, group) {
        return mapUrlCorrected + group;
    });
};

HtmlWebpackInlineSourcePlugin.prototype.processTag = function (compilation, regex, tag) {
    var assetUrl;

    

    // inline js
    if (tag.tagName === 'script' && regex.test(tag.attributes.src)) {
        assetUrl = tag.attributes.src;
        tag = {
            tagName: 'script',
            closeTag: true,
            attributes: {
                type: 'text/javascript'
            }
        };

        // inline css
    } else if (tag.tagName === 'link' && regex.test(tag.attributes.href)) {
        assetUrl = tag.attributes.href;
        tag = {
            tagName: 'style',
            closeTag: true,
            attributes: {
                type: 'text/css'
            }
        };
    }

    if (assetUrl) {
        // Strip public URL prefix from asset URL to get Webpack asset name
        var publicUrlPrefix = compilation.outputOptions.publicPath || '';
        // ***JasonYang 定製：解決html-webpack-plugin輸出同級js路徑問題無法調用源的問題
        assetUrl = assetUrl.replace('../', '');
        var assetName = path.posix.relative(publicUrlPrefix, assetUrl);
        // console.log(assetName);
        var asset = compilation.assets[assetName];
        var updatedSource = this.resolveSourceMaps(compilation, assetName, asset);
        tag.innerHTML = (tag.tagName === 'script') ? updatedSource.replace(/(<)(\/script>)/g, '\\x3C$2') : updatedSource;
    }

    return tag;
};

module.exports = HtmlWebpackInlineSourcePlugin;
