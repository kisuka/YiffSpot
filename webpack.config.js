const path               = require('path');
const ExtractTextPlugin  = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin  = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const Dotenv             = require('dotenv-webpack');

module.exports = {
	entry: { main: './src/client/js/index.js' },
	output: {
    	path: path.resolve(__dirname, 'dist'),
	    filename: 'app.[chunkhash].js'
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
				test: /\.scss$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: ['css-loader', 'sass-loader']
				})
			},
			{
				test: /\.(jpg|png|svg|ico|mp3)$/,
				use: {
					loader: "file-loader",
					options: {
						name: '[name].[ext]',
						outputPath: 'assets/',
						publicPath: '/assets/'
					}
				}
			}
		]
	},
	plugins: [
	    new Dotenv({
	      systemvars: true,
	    }),
	    new ExtractTextPlugin({
			filename: 'style.[chunkhash].css',
			disable: false,
			allChunks: true
		}),
		new HtmlWebpackPlugin({
			inject: false,
			hash: true,
			template: './src/client/index.html',
			filename: 'index.html'
	    }),
	    new CleanWebpackPlugin(['dist'])
	],
	devServer: {
	    contentBase: path.join(__dirname, 'dist'),
	    compress: true,
	    port: 8000,
	    publicPath: '/',
	    historyApiFallback: true
	}
};
