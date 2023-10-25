describe('KeyTable - keys.tabIndex', function() {
	dt.libs({
		js: ['jquery', 'datatables', 'keytable', 'select', 'editor', 'datetime'],
		css: ['datatables', 'keytable', 'select', 'editor', 'datetime']
	});

	describe('Functional tests', function() {
		let table, editor;

		dt.html('basic_id');
		it('Default index - 0', function() {
			$.fx.off = true; // disables lightbox animation

			editor = new $.fn.dataTable.Editor({
				table: '#example',
				fields: dt.getTestEditorColumns()
			});

			table = $('#example').DataTable({
				columns: dt.getTestColumns(),
				keys: {
					editor: editor
				}
			});

			expect($('#example_wrapper input:eq(1)').attr('tabindex')).toBe('0');
		});

		dt.html('basic_id');
		it('Add tab index', function() {
			$.fx.off = true; // disables lightbox animation

			editor = new $.fn.dataTable.Editor({
				table: '#example',
				fields: dt.getTestEditorColumns()
			});

			table = $('#example').DataTable({
				columns: dt.getTestColumns(),
				keys: {
					editor: editor,
					tabIndex: 50
				}
			});

			expect($('#example_wrapper input:eq(1)').attr('tabindex')).toBe('50');
		});
	});
});
