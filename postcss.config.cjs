/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('postcss-load-config').Config} */
module.exports = {
    plugins: [
        require('@csstools/postcss-global-data')({
            files: ['./src/styles/breakpoints.css'],
        }),
        require('postcss-custom-media'),
        require('autoprefixer'),
    ],
};
