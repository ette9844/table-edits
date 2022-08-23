(function ($, window, document, undefined) {
    var pluginName = "editable",
        defaults = {
            keyboard: true,
            dblclick: true,
            editButton: true,
            editButtonSelector: ".edit",
            removeButton: true,
            removeButtonSelector: ".remove",
            maintainWidth: true,
            dropdowns: {},
            numbers: [],
            edit: function() {},
            save: function() {},
            checkValid: function() {return true;},
            cancel: function() {},
            remove: function() {}
        };

    function editable(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options) ;

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    editable.prototype = {
        init: function() {
            this.editing = true;

            if (this.options.dblclick) {
                $(this.element)
                    .css('cursor', 'pointer')
                    .bind('dblclick', this.toggle.bind(this));
            }

            if (this.options.editButton) {
                $(this.options.editButtonSelector, this.element)
                    .bind('click', this.toggle.bind(this));
            }
            
            if (this.options.removeButton) {
                $(this.options.removeButtonSelector, this.element)
                    .bind('click', this.remove.bind(this));
            }
        },

        toggle: function(e) {
            e.preventDefault();
            
            if (this.editing) {
                this.edit();
            } else {
                this.save();
            }
        },

        edit: function() {
            var instance = this,
                values = {};

            $('td[data-field]', this.element).each(function() {
                var input,
                    field = $(this).data('field'),
                    value = $(this).text(),
                    width = $(this).width();

                values[field] = value;

                $(this).empty();

                if (instance.options.maintainWidth) {
                    $(this).width(width);
                }

                if (field in instance.options.dropdowns) {
                    input = $('<select name="' + field + '"></select>');

                    for (var i = 0; i < instance.options.dropdowns[field].length; i++) {
                        $('<option></option>')
                             .text(instance.options.dropdowns[field][i])
                             .appendTo(input);
                    };

                    input.val(value)
                         .data('old-value', value)
                         .dblclick(instance._captureEvent);
                } else if (instance.options.numbers.indexOf(field) != -1) {
                    input = $('<input type="number" name="' + field + '"/>')
	                    .val(value)
	                    .data('old-value', value)
	                    .dblclick(instance._captureEvent);
                } else {
                    input = $('<input type="text" name="' + field + '"/>')
                        .val(value)
                        .data('old-value', value)
                        .dblclick(instance._captureEvent);
                }

                input.appendTo(this);

                if (instance.options.keyboard) {
                    input.keydown(instance._captureKey.bind(instance));
                }
            });

            this.options.edit.bind(this.element)(values);
            this.editing = !this.editing;
        },

        save: function() {
            var instance = this,
                values = {};

            if (!this.checkValid()) {
            	return;
            }
            $('td[data-field]', this.element).each(function() {
                var value = $(':input', this).val();

                values[$(this).data('field')] = value;

                $(this).empty()
                       .text(value);
            });

            this.options.save.bind(this.element)(values);
            this.editing = !this.editing;
        },

        checkValid: function() {
        	var values = {};
        	
        	$('td[data-field]', this.element).each(function() {
	            var value = $(':input', this).val();
	            values[$(this).data('field')] = value;
	        });

            return this.options.checkValid.bind(this.element)(values);
        },
        
        cancel: function() {
            var instance = this,
                values = {};

            $('td[data-field]', this.element).each(function() {
                var value = $(':input', this).data('old-value');

                values[$(this).data('field')] = value;

                $(this).empty()
                       .text(value);
            });

            this.options.cancel.bind(this.element)(values);
            this.editing = !this.editing;
        },
        
        remove: function() {
	        this.options.remove.bind(this.element)();
	        $(this).remove();
        },

        _captureEvent: function(e) {
            e.stopPropagation();
        },

        _captureKey: function(e) {
            if (e.which === 13) {
                this.save();
            } else if (e.which === 27) {
                this.cancel();
            }
        }
    };

    $.fn[pluginName] = function(options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,
                new editable(this, options));
            }
        });
    };

})(jQuery, window, document);
