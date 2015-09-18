define(['react', 'lodash', 'stub-components/test-part.rt'], function (React, _, template) {
    'use strict';

    return React.createClass({
        getDefaultProps: function() {
            return { name: this.displayName }
        },
        displayName: 'test-part-1.1',
        render: template
    });
});
