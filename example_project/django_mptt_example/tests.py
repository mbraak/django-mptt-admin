# coding=utf-8
import os

from django.test import TestCase
from django.contrib.auth.models import User
from django.contrib.admin.options import IS_POPUP_VAR
from django.core import serializers
import django

from django_webtest import WebTest

from django_mptt_admin.util import get_tree_queryset, get_javascript_value

from .models import Country


short_django_version = django.VERSION[0:2]


def read_testdata():
    fixture_filename = os.path.join(os.path.dirname(__file__), 'testdata/countries.json')

    with open(fixture_filename) as f:
        for obj in serializers.deserialize("json", f.read()):
            obj.save()


SCRIPT_JS_NAMESPACE = 'script[src="/static/django_mptt_admin/jquery_namespace.js"]'
SCRIPT_JS_DJANGO_MPTT_ADMIN = 'script[src="/static/django_mptt_admin/django_mptt_admin.js"]'


class DjangoMpttAdminWebTests(WebTest):
    def setUp(self):
        super(DjangoMpttAdminWebTests, self).setUp()

        USERNAME = 'admin'
        PASSWORD = 'p'

        self.admin = User.objects.create_superuser(USERNAME, 'admin@admin.com', PASSWORD)
        self.login(USERNAME, PASSWORD)

        read_testdata()

    def test_tree_view(self):
        # - get countries admin page
        countries_page = self.app.get('/django_mptt_example/country/')
        tree_element = countries_page.pyquery('#tree')

        # check savestate key
        self.assertEqual(tree_element.attr('data-save_state'), 'django_mptt_example_country')

        # check url
        json_url = tree_element.attr('data-url')
        self.assertEqual(json_url, '/django_mptt_example/country/tree_json/')

        self.assertEqual(tree_element.attr('data-csrf-cookie-name'), 'csrftoken')

        # check that js is included
        self.assertEqual(len(countries_page.pyquery(SCRIPT_JS_NAMESPACE)), 1)
        self.assertEqual(len(countries_page.pyquery(SCRIPT_JS_DJANGO_MPTT_ADMIN)), 1)

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

        if short_django_version >= (1, 9):
            change_url = '/django_mptt_example/country/{0:d}/change/'.format(africa_id)
        else:
            change_url = '/django_mptt_example/country/{0:d}/'.format(africa_id)

        self.assertEqual(
            africa,
            dict(
                label='Africa',
                id=africa_id,
                url=change_url,
                move_url='/django_mptt_example/country/{0:d}/move/'.format(africa_id),
                load_on_demand=True,
            )
        )

        # no children loaded beyond level 1
        self.assertFalse(hasattr(africa, 'children'))

        # -- load subtree
        json_data = self.app.get('{0!s}?node={1:d}'.format(base_url, africa_id)).json

        self.assertEqual(len(json_data), 58)
        self.assertEqual(json_data[0]['label'], 'Algeria')

        # -- issue 8; selected node does not exist
        self.app.get('{0!s}?selected_node=9999999'.format(base_url))

    def test_grid_view(self):
        # - get grid page
        grid_page = self.app.get('/django_mptt_example/country/grid/')

        # get first row
        row_index = 0

        first_row = grid_page.pyquery('#result_list tbody tr').eq(row_index)

        # 'name' column
        self.assertEqual(first_row.find('td').eq(1).text(), 'Afghanistan')

        # 'code' column
        self.assertEqual(first_row.find('th').text(), 'AF')

        # link to edit page
        afghanistan_id = Country.objects.get(name='Afghanistan').id

        if short_django_version >= (1, 9):
            change_url = '/django_mptt_example/country/{0:d}/change/'.format(afghanistan_id)
        else:
            change_url = '/django_mptt_example/country/{0:d}/'.format(afghanistan_id)

        self.assertEqual(first_row.find('a').attr('href'), change_url)

        # check that js is not included
        self.assertEqual(len(grid_page.pyquery(SCRIPT_JS_NAMESPACE)), 0)
        self.assertEqual(len(grid_page.pyquery(SCRIPT_JS_DJANGO_MPTT_ADMIN)), 0)

    def test_move_view(self):
        def get_continents():
            return ','.join(c.name for c in Country.objects.filter(level=1).order_by('lft'))

        def do_move(source_id, target_id, position):
            countries_page = self.app.get('/django_mptt_example/country/')
            csrf_token = countries_page.form['csrfmiddlewaretoken'].value

            response = self.app.post(
                '/django_mptt_example/country/{0:d}/move/'.format(source_id),
                params=dict(
                    csrfmiddlewaretoken=csrf_token,
                    target_id=target_id,
                    position=position,
                )
            )
            self.assertEqual(response.json, dict(success=True))

        # setup
        bouvet_island = Country.objects.get(code='BV')
        oceania = Country.objects.get(name='Oceania')

        self.assertEqual(bouvet_island.parent.name, 'Antarctica')

        # - move Bouvet Island under Oceania
        do_move(bouvet_island.id, oceania.id, 'inside')

        bouvet_island = Country.objects.get(code='BV')
        self.assertEqual(bouvet_island.parent.name, 'Oceania')

        # - move Antartica before Africa
        self.assertEqual(get_continents(), 'Africa,Antarctica,Asia,Europe,North America,Oceania,South America')

        do_move(
            Country.objects.get(name='Antarctica', level=1).id,
            Country.objects.get(name='Africa').id,
            'before'
        )

        self.assertEqual(get_continents(), 'Antarctica,Africa,Asia,Europe,North America,Oceania,South America')

        # move Antarctica after Europe
        do_move(
            Country.objects.get(name='Antarctica', level=1).id,
            Country.objects.get(name='Europe').id,
            'after'
        )
        self.assertEqual(get_continents(), 'Africa,Asia,Europe,Antarctica,North America,Oceania,South America')

        # unknown position
        self.assertRaisesMessage(
            Exception,
            'Unknown position',
            lambda: do_move(
                Country.objects.get(name='Antarctica', level=1).id,
                Country.objects.get(name='Europe').id,
                'unknown'
            )
        )

    def login(self, username, password):
        login_page = self.app.get('/login/')
        form = login_page.form

        form['username'] = username
        form['password'] = password

        form.submit()

        response = self.app.get('/')
        self.assertEqual(response.context['user'].username, username)

    def test_popup(self):
        # popup must return grid view
        grid_page = self.app.get('/django_mptt_example/country/?{0!s}=true'.format(IS_POPUP_VAR))

        first_row = grid_page.pyquery('#result_list tbody tr').eq(0)
        self.assertEqual(first_row.find('td').eq(0).text(), 'Afghanistan')

    def test_permissions(self):
        # admin2 doesn't have access because he's no superuser
        admin2 = User.objects.create_user('admin2', 'admin2@admin.nl', 'p')
        admin2.is_staff = True
        admin2.save()

        self.app.get('/logout/')
        self.login('admin2', 'p')

        # tree view
        self.app.get('/django_mptt_example/country/', status=403)

    def test_filter(self):
        # - tree view with all continents
        countries_page = self.app.get('/django_mptt_example/country/')

        self.assertEqual(
            countries_page.pyquery('#changelist-filter li a').text(),
            "All Africa Antarctica Asia Europe North America Oceania South America"
        )

        # - filter on 'Europe'
        countries_page = self.app.get('/django_mptt_example/country/?continent=Europe')

        tree_div = countries_page.pyquery('#tree')
        self.assertEqual(tree_div.attr('data-url'), '/django_mptt_example/country/tree_json/?continent=Europe')

        self.assertEqual(
            tree_div.attr('data-insert_at_url'),
            '/django_mptt_example/country/add/?_changelist_filters=continent%3DEurope'
        )

        # test json data
        # add `selected_node` parameter
        json_data = self.app.get('/django_mptt_example/country/tree_json/?continent=Europe&selected_node=2').json

        self.assertEqual(len(json_data), 1)
        root = json_data[0]
        self.assertEqual(root['label'], 'Europe')
        self.assertEqual(len(root['children']), 50)

        country_node = root['children'][0]

        if short_django_version >= (1, 9):
            self.assertEqual(
                country_node['url'],
                "/django_mptt_example/country/{0!s}/change/?_changelist_filters=continent%3DEurope".format(country_node['id'])
            )
        else:
            self.assertEqual(
                country_node['url'],
                "/django_mptt_example/country/{0!s}/?_changelist_filters=continent%3DEurope".format(country_node['id'])
            )

        # check urls
        object_tool_buttons = countries_page.pyquery('.object-tools a')
        self.assertEqual(len(object_tool_buttons), 2)

        self.assertEqual(
            object_tool_buttons.eq(0).attr('href'),
            '/django_mptt_example/country/add/?_changelist_filters=continent%3DEurope'
        )
        self.assertEqual(
            object_tool_buttons.eq(1).attr('href'),
            '/django_mptt_example/country/grid/?continent=Europe'
        )

        # - grid view; filter on 'Europe'
        grid_page = self.app.get('/django_mptt_example/country/grid/?continent=Europe')

        object_tool_buttons = grid_page.pyquery('.object-tools a')
        self.assertEqual(len(object_tool_buttons), 2)

        self.assertEqual(
            object_tool_buttons.eq(0).attr('href'),
            '/django_mptt_example/country/add/?_changelist_filters=continent%3DEurope'
        )
        self.assertEqual(
            object_tool_buttons.eq(1).attr('href'),
            '/django_mptt_example/country/?continent=Europe'
        )


class DjangoMpttAdminTestCase(TestCase):
    def setUp(self):
        super(DjangoMpttAdminTestCase, self).setUp()

        read_testdata()

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
