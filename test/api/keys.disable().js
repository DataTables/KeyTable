describe('KeyTable - keys.disable()', function() {
	dt.libs({
		js: ['jquery', 'datatables', 'keytable'],
		css: ['datatables', 'keytable']
	});

	let table;

	describe('Check the defaults', function() {
		it('Exists and is a function', function() {
			table = $('#example').DataTable();
			expect(typeof table.keys.enable).toBe('function');
		});
		it('Returns an API instance', function() {
			expect(table.keys.enable() instanceof $.fn.dataTable.Api).toBe(true);
		});
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Can use it to disable keys', function() {
			table = $('#example').DataTable({
				keys: true
			});

			table.keys
				.disable()
				.cell(2, 0)
				.focus();

			expect($('.focus').length).toBe(0);
		});

		dt.html('basic');
		it('Cell keeps focus after being disabled', function() {
			table = $('#example').DataTable({
				keys: true
			});

			table.keys
				.enable()
				.cell(2, 0)
				.focus()
				.keys.disable();

			expect($('.focus').length).toBe(1);
			expect($('.focus').text()).toBe('Ashton Cox');
		});
	});
});
