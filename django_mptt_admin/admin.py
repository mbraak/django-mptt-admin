from functools import update_wrapper

from django.core.exceptions import PermissionDenied, SuspiciousOperation
from django.core.urlresolvers import reverse
from django.template.response import TemplateResponse
from django.db import transaction
from django.contrib import admin
from django.contrib.admin.options import csrf_protect_m
from django.contrib.admin.views.main import ChangeList
from django.contrib.admin.util import unquote, quote
from django.conf.urls import url

from . import util


class DjangoMpttAdmin(admin.ModelAdmin):
    tree_auto_open = 1
    tree_load_on_demand = 1

    change_list_template = 'django_mptt_admin/grid_view.html'

    @csrf_protect_m
    def changelist_view(self, request, extra_context=None):
        if not self.has_change_permission(request, None):
            raise PermissionDenied()

        change_list = self.get_change_list_for_tree(request)

        context = dict(
            title=change_list.title,
            app_label=self.model._meta.app_label,
            cl=change_list,
            media=self.media,
            has_add_permission=self.has_add_permission(request),
            tree_auto_open=util.get_javascript_value(self.tree_auto_open),
            tree_json_url=self.get_admin_url('tree_json'),
            grid_url=self.get_admin_url('grid'),
        )

        return TemplateResponse(
            request,
            'django_mptt_admin/change_list.html',
            context
        )

    def get_urls(self):
        def wrap(view):
            def wrapper(*args, **kwargs):
                return self.admin_site.admin_view(view)(*args, **kwargs)
            return update_wrapper(wrapper, view)

        urlpatterns = super(DjangoMpttAdmin, self).get_urls()

        def add_url(regex, url_name, view):
            # Prepend url to list so it has preference before 'change' url
            urlpatterns.insert(
                0,
                url(
                    regex,
                    wrap(view),
                    name='%s_%s_%s' % (
                        self.model._meta.app_label,
                        self.model._meta.module_name,
                        url_name
                    )
                )
            )

        add_url(r'^(.+)/move/$', 'move', self.move_view)
        add_url(r'^tree_json/$', 'tree_json', self.tree_json_view)
        add_url(r'^grid/$', 'grid', self.grid_view)
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

        return util.JsonResponse(
            dict(success=True)
        )

    def get_change_list_for_tree(self, request):
        kwargs = dict(
            request=request,
            model=self.model,
            list_display=(),
            list_display_links=(),
            list_filter=(),
            date_hierarchy=None,
            search_fields=(),
            list_select_related=(),
            list_per_page=100,
            list_editable=(),
            model_admin=self,
            list_max_show_all=200,
        )

        return ChangeList(**kwargs)

    def get_changelist(self, request, **kwargs):
        if util.get_short_django_version() >= (1, 5):
            return super(DjangoMpttAdmin, self).get_changelist(request, **kwargs)
        else:
            return FixedChangeList

    def get_admin_url(self, name, args=None):
        opts = self.model._meta
        url_name = 'admin:%s_%s_%s' % (opts.app_label, opts.module_name, name)

        return reverse(
            url_name,
            args=args,
            current_app=self.admin_site.name
        )

    def get_tree_data(self, qs, max_level):
        pk_attname = self.model._meta.pk.attname

        def handle_create_node(instance, node_info):
            pk = quote(getattr(instance, pk_attname))

            node_info.update(
                url=self.get_admin_url('change', (quote(pk),)),
                move_url=self.get_admin_url('move', (quote(pk),))
            )

        return util.get_tree_from_queryset(qs, handle_create_node, max_level)

    def tree_json_view(self, request):
        node_id = request.GET.get('node')

        if node_id:
            node = self.model.objects.get(id=node_id)
            max_level = node.level + 1
        else:
            max_level = self.tree_load_on_demand

        qs = util.get_tree_queryset(
            model=self.model,
            node_id=node_id,
            selected_node_id=request.GET.get('selected_node'),
            max_level=max_level,
        )

        tree_data = self.get_tree_data(qs, max_level)
        return util.JsonResponse(tree_data)

    def grid_view(self, request):
        return super(DjangoMpttAdmin, self).changelist_view(
            request,
            dict(tree_url=self.get_admin_url('changelist'))
        )


class FixedChangeList(ChangeList):
    """
    Fix issue 1: the changelist must have a correct link to the edit page
    """
    def url_for_result(self, result):
        pk = getattr(result, self.pk_attname)

        return reverse(
            'admin:%s_%s_change' % (self.opts.app_label, self.opts.module_name),
            args=[quote(pk)],
            current_app=self.model_admin.admin_site.name
        )