from django.conf.urls import patterns, url

from dcp_sandbox import views

urlpatterns = patterns('',
    url(r'^$', views.intro, name='intro'),
    url(r'^analyzer$', views.analyzer, name='analyzer'),
    url(r'^parse$', views.parse, name='parse'),
    url(r'^send_feedback$', views.send_feedback, name='send_feedback'),
    url(r'^test$', views.test, name='test'),
    url(r'^quiz$', views.quiz, name='quiz'),
    url(r'^new_expr$', views.new_expr, name='new_expr'),
    url(r'^intro$', views.intro, name='intro'),
    url(r'^rules$', views.rules, name='rules'),
    url(r'^about$', views.about, name='about'),
    url(r'^functions$', views.functions, name='functions'),
)