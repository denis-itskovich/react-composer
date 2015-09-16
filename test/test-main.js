var tests = Object
    .keys(window.__karma__.files)
    .filter(RegExp.prototype.test.bind(/\.test\.js$/));

requirejs.config({
    baseUrl: '/base',

    packages: [
        {name: 'stub-components', location: './test/stub-components'}
    ],

    // ask Require.js to load these files (all our tests)
    deps: tests,
    // start tests, once Require.js is done
    callback: function () {
        window.__karma__.start();
    }
});
