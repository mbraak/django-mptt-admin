# coding=utf-8
from django.test import TestCase
from django.contrib.auth.models import User

from django_webtest import WebTest

from django_mptt_admin.util import get_tree_queryset, get_javascript_value

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
        tree_element = countries_page.pyquery('#tree')

        # check savestate key
        self.assertEqual(tree_element.attr('data-save_state'), 'django_mptt_example_country')

        # check url
        json_url = tree_element.attr('data-url')
        self.assertEqual(json_url, '/django_mptt_example/country/tree_json/')

    def test_load_json(self):
        base_url = '/django_mptt_example/country/tree_json/'

        # -- load json
        json_data = self.app.get(base_url).json

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

        # no children loaded beyond level 1
        self.assertFalse(hasattr(africa, 'children'))

        # -- load subtree
        json_data = self.app.get('%s?node=%d' % (base_url, africa_id)).json

        self.assertEqual(len(json_data), 58)
        self.assertEqual(json_data[0]['label'], 'Algeria')

        # -- issue 8; selected node does not exist
        self.app.get('%s?selected_node=9999999' % base_url)

    def test_grid_view(self):
        # - get grid page
        grid_page = self.app.get('/django_mptt_example/country/grid/')

        # get row with 'Africa'
        row_index = 0

        first_row = grid_page.pyquery('#result_list tbody tr').eq(row_index)

        # 'name' column
        self.assertEqual(first_row.find('td').eq(1).text(), 'Afghanistan')

        # 'code' column
        self.assertEqual(first_row.find('th').text(), 'AF')

        # link to edit page
        afghanistan_id = Country.objects.get(name='Afghanistan').id

        self.assertEqual(first_row.find('a').attr('href'), '/django_mptt_example/country/%d/' % afghanistan_id)

    def test_move_view(self):
        # setup
        bouvet_island = Country.objects.get(code='BV')
        oceania = Country.objects.get(name='Oceania')

        # - move Bouvet Island under Oceania
        countries_page = self.app.get('/django_mptt_example/country/')
        csrf_token = countries_page.form['csrfmiddlewaretoken'].value

        response = self.app.post(
            '/django_mptt_example/country/%d/move/' % bouvet_island.id,
            dict(
                csrfmiddlewaretoken=csrf_token,
                target_id=oceania.id,
                position='inside',
            )
        )
        self.assertEqual(response.json, dict(success=True))

    def login(self, username, password):
        login_page = self.app.get('/', auto_follow=True)
        form = login_page.form

        form['username'] = username
        form['password'] = password

        response = form.submit().follow()
        self.assertEqual(response.context['user'].username, 'admin')


class DjangoMpttAdminTestCase(TestCase):
    fixtures = ['initial_data.json']

    def test_get_tree_queryset(self):
        # get default queryset
        qs = get_tree_queryset(Country)
        self.assertEqual(len(qs), 257)
        self.assertEqual(qs[0].name, 'root')

        # subtree
        qs = get_tree_queryset(Country, node_id=Country.objects.get(name='Europe').id)
        self.assertEqual(len(qs), 50)
        self.assertEqual(qs[0].name, u'Åland Islands')

        # max_level 1
        qs = get_tree_queryset(Country, max_level=1)
        self.assertEqual(len(qs), 8)
        self.assertEqual(qs[0].name, 'root')

        # max_level True
        qs = get_tree_queryset(Country, max_level=True)
        self.assertEqual(len(qs), 8)

        # exclude root
        qs = get_tree_queryset(Country, include_root=False)
        self.assertEqual(len(qs), 256)
        self.assertEqual(qs[0].name, 'Africa')

    def test_get_javascript_value(self):
        self.assertEqual(get_javascript_value(True), 'true')
        self.assertEqual(get_javascript_value(False), 'false')
        self.assertEqual(get_javascript_value(10), '10')
