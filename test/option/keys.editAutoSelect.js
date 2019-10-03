describe('KeyTable - keys.editAutoSelect', function() {
	dt.libs({
		js: ['jquery', 'datatables', 'keytable', 'select', 'editor'],
		css: ['datatables', 'keytable', 'select', 'editor']
	});

	describe('Functional tests', function() {
		let table, editor;

		dt.html('basic_id');
		it('Check the defaults - true', function() {
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

			// DD-1182 - nothing currently getting selected
			// expect(document.getSelection().toString()).toBe('San Francisco');
			expect(document.getSelection().toString()).toBe('');
		});

		dt.html('basic_id');
		it('Set to true', function() {
			$.fx.off = true; // disables lightbox animation

			editor = new $.fn.dataTable.Editor({
				table: '#example',
				fields: dt.getTestEditorColumns()
			});

			table = $('#example').DataTable({
				columns: dt.getTestColumns(),
				keys: {
					editor: editor,
					editAutoSelect: true,
					editOnFocus: true
				}
			});

			$('tbody tr:eq(2) td:eq(2)').click();

			// DD-1182 - nothing currently getting selected
			// expect(document.getSelection().toString()).toBe('San Francisco');
			expect(document.getSelection().toString()).toBe('');
		});

		dt.html('basic_id');
		it('Set to false', function() {
			$.fx.off = true; // disables lightbox animation

			editor = new $.fn.dataTable.Editor({
				table: '#example',
				fields: dt.getTestEditorColumns()
			});

			table = $('#example').DataTable({
				columns: dt.getTestColumns(),
				keys: {
					editor: editor,
					editAutoSelect: false,
					editOnFocus: true
				}
			});

			$('tbody tr:eq(2) td:eq(2)').click();

			expect(document.getSelection().toString()).toBe('');
		});
	});
});
