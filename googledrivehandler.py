# -*- coding: utf-8 -*-

import webapp2
import os
import logging
import urllib
import yaml
from apiclient.http import MediaInMemoryUpload
from apiclient.discovery import build
from oauth2client.appengine import OAuth2Decorator


# 二つ以上Scopeがあるため、リストで指定しておく
OAUTH_SCOPE = ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/calendar']
HTML_FILE_NAME = 'index.html'
ICON_FILE = './img/shinanogold.png'



apiKeys = yaml.safe_load(open('api.yaml').read().decode('utf-8'))

decorator = OAuth2Decorator(
        client_id=apiKeys['client_id'],
        client_secret=apiKeys['client_secret'],
        scope=OAUTH_SCOPE,
        )

class ArukumaHTML(object):
    def __init__(self, events):
        self.events = events

    def create_html(self):
        html = []
        html.append('<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">')
        html.append('<html>')
        html.append('<head>')
        html.append('<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">')
        html.append('<meta name="viewport" content="width=device-width">')
        html.append('<link href="./css/map.css" rel="stylesheet" type="text/css" />')
        html.append('<title>アルクマップ - GoogleDrive版</title>')
        html.append('</head>')
        html.append('<body>')
        html.append('<div id="info">')
        html.append('<h2>アルクマの予定</h2>')
        html.append('<div id="schedule">')
        html.append(self._create_event_column())
        html.append('</div>')
        html.append('</div>')
        html.append('<div id="map"><img src=\"' + self._create_map_url() + '\" alt="map">')
        html.append('</div>')
        html.append('</body>')
        html.append('</html>')

        # 見やすくするための改行：なくても良い
        return '\n'.join(html)


    def _create_event_column(self):
        html = []
        html.append('<div class="event">')

        for event in self.events:
            # エンコード方法を合わせるため、カレンダーから取得した各列をutf-8指定しておく
            html.append('<div class="day">' + event.day.encode('utf-8') + '</div>')
            html.append('<div class="title">' + event.title.encode('utf-8') + '</div>')
            html.append('<div>' + event.place.encode('utf-8') + '</div>')

        html.append('</div>')

        return '\n'.join(html)


    def _create_map_url(self):
        url = []
        url.append('http://maps.google.com/maps/api/staticmap?')
        url.append('zoom=8')
        url.append('&size=800x800')
        url.append('&markers=icon:' + ICON_FILE)
        url.append('|shadow:false|')

        for event in self.events:
            # 場所名だとエンコードした後のURLが長くなりすぎてエラーとなるため、緯度経度でパラメータを指定しておく
            url.append(urllib.quote_plus(event.location))
            url.append('|')

        url.append('&sensor=false')

        return ''.join(url)


class Event(object):
  def __init__(self, day, title, place, location):
    self.day = day
    self.title = title
    self.place = place
    self.location = location


class GoogleDriveHandler(webapp2.RequestHandler):
    @decorator.oauth_required
    def get(self):
        # Googleカレンダーから抽出
        events = self.create_events_from_calendar()

        # Googleドライブへファイルを作成
        self.create_google_dirve_file(events)


    def create_events_from_calendar(self):
        calendarService = build('calendar', 'v3')
        request = calendarService.events().list(
            calendarId = apiKeys['calendar_id'],
            orderBy = 'startTime',
            singleEvents = True
            )
        response = request.execute(http=decorator.http())

        events = []
        for item in response['items']:
            event = Event(
                        item['start']['date'],
                        item['summary'],
                        item['description'],
                        item['location'])
            events.append(event)

        return events



    def create_google_dirve_file(self, events):
        drive_service = build('drive', 'v2', http=decorator.http())

        # ファイルデータの作成
        arukuma = ArukumaHTML(events)
        media_body = MediaInMemoryUpload(arukuma.create_html(), mimetype='text/plain', resumable=True)
        body = {
          'title': HTML_FILE_NAME,
          'description': 'Arukuma HTML',
          'mimeType': 'text/html',
          'fileExtension': 'html',
          'parents': [
           {
            "id": apiKeys['folder_id'],
           }
          ],
        }

        # 同一名のファイルがなければInsert、あればUpdate
        query = 'title = "index.html" and trashed = False'
        response = drive_service.files().list(q=query).execute()
        items = response['items']
        if len(items) == 0:
            drive_service.files().insert(body=body, media_body=media_body).execute()
        else:
            # 一件だけのはず
            fileId = items[0]['id']
            instance = drive_service.files().update(fileId=fileId, body=body, media_body=media_body).execute()




debug = os.environ.get('SERVER_SOFTWARE', '').startswith('Dev')
app = webapp2.WSGIApplication([
                               ('/cron/googledrive', GoogleDriveHandler),
                               (decorator.callback_path, decorator.callback_handler()),
                              ],
                              debug=debug)