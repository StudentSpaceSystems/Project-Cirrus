var LAUNCH_NAME = 'bluemoon2';
var socket;
var COLORS = ['#000','#111','#222','#333','#444','#555','#666','#777','#888','#999'];
$( document ).ready(function() {	
	(function($){	
		var Chart = Backbone.Model.extend({
			defaults: {
				table: google.visualization.DataTable(),
				name: 'test stream',
				persistence: false,
				fields: [],
			}
		});
		
		var ChartView = Backbone.View.extend({
			tagName: 'div',
			
			initialize: function(){
				
				this.model.table.addColumn('DateTime','Time');
				for (var i = 0; i < this.model.fields.length; i++)
				{
					this.model.table.addColumn(this.model.fields[i],'number');
				}
			},
		
			update: function(time, fields){
				fields.unshift(time);
				this.model.table.addRow(fields);
			}
			
		});
		var ListView = Backbone.View.extend({
		    el: $('body'), // el attaches to existing element
			// `events`: Where DOM events are bound to View methods. Backbone doesn't have a separate controller to handle such bindings; it all happens in a View.
			events: {
			  'click button#add': 'addItem'
			},
			initialize: function(){
				
			    _.bindAll(this, 'render', 'addItem'); // every function that uses 'this' as the current object should be in here
			  
			    this.render();
			},
			// `render()` now introduces a button to add a new list item.
			render: function(){
			    $(this.el).append("<ul></ul>");
			},
			// `addItem()`: Custom function called via `click` event above.
			addItem: function(msg){
			    console.log(msg);
			}
		});
		
		var listView = new ListView();
		socket = io();
	    socket.on('bluemoon2',function(msg){console.log(msg);});
		$.post( '/get_stream_info', {'key': LAUNCH_NAME},function( data ) {
		    console.log(data); 
		});
	})(jQuery);
});