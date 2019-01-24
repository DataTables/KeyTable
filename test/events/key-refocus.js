describe('KeyTable - key-refocus', function() {
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
			table.on('key-refocus', function() {
				params = arguments;
				count++;
				focussed = $('.focus').length;
			});

			table
				.cell(2, 0)
				.focus()
				.focus();

			expect(params.length).toBe(4);
			expect(params[0] instanceof $.Event).toBe(true);
			expect(params[1] instanceof $.fn.dataTable.Api).toBe(true);
			expect(params[2] instanceof $.fn.dataTable.Api).toBe(true);
			expect(typeof params[3]).toBe('object');
		});
		it('It passes the correct cell', function() {
			expect(params[2].data()).toBe('Ashton Cox');
		});
		it('Is called after the focus', function() {
			expect(focussed).toBe(1);
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

			table.on('key-refocus', function() {
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
			expect(params[2].data()).toBe('Ashton Cox');
			expect(count).toBe(1);
		});
		it('Not called if blurred', function() {
			table.cell.blur();
			expect(count).toBe(1);
		});
		it('Ensure originalEvent is correct for API', function() {
			table.keys.enable();
			table
				.cell(2, 0)
				.focus()
				.focus();
			expect(params[3]).toBe(null);
			expect(count).toBe(2);
		});
		it('Ensure originalEvent is correct for click', function() {
			$('tbody tr:eq(2) td:eq(0)').click();
			expect(params[3].type).toBe('click');
			expect(count).toBe(3);
		});
	});
});
