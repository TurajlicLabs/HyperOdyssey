module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    chrome: "23"
                }
            },
            '@babel/preset-typescript'
        ]
    ]
};