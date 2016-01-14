from django.db import models


# Create your models here.


class StatisticsModel(models.Model):
    common_videos = models.TextField(null=True, blank=True)
    abusive = models.TextField(null=True, blank=True)
    top = models.TextField(null=True, blank=True)
    activity = models.TextField(null=True, blank=True)
    total = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now=True)
