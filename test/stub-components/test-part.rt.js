define([
    'react/addons',
    'lodash'
], function (React, _) {
    'use strict';
    return function () {
        return React.createElement('div', {}, 'Hello from ' + this.props.name);
    };
});