# -*- coding: utf-8 -*-

import webapp2
import os
import datetime
import logging
import re
import yaml

from google.appengine.api import rdbms
from google.appengine.api import urlfetch

from lxml import html


def _get_api_key():
    return yaml.safe_load(open('api.yaml').read().decode('utf-8'))


# Google Geocoding API は、GoogleMapと合わせて使うときのみ利用可能な規約のため、
# GAE側でデータ収集する段階では、場所名称だけの取得としておく
# See: https://developers.google.com/maps/documentation/geocoding/?hl=ja
class Schedule(object):
  def __init__(self, day, title, place):
    self.day = day
    self.title = title
    self.place = place


class GatherHandler(webapp2.RequestHandler):
    def get(self):

        # アルクマスケジュールを解析
        response = urlfetch.fetch('http://arukuma.jp/schedule/')
        schedules = self.separate_contents(response.content)

        # DB更新
        # 更新対象データがない場合は、解析が失敗したとみなして、今までのスケジュールのままにしておく
        if len(schedules) == 0:
            return

        self._update(schedules)



    def _update(self, schedules):

        # (手抜きのため) 全削除後に登録する
        keys = _get_api_key()
        cn = rdbms.connect(instance=keys['instance'], database='arukuma')

        # 文字コードを指定してあげないと、開発環境では文字化けする
        # See: http://www.dasprids.de/blog/2007/12/17/python-mysqldb-and-utf-8
        # 開発環境のみ必要な設定(本番環境はutf-8化されているのか、大丈夫っぽい)
        if debug:
            cn.set_character_set('utf8')

        cursor = cn.cursor()
        self._delete(cn, cursor)
        self._insert(cn, cursor, schedules)

        cn.commit()
        cn.close()


    def _delete(self, cn, cursor):
        sql = 'DELETE FROM schedule'
        cursor.execute(sql)


    def _insert(self, cn, cursor, schedules):
        sql = 'INSERT INTO schedule (day, title, place) VALUES (%s, %s, %s)'
        for s in schedules:
            cursor.execute(sql, (s.day, s.title, s.place))



    def separate_contents(self, content):
        root = html.fromstring(content)
        trlist = root.xpath('//div[@class="schedule sep"]/table/tr')

        schedules = []

        # 一つ目はタイトルであるため、処理対象外
        for i, tr in enumerate(trlist):
            if i != 0:
                schedule = Schedule(self._get_day(tr[0].text_content()),
                                    unicode(tr[1].text_content()),
                                    unicode(tr[2].text_content())
                                    )
                schedules.append(schedule)

        return schedules



    def _get_day(self, day):
        date = day.lstrip()
        match = re.match(r'[0-9]+.[0-9]+', date)
        mmdd = match.group()

        splited = mmdd.split(u'月')

        yyyy = self._get_jst_year()
        return datetime.date(yyyy, int(splited[0]), int(splited[1]))


    def _get_jst_year(self):
        jstnow = datetime.datetime.utcnow() + datetime.timedelta(hours=9)
        return jstnow.year








debug = os.environ.get('SERVER_SOFTWARE', '').startswith('Dev')
app = webapp2.WSGIApplication([
                               ('/cron/gather', GatherHandler),
                              ],
                              debug=debug)