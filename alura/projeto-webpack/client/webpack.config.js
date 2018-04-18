const path = require('path');
const babiliPlugin = require('babili-webpack-plugin');

// usado para acabar com o FOUC, construindo o bundle de css
// separado do js, para que possa ser importando pela tag link
// dentro do intex.html
const extractTextPlugin = require('extract-text-webpack-plugin');

let plugins = [];

// recebe por parâmetro o nome do arquivo que vai ser gerado
plugins.push(new extractTextPlugin('styles.css'));

if (process.env.NODE_ENV == 'production') {
    plugins.push(new babiliPlugin());
}

module.exports = {
    entry: './app-src/app.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        // é usado pelo webpack-dev-server para carregar o bundle.js em memoria
        publicPath: 'dist'
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