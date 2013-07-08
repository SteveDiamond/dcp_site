from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    url(r'^', include('dcp_sandbox.urls')),
    url(r'^dcp_sandbox/', include('dcp_sandbox.urls')),
    # Examples:
    # url(r'^$', 'dcp_site.views.home', name='home'),
    # url(r'^dcp_site/', include('dcp_site.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
