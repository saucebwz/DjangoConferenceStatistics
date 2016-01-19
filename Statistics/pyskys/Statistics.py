
import sqlite3 as lite
from Statistics.pyskys.StatisticsException import StatisticsException
from collections import Counter
import re
from datetime import datetime, time
from Statistics.pyskys.Lexic import matfilter


def conn(func):
    def wrapper(self, *args, **kwargs):
        if self.connection:
            return func(self, *args, **kwargs)
        else:
            raise StatisticsException('Connection not found')
    return wrapper


class Statistics:
    def __init__(self):
        self.CONF_REMOTE_ID = 802
        self.MESSAGES_ROW_INDEX = 17
        self.MESSAGES_AUTHOR_INDEX = 4
        self.connection = None
        self.path = r'C:\Users\saucebwz\AppData\Roaming\Skype\rikisharu\main.db'
        self.messages = None
        self.unique_authors = None

    def connect(self, path=None):
        path = path if path else self.path
        try:
            self.connection = lite.connect(path)
        except lite.Error as error:
            print("error message: ", error)

    @conn
    def init_message_stack(self):
        cursor = self.connection.cursor()
        cursor.execute("SELECT * FROM 'Messages' WHERE convo_id=?", (self.CONF_REMOTE_ID, ))
        messages = cursor.fetchall()
        self.messages = messages
        self.unique_authors = list(set(message[self.MESSAGES_AUTHOR_INDEX] for message in messages))
        return messages

    @conn
    def get_top3_speakers(self, cls, messages=None):
        messages = messages if messages else self.messages
        top_counter = Counter()
        for author in self.unique_authors:
            message = [msg for msg in messages if msg[self.MESSAGES_AUTHOR_INDEX] == author]
            top_counter[author] += len(message)

        cls.write_result({'top': top_counter.most_common(), 'total': len(messages)})

    def _remove_tags(self, text):
        return re.sub('<[^<]+?>', '', text)

    def _get_message_text(self, message):
        if message[self.MESSAGES_ROW_INDEX] and message[self.MESSAGES_ROW_INDEX][0] is not None:
            return message[self.MESSAGES_ROW_INDEX]


    @conn
    def get_most_frequent_youtube_video(self, cls, messages=None):
        messages = messages if messages else self.messages
        videos_counter = Counter()
        for message in messages:
            from_block_text = self._get_message_text(message)
            if from_block_text is None:
                continue
            text = self._remove_tags(''.join(from_block_text))
            if len(text) < 15:
                continue
            match = re.search(r'(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\/?\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})', text)
            if match:
                link = match.group(1)
                videos_counter[link] += 1
        common_videos = videos_counter.most_common()
        cls.write_result({'common_videos': common_videos})


    def get_time_activity(self, cls, messages=None):
        messages = messages if messages else self.messages
        ACTIVITY_TIMES = {
            'EARLIER_MORNING': time(4, 0, 0),
            'MORNING': time(8, 0, 0),
            'NOON': time(12, 0, 0),
            'AFTERNOON': time(15, 0, 0),
            'EVENING': time(18, 0, 0),
            'NIGHT': time(23, 0, 0)
        }
        activity_counter = Counter()
        em, m, n, an, e, ni = 0, 0, 0, 0, 0, 0
        for message in messages:
            timestamp = message[-1]
            time_from_epoch = datetime.fromtimestamp(timestamp/1000)
            message_time = time(time_from_epoch.hour, time_from_epoch.minute, time_from_epoch.second)

            if ACTIVITY_TIMES['EARLIER_MORNING'] < message_time < ACTIVITY_TIMES['MORNING']:
                em += 1
            elif ACTIVITY_TIMES['MORNING'] < message_time < ACTIVITY_TIMES['NOON']:
                m += 1
            elif ACTIVITY_TIMES['NOON'] < message_time < ACTIVITY_TIMES['AFTERNOON']:
                n += 1
            elif ACTIVITY_TIMES['AFTERNOON'] < message_time < ACTIVITY_TIMES['EVENING']:
                an += 1
            elif ACTIVITY_TIMES['EVENING'] < message_time < ACTIVITY_TIMES['NIGHT']:
                e += 1
            else:
                ni += 1
        print("{0}, {1}, {2}".format(em, m, n))
        cls.write_result({'activity': [["Раннее утро", em], ["Утро", m], ["Полдень", n], ["После полудня", an], ["Вечер", e],
                          ["Ночь", ni]]})

    def get_use_word_count(self, word, messages=None):
        messages = messages if messages else self.messages
        counter = 0
        for message in messages:
            text_from_block = self._get_message_text(message)
            if text_from_block is None:
                continue
            text = self._remove_tags(''.join(text_from_block))
            if len(text) < len(word):
                continue
            reg_string = re.escape(word)
            match = re.search(reg_string, text, flags=re.IGNORECASE | re.UNICODE)
            if match:
                counter += 1

    def _filter_messages_by_author(self, author):
        return map(lambda x: x[self.MESSAGES_ROW_INDEX], list(filter(lambda message: (message[self.MESSAGES_AUTHOR_INDEX] == author), self.messages)))

    def get_abusive_expressions(self, cls, messages=None):
        abusive_counter = Counter()
        for author in self.unique_authors:
            messages_by_author = list(self._filter_messages_by_author(author))
            for msg in messages_by_author:
                abusive_counter[author] += matfilter(msg)
        cls.write_result({'abusive': abusive_counter.most_common()})




