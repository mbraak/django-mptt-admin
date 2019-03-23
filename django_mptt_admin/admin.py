from functools import update_wrapper

from django.conf import settings
from django.templatetags.static import static
from django.contrib.admin.templatetags.admin_urls import add_preserved_filters
from django.core.exceptions import PermissionDenied, SuspiciousOperation
from django.http import JsonResponse
from django.template.response import TemplateResponse
from django.contrib.admin.options import csrf_protect_m
from django.contrib.admin.views.main import ChangeList, IGNORED_PARAMS
from django.conf.urls import url
from django.contrib.admin.utils import unquote, quote
from django.contrib.admin.options import IS_POPUP_VAR
from django.db import transaction
from django.utils.http import urlencode
from django.forms import Media
from django.urls import reverse
from django.views.i18n import JavaScriptCatalog
import django

from mptt.admin import MPTTModelAdmin

from . import util


class TreeChangeList(ChangeList):
    TREE_IGNORED_PARAMS = IGNORED_PARAMS + ('_', 'node', 'selected_node')

    def __init__(self, request, model, model_admin, list_filter, node_id, max_level):
        self.node_id = node_id
        self.max_level = max_level

        params = dict(
            request=request,
            model=model,
            list_filter=list_filter,
            model_admin=model_admin,
            list_display=(),
            list_display_links=(),
            date_hierarchy=None,
            search_fields=(),
            list_select_related=(),
            list_per_page=100,
            list_editable=(),
            list_max_show_all=200,
        )

        if django.VERSION[0:2] >= (2, 1):
            params['sortable_by'] = []

        super(TreeChangeList, self).__init__(**params)

    def get_filters_params(self, params=None):
        if not params:
            params = self.params

        lookup_params = params.copy()

        for ignored in self.TREE_IGNORED_PARAMS:
            if ignored in lookup_params:
                del lookup_params[ignored]

        return lookup_params

    def get_queryset(self, request):
        self.filter_specs, self.has_filters, remaining_lookup_params, filters_use_distinct = self.get_filters(request)

        qs = util.get_tree_queryset(
            model=self.model,
            node_id=self.node_id,
            max_level=self.max_level,
        )

        for filter_spec in self.filter_specs:
            new_qs = filter_spec.queryset(request, qs)
            if new_qs is not None:
                qs = new_qs

        return qs


