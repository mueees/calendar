define([
    'marionette',
    'text!./application.list.view.html',
    'clientCore/dialog/dialog.service'
], function (Marionette, template, $mDialog) {
    return Marionette.ItemView.extend({
        template: _.template(template),

        className: 'list-group mue-list-group mue-list-group-lagoon',

        events: {
            'click [data-link="application"]': 'onHandlerApplication'
        },

        initialize: function () {
            var me = this;

            this.listenTo(this.collection, 'change:name change:description', this.onEditHandler);
            this.listenTo(this.collection, 'add', this.render);
            this.listenTo(this.collection, 'remove', function () {
                me.render();
                me.trigger('application:new');
            });
        },

        onEditHandler: function (model) {
            var $el = this.$el.find('[data-id=' + model.get('_id') + ']');

            if ($el) {
                $el.find('.list-group-item-heading').html(model.get('name'));
                $el.find('.mue-item-description').html(model.get('description'));
            }
        },

        serializeData: function () {
            return {
                applications: this.collection.toJSON()
            }
        },

        onHandlerApplication: function (e) {
            e.preventDefault();

            var $item = $(e.target).closest('.list-group-item'),
                id = $item.attr('data-id');

            this.$el.find('.list-group-item').removeClass('active');
            $item.addClass('active');

            if (id) {
                this.trigger('application:selected', id);
            } else {
                this.trigger('application:new');
            }
        }
    });
});