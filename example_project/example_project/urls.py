try:
    from django.conf.urls import patterns, include, url
except:
    # Django 1.3
    from django.conf.urls.defaults import patterns, include, url

from django.contrib import admin


admin.autodiscover()

urlpatterns = patterns('',
    url(r'^', include(admin.site.urls)),
)
