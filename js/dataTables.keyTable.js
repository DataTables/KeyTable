/*! KeyTable 2.0.0
 * ©2009-2015 SpryMedia Ltd - datatables.net/license
 */

/**
 * @summary     KeyTable
 * @description Spreadsheet like keyboard navigation for DataTables
 * @version     2.0.0
 * @file        dataTables.keyTable.js
 * @author      SpryMedia Ltd (www.sprymedia.co.uk)
 * @contact     www.sprymedia.co.uk/contact
 * @copyright   Copyright 2009-2015 SpryMedia Ltd.
 *
 * This source file is free software, available under the following license:
 *   MIT license - http://datatables.net/license/mit
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: http://www.datatables.net
 */


(function(window, document, undefined) {


var factory = function( $, DataTable ) {
"use strict";



var KeyTable = function ( dt, opts ) {
	// Sanity check that we are using DataTables 1.10 or newer
	if ( ! DataTable.versionCheck || ! DataTable.versionCheck( '1.10.8' ) ) {
		throw 'KeyTable requires DataTables 1.10.8 or newer';
	}

	// User and defaults configuration object
	this.c = $.extend( true, {},
		DataTable.defaults.keyTable,
		KeyTable.defaults,
		opts
	);

	// Internal settings
	this.s = {
		/** @type {DataTable.Api} DataTables' API instance */
		dt: new DataTable.Api( dt ),

		enable: true
	};

	// DOM items
	this.dom = {

	};

	// Check if row reorder has already been initialised on this table
	var settings = this.s.dt.settings()[0];
	var exisiting = settings.keytable;
	if ( exisiting ) {
		return exisiting;
	}

	settings.keytable = this;
	this._constructor();
};


KeyTable.prototype = {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * API methods for DataTables API interface
	 */
	blur: function ()
	{
		this._blur();
	},


	enable: function ( state )
	{
		this.s.enable = state;
	},


	focus: function ( row, column )
	{
		this._focus( this.s.dt.cell( row, column ) );
	},


	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Constructor
	 */

	/**
	 * Initialise the KeyTable instance
	 *
	 * @private
	 */
	_constructor: function ()
	{
		this._tabInput();

		var that = this;
		var dt = this.s.dt;
		var table = $( dt.table().node() );

		// Need to be able to calculate the cell positions relative to the table
		if ( table.css('position') === 'static' ) {
			table.css( 'position', 'relative' );
		}

		// Click to focus
		$( dt.table().body() ).on( 'click.keyTable', 'th, td', function () {
			var cell = dt.cell( this );

			if ( ! cell.any() ) {
				return;
			}

			that._focus( cell );
		} );

		// Key events
		$( document.body ).on( 'keydown.keyTable', function (e) {
			that._key( e );
		} );

		// Click blur
		// xxx don't blur in Editor form
		if ( this.c.blurable ) {
			$( document.body ).on( 'click.keyTable', function ( e ) {
				if ( $.inArray( dt.table().body(), $(e.target).parents('tbody').toArray() ) === -1 ) {
					that._blur();
				}
			} );
		}

		if ( this.c.editor ) {
			dt.on( 'key.kt', function ( e, dt, key, orig ) {
				that._editor( key, orig );
			} );
		}

		dt.on( 'destroy.kt', function () {
			dt.off( '.kt' );
			$( dt.table().body() ).off( 'click.keyTable', 'th, td' );
			$( document.body )
				.off( 'keydown.keyTable' )
				.off( 'click.keyTable' );
		} );
	},




	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */


	_blur: function ()
	{
		if ( ! this.s.enable || ! this.s.lastFocus ) {
			return;
		}

		var cell = this.s.lastFocus;

		$( cell.node() ).removeClass( this.c.className );
		this.s.lastFocus = null;

		this._emitEvent( 'key-blur', [ this.s.dt, cell ] );
	},


	_columns: function ()
	{
		var dt = this.s.dt;
		var user = dt.columns( this.c.columns ).indexes();
		var out = [];

		dt.columns( ':visible' ).every( function (i) {
			if ( user.indexOf( i ) !== -1 ) {
				out.push( i );
			}
		} );

		return out;
	},


	_editor: function ( key, orig )
	{
		var dt = this.s.dt;
		var editor = this.c.editor;

		orig.stopPropagation();

		editor.inline( this.s.lastFocus.index() );

		// Excel style - select all
		var input = $('div.DTE input');
		if ( input.length ) {
			input[0].select();
		}

		// Reduce the keys the Keys listens for
		dt.keys.enable( 'navigation-only' );

		// On blur of the navigation submit
		dt.one( 'key-blur.editor', function () {
			if ( editor.displayed() ) {
				editor.submit();
			}
		} );

		// Restore full key navigation on close
		editor.one( 'close', function () {
			dt.keys.enable( true );
			dt.off( 'key-blur.editor' );
		} );
	},


	/**
	 * Emit an event on the DataTable for listeners
	 *
	 * @param  {string} name Event name
	 * @param  {array} args Event arguments
	 * @private
	 */
	_emitEvent: function ( name, args )
	{
		this.s.dt.iterator( 'table', function ( ctx, i ) {
			$(ctx.nTable).triggerHandler( name, args );
		} );
	},


	_focus: function ( row, column )
	{
		var that = this;
		var dt = this.s.dt;
		var pageInfo = dt.page.info();

		if ( this.s.lastFocus ) {
			this._blur();
		}

		if ( typeof row !== 'number' ) {
			// Convert the cell to a row and column
			var index = row.index();
			column = index.column;
			row = dt
				.rows( { filter: 'applied', order: 'applied' } )
				.indexes()
				.indexOf( index.row );

			// For server-side processing normalise the row by adding the start
			// point, since `rows().indexes()` includes only rows that are
			// available at the client-side
			if ( pageInfo.serverSide ) {
				row += pageInfo.start;
			}
		}

		// Is the row on the current page?
		if ( row < pageInfo.start || row >= pageInfo.start+pageInfo.length ) {
			dt
				.one( 'draw', function () {
					that._focus( row, column );
				} )
				.page( Math.floor( row / pageInfo.length ) )
				.draw( false );

			return;
		}

		// De-normalise the server-side processing row, so we select the row
		// in its displayed position
		if ( pageInfo.serverSide ) {
			row -= pageInfo.start;
		}

		var cell = dt.cell( ':eq('+row+')', column );
		var node = $( cell.node() );

		node.addClass( this.c.className );

		// Shift viewpoint and page to make cell visible
		this._scroll( $(window), $(document.body), node, 'offset' );

		var bodyParent = dt.table().body().parentNode;
		if ( bodyParent !== dt.table().header().parentNode ) {
			var parent = $(bodyParent.parentNode);

			this._scroll( parent, parent, node, 'position' );
		}

		// Event and finish
		this._emitEvent( 'key-focus', [ this.s.dt, cell ] );

		this.s.lastFocus = cell;
	},



	_key: function ( e )
	{
		if ( ! this.s.enable ) {
			return;
		}

		if ( e.keyCode === 0 || e.ctrlKey || e.metaKey || e.altKey ) {
			return;
		}

		// If not focused, then there is no key action to take
		var cell = this.s.lastFocus;
		if ( ! cell ) {
			return;
		}

		var that = this;
		var dt = this.s.dt;

		switch( e.keyCode ) {
			case 9: // tab
				this._shift( e, e.shiftKey ? 'left' : 'right' );
				break;

			case 27: // esc
				if ( this.s.blurable && this.s.enable === true ) {
					this._blur();
				}
				break;

			case 33: // page up (previous page)
			case 34: // page down (next page)
				e.preventDefault();
				var index = dt.cells( {page: 'current'} ).nodes().indexOf( cell.node() );

				dt
					.one( 'draw', function () {
						var nodes = dt.cells( {page: 'current'} ).nodes();

						that._focus( dt.cell( index < nodes.length ?
							nodes[ index ] :
							nodes[ nodes.length-1 ]
						) );
					} )
					.page( e.keyCode === 33 ? 'previous' : 'next' )
					.draw( false );
				break;

			case 35: // end (end of current page)
			case 36: // home (start of current page)
				e.preventDefault();
				var indexes = dt.cells( {page: 'current'} ).indexes();

				this._focus( dt.cell(
					indexes[ e.keyCode === 35 ? indexes.length-1 : 0 ]
				) );
				break;

			case 37: // left arrow
				this._shift( e, 'left' );
				break;

			case 38: // up arrow
				this._shift( e, 'up' );
				break;

			case 39: // right arrow
				this._shift( e, 'right' );
				break;

			case 40: // down arrow
				this._shift( e, 'down' );
				break;

			default:
				// Everything else - pass through only when fully enabled
				if ( this.s.enable === true ) {
					this._emitEvent( 'key', [ dt, e.keyCode, e ] );
				}
				break;
		}
	},


	_scroll: function ( container, scroller, cell, posOff )
	{
		var offset = cell[posOff]();
		var height = cell.outerHeight();
		var width = cell.outerWidth();

		var scrollTop = scroller.scrollTop();
		var scrollLeft = scroller.scrollLeft();
		var containerHeight = container.height();
		var containerWidth = container.width();

		// Top correction
		if ( offset.top < scrollTop ) {
			scroller.scrollTop( offset.top );
		}

		// Left correction
		if ( offset.left < scrollLeft ) {
			scroller.scrollLeft( offset.left );
		}

		// Bottom correction
		if ( offset.top + height > scrollTop + containerHeight ) {
			scroller.scrollTop( offset.top + height - containerHeight );
		}

		// Right correction
		if ( offset.left + width > scrollLeft + containerWidth ) {
			scroller.scrollLeft( offset.left + width - containerWidth );
		}
	},


	_shift: function ( e, direction )
	{
		var that         = this;
		var dt           = this.s.dt;
		var pageInfo     = dt.page.info();
		var rows         = pageInfo.recordsDisplay;
		var currentCell  = this.s.lastFocus;
		var columns      = this._columns();

		if ( ! currentCell ) {
			return;
		}

		var currRow = dt
			.rows( { filter: 'applied', order: 'applied' } )
			.indexes()
			.indexOf( currentCell.index().row );

		// When server-side processing, `rows().indexes()` only gives the rows
		// that are available at the client-side, so we need to normalise the
		// row's current position by the display start point
		if ( pageInfo.serverSide ) {
			currRow += pageInfo.start;
		}

		var currCol = dt
			.columns( columns )
			.indexes()
			.indexOf( currentCell.index().column );

		var
			row = currRow,
			column = currCol; // row is the display, column is an index

		if ( direction === 'right' ) {
			if ( currCol >= columns.length - 1 ) {
				row++;
				column = columns[0];
			}
			else {
				column = columns[ currCol+1 ];
			}
		}
		else if ( direction === 'left' ) {
			if ( currCol === 0 ) {
				row--;
				column = columns[ columns.length - 1 ];
			}
			else {
				column = columns[ currCol-1 ];
			}
		}
		else if ( direction === 'up' ) {
			row--;
		}
		else if ( direction === 'down' ) {
			row++;
		}

		if ( row    >= 0 && row    < rows &&
			 column >= 0 && column < columns.length
		) {
			e.preventDefault();

			this._focus( row, column );
		}
		else if ( ! this.c.blurable ) {
			// No new focus, but if the table isn't blurable, then don't loose
			// focus
			e.preventDefault();
		}
		else {
			this._blur();
		}
		// xxx
		// arrow keys shouldn't blur
	},


	_tabInput: function ()
	{
		var that = this;
		var dt = this.s.dt;
		var tabIndex = this.c.tabIndex !== null ?
			this.c.tabIndex :
			dt.settings()[0].iTabIndex;

		if ( tabIndex == -1 ) {
			return;
		}

		var div = $('<div><input type="text" tabindex="'+tabIndex+'"/></div>')
			.css( {
				position: 'absolute',
				height: 1,
				width: 0,
				overflow: 'hidden'
			} )
			.insertBefore( dt.table().node() );

		div.children().on( 'focus', function () {
			that._focus( dt.cell(':eq(0)') );
		} );
	}
};

KeyTable.defaults = {
	focus: null, // initial focus selector - table cell selector

	className: 'focus',

	tabIndex: null,

	blurable: true,

	columns: '', // all

	editor: null
};



KeyTable.version = "2.0.0";


$.fn.dataTable.KeyTable = KeyTable;
$.fn.DataTable.KeyTable = KeyTable;


DataTable.Api.register( 'cell().focus()', function () {
	return this.iterator( 'cell', function (ctx, row, column) {
		if ( ctx.keytable ) {
			ctx.keytable.focus( row, column );
		}
	} );
} );

DataTable.Api.register( 'cell.blur()', function () {
	return this.iterator( 'table', function (ctx) {
		if ( ctx.keytable ) {
			ctx.keytable.blur();
		}
	} );
} );

DataTable.Api.register( 'keys.enable()', function ( opts ) {
	return this.iterator( 'table', function (ctx) {
		if ( ctx.keytable ) {
			ctx.keytable.enable( opts === undefined ? true : opts );
		}
	} );
} );

DataTable.Api.register( 'keys.disable()', function () {
	return this.iterator( 'table', function (ctx) {
		if ( ctx.keytable ) {
			ctx.keytable.enable( false );
		}
	} );
} );


// Attach a listener to the document which listens for DataTables initialisation
// events so we can automatically initialise
$(document).on( 'init.dt.dtk', function (e, settings, json) {
	if ( e.namespace !== 'dt' ) {
		return;
	}

	var init = settings.oInit.keys;
	var defaults = DataTable.defaults.keys;

	if ( init || defaults ) {
		var opts = $.extend( {}, init, defaults );

		if ( init !== false ) {
			new KeyTable( settings, opts  );
		}
	}
} );


return KeyTable;
}; // /factory


// Define as an AMD module if possible
if ( typeof define === 'function' && define.amd ) {
	define( ['jquery', 'datatables'], factory );
}
else if ( typeof exports === 'object' ) {
    // Node/CommonJS
    factory( require('jquery'), require('datatables') );
}
else if ( jQuery && !jQuery.fn.dataTable.KeyTable ) {
	// Otherwise simply initialise as normal, stopping multiple evaluation
	factory( jQuery, jQuery.fn.dataTable );
}


})(window, document);
