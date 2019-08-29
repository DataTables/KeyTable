describe('KeyTable - keys', function() {
	dt.libs({
		js: ['jquery', 'datatables', 'keytable'],
		css: ['datatables', 'keytable']
	});

	describe('Check the defaults', function() {
		let table;

		dt.html('basic');
		it('Not enabled by default', function() {
			expect($.fn.dataTable.KeyTable.defaults.keys).toBe(null);
		});
		it('Nothing selected initially', function() {
			table = $('#example').DataTable({
				keys: true
			});
			expect($('.focus').length).toBe(0);
		});
		it('Can select a cell', function() {
			$('tbody tr:eq(2) td:eq(0)').click();

			expect($('.focus').length).toBe(1);
			expect($('.focus').text()).toBe('Ashton Cox');
		});
		it('Destroying table removes class', function() {
			table.destroy();

			expect($('.focus').length).toBe(0);
		});
	});

	describe('Tests with two tables', function() {
		let table1;
		let table2;

		dt.html('two_tables');
		it('Can have it on one table but not other', function() {
			table1 = $('#example_one').DataTable({
				keys: true
			});

			table2 = $('#example_two').DataTable();

			$('#example_one tbody tr:eq(2) td:eq(0)').click();
			$('#example_two tbody tr:eq(2) td:eq(0)').click();

			expect($('.focus').length).toBe(1);
			expect($('.focus').text()).toBe('Ashton Cox');
		});

		dt.html('two_tables');
		it('Can have it on one table but not other', function() {
			table1 = $('#example_one').DataTable();
			table2 = $('#example_two').DataTable({
				keys: true
			});

			$('#example_one tbody tr:eq(2) td:eq(0)').click();
			$('#example_two tbody tr:eq(2) td:eq(0)').click();

			expect($('.focus').length).toBe(1);
			expect($('.focus').text()).toBe('Sydney');
		});

		dt.html('two_tables');
		it('Can have it on both tables', function() {
			table1 = $('#example_one').DataTable({
				keys: true
			});
			table2 = $('#example_two').DataTable({
				keys: true
			});

			$('#example_one tbody tr:eq(2) td:eq(0)').click();
			$('#example_two tbody tr:eq(2) td:eq(0)').click();

			expect($('.focus').length).toBe(1);
		});
		it('Destroying one table doesnt affect other', function() {
			table1.destroy();

			$('#example_two tbody tr:eq(1) td:eq(0)').click();

			expect($('.focus').length).toBe(1);
			expect($('#example_two tbody td.focus').text()).toBe('Milan');
		});
		it('Clicking on destroyed table does nothing', function() {
			$('#example_one tbody tr:eq(1) td:eq(0)').click();

			expect($('.focus').length).toBe(1);
			expect($('#example_two tbody td.focus').text()).toBe('Milan');
		});		
	});
});
