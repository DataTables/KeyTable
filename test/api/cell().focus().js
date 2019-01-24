describe('KeyTable - cell().focus()', function() {
	dt.libs({
		js: ['jquery', 'datatables', 'keytable'],
		css: ['datatables', 'keytable']
	});

	describe('Check the defaults', function() {
		let table;
		it('Exists and is a function', function() {
			table = $('#example').DataTable();
			expect(typeof table.cell().focus).toBe('function');
		});
		it('Returns an API instance', function() {
			expect(table.cell().focus() instanceof $.fn.dataTable.Api).toBe(true);
		});
	});

	describe('Functional tests', function() {
		let table;

		dt.html('basic');
		it('Does nothing if keyTable not enabled', function() {
			table = $('#example').DataTable({
				keys: false
			});

			table.cell(2, 0).focus();

			expect($('.focus').length).toBe(0);
		});

		dt.html('basic');
		it('Ensure nothing selected by default', function() {
			table = $('#example').DataTable({
				keys: true
			});

			expect($('.focus').length).toBe(0);
		});
		it('Can select a cell', function() {
			table.cell(2, 0).focus();

			expect($('.focus').length).toBe(1);
			expect($('.focus').text()).toBe('Ashton Cox');
		});
		it('Can select a cell on non-visible page', function() {
			table.cell(':eq(56)', 0, { order: 'current' }).focus();

			expect(table.page.info().page).toBe(5);
			expect($('.focus').length).toBe(1);
			expect($('.focus').text()).toBe('Zorita Serrano');
		});
	});
});
