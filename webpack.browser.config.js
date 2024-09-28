const path = require("path");
const webpack = require("webpack");

module.exports = {
    mode: 'production',
	entry: path.resolve("./src/extension"),
	output: {
		path: path.resolve("./out/extension"),
		filename: "extension_browser.js",
		libraryTarget: "commonjs2",
	},
	devtool: "source-map",
	externals: {
		vscode: "commonjs vscode",
	},
	resolve: {
		extensions: [".ts", ".js"],
		fallback: {
			path: require.resolve("path-browserify"),
			fs: false,
		},
	},
	module: {
		rules: [
			{
				test: /\.html$/i,
				loader: "raw-loader",
			},
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "ts-loader",
					},
				],
			},
		],
	},
	node: {
		__dirname: false,
	},
	plugins: [
	],
    optimization: {
        minimize: true,
    },
};
