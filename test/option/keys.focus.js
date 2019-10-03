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
		it('Can select a cell - first cell', function() {
			table = $('#example').DataTable({
				keys: {
					focus: ':eq(0)'
				},
				// DD-1181 - remove displayStart once fixed
				displayStart: 5
			});

			expect($('.focus').text()).toBe('Airi Satou');
		});

		dt.html('basic');
		it('Can select a cell - node', function() {
			table = $('#example').DataTable({
				keys: {
					focus: $('tbody tr:eq(2) td:eq(3)')
				}
			});

			expect($('.focus').text()).toBe('66');
		});

		dt.html('basic');
		it('Can select a cell - function', function() {
			table = $('#example').DataTable({
				keys: {
					focus: function(idx, data, node) {
						return data === '$86,000' ? true : false;
					}
				}
			});

			expect($('.focus').text()).toBe('$86,000');
		});
	});
});
