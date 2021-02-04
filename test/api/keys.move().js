describe('KeyTable - keys.move()', function () {
	dt.libs({
		js: ['jquery', 'datatables', 'keytable'],
		css: ['datatables', 'keytable']
	});

	let table;

	describe('Check the defaults', function () {
		it('Exists and is a function', function () {
			table = $('#example').DataTable();
			expect(typeof table.keys.move).toBe('function');
		});
		it('Returns an API instance', function () {
			expect(table.keys.move() instanceof $.fn.dataTable.Api).toBe(true);
		});
	});

	describe('Functional tests', function () {
		dt.html('basic');
		it('Give focus', function () {
			table = $('#example').DataTable({
				keys: true,				
			})

			table.cell(2, 5).focus();

			expect($('.focus').text()).toBe('$86,000');
		});
		it('Down', function() {
			table.keys.move('down');
			expect($('.focus').text()).toBe('$132,000');
		});
		it('Up', function() {
			table.keys.move('up');
			expect($('.focus').text()).toBe('$86,000');
		});
		it('Right', function() {
			table.keys.move('right');
			expect($('.focus').text()).toBe('Bradley Greer');
		});
		it('Left', function() {
			table.keys.move('left');
			expect($('.focus').text()).toBe('$86,000');
		});

		it('Can change page', function() {
			table.cell(3, 0).focus();
			expect($('.focus').text()).toBe('Cedric Kelly');
		});
		it('... and move', function() {
			table.keys.move('down');
			expect($('.focus').text()).toBe('Charde Marshall');
		});
	});
});
