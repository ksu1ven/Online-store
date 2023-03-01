const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');





const baseConfig = {
    devtool: 'eval-source-map',
    entry: path.resolve(__dirname, './src/index.ts'),
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.ts$/i,
                use: 'ts-loader',
                include: path.resolve(__dirname, 'src'),
            },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff)$/,
                type: 'asset/resource',
            }
           
        ]
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/online-store/',
        assetModuleFilename: 'img/[name][ext]'
    },
    plugins: [
        new HtmlWebpackPlugin(
            {
                template: path.resolve(__dirname, './src/index.html'), 
                filename: 'index.html'
                }
        ),
    ],
    
    devServer: {
        static: path.join(__dirname, 'dist'),
        historyApiFallback: true,


    }
};
baseConfig.experiments = {
    topLevelAwait: true,
  }

module.exports = ({ mode }) => {
    const isProductionMode = mode === 'prod';
    const envConfig = isProductionMode ? require('./webpack.prod.config') : require('./webpack.dev.config');

    return merge(baseConfig, envConfig);
};
