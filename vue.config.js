const { mergeSassVariables } = require('@vuetify/cli-plugin-utils')
module.exports = {
    devServer: {
        public: 'https://192.168.3.206:9999'
        // publicPath: process.env.VUE_APP_BASE_API,
        // proxy: {
        //     '/api': {
        //         target: process.env.VUE_APP_TARGET_URL,
        //         changeOrigin: false,
        //         pathRewrite: {
        //             '^/api': ""
        //         }
        //     }
        // },
        // https: true
    },
    transpileDependencies: [
        'vuetify'
    ],
    chainWebpack: config => {
        const modules = ['vue-modules', 'vue', 'normal-modules', 'normal']
        modules.forEach(match => {
            config.module
                .rule('sass')
                .oneOf(match)
                .use('sass-loader')
                .tap(opt => mergeSassVariables(opt, "'@/styles/variables.scss'"))
            config.module
                .rule('scss')
                .oneOf(match)
                .use('sass-loader')
                .tap(opt => mergeSassVariables(opt, "'@/styles/variables.scss';"))
        })
    },
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            customFileProtocol: './',
            chainWebpackMainProcess: (config) => {
                config.output.filename('index.js')
            },
            builderOptions: {
                // options placed here will be merged with default configuration and passed to electron-builder
                productName: 'im',
                appId: '123456789',
                copyright: 'Copyright © 2022', // 版权信息
                directories: {
                    output: './dist_electron'// 输出文件路径
                },
                releaseInfo: {
                    releaseNotes: '{"forceVersion": "0.0.4", "wholeVersion": "0.0.4"}'
                },
                afterPack: './afterPack.js',
                extraResources: [{
                    from: 'dist_electron/bundled',
                    to: 'app.asar.unpacked',
                    filter: [
                        '!**/icons',
                        '!**/preload.js',
                        '!**/node_modules',
                        '!**/index.js'
                    ]
                }],
                files: [
                    '**/icons/*',
                    '**/preload.js',
                    '**/node_modules/**/*',
                    '**/index.js'
                ],
                publish: {
                    provider: 'generic',
                    url: process.env.VUE_APP_UPDATE_URL
                },
                nsis: {
                    oneClick: false,
                    perMachine: true,
                    allowElevation: true,
                    allowToChangeInstallationDirectory: true,
                    createDesktopShortcut: true,
                    createStartMenuShortcut: true,
                    runAfterFinish: true,
                    installerIcon: './public/icons/tray.ico',
                    uninstallerIcon: './public/icons/tray.ico'
                },
                win: { // win相关配置
                    icon: '/public/icons/tray.ico', // 图标，当前图标在根目录下，注意这里有两个坑
                    // requestedExecutionLevel: 'highestAvailable',
                  // eslint-disable-next-line no-template-curly-in-string
                    artifactName: '${productName}_${version}.${ext}',
                    target: [
                        {
                            target: 'nsis', // 利用nsis制作安装程序
                            arch: [
                                'x64',
                                'ia32' // 32位
                            ]
                        }
                    ]
                },
                mac: {
                    target: ['dmg'],
                  // eslint-disable-next-line no-template-curly-in-string
                    artifactName: '${productName}_${version}.${ext}',
                    category: 'public.app-category.productivity',
                    hardenedRuntime: true,
                    gatekeeperAssess: true,
                    extendInfo: {
                        NSAppleEventsUsageDescription: 'Let me use Apple Events.',
                        NSCameraUsageDescription: 'Let me use the camera.',
                        NSScreenCaptureDescription: 'Let me take screenshots.'
                    }
                },
                dmg: {
                    // background: "installer/mac/dmg-background.png",
                    iconSize: 100,
                    contents: [
                        {
                            x: 255,
                            y: 85,
                            type: 'file'
                        },
                        {
                            x: 253,
                            y: 325,
                            type: 'link',
                            path: '/Applications'
                        }
                    ],
                    window: {
                        width: 500,
                        height: 500
                    }
                },
                linux: {
                    desktop: {
                        StartupNotify: 'false',
                        Encoding: 'UTF-8',
                        MimeType: 'x-scheme-handler/deeplink'
                    },
                    target: ['AppImage', 'rpm', 'deb']
                },
                deb: {
                    priority: 'optional',
                    afterInstall: 'installer/linux/after-install.tpl'
                },
                rpm: {
                    fpm: ['--before-install', 'installer/linux/before-install.tpl'],
                    afterInstall: 'installer/linux/after-install.tpl'
                }
            }
        }
    }

}
