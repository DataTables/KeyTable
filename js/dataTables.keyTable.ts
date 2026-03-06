/*! KeyTable for DataTables
 * Copyright (c) SpryMedia Ltd - datatables.net/license
 */

import DataTable, { CellIdx, Context, Dom, util } from 'datatables.net';
import KeyTable from "./KeyTable";
import './interface';
import { Defaults } from "./interface";


DataTable.KeyTable = KeyTable;

DataTable.Api.register('cell.blur()', function () {
	return this.iterator('table', function (ctx) {
		if (ctx.keytable) {
			ctx.keytable.blur();
		}
	});
});

DataTable.Api.register('cell().focus()', function () {
	return this.iterator('cell', function (ctx, row, column) {
		if (ctx.keytable) {
			ctx.keytable.focus(row, column);
		}
	});
});

DataTable.Api.register('keys.disable()', function () {
	return this.iterator('table', function (ctx) {
		if (ctx.keytable) {
			ctx.keytable.enable(false);
		}
	});
});

DataTable.Api.register('keys.enable()', function (opts) {
	return this.iterator('table', function (ctx) {
		if (ctx.keytable) {
			ctx.keytable.enable(opts === undefined ? true : opts);
		}
	});
});

DataTable.Api.register('keys.enabled()', function (opts) {
	var ctx = this.context;

	if (ctx.length) {
		return ctx[0].keytable ? ctx[0].keytable.enabled() : false;
	}

	return false;
});

DataTable.Api.register('keys.move()', function (dir) {
	return this.iterator('table', function (ctx) {
		if (ctx.keytable) {
			ctx.keytable._shift(null, dir, false);
		}
	});
});

// Cell selector
DataTable.ext.selector.cell.push(function (settings: Context, opts: {focused?: boolean}, cells: CellIdx[]) {
	var focused = opts.focused;
	var kt = settings.keytable;
	var out = [];

	if (!kt || focused === undefined) {
		return cells;
	}

	for (var i = 0, ien = cells.length; i < ien; i++) {
		if (
			(focused === true && kt.focused(cells[i])) ||
			(focused === false && !kt.focused(cells[i]))
		) {
			out.push(cells[i]);
		}
	}

	return out;
});

// Attach a listener to the document which listens for DataTables initialisation
// events so we can automatically initialise
Dom.s(document).on('preInit.dt.dtk', function (e, settings, json) {
	if (e.namespace !== 'dt') {
		return;
	}

	var init = settings.init.keys;
	var defaults = DataTable.defaults.keys;

	if (init || defaults) {
		let opts: Partial<Defaults> = {};

		if (util.is.plainObject(defaults)) {
			util.object.assign(opts, defaults);
		}

		if (util.is.plainObject(init)) {
			util.object.assign(opts, init);
		}

		if (init !== false) {
			new KeyTable(settings, opts);
		}
	}
});
