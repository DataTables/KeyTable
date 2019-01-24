describe('KeyTable - keys.enable()', function() {
	dt.libs({
		js: ['jquery', 'datatables', 'keytable'],
		css: ['datatables', 'keytable']
	});

	describe('Check the defaults', function() {
		let table;
		it('Exists and is a function', function() {
			table = $('#example').DataTable();
			expect(typeof table.keys.enable).toBe('function');
		});
		it('Returns an API instance', function() {
			expect(table.keys.enable() instanceof $.fn.dataTable.Api).toBe(true);
		});
	});

	describe('Functional tests', function() {
		let table;

		dt.html('basic');
		it('Does nothing if keyTable not enabled at initialisation', function() {
			table = $('#example').DataTable({
				keys: false
			});

			table.keys.enable();

			table.cell(2, 0).focus();

			expect($('.focus').length).toBe(0);
		});

		dt.html('basic');
		it('Can use it to disable keys', function() {
			table = $('#example').DataTable({
				keys: true
			});

			table.keys
				.enable(false)
				.cell(2, 0)
				.focus();

			expect($('.focus').length).toBe(0);
		});
		it('Can use it to enable keys', function() {
			table.keys
				.enable(true)
				.cell(2, 0)
				.focus();

			expect($('.focus').length).toBe(1);
			expect($('.focus').text()).toBe('Ashton Cox');
		});
		it('Disabling keeps focussed cell', function() {
			table.keys
				.enable(false)
				.cell(2, 0)
				.focus();

			expect($('.focus').length).toBe(1);
		});
		it('Can set navigation only', function() {
			table.keys
				.enable('navigation-only')
				.cell(3, 0)
				.focus();

			expect($('.focus').length).toBe(1);
			expect($('.focus').text()).toBe('Cedric Kelly');
		});
	});
});
