# coding=utf-8
from uuid import UUID

from django.test import TestCase

from django_mptt_admin.util import get_tree_queryset, get_tree_from_queryset, get_javascript_value, serialize_id

from ..models import Country

from .utils import read_testdata


class UtilTestCase(TestCase):
    def setUp(self):
        super(UtilTestCase, self).setUp()

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


    def test_get_tree_from_queryset(self):
        tree = get_tree_from_queryset(get_tree_queryset(Country))

        root = tree[0]
        self.assertEqual(root['label'], 'root')

        continents = root['children']
        self.assertEqual(len(continents), 7)
        self.assertEqual(continents[0]['label'], 'Africa')

        african_countries = continents[0]['children']
        self.assertEqual(african_countries[0]['label'], 'Algeria')

        # format label
        tree = get_tree_from_queryset(get_tree_queryset(Country), item_label_field_name='code')
        root = tree[0]
        continents = root['children']
        african_countries = continents[0]['children']
        self.assertEqual(african_countries[0]['label'], 'DZ')

    def test_get_javascript_value(self):
        self.assertEqual(get_javascript_value(True), 'true')
        self.assertEqual(get_javascript_value(False), 'false')
        self.assertEqual(get_javascript_value(10), '10')

    def test_serialize_id(self):
        self.assertEqual(serialize_id(10), 10)
        self.assertEqual(serialize_id('10'), '10')

        self.assertEqual(
            serialize_id(UUID('7b6dd6ba55fb400ca0f59cde381c987f')),
            '7b6dd6ba-55fb-400c-a0f5-9cde381c987f'
        )
