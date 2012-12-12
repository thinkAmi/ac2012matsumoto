var InstanceName = <your CloudSQL instance name>;

/* 日本アルプス */
var DEFAULT_LAT = 36.289167;
var DEFAULT_LNG = 137.648056;


var EventList = function(title, place, day){
  this.title = title;
  this.place = place;
  this.day = day;
}


/**
 * メイン：ブラウザからのGETを待つところ
 */
function doGet(){
  var output = HtmlService.createTemplateFromFile("index");
  return output.evaluate();
}


/**
 * Google StaticMapを作成し、Urlを取得する
 */
function getMap(){
  // staticMapの設定
  var map = Maps.newStaticMap();
  // サイズは600x600強が限界
  map.setSize(700, 700);
  map.setZoom(8);
  map.setCenter(DEFAULT_LAT, DEFAULT_LNG);
  map.setLanguage('ja');
  map.setMapType(Maps.StaticMap.Type.ROADMAP);
  map.setFormat(Maps.StaticMap.Format.PNG);

  // マーカーの画像セット
  map.setCustomMarkerStyle("http://arukumap.appspot.com/img/shinanogold.png", false);


  // 地図上にマーカーを追加
  var events = getEvents();
  for (var i = 0; i < events.length; i++){

    var geo = getGeo(events[i].place);
    var lat = geo.lat;
    var lng = geo.lng;

    map.addMarker(lat, lng);
  }

  return map.getMapUrl();

}



/**
* 【GatherArukuma】より流用 : ライブラリ化でも良いが、今回はコード提示のためコピペ
 * 場所の名称をもとに、Mapsクラスにて緯度・経度を取得する
 * 正しい緯度・軽度が取得できない場合は、デフォルトの緯度・経度を取得する(手抜き)
 */
function getGeo(place){
  if (place == " "){
    return {lat:DEFAULT_LAT, lng:DEFAULT_LNG};
  }

  var latlng = Maps.newGeocoder().geocode(place);
  if (latlng.status == "ZERO_RESULTS"){
    return {lat:DEFAULT_LAT, lng:DEFAULT_LNG};
  }
  return {lat: latlng.results[0].geometry.location.lat,
          lng: latlng.results[0].geometry.location.lng}
}



/**
 * Google CloudSQL より、アルクマの登場するイベントを取得する
 */
function getEvents() {

  var connectionString = "jdbc:google:rdbms://" + InstanceName + "/arukuma";
  var conn = Jdbc.getCloudSqlConnection(connectionString);
  var stmt = conn.createStatement();

  var rs = stmt.executeQuery("select * from schedule");

  var events = [];
  while(rs.next()){
    events.push(new EventList(rs.getString(1),
                              rs.getString(2),
                              rs.getObject(3)
                             ));
  }

  return events;
}