var tests = Object
    .keys(window.__karma__.files)
    .filter(function(file) {
        return /\.test\.js$/.test(file);
    });

requirejs.config({
    baseUrl: '/base',
    urlArgs: "bust=" + (new Date()).getTime(),

    paths: {
        lodash: 'bower_components/lodash/lodash',
        ajax: 'bower_components/ajax/dist/ajax.min',
        react: 'bower_components/react/react-with-addons',
        composer: 'src/composer',
        json: 'bower_components/requirejs-plugins/src/json',
        text: 'bower_components/requirejs-plugins/lib/text'
    },

    packages: [
        {name: 'stub-components', location: './test/stub-components'}
    ],

    map: {
        '*': {
            'react/addons': 'react'
        }
    },


    // ask Require.js to load these files (all our tests)
    deps: tests,
    // start tests, once Require.js is done
    callback: function () {
        window.__karma__.start();
    }
});
