describe('KeyTable - cell().focus()', function() {
	dt.libs({
		js: ['jquery', 'datatables', 'keytable'],
		css: ['datatables', 'keytable']
	});

	describe('Check the defaults', function() {
		let table;
		it('Exists and is a function', function() {
			table = $('#example').DataTable();
			expect(typeof table.cell.blur).toBe('function');
		});
		it('Returns an API instance', function() {
			expect(table.cell.blur() instanceof $.fn.dataTable.Api).toBe(true);
		});
	});

	describe('Functional tests', function() {
		let table;

		dt.html('basic');
		it('Removes focus', function() {
			table = $('#example').DataTable({
				keys: true
			});

			table.cell(2, 0).focus();
			expect($('.focus').length).toBe(1);

			table.cell.blur();
			expect($('.focus').length).toBe(0);
		});
		it('Stays focussed if keys disabled', function() {
			table.cell(2, 0).focus();
			expect($('.focus').length).toBe(1);

			table.keys.disable();
			table.cell.blur();
			expect($('.focus').length).toBe(1);
		});
		it('Can blur when reenabled', function() {
			table.keys.enable();
			table.cell.blur();
			expect($('.focus').length).toBe(0);
		});
	});
});
