from django.contrib.auth.models import User

from django_webtest import WebTest

from .models import Country


class DjangoMpttAdminWebTests(WebTest):
    fixtures = ['initial_data.json']

    def setUp(self):
        super(DjangoMpttAdminWebTests, self).setUp()

        USERNAME = 'admin'
        PASSWORD = 'p'

        self.admin = User.objects.create_superuser(USERNAME, 'admin@admin.com', PASSWORD)
        self.login(USERNAME, PASSWORD)

    def test_tree_view(self):
        # - get countries admin page
        countries_page = self.app.get('/django_mptt_example/country/')

        # - load json
        json_url = countries_page.pyquery('#tree').attr('data-url')
        json_data = self.app.get(json_url).json

        self.assertEqual(len(json_data), 1)

        root = json_data[0]
        self.assertEqual(root['label'], 'root')
        self.assertEqual(len(root['children']), 7)

        africa_id = Country.objects.get(name='Africa').id

        africa = root['children'][0]
        self.assertEqual(
            africa,
            dict(
                label='Africa',
                id=africa_id,
                url='/django_mptt_example/country/%d/' % africa_id,
                move_url='/django_mptt_example/country/%d/move/' % africa_id,
                load_on_demand=True,
            )
        )

    def test_grid_view(self):
        # - get grid page
        grid_page = self.app.get('/django_mptt_example/country/grid/')

        # get first row
        first_row = grid_page.pyquery('#result_list tbody tr').eq(0)

        # 'name' column
        self.assertEqual(first_row.find('td').eq(1).text(), 'Africa')

        # 'code' column
        self.assertEqual(first_row.find('th').text(), '(None)')

        # link to edit page
        africa_id = Country.objects.get(name='Africa').id

        self.assertEqual(first_row.find('a').attr('href'), '/django_mptt_example/country/%d/' % africa_id)

    def login(self, username, password):
        form = self.app.get('/').form

        form['username'] = username
        form['password'] = password

        response = form.submit().follow()
        self.assertEqual(response.context['user'].username, 'admin')