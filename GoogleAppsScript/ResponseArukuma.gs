var CALENDAR_ID = '<your calendar id>';


/**
 * GETを受け取るところ
 */
function doGet(e) {

  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  var json = JSON.stringify(createJSONFromCalendar());
  
  // jQueryに返すため、受け取ったパラメータにある「callback」の値を先頭につけておく
  var jsonp = e.parameters.callback + "(" + json + ")";
  output.setContent(jsonp);

  return output;
}


/**
 * Googleカレンダーよりデータを取得し、JSON形式でデータを戻す
 */
function createJSONFromCalendar(){
  var calendar = CalendarApp.getCalendarById(CALENDAR_ID);
  var now = new Date();
  var events = calendar.getEvents(getFirstDate(now), getLastDate(now));
  
  var results = {};
  for (var i = 0; i < events.length; i++){
    var event = events[i];
    
    var title = event.getTitle();
    var place = event.getDescription();
    var geo = event.getLocation();
    var lat = geo.split(",")[0];
    var lng = geo.split(",")[1];
    
    var startTime = event.getStartTime();
    var day = startTime.getFullYear() + "/" + paddingZero(startTime.getMonth() + 1) + "/" + paddingZero(startTime.getDate());
    
    var json = {
        "title": title,
        "place": place,
        "Day": day,
        "lat": lat,
        "lng": lng
    };
    
    results[i] = json;
  }
  
  return results;
}


/**
 * 先頭ゼロ詰め
 */
function paddingZero(value){
  if (value < 10){
    return '0' + value;
  }
  
  return value;
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