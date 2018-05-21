const path = require('path');
const babiliPlugin = require('babili-webpack-plugin');

// usado para acabar com o FOUC, construindo o bundle de css
// separado do js, para que possa ser importando pela tag link
// dentro do intex.html
const extractTextPlugin = require('extract-text-webpack-plugin');

// usado para minificar css
const optimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');

let plugins = [];

// lazy loading, carregamento sob demanda, para quando a app ficar grande

// usado para não precisar importar os arquivos gerados pelo webpack
// manualmente no HTML da aplicação
plugins.push(new htmlWebpackPlugin({
    // para validação do cash no navegador, se o hash do arquivo mudar
    // o cache vai invalidar, e recarregar
    hash: true,
    minify: {
        html5: true,
        collapseWhitespace: true,
        removeComments: true
    },
    filename: 'index.html',
    template: __dirname + '/main.html'
}));

// recebe por parâmetro o nome do arquivo que vai ser gerado
plugins.push(new extractTextPlugin('styles.css'));

// necessário para tornar o jQuery global e não um módulo confinado
// no momento da importação, pode usar pro loadesh por exemplo também
plugins.push(new webpack.ProvidePlugin({
    '$': 'jquery/dist/jquery.js',
    'jQuery': 'jquery/dist/jquery.js'
}));

// separando bibliotecas de terceiros em outro arquivo
plugins.push(new webpack.optimize.CommonsChunkPlugin({
    // name é um identificador
    name: 'vendor',
    filename: 'vendor.bundle.js'
}));

// para usar o Define do webpack, tem que usar JSON STRINGFY!!!
let SERVICE_URL = JSON.stringify('http://localhost:3000');
if (process.env.NODE_ENV == 'production') {
    SERVICE_URL = JSON.stringify('http://endereco-da-sua-api');

    // para otimizar o parse dos módulos no carregamento do app no browser
    plugins.push(new webpack.optimize.ModuleConcatenationPlugin());

    plugins.push(new babiliPlugin());
    plugins.push(new optimizeCssAssetsPlugin({
        cssProcessor: require('cssnano'),
        cssProcessorOptions: {
            discardComments: {
                removeAll: true
            }
        },
        canPrint: true
    }));
}

plugins.push(new webpack.DefinePlugin({ SERVICE_URL }));

module.exports = {
    entry: {
        app: './app-src/app.js',
        // app não precisa ter esse nome, mas o vendor deve ser o mesmo do
        // identificador criado a cima
        vendor: ['jquery', 'bootstrap', 'reflect-metadata']
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        // // é usado pelo webpack-dev-server para carregar o bundle.js em memoria
        // // é removido para usar a importação automática do html-webpack-plugin
        // publicPath: 'dist'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }, 
            // css-loader le o css e transforma em json para outros loaders
            // style-loader pega as informacoes do json e transforma inline para o navegador
            {
                test: /\.css$/,
                use: extractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                })
                // loader: 'style-loader!css-loader'
                //! é para a ordem de uso dos loaders, DA DIREITA PARA ESQUERDA
            },
            // url-loader ve a URL da fonte, extrai e copia no lugar certo de dist, usando versionamento
            // file-loader trata de forma especial algumas fontes
            { 
                test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, 
                loader: 'url-loader?limit=10000&mimetype=application/font-woff' 
            },
            { 
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, 
                loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
            },
            { 
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, 
                loader: 'file-loader' 
            },
            { 
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, 
                loader: 'url-loader?limit=10000&mimetype=image/svg+xml' 
            }
        ]
    },
    plugins
}