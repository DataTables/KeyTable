describe('KeyTable - keys.columns', function() {
	dt.libs({
		js: ['jquery', 'datatables', 'keytable'],
		css: ['datatables', 'keytable']
	});

	function checkFocus(expected) {
		let last = undefined;
		for (let i = 0; i < 6; i++) {
			$('#example tbody tr:eq(2) td:eq(' + i + ')').click();

			if (expected[i]) {
				expect($('.focus').length).toBe(1);
				expect($('.focus').index()).toBe(i);
				last = i;
			} else {
				expect($('.focus').length).toBe(last === undefined ? 0 : 1);
				if (last !== undefined) {
					expect($('.focus').index()).toBe(last);
				}
			}
		}
	}

	describe('Check the defaults', function() {
		let table;

		dt.html('basic');
		it('Ensure can select all columns by default', function() {
			table = $('#example').DataTable({
				keys: true
			});

			checkFocus([true, true, true, true, true, true]);
		});

		dt.html('basic');
		it('Can restrict by column number', function() {
			table = $('#example').DataTable({
				keys: {
					columns: [2, 3, 5]
				}
			});

			checkFocus([false, false, true, true, false, true]);
		});

		dt.html('basic');
		it('Can restrict by selectors', function() {
			table = $('#example').DataTable({
				keys: {
					columns: ':not(:last-child)'
				}
			});

			checkFocus([true, true, true, true, true, false]);
		});
	});
});
