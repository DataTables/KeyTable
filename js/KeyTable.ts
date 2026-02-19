/**
 * @summary     KeyTable
 * @description Spreadsheet like keyboard navigation for DataTables
 * @version     3.0.0-dev
 * @author      SpryMedia Ltd
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

import DataTable, {
	Api,
	ApiCellMethods,
	CellIdx,
	Context,
	Dom
} from 'datatables.net';
import { Config, Defaults, Settings } from './interface';

// Sanity check
if (!DataTable.versionCheck('3')) {
	throw 'Warning: KeyTable requires DataTables 3 or newer';
}

var namespaceCounter = 0;
var editorNamespaceCounter = 0;

const dom = DataTable.dom;
const util = DataTable.util;

export default class KeyTable {
	public static defaults: Defaults = {
		/**
		 * Can focus be removed from the table
		 */
		blurable: true,

		/**
		 * Class to give to the focused cell
		 */
		className: 'focus',

		/**
		 * Enable or disable clipboard support
		 */
		clipboard: true,

		/**
		 * Orthogonal data that should be copied to clipboard
		 */
		clipboardOrthogonal: 'display',

		/**
		 * Columns that can be focused. This is automatically merged with the
		 * visible columns as only visible columns can gain focus.
		 */
		columns: '', // all

		/**
		 * Editor instance to automatically perform Excel like navigation
		 */
		editor: null,

		/**
		 * Trigger editing immediately on focus
		 */
		editOnFocus: false,

		/**
		 * Options to pass to Editor's inline method
		 */
		editorOptions: null,

		/**
		 * Select a cell to automatically select on start up. `null` for no
		 * automatic selection
		 */
		focus: null,

		/**
		 * Array of keys to listen for
		 */
		keys: null,

		/**
		 * Tab index for where the table should sit in the document's tab flow
		 */
		tabIndex: null
	};

	public static version: '3.0.0-dev';

	private c: Defaults;

	private s: Settings;

	constructor(dt: Context | Api, opts: Config) {
		// User and defaults configuration object
		this.c = util.object.assignDeep(
			{},
			DataTable.defaults.keys,
			KeyTable.defaults,
			opts
		);

		// Internal settings
		this.s = {
			dt: new DataTable.Api(dt),
			dtDrawing: false,
			enable: true,
			focusDraw: false,
			waitingForDraw: false,
			lastFocus: null,
			namespace: '.keyTable-' + namespaceCounter++,
			returnSubmit: false,
			tabInput: null
		};

		// Check if row reorder has already been initialised on this table
		var settings = this.s.dt.settings()[0];
		var existing = settings.keytable;

		if (existing) {
			return existing;
		}

		settings.keytable = this;
		this._init();
	}

	/**
	 * Blur the table's cell focus
	 */
	public blur() {
		this._blur();
	}

	/**
	 * Enable cell focus for the table
	 *
	 * @param state Can be `true`, `false` or `-string navigation-only`
	 */
	public enable(state: boolean | 'navigation-only' | 'tab-only') {
		this.s.enable = state;
	}

	/**
	 * Get enable status
	 */
	public enabled() {
		return this.s.enable;
	}

	/**
	 * Focus on a cell
	 *
	 * @param row    Row index
	 * @param column Column index
	 */
	public focus(row: number, column: number) {
		this._focus(this.s.dt.cell(row, column), null);
	}

	/**
	 * Is the cell focused
	 * @param  cell Cell index to check
	 * @returns true if focused, false otherwise
	 */
	public focused(cell: CellIdx) {
		var lastFocus = this.s.lastFocus;

		if (!lastFocus) {
			return false;
		}

		var lastIdx = lastFocus.cell.index();
		return cell.row === lastIdx.row && cell.column === lastIdx.column;
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */

	/**
	 * Initialise the KeyTable instance
	 */
	private _init() {
		this._tabInput();

		var that = this;
		var dt = this.s.dt;
		var table = dom.s(dt.table().node());
		var namespace = this.s.namespace;
		var editorBlock = false;

		// Need to be able to calculate the cell positions relative to the table
		if (table.css('position') === 'static') {
			table.css('position', 'relative');
		}

		// Click to focus
		dom.s(dt.table().body()).on(
			'click' + namespace,
			'th, td',
			function (e) {
				if (that.s.enable === false) {
					return;
				}

				var cell = dt.cell(this);

				if (!cell.any()) {
					return;
				}

				that._focus(cell, null, false, e);
			}
		);

		// Key events
		dom.s(document).on('keydown' + namespace, function (e) {
			if (!editorBlock && !that.s.dtDrawing) {
				that._key(e);
			}
			else {
				e.preventDefault();
			}
		});

		// Click blur
		if (this.c.blurable) {
			dom.s(document).on('mousedown' + namespace, function (e) {
				let target = dom.s(e.target);

				// Click on the search input will blur focus
				if (target.closest('.dt-search').count()) {
					that._blur();
				}

				// If the click was inside the DataTables container, don't blur
				if (target.closest(dt.table().container()).count()) {
					return;
				}

				// Don't blur in Editor form
				if (target.closest('div.DTE').count()) {
					return;
				}

				// Or an Editor date input
				if (
					target.closest('div.editor-datetime').count() ||
					target.closest('div.dt-datetime').count()
				) {
					return;
				}

				// Or an Editor dropdown
				if (target.closest('div.dte-dropdown').count()) {
					return;
				}

				//If the click was inside the fixed columns container, don't blur
				if (target.closest('.DTFC_Cloned').count()) {
					return;
				}

				that._blur();
			});
		}

		if (this.c.editor) {
			var editor = this.c.editor;

			// Need to disable KeyTable when the main editor is shown
			editor.on('open.keyTableMain', function (e: Event, mode: string) {
				if (mode !== 'inline' && that.s.enable) {
					that.enable(false);

					editor.one('close' + namespace, function () {
						that.enable(true);
					});
				}
			});

			if (this.c.editOnFocus) {
				dt.on(
					'key-focus' + namespace + ' key-refocus' + namespace,
					function (e, dt, cell, orig) {
						that._editor(null, orig, true);
					}
				);
			}

			// Activate Editor when a key is pressed (will be ignored, if
			// already active).
			dt.on('key' + namespace, function (e, dt, key, cell, orig) {
				that._editor(key, orig, false);
			});

			// Active editing on double click - it will already have focus from
			// the click event handler above
			dom.s(dt.table().body()).on(
				'dblclick' + namespace,
				'th, td',
				function (e) {
					if (that.s.enable === false) {
						return;
					}

					var cell = dt.cell(this);

					if (!cell.any()) {
						return;
					}

					if (
						that.s.lastFocus &&
						this !== that.s.lastFocus.cell.node()
					) {
						return;
					}

					that._editor(null, e, true);
				}
			);

			// While Editor is busy processing, we don't want to process any key events
			editor
				.on('preSubmit', function () {
					editorBlock = true;
				})
				.on('preSubmitCancelled', function () {
					editorBlock = false;
				})
				.on('submitComplete', function () {
					editorBlock = false;
				});
		}

		// Stave saving
		dt.on('stateSaveParams' + namespace, function (e, s, d) {
			d.keyTable = that.s.lastFocus
				? that.s.lastFocus.cell.index()
				: null;
		});

		dt.on('column-visibility' + namespace, function (e) {
			that._tabInput();
		});

		dt.on('column-reorder' + namespace, function (e, s, d) {
			// Need to update the last focus cell's index
			var lastFocus = that.s.lastFocus;

			if (lastFocus && lastFocus.cell) {
				var curr = lastFocus.relative.column;

				// Manipulate the API instance to correct the column index
				lastFocus.cell[0][0].column = d.mapping.indexOf(curr);
				lastFocus.relative.column = d.mapping.indexOf(curr);
			}
		});

		// When the table is about to do a draw we need to block key
		// handling. This is only important for async draws - i.e.
		// server-side processing.
		dt.on(
			'preDraw' + namespace + ' scroller-will-draw' + namespace,
			function (e) {
				that.s.dtDrawing = true;
			}
		);

		// Redraw - retain focus on the current cell
		dt.on('draw' + namespace, function (e) {
			that.s.dtDrawing = false;

			that._tabInput();

			if (that.s.focusDraw) {
				return;
			}

			var lastFocus = that.s.lastFocus;

			if (lastFocus) {
				var relative = lastFocus.relative;
				var info = dt.page.info();
				var row = relative.row;

				if (info.recordsDisplay === 0) {
					return;
				}

				// If the refocus is outside the current draw zone -
				// don't attempt to refocus onto it
				if (row < info.start || row > info.start + info.length) {
					return;
				}

				// Reverse if needed
				if (row >= info.recordsDisplay) {
					row = info.recordsDisplay - 1;
				}

				that._focus(row, relative.column, true, e);
			}
		});

		// Clipboard support
		if (this.c.clipboard) {
			this._clipboard();
		}

		dt.on('destroy' + namespace, function () {
			that._blur(true);

			// Event tidy up
			dt.off(namespace);

			dom.s(dt.table().body())
				.off('click' + namespace, 'th, td')
				.off('dblclick' + namespace, 'th, td');

			dom.s(document)
				.off('mousedown' + namespace)
				.off('keydown' + namespace)
				.off('copy' + namespace)
				.off('paste' + namespace);
		});

		// Initial focus comes from state or options
		var state = dt.state.loaded();

		// Wait until init is done
		dt.one('init', () => {
			if (state && state.keyTable) {
				var cell = dt.cell(state.keyTable);

				// Ensure that the saved cell still exists
				if (cell.any()) {
					cell.focus();
				}
			}
			else if (this.c.focus) {
				dt.cell(this.c.focus).focus();
			}
		});
	}

	/**
	 * Blur the control
	 *
	 * @param noEvents Don't trigger updates / events (for destroying)
	 */
	private _blur(noEvents: boolean = false) {
		if (!this.s.enable || !this.s.lastFocus) {
			return;
		}

		var cell = this.s.lastFocus.cell;

		dom.s(cell.node()).classRemove(this.c.className);
		this.s.lastFocus = null;

		if (!noEvents) {
			this._updateFixedColumns(cell.index().column);

			this._emitEvent('key-blur', [this.s.dt, cell]);
		}
	}

	/**
	 * Clipboard interaction handlers
	 */
	private _clipboard() {
		var dt = this.s.dt;
		var that = this;
		var namespace = this.s.namespace;
		var opts = this.c.clipboard;

		// IE8 doesn't support getting selected text
		if (!window.getSelection) {
			return;
		}

		if (opts === true || (opts && opts.copy)) {
			dom.s(document).on('copy' + namespace, function (ejq) {
				var e = ejq.originalEvent;
				var selection = window.getSelection()?.toString();
				var focused = that.s.lastFocus;

				// Only copy cell text to clipboard if there is no other selection
				// and there is a focused cell
				if (!selection && focused) {
					e.clipboardData.setData(
						'text/plain',
						focused.cell.render(that.c.clipboardOrthogonal)
					);
					e.preventDefault();
				}
			});
		}

		if (opts === true || (opts && opts.paste)) {
			dom.s(document).on('paste' + namespace, function (ejq) {
				var e = ejq.originalEvent;
				var focused = that.s.lastFocus;
				var activeEl = document.activeElement;
				var editor = that.c.editor;
				var pastedText;

				if (
					focused &&
					(!activeEl || activeEl.nodeName.toLowerCase() === 'body')
				) {
					e.preventDefault();

					if (e.clipboardData && e.clipboardData.getData) {
						pastedText = e.clipboardData.getData('text/plain');
					}

					if (editor) {
						// Got Editor - need to activate inline editing,
						// set the value and submit
						var options = that._inlineOptions(focused.cell.index());

						editor
							.inline(
								options.cell,
								options.field,
								options.options
							)
							.set(editor.displayed()[0], pastedText)
							.submit();
					}
					else {
						// No editor, so just dump the data in
						focused.cell.data(pastedText);
						dt.draw(false);
					}
				}
			});
		}
	}

	/**
	 * Get an array of the column indexes that KeyTable can operate on. This
	 * is a merge of the user supplied columns and the visible columns.
	 */
	private _columns() {
		var dt = this.s.dt;
		var user = dt.columns(this.c.columns).indexes();
		var out: number[] = [];

		dt.columns(':visible').every(function (i) {
			if (user.indexOf(i) !== -1) {
				out.push(i);
			}
		});

		return out;
	}

	/**
	 * Perform excel like navigation for Editor by triggering an edit on key
	 * press
	 *
	 * @param key Key code for the pressed key
	 * @param orig Original event
	 */
	private _editor(key: number | null, orig: Event, hardEdit: boolean) {
		// If nothing focused, we can't take any action
		if (!this.s.lastFocus) {
			return;
		}

		// DataTables draw event
		if (orig && orig.type === 'draw') {
			return;
		}

		var that = this;
		var dt = this.s.dt;
		var editor = this.c.editor;
		var editCell = this.s.lastFocus.cell;
		var namespace = this.s.namespace + 'e' + editorNamespaceCounter++;

		// Do nothing if there is already an inline edit in this cell
		if (dom.s(editCell.node()).find('div.DTE').count()) {
			return;
		}

		// Don't activate Editor on control key presses
		if (
			key !== null &&
			((key >= 0x00 && key <= 0x09) ||
				key === 0x0b ||
				key === 0x0c ||
				(key >= 0x0e && key <= 0x1f) ||
				(key >= 0x70 && key <= 0x7b) ||
				(key >= 0x7f && key <= 0x9f))
		) {
			return;
		}

		if (orig) {
			orig.stopPropagation();

			// Return key should do nothing - for textareas it would empty the
			// contents
			if (key === 13) {
				orig.preventDefault();
			}
		}

		var editInline = function () {
			var options = that._inlineOptions(editCell.index());

			editor
				.one('open' + namespace, function () {
					// Remove cancel open
					editor.off('cancelOpen' + namespace);

					// Excel style - select all text
					if (!hardEdit) {
						dom.s<HTMLInputElement>(
							'div.DTE_Field_InputControl input, div.DTE_Field_InputControl textarea'
						)
							.get(0)
							.select();
					}

					// Reduce the keys the Keys listens for
					dt.keys.enable(hardEdit ? 'tab-only' : 'navigation-only');

					// On blur of the navigation submit
					dt.on('key-blur.editor', function (e, dt, cell) {
						// When Editor has its own blur enabled - do nothing here
						if (editor.s.editOpts.onBlur === 'submit') {
							return;
						}

						if (
							editor.displayed() &&
							cell.node() === editCell.node()
						) {
							editor.submit();
						}
					});

					// Highlight the cell a different colour on full edit
					if (hardEdit) {
						dom.s(dt.table().container()).classAdd('dtk-focus-alt');
					}

					// If the dev cancels the submit, we need to return focus
					editor.on('preSubmitCancelled' + namespace, function () {
						setTimeout(function () {
							that._focus(editCell, null, false);
						}, 50);
					});

					editor.on('submitUnsuccessful' + namespace, function () {
						that._focus(editCell, null, false);
					});

					// Restore full key navigation on close
					editor.one('close' + namespace, function () {
						dt.keys.enable(true);
						dt.off('key-blur.editor');
						editor.off(namespace);
						dom.s(dt.table().container()).classRemove(
							'dtk-focus-alt'
						);

						if (that.s.returnSubmit) {
							that.s.returnSubmit = false;
							that._emitEvent('key-return-submit', [
								dt,
								editCell
							]);
						}
					});
				})
				.one('cancelOpen' + namespace, function () {
					// `preOpen` can cancel the display of the form, so it
					// might be that the open event handler isn't needed
					editor.off(namespace);
				})
				.inline(options.cell, options.field, options.options);
		};

		// Editor 1.7 listens for `return` on keyup, so if return is the trigger
		// key, we need to wait for `keyup` otherwise Editor would just submit
		// the content triggered by this keypress.
		if (key === 13) {
			hardEdit = true;

			dom.s(document).one('keyup', function () {
				// immediately removed
				editInline();
			});
		}
		else {
			editInline();
		}
	}

	private _inlineOptions(cellIdx: CellIdx) {
		if (this.c.editorOptions) {
			return this.c.editorOptions(cellIdx);
		}

		return {
			cell: cellIdx,
			field: undefined,
			options: undefined
		};
	}

	/**
	 * Emit an event on the DataTable for listeners
	 *
	 * @param name Event name
	 * @param args Event arguments
	 */
	private _emitEvent(name: string, args: any[]) {
		return this.s.dt.trigger(name, args);
	}

	/**
	 * Focus on a particular cell, shifting the table's paging if required
	 *
	 * @param row Can be given as an API instance that
	 *   contains the cell to focus or as an integer. As the latter it is the
	 *   visible row index (from the whole data set) - NOT the data index
	 * @param column Not required if a cell is given as the first
	 *   parameter. Otherwise this is the column data index for the cell to
	 *   focus on
	 * @param shiftKey Should the viewport be moved to show cell
	 * @param originalEvent Triggering event
	 */
	private _focus(
		row: number | ApiCellMethods<any>,
		column: number | null,
		shift?: boolean,
		originalEvent?: Event | null
	) {
		var that = this;
		var dt = this.s.dt;
		var pageInfo = dt.page.info();
		var lastFocus = this.s.lastFocus;

		if (!originalEvent) {
			originalEvent = null;
		}

		if (!this.s.enable) {
			return;
		}

		if (typeof row !== 'number') {
			// Its an API instance - check that there is actually a row
			if (!row.any()) {
				return;
			}

			// Convert the cell to a row and column
			var index = row.index();
			column = index.column;
			row = dt
				.rows({ filter: 'applied', order: 'applied' })
				.indexes()
				.indexOf(index.row);

			// Don't focus rows that were filtered out.
			if (row < 0) {
				return;
			}

			// For server-side processing normalise the row by adding the start
			// point, since `rows().indexes()` includes only rows that are
			// available at the client-side
			if (pageInfo.serverSide) {
				row += pageInfo.start;
			}
		}

		// Is the row on the current page? If not, we need to redraw to show the
		// page
		if (
			pageInfo.length !== -1 &&
			(row < pageInfo.start || row >= pageInfo.start + pageInfo.length)
		) {
			this.s.focusDraw = true;
			this.s.waitingForDraw = true;

			dt.one('draw', function () {
				that.s.focusDraw = false;
				that.s.waitingForDraw = false;
				that._focus(row, column, undefined, originalEvent);
			})
				.page(Math.floor(row / pageInfo.length))
				.draw(false);

			return;
		}

		// In the available columns?
		if (column !== null && !this._columns().includes(column)) {
			return;
		}

		// De-normalise the server-side processing row, so we select the row
		// in its displayed position
		if (pageInfo.serverSide) {
			row -= pageInfo.start;
		}

		// Get the cell from the current position - ignoring any cells which might
		// not have been rendered (therefore can't use `:eq()` selector).
		var cells = dt
			.cells(null, column, { search: 'applied', order: 'applied' })
			.flatten();
		var cell = dt.cell(cells[row]);

		// Prefocus check - this event allows a focus action to be disallowed.
		var preFocus = this._emitEvent('key-prefocus', [
			this.s.dt,
			cell,
			originalEvent || null
		]);
		if (preFocus.indexOf(false) !== -1) {
			return;
		}

		if (lastFocus) {
			// Don't trigger a refocus on the same cell
			if (lastFocus.node === cell.node()) {
				this._emitEvent('key-refocus', [
					this.s.dt,
					cell,
					originalEvent || null
				]);
				return;
			}

			// Otherwise blur the old focus
			this._blur();
		}

		// Clear focus from other tables
		this._removeOtherFocus();

		var node = dom.s(cell.node());
		node.classAdd(this.c.className);

		if (column !== null) {
			this._updateFixedColumns(column);
		}

		// Shift viewpoint and page to make cell visible
		if (shift === undefined || shift === true) {
			this._scroll(window, document.body, node, 'offset');

			var bodyParent = dt.table().body().parentNode;
			if (bodyParent !== dt.table().header().parentNode) {
				var parent = bodyParent!.parentNode as HTMLElement;

				this._scroll(parent, parent, node, 'position');
			}
		}

		// Event and finish
		var info = dt.page.info();

		this.s.lastFocus = {
			cell: cell,
			node: cell.node(),
			relative: {
				row:
					info.start +
					dt
						.rows({ page: 'current' })
						.indexes()
						.indexOf(cell.index().row),
				column: cell.index().column
			}
		};

		this._emitEvent('key-focus', [this.s.dt, cell, originalEvent || null]);
		dt.state.save();
	}

	/**
	 * Handle key press
	 *
	 * @param e Event
	 */
	private _key(e: KeyboardEvent) {
		// If we are waiting for a draw to happen from another key event, then
		// do nothing for this new key press.
		if (this.s.waitingForDraw) {
			e.preventDefault();
			return;
		}

		// Ignore key presses in an Editor inline create row - it is not
		// navigatable by KeyTable
		if (
			dom
				.s(e.target as HTMLElement)
				.closest('.dte-inlineAdd')
				.count()
		) {
			return;
		}

		var enable = this.s.enable;
		this.s.returnSubmit =
			(enable === 'navigation-only' || enable === 'tab-only') &&
			e.keyCode === 13
				? true
				: false;

		var navEnable = enable === true || enable === 'navigation-only';
		if (!enable) {
			return;
		}

		if (
			(e.keyCode === 0 || e.ctrlKey || e.metaKey || e.altKey) &&
			!(e.ctrlKey && e.altKey)
		) {
			return;
		}

		// If not focused, then there is no key action to take
		var lastFocus = this.s.lastFocus;
		if (!lastFocus) {
			return;
		}

		// And the last focus still exists!
		if (!this.s.dt.cell(lastFocus.node).any()) {
			this.s.lastFocus = null;
			return;
		}

		var that = this;
		var dt = this.s.dt;
		var scrolling = this.s.dt.settings()[0].scroll.y ? true : false;

		// If we are not listening for this key, do nothing
		if (this.c.keys && ! this.c.keys.includes(e.keyCode)) {
			return;
		}

		switch (e.keyCode) {
			case 9: // tab
				// `enable` can be tab-only
				e.preventDefault();

				this._keyAction(function () {
					that._shift(e, e.shiftKey ? 'left' : 'right', true);
				});
				break;

			case 27: // esc
				// If there is an inline edit in the cell, let it blur first,
				// a second escape will then blur keytable
				if (dom.s(lastFocus.node).find('div.DTE').count()) {
					return;
				}

				if (this.c.blurable && enable === true) {
					this._blur();
				}
				break;

			case 33: // page up (previous page)
			case 34: // page down (next page)
				if (navEnable && !scrolling) {
					e.preventDefault();

					this._keyAction(function () {
						dt.page(e.keyCode === 33 ? 'previous' : 'next').draw(
							false
						);
					});
				}
				break;

			case 35: // end (end of current page)
			case 36: // home (start of current page)
				if (navEnable) {
					e.preventDefault();

					this._keyAction(function () {
						var indexes = dt.cells({ page: 'current' }).indexes();
						var colIndexes = that._columns();

						that._focus(
							dt.cell(
								indexes[
									e.keyCode === 35
										? indexes.length - 1
										: colIndexes[0]
								]
							),
							null,
							true,
							e
						);
					});
				}
				break;

			case 37: // left arrow
				if (navEnable) {
					this._keyAction(function () {
						that._shift(e, 'left');
					});
				}
				break;

			case 38: // up arrow
				if (navEnable) {
					this._keyAction(function () {
						that._shift(e, 'up');
					});
				}
				break;

			case 39: // right arrow
				if (navEnable) {
					this._keyAction(function () {
						that._shift(e, 'right');
					});
				}
				break;

			case 40: // down arrow
				if (navEnable) {
					this._keyAction(function () {
						that._shift(e, 'down');
					});
				}
				break;

			case 113: // F2 - Excel like hard edit
				if (this.c.editor) {
					this._editor(null, e, true);
					break;
				}
			// else fallthrough

			default:
				// Everything else - pass through only when fully enabled
				if (enable === true) {
					this._emitEvent('key', [
						dt,
						e.keyCode,
						this.s.lastFocus?.cell,
						e
					]);
				}
				break;
		}
	}

	/**
	 * Whether we perform a key shift action immediately or not depends upon if
	 * Editor is being used. If it is, then we wait until it completes its
	 * action
	 *
	 * @param action Function to trigger when ready
	 */
	private _keyAction(action: Function) {
		var editor = this.c.editor;

		if (editor && editor.mode() && editor.display()) {
			editor.submit(action);
		}
		else {
			action();
		}
	}

	/**
	 * Remove focus from all tables other than this one
	 */
	private _removeOtherFocus() {
		var thisTable = this.s.dt.table().node();

		DataTable.tables({ api: true }).iterator('table', function (settings) {
			if (this.table().node() !== thisTable) {
				this.cell.blur();
			}
		});
	}

	/**
	 * Scroll a container to make a cell visible in it. This can be used for
	 * both DataTables scrolling and native window scrolling.
	 *
	 * @param container Scrolling container
	 * @param scroller  Item being scrolled
	 * @param cell      Cell in the scroller
	 * @param posOff    `position` or `offset` - which to use for the
	 *   calculation. `offset` for the document, otherwise `position`
	 */
	private _scroll(
		containerIn: Window | HTMLElement,
		scrollerIn: HTMLElement,
		cell: Dom,
		posOff: 'position' | 'offset'
	) {
		var offset = cell[posOff]();
		var height = cell.height('outer');
		var width = cell.width('outer');
		var scroller = dom.s(scrollerIn);
		var container =
			containerIn === window ? dom.w : dom.s(containerIn as HTMLElement);

		var scrollTop = scroller.scrollTop();
		var scrollLeft = scroller.scrollLeft();
		var containerHeight = container.height();
		var containerWidth = container.width();

		// If Scroller is being used, the table can be `position: absolute` and that
		// needs to be taken account of in the offset. If no Scroller, this will be 0
		if (posOff === 'position') {
			offset.top += parseInt(cell.closest('table').css('top'), 10);
		}

		// Top correction (partially in view)
		if (offset.top < scrollTop && offset.top + height > scrollTop - 5) {
			scroller.scrollTop(offset.top);
		}

		// Left correction
		if (offset.left < scrollLeft) {
			scroller.scrollLeft(offset.left);
		}

		// Bottom correction plus in view correction. Note that the magic 5 is to allow
		// for the edge just passing the bottom of the view
		if (
			offset.top + height > scrollTop + containerHeight &&
			offset.top < scrollTop + containerHeight + 5 &&
			height < containerHeight
		) {
			scroller.scrollTop(offset.top + height - containerHeight);
		}

		// Right correction
		if (
			offset.left + width > scrollLeft + containerWidth &&
			width < containerWidth
		) {
			scroller.scrollLeft(offset.left + width - containerWidth);
		}
	}

	/**
	 * Calculate a single offset movement in the table - up, down, left and
	 * right and then perform the focus if possible
	 *
	 * @param e           Event object
	 * @param direction   Movement direction
	 * @param keyBlurable `true` if the key press can result in the table being
	 *   blurred. This is so arrow keys won't blur the table, but tab will.
	 */
	private _shift(e: Event, direction: string, keyBlurable?: boolean) {
		var dt = this.s.dt;
		var pageInfo = dt.page.info();
		var rows = pageInfo.recordsDisplay;
		var columns = this._columns();
		var last = this.s.lastFocus;
		if (!last) {
			return;
		}

		var currentCell = last.cell;
		if (!currentCell) {
			return;
		}

		var currRow = dt
			.rows({ filter: 'applied', order: 'applied' })
			.indexes()
			.indexOf(currentCell.index().row);

		// When server-side processing, `rows().indexes()` only gives the rows
		// that are available at the client-side, so we need to normalise the
		// row's current position by the display start point
		if (pageInfo.serverSide) {
			currRow += pageInfo.start;
		}

		var currCol = dt
			.columns(columns)
			.indexes()
			.indexOf(currentCell.index().column);

		var row = currRow,
			column = columns[currCol]; // row is the display, column is an index

		// If the direction is rtl then the logic needs to be inverted from this point forwards
		if (dom.s(dt.table().node()).css('direction') === 'rtl') {
			if (direction === 'right') {
				direction = 'left';
			}
			else if (direction === 'left') {
				direction = 'right';
			}
		}

		if (direction === 'right') {
			if (currCol >= columns.length - 1) {
				row++;
				column = columns[0];
			}
			else {
				column = columns[currCol + 1];
			}
		}
		else if (direction === 'left') {
			if (currCol === 0) {
				row--;
				column = columns[columns.length - 1];
			}
			else {
				column = columns[currCol - 1];
			}
		}
		else if (direction === 'up') {
			row--;
		}
		else if (direction === 'down') {
			row++;
		}

		if (row >= 0 && row < rows && columns.includes(column)) {
			if (e) {
				e.preventDefault();
			}

			this._focus(row, column, true, e);
		}
		else if (!keyBlurable || !this.c.blurable) {
			// No new focus, but if the table isn't blurable, then don't loose
			// focus
			if (e) {
				e.preventDefault();
			}
		}
		else {
			this._blur();
		}
	}

	/**
	 * Create and insert a hidden input element that can receive focus on behalf
	 * of the table
	 *
	 */
	private _tabInput() {
		var that = this;
		var dt = this.s.dt;
		var tabIndex =
			this.c.tabIndex !== null
				? this.c.tabIndex
				: dt.settings()[0].tabIndex;

		if (tabIndex == -1) {
			return;
		}

		// Only create the input element once on first class
		if (!this.s.tabInput) {
			var inputId =
				'keytable-focus-capture-' + this.s.namespace.split('-')[1];
			var input = dom
				.c('input')
				.attr('id', inputId)
				.attr('type', 'text')
				.attr('tabindex', tabIndex);
			var div = dom
				.c('div')
				.append(dom.c('label').attr('for', inputId).append(input))
				.css({
					position: 'absolute',
					height: '1px',
					width: '0px',
					overflow: 'hidden'
				});

			div.find('input').on('focus', function (e) {
				var cell = dt.cell(':eq(0)', that._columns(), {
					page: 'current'
				});

				if (cell.any()) {
					that._focus(cell, null, true, e);
				}
			});

			this.s.tabInput = div;
		}

		// Insert the input element into the first cell in the table's body
		var cell = this.s.dt
			.cell(':eq(0)', '0:visible', { page: 'current', order: 'current' })
			.node();

		if (cell) {
			dom.s(cell).prepend(this.s.tabInput);
		}
	}

	/**
	 * Update fixed columns if they are enabled and if the cell we are
	 * focusing is inside a fixed column
	 * @param  column Index of the column being changed
	 */
	private _updateFixedColumns(column: number) {
		var dt = this.s.dt;
		var settings = dt.settings()[0];
		var fc = (settings as any)._fixedColumns;

		if (fc) {
			var leftCols = fc.s.iLeftColumns;
			var rightCols = settings.columns.length - fc.s.iRightColumns;

			if (column < leftCols || column >= rightCols) {
				(dt as any).fixedColumns().update();
			}
		}
	}
}
