define([
    'backbone',
    'marionette'
], function (Backbone, Marionette) {
    return Marionette.ItemView.extend({
        initialize: function () {
            var _this = this;
            _.bindAll(this, "valid", 'invalid');

            Backbone.Validation.configure({
                forceUpdate: true
            });

            Backbone.Validation.bind(this, {
                valid: _this.valid,
                invalid: _this.invalid
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
            messages.find('li[data-name="' + attr + '"]').remove();
        },

        invalid: function (view, attr, error) {
            var $el = view.$('[name=' + attr + ']'),
                $section = $el.closest('.form-group'),
                messages = view.$('.messages');

            messages.addClass('error-messages');
            $section.addClass('error-row');
            messages.find('li[data-name="' + attr + '"]').remove();
            messages.append("<li data-name='" + attr + "'>" + error + "</li>");
        },

        onBeforeClose: function () {
            Backbone.Validation.unbind(this);
        }
    });
});