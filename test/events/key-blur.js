describe('KeyTable - key-blur', function() {
	dt.libs({
		js: ['jquery', 'datatables', 'keytable'],
		css: ['datatables', 'keytable']
	});

	describe('Check the defaults', function() {
		let table;
		let params = undefined;
		let count = 0;
		let focussed = 0;

		dt.html('basic');
		it('Set stuff up', function() {
			table = $('#example').DataTable({
				keys: true
			});
		});
		it('Is called with the right parameters', function() {
			table.on('key-blur', function() {
				params = arguments;
				count++;
				focussed = $('.focus').length;
			});

			table
				.cell(2, 0)
				.focus()
				.cell.blur();

			expect(params.length).toBe(3);
			expect(params[0] instanceof $.Event).toBe(true);
			expect(params[1] instanceof $.fn.dataTable.Api).toBe(true);
			expect(params[2] instanceof $.fn.dataTable.Api).toBe(true);
		});
		it('It passes the correct cell', function() {
			expect(params[2].data()).toBe('Ashton Cox');
		});
		it('Is called after the blur', function() {
			expect(focussed).toBe(0);
		});
		it('Called once per focus', function() {
			expect(count).toBe(1);
		});
	});

	describe('Functional tests', function() {
		let table;
		let params;
		let count = 0;

		dt.html('basic');
		it('Set stuff up', function() {
			table = $('#example').DataTable({
				keys: true
			});

			table.on('key-blur', function() {
				params = arguments;
				count++;
				focussed = $('.focus').length;
			});
		});
		it('Not triggered on first focus', function() {
			table.cell(2, 0).focus();
			expect(count).toBe(0);
		});
		it('Triggered if same cell focussed again', function() {
			table.cell(2, 0).focus();
			expect(count).toBe(0);
		});
		it('Called if blurred', function() {
			table.cell.blur();
			expect(params[2].data()).toBe('Ashton Cox');
			expect(count).toBe(1);
		});
	});
});
