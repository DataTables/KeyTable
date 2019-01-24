describe('KeyTable - key-focus', function() {
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
			table.on('key-focus', function() {
				params = arguments;
				count++;
				focussed = $('.focus').length;
			});

			table.cell(2, 0).focus();

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

			table.on('key-focus', function() {
				params = arguments;
				count++;
				focussed = $('.focus').length;
			});
		});
		it('Check with a cell', function() {
			table.cell(2, 0).focus();
			expect(params[2].data()).toBe('Ashton Cox');
			expect(count).toBe(1);
		});
		it('Check with another cell', function() {
			table.cell(':eq(0)', 0).focus();
			expect(params[2].data()).toBe('Airi Satou');
			expect(count).toBe(2);
		});
		it('Not called if same cell focussed again', function() {
			table.cell(':eq(0)', 0).focus();
			expect(count).toBe(2);
		});
		it('Not called if blurred', function() {
			table.cell.blur();
			expect(count).toBe(2);
		});
		it('Now called if same cell focussed again', function() {
			table.cell(':eq(0)', 0).focus();
			expect(params[2].data()).toBe('Airi Satou');
			expect(count).toBe(3);
		});
		it('Check with a cell after keys disabled', function() {
			table.keys.disable();
			table.cell(2, 0).focus();
			expect(count).toBe(3);
		});
		it('Ensure originalEvent is correct for API', function() {
			table.keys.enable();
			table.cell(2, 0).focus();
			expect(params[3]).toBe(null);
			expect(count).toBe(4);
		});
		it('Ensure originalEvent is correct for click', function() {
			$('tbody tr:eq(0) td:eq(0)').click();
			expect(params[3].type).toBe('click');
			expect(count).toBe(5);
		});
	});

	describe('Tests with two tables', function() {
		let table1, table2;
		let name = '';
		let params;
		let count = 0;

		function eventCallback(argName, argParams) {
			name = argName;
			params = argParams;
			count++;
		}

		dt.html('two_tables');
		it('Setup both tables', function() {
			table1 = $('#example_one').DataTable({
				keys: true
			});
			table2 = $('#example_two').DataTable({
				keys: true
			});

			table1.on('key-focus', function() {
				eventCallback('table1', arguments);
				params = arguments;
			});
			table2.on('key-focus', function() {
				eventCallback('table2', arguments);
				params = arguments;
			});
		});
		it('Click on first table', function() {
			$('#example_one tbody tr:eq(2) td:eq(0)').click();
			expect(name).toBe('table1');
			expect(params[2].data()).toBe('Ashton Cox');
			expect(count).toBe(1);
		});
		it('Click on second table', function() {
			$('#example_two tbody tr:eq(2) td:eq(0)').click();
			expect(name).toBe('table2');
			expect(params[2].data()).toBe('Sydney');
			expect(count).toBe(2);
		});
		it('Disable event handler on first table', function() {
			table1.off('key-focus');

			$('#example_one tbody tr:eq(0) td:eq(0)').click();
			expect(name).toBe('table2');
			expect(params[2].data()).toBe('Sydney');
			expect(count).toBe(2);
		});
		it('Click on second table', function() {
			$('#example_two tbody tr:eq(0) td:eq(0)').click();
			expect(name).toBe('table2');
			expect(params[2].data()).toBe('Boston');
			expect(count).toBe(3);
		});
	});
});
