import json

from django.core.exceptions import PermissionDenied
from django.template.response import TemplateResponse
from django.contrib import admin
from django.contrib.admin.options import csrf_protect_m
from django.contrib.admin.views.main import ChangeList

from util import get_tree_from_mptt


class MPTTChangeList(ChangeList):
    def get_query_set(self, request):
        qs = super(MPTTChangeList, self).get_query_set(request)

        # always order by (tree_id, left)
        tree_id = qs.model._mptt_meta.tree_id_attr
        left = qs.model._mptt_meta.left_attr
        return qs.order_by(tree_id, left)


class DjangoMpttAdmin(admin.ModelAdmin):
    @csrf_protect_m
    def changelist_view(self, request, extra_context=None):
        if not self.has_change_permission(request, None):
            raise PermissionDenied

        list_display = self.get_list_display(request)
        list_display_links = self.get_list_display_links(request, list_display)
        list_filter = self.get_list_filter(request)

        change_list = MPTTChangeList(
            request, self.model, list_display,
            list_display_links, list_filter, self.date_hierarchy,
            self.search_fields, self.list_select_related,
            self.list_per_page, self.list_max_show_all, self.list_editable,
            self
        )

        context = dict(
            cl=change_list,
            app_label=self.model._meta.app_label,
            media=self.media,
            tree_data=self.get_tree_data_as_json(change_list),
        )

        return TemplateResponse(
            request,
            'django_mptt_admin/change_list.html',
            context
        )

    def get_tree_data_as_json(self, change_list):
        def handle_create_node(node, node_info):
            node_info['url'] = change_list.url_for_result(node)

        return json.dumps(
            get_tree_from_mptt(change_list.query_set, handle_create_node)
        )