class DjangoMpttAdminMixin(object):
    tree_auto_open = 1
    tree_load_on_demand = 1
    trigger_save_after_move = False

    # Autoescape the tree data; default is True
    autoescape = True

    # useContextMenu option for the tree; default is False
    use_context_menu = False

    change_list_template = 'django_mptt_admin/grid_view.html'
    change_tree_template = 'django_mptt_admin/change_list.html'

    # define which field of the model should be the label for tree items
    item_label_field_name = None

    # list and tree filter
    list_filter = ()

    change_list_tree_class = TreeChangeList

    @csrf_protect_m
    def changelist_view(self, request, extra_context=None):
        request.current_app = self.admin_site.name
        is_popup = IS_POPUP_VAR in request.GET
        if is_popup:
            return super(DjangoMpttAdminMixin, self).changelist_view(request, extra_context=extra_context)

        if not self.has_change_permission(request, None):
            raise PermissionDenied()

        change_list = self.get_change_list_for_tree(request)

        preserved_filters = self.get_preserved_filters(request)

        def get_admin_url_with_filters(name):
            admin_url = self.get_admin_url(name)

            if change_list.params:
                return admin_url + change_list.get_query_string()
            else:
                return admin_url

        def get_admin_url_with_preserved_filters(name):
            return add_preserved_filters(
                {'preserved_filters': preserved_filters, 'opts': self.model._meta},
                self.get_admin_url(name)
            )

        def get_csrf_cookie_name():
            if settings.CSRF_USE_SESSIONS:
                return ''
            else:
                return settings.CSRF_COOKIE_NAME

        grid_url = get_admin_url_with_filters('grid')
        tree_json_url = get_admin_url_with_filters('tree_json')
        insert_at_url = get_admin_url_with_preserved_filters('add')

        context = dict(
            title=change_list.title,
            app_label=self.model._meta.app_label,
            model_name=util.get_model_name(self.model),
            cl=change_list,
            media=self.get_tree_media(),
            has_add_permission=self.has_add_permission(request),
            opts=change_list.opts,
            tree_auto_open=util.get_javascript_value(self.tree_auto_open),
            tree_json_url=tree_json_url,
            insert_at_url=insert_at_url,
            grid_url=grid_url,
            autoescape=util.get_javascript_value(self.autoescape),
            use_context_menu=util.get_javascript_value(self.use_context_menu),
            jsi18n_url=self.get_admin_url('jsi18n'),
            preserved_filters=preserved_filters,
            csrf_cookie_name=get_csrf_cookie_name()
        )
        if extra_context:
            context.update(extra_context)

        context.update(self.admin_site.each_context(request))

        return TemplateResponse(
            request,
            self.change_tree_template,
            context
        )

    def get_urls(self):
        def wrap(view, cacheable=False):
            def wrapper(*args, **kwargs):
                return self.admin_site.admin_view(view, cacheable)(*args, **kwargs)

            return update_wrapper(wrapper, view)

        def create_url(regex, url_name, view, kwargs=None, cacheable=False):
            return url(
                regex,
                wrap(view, cacheable),
                kwargs=kwargs,
                name='{0!s}_{1!s}_{2!s}'.format(
                    self.model._meta.app_label,
                    util.get_model_name(self.model),
                    url_name
                )
            )

        def create_js_catalog_url():
            packages = ['django_mptt_admin']
            url_pattern = r'^jsi18n/$'

            return create_url(url_pattern, 'jsi18n', JavaScriptCatalog.as_view(packages=packages), cacheable=True)

        # prepend new urls to existing urls
        return [
           create_url(r'^(.+)/move/$', 'move', self.move_view),
           create_url(r'^tree_json/$', 'tree_json', self.tree_json_view),
           create_url(r'^grid/$', 'grid', self.grid_view),
           create_js_catalog_url()
       ] + super(DjangoMpttAdminMixin, self).get_urls()

    def get_tree_media(self):
        admin_media = super(DjangoMpttAdminMixin, self).media

        js = [
            "admin/js/jquery.init.js",
            static('django_mptt_admin/jquery_namespace.js'),
            static('django_mptt_admin/django_mptt_admin.js'),
        ]
        css = dict(
            all=(
                static('django_mptt_admin/django_mptt_admin.css'),
            )
        )

        tree_media = Media(js=js, css=css)

        return admin_media + tree_media

    @csrf_protect_m
    @transaction.atomic()
    def move_view(self, request, object_id):
        request.current_app = self.admin_site.name
        instance = self.get_object(request, unquote(object_id))

        if not self.has_change_permission(request, instance):
            raise PermissionDenied()

        if request.method != 'POST':
            raise SuspiciousOperation()

        target_id = request.POST['target_id']
        position = request.POST['position']
        target_instance = self.get_object(request, target_id)

        self.do_move(instance, position, target_instance)

        return JsonResponse(
            dict(success=True)
        )

    def do_move(self, instance, position, target_instance):
        if position == 'before':
            instance.move_to(target_instance, 'left')
        elif position == 'after':
            instance.move_to(target_instance, 'right')
        elif position == 'inside':
            instance.move_to(target_instance)
        else:
            raise Exception('Unknown position')

        if self.trigger_save_after_move:
            instance.save()

    def get_change_list_for_tree(self, request, node_id=None, max_level=None):
        request.current_app = self.admin_site.name

        return self.change_list_tree_class(
            request=request,
            model=self.model,
            model_admin=self,
            list_filter=self.get_list_filter(request),
            node_id=node_id,
            max_level=max_level
        )

    def get_admin_url(self, name, args=None):
        opts = self.model._meta
        url_name = 'admin:{0!s}_{1!s}_{2!s}'.format(opts.app_label, util.get_model_name(self.model), name)

        return reverse(
            url_name,
            args=args,
            current_app=self.admin_site.name
        )

    def get_tree_data(self, qs, max_level, filters_params):
        pk_attname = self.model._meta.pk.attname

        preserved_filters = urlencode({'_changelist_filters': urlencode(filters_params)})

        def add_preserved_filters_to_url(url):
            return add_preserved_filters(
                {'preserved_filters': preserved_filters, 'opts': self.model._meta},
                url
            )

        def handle_create_node(instance, node_info):
            pk = quote(getattr(instance, pk_attname))

            node_url = add_preserved_filters_to_url(
                self.get_admin_url('change', (quote(pk),))
            )

            node_info.update(
                url=node_url,
                move_url=self.get_admin_url('move', (quote(pk),))
            )

        return util.get_tree_from_queryset(qs, handle_create_node, max_level, self.item_label_field_name)

    def tree_json_view(self, request):
        request.current_app = self.admin_site.name
        node_id = request.GET.get('node')

        def get_max_level():
            if node_id:
                node = self.model.objects.get(pk=node_id)
                return node.level + 1
            else:
                return self.tree_load_on_demand

        max_level = get_max_level()

        change_list = self.get_change_list_for_tree(request, node_id, max_level)

        qs = change_list.get_queryset(request)
        qs = self.filter_tree_queryset(qs, request)

        tree_data = self.get_tree_data(qs, max_level, change_list.get_filters_params())

        # Set safe to False because the data is a list instead of a dict
        return JsonResponse(tree_data, safe=False)

    def grid_view(self, request, extra_context=None):
        request.current_app = self.admin_site.name

        preserved_filters = self.get_preserved_filters(request)

        tree_url = add_preserved_filters(
            {'preserved_filters': preserved_filters, 'opts': self.model._meta},
            self.get_admin_url('changelist')
        )

        context = dict(tree_url=tree_url)

        if extra_context:
            context.update(extra_context)
        return super(DjangoMpttAdminMixin, self).changelist_view(request, context)

    def get_preserved_filters(self, request):
        """
        Override `get_preserved_filters` to make sure that it returns the current filters for the grid view.
        """
        def must_return_current_filters():
            match = request.resolver_match

            if not self.preserve_filters or not match:
                return False
            else:
                opts = self.model._meta
                current_url = '{0!s}:{1!s}'.format(match.app_name, match.url_name)
                grid_url = 'admin:{0!s}_{1!s}_grid'.format(opts.app_label, opts.model_name)

                return current_url == grid_url

        if must_return_current_filters():
            # for the grid view return the current filters
            preserved_filters = request.GET.urlencode()
            return urlencode({'_changelist_filters': preserved_filters})
        else:
            return super(DjangoMpttAdminMixin, self).get_preserved_filters(request)

    def filter_tree_queryset(self, queryset, request):
        """
        Override 'filter_tree_queryset' to filter the queryset for the tree.
        """
        return queryset

    def get_changeform_initial_data(self, request):
        initial_data = super(DjangoMpttAdminMixin, self).get_changeform_initial_data(request=request)

        if 'insert_at' in request.GET:
            initial_data[self.get_insert_at_field()] = request.GET.get('insert_at')

        return initial_data

    def get_insert_at_field(self):
        return 'parent'


class DjangoMpttAdmin(DjangoMpttAdminMixin, MPTTModelAdmin):
    pass


class FilterableDjangoMpttAdmin(DjangoMpttAdmin):
    pass
