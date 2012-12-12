ac2012matsumoto
========
[Advent Calendar in 信州松本（だけじゃなくてもいいよ）](http://atnd.org/event/E0010864) で作成したWebアプリのソースコードです。

* アルクマップ - 今月アルクマはどこにいるかな
* アルクマップ - GAS版

開発環境
----------

* OS: Windows7 x64
* SDK: Google App Engine SDK for Python 1.7.3
* Python: Python2.7
* Google Apps Script


セットアップ
----------

開発環境がWindowsしかないため、手順はWindowsでのみ確認しています。
`git clone` などで自分の端末へとソースコードをダウンロードした後、以下の作業を行います。

### GoogleAppEngine側

1.  app.yaml中のapplicationの「＜your application id＞」を自分が作成するApplicationIDへと変更します。
2.  Launcherにて、File > Add Existing Application よりリポジトリを指定します。

### GoogleAppsScript側
gsファイルをGoogleドライブへアップロードしても認識されないため、以下の方法で作業を行います。
担当した日付ごとに使用するGoogleApps用ファイルが異なります。

####9日目用のGoogleAppsScript側の作り方
該当ファイルは、以下の2つです。

* GatherArukuma.gs
* ResponseArukuma.gs

なお、ひとつのgsファイルを1プロジェクトとして作成しました。
（他に良い方法があれば、教えてください）

1.  Googleドライブを開き、作成 > スクリプト より、新規スクリプトファイルを作成します。
2.  GoogleAppsScriptディレクトリのgsファイルのうち、ひとつ選んでコピペします。
3.  すべてのgsファイルをコピペするまで、1～2を繰り返します。
4.  コピペしたgsファイルのうち、「＜your calendar id＞」を自分のアルクマ用GoogleカレンダーのIDへと変更します。
5.  コピペしたgsファイルのうち、doGet()メソッドを持つものをバージョン管理した後、Webアプリとして公開します。


####13日目用のGoogleAppsScript側の作り方
該当するのは、gsファイルとhtmlファイル、それぞれ１つずつとなります。

* RenderArukuma.gs
* index.html

これらをGoogleAppsScriptで同一のプロジェクトとしてコピペします。
手順は9日目と同じですが、1.は「作成 > HTML」という手順となります。




クレジット
----------
### 中垣 健志 著「作ればわかる！Google App Engine for Javaプログラミング」(翔泳社 978-4-7981-2302-8) ###
HTMLやjQuery、CSSファイルは「作ればわかる！ Google App Engine for Java プログラミング」本の第6章のものより派生しています。そのため、Apache License 2.0に記載の条件に従って使用しています。
(http://www.apache.org/licenses/LICENSE-2.0)


ライセンス
----------
Apache License 2.0に従って配布します。


     Copyright (C) 2012 thinkAmi

     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at

          http://www.apache.org/licenses/LICENSE-2.0

     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.


謝辞
----------
ネタを考える機会となった、「Advent Calendar in 信州松本（だけじゃなくてもいいよ）」を主催してくださった4_1さんや他の参加者の皆様、ありがとうございました。
