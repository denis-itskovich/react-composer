/**
 * Created by Denis on 11/09/2015.
 */
define('composer', ['react', 'lodash'], function(React, _) {
    var Composer = function() {
        var composer = {
            modules: [],
            partsMap: {},
            pendingCallbacks: {},
            loadingModules: 0,

            isLoadingModules: function() {
                return this.loadingModules != 0;
            },

            addModules: function(modules) {
                var self = this;
                _.each(modules, function(module) {
                    self.addModule(module);
                });
            },

            addModule: function(module) {
                var moduleName = module.name;
                var moduleLocation = module.location;
                var self = this;

                require.config({
                    packages: [{name: moduleName, location: moduleLocation}]
                });

                if (module.definition === undefined) {
                    if (module.definitionPath === undefined) {
                        module.definitionPath = 'module.json';
                    }

                    var moduleDefPath = 'json!' + moduleLocation + '/' + module.definitionPath;

                    ++self.loadingModules;

                    console.info('Loading module definition: ' + moduleDefPath);

                    require([moduleDefPath], function(module) {
                        --self.loadingModules;
                        self.handleModuleLoaded(moduleName, module);
                    });
                } else if (module.definition !== null) {
                    this.handleModuleLoaded(moduleName, module.definition);
                }
            },

            handleModuleLoaded: function(moduleName, module) {
                this.modules.push(module);

                if (module.parts !== undefined) {
                    this.mergeParts(moduleName, module.parts);
                }

                if (!this.isLoadingModules()) {
                    this.invokePendingCallbacks();
                }
            },

            invokePendingCallbacks: function() {
                var self = this;
                for (var part in this.pendingCallbacks) {
                    if (this.pendingCallbacks.hasOwnProperty(part)) {
                        _.each(this.pendingCallbacks[part], function(callback) {
                            self.loadParts(part, callback);
                        });
                    }
                }
            },

            addPendingCallback: function(part, callback) {
                if (this.pendingCallbacks.hasOwnProperty(part)) {
                    this.pendingCallbacks[part].push(callback);
                } else {
                    this.pendingCallbacks[part] = [callback];
                }
            },

            mergeParts: function(moduleName, parts) {
                var self = this;
                for (var key in parts) {
                    if (parts.hasOwnProperty(key)) {
                        _.each(parts[key], function(part) {
                            if (part[0] != '/') part = moduleName + '/' + part;

                            if (self.partsMap.hasOwnProperty(key)) {
                                self.partsMap[key].push(part);
                            } else {
                                self.partsMap[key] = [part];
                            }
                        });
                    }
                }
            },

            loadParts: function(name, callback) {
                if (this.isLoadingModules()) {
                    this.addPendingCallback(name, callback);
                    return;
                }

                if (this.partsMap.hasOwnProperty(name)) {
                    var paths = this.partsMap[name];
                    require(paths, function() {
                        callback(arguments);
                    });
                } else {
                    callback([]);
                }
            },

            Container: React.createClass({
                displayName: 'Composer.Container',

                getInitialState: function() {
                    return { children: []};
                },

                componentDidMount: function() {
                    composer.loadParts(this.props.name, this.handlePartsLoaded);
                },

                handlePartsLoaded: function(parts) {
                    parts = _.map(parts, function(part) {
                        return React.createElement(part, {});
                    });

                    if (this.props.hasOwnProperty('wrapperElement')) {
                        var props = this.props;
                        parts = _.map(parts, function(part) {
                            return React.createElement(props['wrapperElement'], props, part);
                        });
                    }

                    this.setState({children: parts});
                },

                render: function() {
                    return React.createElement('div', {}, this.state.children);
                }
            })
        }

        return composer;
    };

    Composer.instance = Composer();
    Composer.Container = Composer.instance.Container;

    //composer.Container.Header = React.createClass({
    //
    //});
    //
    //composer.Container.Footer = React.createClass({
    //
    //});
    //
    //composer.Container.Body = React.createClass({
    //
    //});

    return Composer;
});
