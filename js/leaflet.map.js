var map;
var url = "http://api.tiles.mapbox.com/v2/npr.vacation-homes.jsonp";

wax.tilejson(url, function(tilejson) {
    map = new L.Map('map')
        .addLayer(new wax.leaf.connector(tilejson))
        .setView(new L.LatLng(38.994, -94.658), 1);
    
    wax.leaf.interaction(map, tilejson);
});

function setMapSize() {
    $('#map').css({
        height: $(window).height(),
        width: $(window).width()
    })
}

$(setMapSize);
$(window).resize(setMapSize);