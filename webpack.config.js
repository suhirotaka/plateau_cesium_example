const path = require("path");
const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopywebpackPlugin = require("copy-webpack-plugin");
const Dotenv = require("dotenv-webpack");

const cesiumSource = "node_modules/cesium/Source";
const cesiumWorkers = "../Build/Cesium/Workers";

module.exports = {
  mode: "development",
  context: __dirname,
  entry: {
    app: "./src/index.js",
  },
  module: {
    rules: [
      {
        test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
        type: "asset/inline",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  devServer: {
    port: 8081,
    static: {
      directory: path.resolve(__dirname, "dist"),
    },
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
    assetModuleFilename: "assets/[name].[contenthash][ext]",
    sourcePrefix: "", // Needed to compile multiline strings in Cesium
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),
    new CopywebpackPlugin({
      patterns: [
        { from: path.join(cesiumSource, cesiumWorkers), to: "Workers" },
        { from: path.join(cesiumSource, "Assets"), to: "Assets" },
        { from: path.join(cesiumSource, "Widgets"), to: "Widgets" },
      ],
    }),
    new webpack.DefinePlugin({
      CESIUM_BASE_URL: JSON.stringify(""), // Define relative base path in cesium for loading assets
    }),
    new Dotenv(),
  ],
  resolve: {
    alias: {
      cesium: path.resolve(__dirname, cesiumSource), // CesiumJS module name
    },
    fallback: {
      fs: false,
    },
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          name: "chunk-vendor",
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks: "initial",
        },
        cesium: {
          name: "chunk-cesium",
          test: /[\\/]node_modules[\\/]cesium/,
          chunks: "all",
        },
      },
    },
  },
  amd: {
    toUrlUndefined: true, // Enable webpack-friendly use of require in Cesium
  },
  devtool: "eval",
};
