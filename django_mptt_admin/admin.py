import json
from functools import update_wrapper

from django.core.exceptions import PermissionDenied, SuspiciousOperation
from django.core.urlresolvers import reverse
from django.http import HttpResponse
from django.template.response import TemplateResponse
from django.conf.urls import url
from django.db import transaction
from django.contrib import admin
from django.contrib.admin.options import csrf_protect_m
from django.contrib.admin.views.main import ChangeList
from django.contrib.admin.util import unquote, quote

from util import get_tree_from_queryset


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
            title=change_list.title,
            cl=change_list,
            app_label=self.model._meta.app_label,
            media=self.media,
            has_add_permission=self.has_add_permission(request),
            tree_data=self.get_tree_data_as_json(change_list),
        )

        return TemplateResponse(
            request,
            'django_mptt_admin/change_list.html',
            context
        )

    def get_tree_data_as_json(self, change_list):
        opts = self.model._meta
        pk_attname = opts.pk.attname
        url_name = 'admin:%s_%s_move' % (opts.app_label, opts.module_name)

        def get_move_url(instance):
            pk = getattr(instance, pk_attname)
            return reverse(
                url_name,
                args=(quote(pk),),
                current_app=self.admin_site.name
            )

        def handle_create_node(instance, node_info):
            node_info.update(
                url=change_list.url_for_result(instance),
                move_url=get_move_url(instance)
            )

        return json.dumps(
            get_tree_from_queryset(change_list.query_set, handle_create_node)
        )

    def get_urls(self):
        def wrap(view):
            def wrapper(*args, **kwargs):
                return self.admin_site.admin_view(view)(*args, **kwargs)
            return update_wrapper(wrapper, view)

        info = self.model._meta.app_label, self.model._meta.module_name
        urlpatterns = super(DjangoMpttAdmin, self).get_urls()

        # Prepend 'move' url to list so it has preference before 'change' url
        urlpatterns.insert(
            0,
            url(
                r'^(.+)/move/$',
                wrap(self.move_view),
                name='%s_%s_move' % info
            )
        )
        return urlpatterns

    @csrf_protect_m
    @transaction.commit_on_success
    def move_view(self, request, object_id):
        instance = self.get_object(request, unquote(object_id))

        if not self.has_change_permission(request, instance):
            raise PermissionDenied()

        if request.method != 'POST':
            raise SuspiciousOperation()

        target_id = int(request.POST['target_id'])
        position = request.POST['position']
        target_instance = self.get_object(request, target_id)

        if position == 'before':
            instance.move_to(target_instance, 'left')
        elif position == 'after':
            instance.move_to(target_instance, 'right')
        elif position == 'inside':
            instance.move_to(target_instance)
        else:
            raise Exception('Unknown position')

        return HttpResponse()