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
                            var partDef = part;

                            if (typeof(part) === "string") {
                                partDef = { path: part, props: {} };
                            } else {
                                if (!partDef.hasOwnProperty('props')) {
                                    partDef.props = {};
                                }
                            }

                            if (partDef.path[0] != '/') partDef.path = moduleName + '/' + partDef.path;

                            if (self.partsMap.hasOwnProperty(key)) {
                                self.partsMap[key].push(partDef);
                            } else {
                                self.partsMap[key] = [partDef];
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
                    var partDefs = this.partsMap[name];
                    var paths = partDefs.map(function(def) { return def.path; });
                    console.log('Loading part for paths: ' + paths);
                    require(paths, function() {
                        var resolvedParts = _.map(arguments, function(arg, i) {
                            return { partClass: arg, props: partDefs[i].props };
                        });
                        callback(resolvedParts);
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
                    console.log('Loaded ' + parts.length + ' parts');

                    var props = this.props;
                    var renderElements = function() {
                        if (props.hasOwnProperty('itemElement')) {
                            var itemElement = props['itemElement'];
                            return _.map(parts, function(part) {
                                var element = React.createElement(part.partClass, props);
                                console.log('Wrapping with element: ' + itemElement.displayName);
                                return React.createElement(itemElement, part.props, [element]);
                            });
                        } else {
                            return _.map(parts, function(part) {
                                console.log('Creating element: ' + part.partClass.displayName);
                                return React.createElement(part.partClass, part.props);
                            });
                        }
                    }

                    var elements = renderElements();
                    this.setState({children: elements});
                },

                render: function() {
                    var containerElement = this.props.hasOwnProperty('containerElement')
                        ? this.props['containerElement']
                        : 'div';

                    console.log('Creating container element: ' + containerElement.displayName);
                    return React.createElement(containerElement, this.props, this.state.children);
                }
            })
        }

        return composer;
    };

    Composer.instance = Composer();
    Composer.Container = Composer.instance.Container;

    return Composer;
});
