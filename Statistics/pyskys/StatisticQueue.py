from threading import Thread, Semaphore
from queue import Queue
from Statistics.pyskys import Statistics

_sentinel = object()

class StatisticQueue:
    def __init__(self, stats):
        self._semaphore = Semaphore()
        self.result = {}
        self.stats = stats

    def write_result(self, data):
        self._semaphore.acquire()
        self.result.update(data)
        self._semaphore.release()

    def start_parse(self):
        self.stats.connect()
        self.stats.init_message_stack()
        func_to_start = [
            self.stats.get_top3_speakers,
            self.stats.get_most_frequent_youtube_video,
            self.stats.get_time_activity,
            self.stats.get_abusive_expressions,
        ]
        threads = []
        for func in func_to_start:
            thread = Thread(target=func, args=(self, ))
            threads.append(thread)
            thread.start()
        for t in threads:
            t.join()
        return self.result