const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
	entry: { main: './src/client/js/index.js' },
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'app.[chunkhash].js',
		assetModuleFilename: 'assets/[name][ext]'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader"
				}
			},
			{
				test: /\.(scss)$/,
				use: [{
					loader: 'style-loader'
				}, {
					loader: 'css-loader'
				}, {
					loader: 'postcss-loader',
					options: {
						postcssOptions: {
							plugins: function () {
								return [
									require('autoprefixer')
								];
							}
						}
					}
				}, {
					// compiles Sass to CSS
					loader: 'sass-loader'
				}]
			},
			{
				test: /\.(jpg|png|svg|ico|mp3)$/,
				type: 'asset/resource'
			}
		]
	},
	plugins: [
		new Dotenv({
			systemvars: true,
		}),
		new MiniCssExtractPlugin({
			filename: 'style.[chunkhash].css',
		}),
		new HtmlWebpackPlugin({
			inject: false,
			hash: true,
			template: './src/client/index.html',
			filename: 'index.html'
		}),
		new CleanWebpackPlugin()
	],
	devServer: {
		static: {
			directory: path.join(__dirname, 'dist'),
			publicPath: '/'
		},
		compress: true,
		port: 8000,
		historyApiFallback: true
	},
	target: ["web", "es5"]
};