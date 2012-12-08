/* GoogleAppsScriptの公開URL */
var URL = "https://script.google.com/macros/s/AKfycbwl15TMWmLfYqrohaTezWilvUxeq-brYRn1VswxcD6uTQC5xMgR/exec";

/* 日本アルプス */
var DEFAULT_LAT = 36.289167;
var DEFAULT_LNG = 137.648056;


var map;
var markersArray = [];


/* HTMLが読み込まれたら実行される関数を準備する */
$(function(){
    var latlng = new google.maps.LatLng(DEFAULT_LAT, DEFAULT_LNG);

    /* 倍率、中心位置、地図の種類(ROADMAP)をオプションとして用意する */
    var myOptions = {
        zoom : 9,
        center : latlng,
        mapTypeId : google.maps.MapTypeId.ROADMAP
    };


    /* 地図オブジェクトを <div id="map"> の中に作成する */
    map = new google.maps.Map(document.getElementById("map"), myOptions);


    /* 位置情報の一覧を取得する */
    refresh();
});



function refresh(){
    $.ajax({
        type : 'GET',
        url : URL,
        cache : false,
        crossDomain: true,
        dataType : 'jsonp',
        scriptCharset:'utf-8',
        success : function(json, status, xhr) {
            $.each(json, function(i, calendar){
                addMarker(calendar);
            });
        },
    });

}



function addMarker(calendar){
    /* マーカーを追加する */
    var myLatLng = new google.maps.LatLng(calendar.lat, calendar.lng);

    var marker = new google.maps.Marker({
        map: map,
        position: myLatLng,
        icon: "../img/shinanogold.png"
    });

    markersArray.push(marker);


    var div = $('<div class="event">'
        + '<div class="day">day</div>'
        + '<div class="title">title</div>'
        + '<div><a class="place" href="">place</a></div>'
        + '</div>'
        );

    $('div.day', div).text(calendar.Day);
    $('div.title', div).text(calendar.title);
    $('a.place', div).attr('href',
                          'javascript:setCenter(' + calendar.lat + ',' + calendar.lng + ');')
                    .text(calendar.place);
    $('#schedule').append(div);


    setCenter(calendar.lat, calendar.lng);
}


/* 地図の中心を移動する */
function setCenter(lat, lng){
    map.setCenter(new google.maps.LatLng(lat, lng));
}
