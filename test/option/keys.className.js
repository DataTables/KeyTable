describe('KeyTable - keys.className', function() {
	dt.libs({
		js: ['jquery', 'datatables', 'keytable'],
		css: ['datatables', 'keytable']
	});

	describe('Check the defaults', function() {
		let table;

		dt.html('basic');
		it('Nothing selected initially', function() {
			table = $('#example').DataTable({
				keys: {
					className: 'unit_test'
				}
			});
			expect($('.focus').length).toBe(0);
			expect($('.unit_test').length).toBe(0);
		});
		it('Select a cell', function() {
			$('tbody tr:eq(2) td:eq(0)').click();

			expect($('.focus').length).toBe(0);
			expect($('.unit_test').length).toBe(1);
		});
	});

	describe('Test with two tables', function() {
		let table1;
		let table2;

		dt.html('two_tables');
		it('Can have it on one table but not other', function() {
			table1 = $('#example_one').DataTable({
				keys: {
					className: 'unit_test'
				}
			});

			table2 = $('#example_two').DataTable({
				keys: true
			});

			$('#example_one tbody tr:eq(2) td:eq(0)').click();

			expect($('.focus').length).toBe(0);
			expect($('.unit_test').length).toBe(1);
		});
		it('Clicking other table deselects first table and uses default', function() {
			$('#example_two tbody tr:eq(2) td:eq(0)').click();

			expect($('.focus').length).toBe(1);
			expect($('.unit_test').length).toBe(0);
		});
	});
});
