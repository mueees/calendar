define([
    'jquery',
    'backbone'
], function ($, Backbone) {
    var Commands = {};

    var commandList = {};

    Commands.register = function (commandName, options) {
        commandList[commandName] = options;
    };

    Commands.get = function (commandName) {
        var options = commandList[commandName];
        options = options || {};
        options = _.clone(options);
        var command = new Commands.Command(commandName, options);
        return command;
    };

    Commands.Command = function (name, options) {
        this.name = name;
        this.options = options
    };

    _.extend(Commands.Command.prototype, Backbone.Events, {
        execute: function (data) {
            var config = this.getAjaxConfig(this.options, data);

            return $.ajax(config);
        },

        getAjaxConfig: function (options, data) {
            var ajaxConfig = {
                type: "GET",
                url: this.getUrl(options, data)
            };

            _.extend(ajaxConfig, options);

            ajaxConfig.data = data;

            if( ajaxConfig.type == 'POST' && ajaxConfig.data && !_.isString(ajaxConfig.data) ){
                ajaxConfig.data = JSON.stringify(ajaxConfig.data);
            }

            // return promise
            return ajaxConfig;
        },

        getUrl: function (options, data) {
            return options.url;
        }
    });

    return Commands;
});