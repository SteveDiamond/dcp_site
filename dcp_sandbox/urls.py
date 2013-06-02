from django.conf.urls import patterns, url

from dcp_sandbox import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^parse$', views.parse, name='parse'),
    url(r'^solveLP$', views.solveLP, name='solveLP'),
)