from uuid import UUID
from django.test import TestCase

from django_mptt_admin.util import (
    get_tree_queryset,
    get_tree_from_queryset,
    get_javascript_value,
    serialize_id,
)

from ..models import Country


class GetQuerySetTestCase(TestCase):
    fixtures = ["countries.json"]

    def test_default(self):
        qs = get_tree_queryset(Country)
        self.assertEqual(len(qs), 257)
        self.assertEqual(qs[0].name, "root")

    def test_subtree(self):
        qs = get_tree_queryset(Country, node_id=Country.objects.get(name="Europe").id)
        self.assertEqual(len(qs), 50)
        self.assertEqual(qs[0].name, "Åland Islands")

    def test_max_level_1(self):
        qs = get_tree_queryset(Country, max_level=1)
        self.assertEqual(len(qs), 8)
        self.assertEqual(qs[0].name, "root")

    def test_max_level_true(self):
        qs = get_tree_queryset(Country, max_level=True)
        self.assertEqual(len(qs), 8)

    def test_exclude_root(self):
        qs = get_tree_queryset(Country, include_root=False)
        self.assertEqual(len(qs), 256)
        self.assertEqual(qs[0].name, "Africa")


class GetTreeFromQuerySetTestCase(TestCase):
    fixtures = ["countries.json"]

    def test_default(self):
        tree = get_tree_from_queryset(get_tree_queryset(Country))

        root = tree[0]
        self.assertEqual(root["name"], "root")

        continents = root["children"]
        self.assertEqual(len(continents), 7)
        self.assertEqual(continents[0]["name"], "Africa")

        african_countries = continents[0]["children"]
        self.assertEqual(african_countries[0]["name"], "Algeria")

    def test_format_label(self):
        tree = get_tree_from_queryset(
            get_tree_queryset(Country), item_label_field_name="code"
        )
        root = tree[0]
        continents = root["children"]
        african_countries = continents[0]["children"]
        self.assertEqual(african_countries[0]["name"], "DZ")


class GetJavascriptValueTestCase(TestCase):
    testcases = ((True, "true"), (False, "false"), (10, "10"))

    def test(self):
        for [value, expected] in self.testcases:
            self.assertEqual(get_javascript_value(value), expected)


class SerializeIdTestCase(TestCase):
    testcases = (
        (10, 10),
        ("10", "10"),
        (
            UUID("7b6dd6ba55fb400ca0f59cde381c987f"),
            "7b6dd6ba-55fb-400c-a0f5-9cde381c987f",
        ),
    )

    def test(self):
        for [value, expected] in self.testcases:
            self.assertEqual(serialize_id(value), expected)
