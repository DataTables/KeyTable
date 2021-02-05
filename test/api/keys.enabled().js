describe('KeyTable - keys.enabled()', function () {
	dt.libs({
		js: ['jquery', 'datatables', 'keytable'],
		css: ['datatables', 'keytable']
	});

	let table;

	describe('Check the defaults', function () {
		it('Exists and is a function', function () {
			table = $('#example').DataTable();
			expect(typeof table.keys.enabled).toBe('function');
		});
		it('Returns an API instance', function () {
			expect(typeof table.keys.enabled()).toBe('boolean');
		});
	});

	describe('Functional tests', function () {
		dt.html('basic');
		it('KeyTable not enabled at initialisation', function () {
			table = $('#example').DataTable({
				keys: false
			});

			expect(table.keys.enabled()).toBe(false);
		});

		dt.html('basic');
		it('Enabled at initialisation', function () {
			table = $('#example').DataTable({
				keys: true
			});

			expect(table.keys.enabled()).toBe(true);
		});
		it('When disabled', function () {
			table.keys.enable(false);

			expect(table.keys.enabled()).toBe(false);
		});
		it('Navigation only', function () {
			table.keys.enable('navigation-only');

			expect(table.keys.enabled()).toBe('navigation-only');
		});
	});
});
