describe('KeyTable - keys.blurable', function() {
	dt.libs({
		js: ['jquery', 'datatables', 'keytable'],
		css: ['datatables', 'keytable']
	});

	describe('Check the defaults', function() {
		let table;

		dt.html('basic');
		it('Is blurable by default', function() {
			table = $('#example').DataTable({
				keys: true
			});

			expect($('.focus').length).toBe(0);
		});
		it('Select a cell', function() {
			$('tbody tr:eq(2) td:eq(0)').click();
			expect($('.focus').length).toBe(1);
		});
		it('Select a search input element', function() {
			$('#example_wrapper input').mousedown();
			expect($('.focus').length).toBe(0);
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

			$('#example_one tbody tr:eq(2) td:eq(1)').click();

			expect($('.focus').length).toBe(0);
			expect($('.unit_test').text()).toBe('Junior Technical Author');
		});
		it('Deselect', function() {
			$('#example_one_wrapper input').mousedown();

			expect($('.focus').length).toBe(0);
			expect($('.unit_test').length).toBe(0);
		});
		it('Clicking other table uses default', function() {
			$('#example_two tbody tr:eq(2) td:eq(0)').click();

			expect($('.focus').text()).toBe('Sydney');
			expect($('.unit_test').length).toBe(0);
		});
	});
});
