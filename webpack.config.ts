import path from "path";
import { Configuration } from "webpack";
import nodeExternals from "webpack-node-externals";

const config: Configuration[] = [
  // Node 
  {
    entry: "./src/index.ts",
    mode: "production",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    target: "node",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "magicfeedback-sdk.node.js",
      library: {
        name: "magicfeedback",
        type: "umd",
        export: "default",
      },
    },
    externals: [nodeExternals()],
  },
  // Web
  {
    entry: "./src/index.ts",
    mode: "production",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    target: "web",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "magicfeedback-sdk.browser.js",
      library: {
        name: "magicfeedback",
        type: "umd",
        export: "default",
      },
    },
  },
];

export default config;