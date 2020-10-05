const path = require('path') // Необходим для работы с абсолютными путями
const HtmlWebpackPlugin = require('html-webpack-plugin') // Плагин подключит все необходимые скрипты в html самостоятельно
const { CleanWebpackPlugin } = require('clean-webpack-plugin') // Плагин удаляет все неиспользуемые файлы
const CopyPlugin = require('copy-webpack-plugin') // Копирует отдельные файлы, которые уже существуют в каталоге сборки.
const MiniCssExtractPlugin = require('mini-css-extract-plugin') // Объединяет все css стили в один файл
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin') // Плагин для минификации css
const TerserPlugin = require('terser-webpack-plugin') // Плагин для минификации javascript

const isDev = process.env.NODE_ENV === 'development' // Условия если проект находится в разработке
const isProd = !isDev // Условия для готового проекта

// Объеденяем повторяющийся код и выносим в отдельный файл
const optimization = () => {
  const config = {
    splitChunks: {
      chunks: 'all'
    }
  }

  // Добавляем минификацию css и javascript для готового проекта
  if (isProd) {
    config.minimizer = [
      new OptimizeCssAssetsPlugin(),
      new TerserPlugin()
    ]
  }

  return config
}

// Условия если проект в разработке, то хэши не ставим
const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

// Создаём конфигурацию для webpack(a)
module.exports = {
  // Указываем исходную папку нашего приложения
  context: path.resolve(__dirname, 'app'),

  // Указываем что мы работаем в среде разрабрти (для необходимой компиляции файлов)
  mode: 'development',

  // Добавляем исходные карты для проекта в разработке
  devtool: isDev ? 'source-map' : '',

  // Указываем начальный (входной) файл для нашего приложения и подключаем polyfill для babel
  entry: {
    main: ['@babel/polyfill', './js/index.js'],
  },

  // Указываем куда webpack будет складывать результат работы
  output: {
    filename: filename('js'),
    path: path.resolve(__dirname, 'dist')
  },

  // вызываем функцию по оптимизации проекта
  optimization: optimization(),

  // Запускаем свой сервер с автоматической перезагрузкой
  devServer: {
    port: 3000
  },

  // Подключаем плагины
  plugins: [
    // Плагин подключит все необходимые скрипты в html самостоятельно
    new HtmlWebpackPlugin({
      template: './index.html',
      minify: {
        collapseWhitespace: isProd
      }
    }),

    // Плагин удаляет все неиспользуемые файлы
    new CleanWebpackPlugin(),

    // Плагин копирует отдельные файлы, которые уже существуют в каталоге сборки. (favicon)
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'app/assets/images/favicon/cat.ico'),
          to: path.resolve(__dirname, 'dist')
        }
      ]
    }),

    // Плагин объединяет все css стили в один файл
    new MiniCssExtractPlugin({
      filename: filename('css'),
    })
  ],

  // Подключаем модули
  module: {
    rules: [
      {
        test: /\.css$/,
        // css-loader – позволяем webpack(у) понимать импорты css, MiniCssExtractPlugin – объединяем все стили и добавляем в html
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
              reloadAll: true
            }
          },
          'css-loader'
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
              reloadAll: true
            }
          },
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(jpg|jpeg|png|webp|svg|gif)$/,
        // file-loader – позволяем webpack(у) понимать импорты картинок
        use: ['file-loader']
      },
      {
        test: /\.(eot|otf|svg|ttf|woff|woff2)$/,
        // file-loader – позволяем webpack(у) понимать импорты шрифтов
        use: ['file-loader']
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        // Извлекает исходные карты из существующих исходных файлов
        use: ['source-map-loader'],
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        // Подключаем babel
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-proposal-class-properties']
          }
        }
      }
    ]
  }
}