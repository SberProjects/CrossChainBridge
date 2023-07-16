const webpack = require('webpack');

module.exports = function override(config) {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        "path": require.resolve("path-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "buffer": require.resolve("buffer/"),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify") 
    })
    config.resolve.fallback = fallback;
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ])
    return config;
}