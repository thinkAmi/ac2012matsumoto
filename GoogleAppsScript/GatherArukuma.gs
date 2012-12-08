var CALENDAR_ID = '<your calendar id>';

var DEFAULT_LAT = 36.289167;
var DEFAULT_LNG = 137.648056;


var EventList = function(title, day, place, lat, lng){
  this.title = title;
  this.place = place;
  this.day = day;
  this.lat = lat;
  this.lng = lng;
}


/**
 * メイン
 */
function main(){
  var contents = fetch();
  
  var tbody = analyzeDOM(contents);
  
  var events = createEvents(tbody);
  if (events.length == 0){
    return;
  }
  
  // (手抜きのため)既存のイベントをすべて消してから、全件追加する仕様
  var calendar = CalendarApp.getCalendarById(CALENDAR_ID);
  deleteEvents(calendar);
  
  addEvents(calendar, events);
}


/**
 * アルクマのスケジュールをfetchし、Webのhtmlを返す
 */
function fetch(){
  var response = UrlFetchApp.fetch("http://arukuma.jp/schedule/");
  var contents = response.getContentText();
  
  return contents;
}


/**
 * アルクマのスケジュールhtmlを解析し、スケジュールが記載されているtableのtbodyを返す
 */
function analyzeDOM(contents){
  var xml = Xml.parse(contents, true);
  var body = xml.getElement().getElements("body")[0];
  var page = body.getElements("div")[0];
  var content = page.getElements("div")[2];
  var alpha = content.getElements("div")[0];
  var calendar = alpha.getElements("div")[1];
  
  // ↓の添字を変えれば、月が変わっても対応可能かもしれない
  var schedule = calendar.getElements("div")[0];
  // ↑の添字を変えれば、月が変わっても対応可能かもしれない
  
  var table = schedule.getElements("table")[0];
  var tbody = table.getElements();
  
  return tbody;
}


/**
 * tbodyのデータをEventList型で返す
 * tbodyのうち、一つ目のtrはヘッダであることに注意
 */
function createEvents(tbody){
  var events = [];
  for (var i = 1; i < tbody.length; i++){
    var td = tbody[i].getElements("td");
    
    var day = getDay(td);
    var place = getPlace(td);
    var title = getTitle(td);
    
    var geo = getGeo(place);
    var lat = geo.lat;
    var lng = geo.lng;
    
    events.push(new EventList(title, day, place, lat, lng));
  }
  
  return events;
}


/**
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
 * タイトルの取得
 */
function getTitle(td){
  return getTextByIndex(td, 1);
}


/**
 * 場所の取得
 */
function getPlace(td){
  return getTextByIndex(td, 2);
}


/**
 * 日付の取得
 */
function getDay(td){
  var day = getTextByIndex(td, 0);

  var mm = day.match(/^[0-9][0-9]?/)[0];
  // TODO: ddに1を加算しないと、カレンダーでは一日前に表示されてしまう。タイムゾーンまわり？
  var dd = parseInt(day.match(/[0-9][0-9]?日/)[0].match(/[0-9][0-9]?/)[0]) + 1;
  
  return new Date(new Date().getFullYear(), mm - 1, dd);
}  


/**
 * td以下のtextデータの取得
 * tdの下にpタグがある場合とない場合があるので、それらに対応
 */
function getTextByIndex(td, index){
  var result = td[index].getText();
  
  // tdタグ + 半角スペース + pタグの場合もあることに注意
  if ((result) && result != " "){
    return result;
  }
  
  result = td[index].getElements("p")[0].getText();  
  return result;
}


/**
 * Googleカレンダーから、当月のイベントを全削除
 */
function deleteEvents(calendar){
  var now = new Date();
  var events = calendar.getEvents(getFirstDate(now), getLastDate(now));

  for (var i = 0; i < events.length; i++){
    var event = events[i];
    event.deleteEvent();
  }
}


/**
 * 月初日を取得
 */
function getFirstDate(date){
  return new Date(date.getFullYear(), date.getMonth(), 1);
}


/**
 * 月末日を取得
 */
function getLastDate(date){
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}


/**
 * Googleカレンダーにアルクマのイベントを追加する
 */
function addEvents(calendar, events){
  for (var i = 0; i < events.length; i++){
    var location = events[i].lat + "," + events[i].lng;
    
    var args = {description: events[i].place,
                location: location};
    
    calendar.createAllDayEvent(events[i].title, events[i].day, args);
  }
}