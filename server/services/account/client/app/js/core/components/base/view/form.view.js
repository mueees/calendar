define([
    'backbone',
    'marionette'
], function (Backbone, Marionette) {
    return Marionette.ItemView.extend({
        initialize: function () {
            Marionette.ItemView.prototype.initialize(this, arguments);

            _.bindAll(this, "valid", 'invalid');

            Backbone.Validation.configure({
                forceUpdate: true
            });

            Backbone.Validation.bind(this, {
                valid: this.valid,
                invalid: this.invalid
            });
        },

        onRender: function () {
            this.stickit();
        },

        valid: function (view, attr) {
            var $el = view.$('[name=' + attr + ']'),
                $section = $el.closest('.form-group'),
                messages = view.$('.messages');

            $section.removeClass('error-row');
            messages.find('p[data-name="' + attr + '"]').remove();
        },

        invalid: function (view, attr, error) {
            var $el = view.$('[name=' + attr + ']'),
                $section = $el.closest('.form-group'),
                messages = view.$('.messages');

            messages.addClass('error-messages');
            $section.addClass('error-row');
            messages.find('p[data-name="' + attr + '"]').remove();
            messages.append("<p data-name='" + attr + "'>" + error + "</p>");
        },

        onBeforeClose: function () {
            Backbone.Validation.unbind(this);
        }
    });
});