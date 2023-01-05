// Type definitions for DataTables KeyTable
//
// Project: https://datatables.net/extensions/keytable/, https://datatables.net
// Definitions by:
//   SpryMedia
//   Konstantin Kuznetsov <https://github.com/Arik-neKrol>

/// <reference types="jquery" />

import DataTables, {Api} from 'datatables.net';

export default DataTables;

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DataTables' types integration
 */
declare module 'datatables.net' {
	interface Config {
		/**
		 * KeyTable extension options
		 */
		keys?: boolean | ConfigKeyTable;
	}

	interface Api<T> {
		/**
		 * KeyTable methods container
		 * 
		 * @returns Api for chaining with the additional KeyTable methods
		 */
		keys: ApiKeyTableMethods<T>;
	}

	interface ApiCell<T> {
		/**
		 * Blur focus from the currently focused cell
		 */
		blur(): Api<T>;
	}

	interface ApiCellMethods<T> {
		/**
		 * Focus on a cell
		 */
		focus(): Api<T>;
	}

	interface ApiStatic {
		/**
		 * KeyTable class
		 */
		KeyTable: {
			/**
			 * Create a new KeyTable instance for the target DataTable
			 */
			new (dt: Api<any>, settings: boolean | ConfigKeyTable);

			/**
			 * KeyTable version
			 */
			version: string;

			/**
			 * Default configuration values
			 */
			defaults: ConfigKeyTable;
		}
	}
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Options
 */

interface ConfigKeyTable {
	/**
	 * Allow KeyTable's focus to be blurred (removed) from a table
	 *
	 * When set to true this option allows the table to lose focus (i.e. to be blurred),
	 * while false will not allow the table to lose focus.
	 */
	blurable?: boolean;

	/**
	 * Set the class name used for the focused cell
	 *
	 * The class name to be added and removed from cells as they gain and loose focus.
	 */
	className?: string;

	/**
	 * Enable / disable clipboard interaction with KeyTable
	 *
	 * A boolean flag that can optionally be used to disable KeyTables' clipboard interaction.
	 */
	clipboard?: boolean;

	/**
	 * Set the orthogonal data point for the data to copy to clipboard.
	 */
	clipboardOrthogonal?: string;

	/**
	 * Select the columns that can gain focus
	 *
	 * The columns that can gain focus. This accepts all of the options of column-selector
	 * such as class name selector, jQuery pseudo selects and column index selectors.
	 */
	columns?: any;

	/**
	 * Control if editing should be activated immediately upon focus
	 *
	 * true to enable editing on focus, false to disable.
	 */
	editOnFocus?: boolean;

	/**
	 * Attach an Editor instance for Excel like editing
	 *
	 * The Editor instance to use for editing of the table
	 */
	editor?: any;

	/**
	 * Cell to receive initial focus in the table
	 *
	 * The cell that will receive focus when the table is initialised. This accepts all of
	 * the options of cell-selector such as class name selector, jQuery pseudo selects and
	 * cell index selectors.
	 */
	focus?: any;

	/**
	 * Limit the keys that KeyTable will listen for and take action on
	 *
	 * As null KeyTable will listen for all key presses, regardless of what key is pressed.
	 * an array you can limit the keys that KeyTable will take action on to just the key
	 * codes given in the array.
	 */
	keys?: number[] | null;

	/**
	 * Set the table's tab index for when it will receive focus
	 *
	 * The tab index for the table. Like all other tab indexes, this can be -1 to disallow
	 * tabbing into the table.
	 */
	tabIndex?: number;
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * API
 */

interface ApiKeyTableMethods<T> extends Api<T> {
		/**
	 * Disable KeyTable's interactions (mouse and keyboard)
	 * 
	 * @returns DataTables API instance
	 */
	disable(): Api<T>;

	/**
	 * Enable or disable KeyTable's interactions (mouse and keyboard)
	 * 
	 * @param options This option can be given as the following values: true - Fully enable KeyTable; false - Fully disable KeyTable (keys.disable()); "navigation-only" - Respond to navigation inputs only;
	 * @returns DataTables API instance
	 */
	enable(options?: string | boolean): Api<T>;

	/**
	 * Determine if KeyTable is enabled on this table
	 * 
	 * @returns Current state
	 */
	enabled(): boolean | 'navigation-only';

	/**
	 * Move the focus from the current cell to one adjacent to it.
	 * 
	 * @param direction String representing the direction that the focus should move in
	 * @returns DataTables API instance.
	 */
	move(direction: string): Api<T>;
}
