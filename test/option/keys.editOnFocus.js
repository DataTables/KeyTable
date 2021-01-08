describe('KeyTable - keys.editOnFocus', function() {
	dt.libs({
		js: ['jquery', 'datatables', 'keytable', 'select', 'editor', 'datetime'],
		css: ['datatables', 'keytable', 'select', 'editor', 'datetime']
	});

	describe('Functional tests', function() {
		let table, editor;

		dt.html('basic_id');
		it('Check the defaults - false', function() {
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

			$('tbody tr:eq(2) td:eq(2)').click();

			expect($('tbody tr:eq(2) input').length).toBe(0);
		});

		dt.html('basic_id');
		it('Check false', function() {
			$.fx.off = true; // disables lightbox animation

			editor = new $.fn.dataTable.Editor({
				table: '#example',
				fields: dt.getTestEditorColumns()
			});

			table = $('#example').DataTable({
				columns: dt.getTestColumns(),
				keys: {
					editor: editor,
					editOnFocus: false
				}
			});

			$('tbody tr:eq(2) td:eq(2)').click();

			expect($('tbody tr:eq(2) input').length).toBe(0);
		});

		dt.html('basic_id');
		it('Check true', function() {
			$.fx.off = true; // disables lightbox animation

			editor = new $.fn.dataTable.Editor({
				table: '#example',
				fields: dt.getTestEditorColumns()
			});

			table = $('#example').DataTable({
				columns: dt.getTestColumns(),
				keys: {
					editor: editor,
					editOnFocus: true
				}
			});

			$('tbody tr:eq(2) td:eq(2)').click();

			expect($('tbody tr:eq(2) input').length).toBe(1);
			expect($('tbody tr:eq(2) input').val()).toBe('San Francisco');
		});
	});
});
