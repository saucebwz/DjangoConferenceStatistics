from django.conf.urls import include, url
from django.contrib import admin
from Statistics import views

urlpatterns = [
    url(r'^$', views.Home.as_view(), name="main"),
    url(r'^get-data/$', views.RequestStatisticView.as_view(), name="request")
]