describe('KeyTable - keys.focus', function() {
	dt.libs({
		js: ['jquery', 'datatables', 'keytable'],
		css: ['datatables', 'keytable']
	});

	describe('Check the defaults', function() {
		let table;

		dt.html('basic');
		it('Ensure nothing selected by default', function() {
			table = $('#example').DataTable({
				keys: true
			});

			expect($('.focus').length).toBe(0);
		});

		dt.html('basic');
		it('Can select a cell by default', function() {
			// This is a bit rubbish - you can specify a row, only a column
			// of the first row, and that first row is the order of the original
			// table. A bit wrong, Allan suggested it be changed to also include
			// a focusModifier, so that {order:'current'} could be included.
			// such a low priority bug that only worth fixing if seen by a
			// customer
			table = $('#example').DataTable({
				keys: {
					focus: ':eq(0)'
				}
			});
			expect($('.focus').length).toBe(0);

			table.page(5).draw(false);

			expect($('.focus').length).toBe(1);
			expect($('.focus').text()).toBe('Tiger Nixon');
		});
	});
});
