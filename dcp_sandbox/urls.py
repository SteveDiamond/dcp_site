from django.conf.urls import patterns, url

from dcp_sandbox import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^parse$', views.parse, name='parse'),
    url(r'^send_feedback$', views.send_feedback, name='send_feedback'),
    url(r'^test$', views.test, name='test'),
    url(r'^quiz$', views.quiz, name='quiz'),
    url(r'^new_expr$', views.new_expr, name='new_expr'),
)