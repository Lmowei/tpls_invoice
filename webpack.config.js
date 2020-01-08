/*
 * @Description: webpack config
 * @Author: JasonYang
 * @Date: 2019-08-23 17:03:05
 * @LastEditTime: 2019-08-27 20:09:00
 */
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');
// 自定義化的inline-source-plugin
const HtmlWebpackInlineSourcePlugin = require('./src/plugins/inline-source-plugin');

module.exports = {
    devServer: {
        port: 3000,
        host: 'localhost',
        progress: true,
        contentBase: './build',
        compress: true
    },
    mode: "development",
    entry: {
        form: './src/form/form.ts',
        model: './src/model/model.ts',
        pdf: './src/pdf/pdf.ts',
    },
    output: {
        filename: '[name]/[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    optimization: {
        minimizer: [new OptimizeCSSAssetsPlugin()],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name]/[name].css',
        }),
        new OptimizeCSSAssetsPlugin(),
        new HtmlWebpackPlugin({
            chunks: ['form'],
            template: './src/form/form.ejs',
            filename: 'form/form.htm',
            inlineSource: '.(js|css)$' // 定製化嵌入
        }),
        new HtmlWebpackPlugin({
            chunks: ['model'],
            template: './src/model/model.ejs',
            filename: 'model/model.htm',
            inlineSource: '.(js|css)$' // 定製化嵌入
        }),
        new HtmlWebpackPlugin({
            chunks: ['pdf'],
            template: './src/pdf/pdf.ejs',
            filename: 'pdf/pdf.htm',
            inlineSource: '.(js|css)$' // 定製化嵌入
        }),
        new HtmlWebpackInlineSourcePlugin()
    ],
    module: {
        rules: [{
            test: /.ejs$/i,
            use: [{
                loader: 'html-withimg-loader'
            }]
        }, {
            test: /.scss$/i,
            use: [
                MiniCssExtractPlugin.loader,
                // {loader: 'style-loader'},
                {
                    loader: 'css-loader'
                },
                {
                    loader: 'postcss-loader'
                },
                {
                    loader: 'sass-loader'
                }
            ]
        }, {
            test: /\.(png|jpg|gif|svg)$/i,
            use: {
                loader: 'url-loader',
                // options: {
                //     limit: 5 * 1024,
                //     outputPath: 'img/'
                // }
            }
        }, {
            test: /.tsx?$/i,
            use: 'ts-loader'
        }]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    devtool: 'source-map'
}