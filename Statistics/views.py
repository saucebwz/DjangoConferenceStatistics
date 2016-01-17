from django.shortcuts import render

from django.views.generic import View
from Statistics.pyskys.Statistics import Statistics
from Statistics.pyskys.StatisticQueue import StatisticQueue
from django.http import JsonResponse
from Statistics.models import StatisticsModel
from django.http import Http404
import json
from django.core import serializers
json_serializer = serializers.get_serializer("json")()

class RequestStatisticView(View):
    def post(self, request):
        try:
            sm = StatisticsModel.objects.latest('created_at')
        except:
            return Http404("Nothing to represent!")
        data = {
            'common_videos': sm.common_videos,
            'activity': sm.activity,
            'abusive': sm.abusive,
            'top': sm.top,
            'total': sm.total
        }
        return JsonResponse(data)

class Home(View):
    template_name = "index.html"

    def get(self, request):
        return render(request, self.template_name, {'user': request.user})

    def post(self, request):
        if request.user.is_superuser:
            print("test")
            stats = Statistics()
            sq = StatisticQueue(stats)
            result = sq.start_parse()

            sm = StatisticsModel(common_videos=json.dumps(result['common_videos']), activity=json.dumps(result['activity']),
                                 top=json.dumps(result['top']), abusive=json.dumps(result['abusive']), total=json.dumps(result['total']))
            sm.save()
            return JsonResponse({"ok": "ok"})