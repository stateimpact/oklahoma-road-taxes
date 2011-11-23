var mm = com.modestmaps;

var map = window.map || {};
var CENTER = new mm.Location(40.302, -82.696);
var DEFAULT_MAP = 'issue2';

var baseurl = "http://api.tiles.mapbox.com/v2/";
var base_layers = ['npr.USA-blank-trans-z11',
        'npr.world-blank-bright-0-10'];
var layers = {
	'issue2': {
		slug: "npr.issue-2",
		title: "2011: Issue 2"
    },

	'election': {
		slug: "npr.ohio-election-2010---kasich-vs-strickland",
		title: "2010: Both Candidates"
    },

    'john-kasich': {
        slug: "npr.ohio-election-map---john-kasich",
        title: "2010: For John Kasich"
    },
    
	'ted-strickland': {
		slug: "npr.ohio-election-2010---ted-strickland",
		title: "2010: For Ted Strickland"
    }
};
var top_layer = ['mapbox.world-borders-dark'];

function getTiles(slug) {
    var data = layers[slug];
    if (!data) return;
    
    var tiles = _.union(base_layers, [data.slug], top_layer);
    return tiles.join(',');
}

function buildMapList() {
    var list = $('<ul/>').addClass('maps');
    for (slug in layers) {
        var a = $('<a/>').attr({
            id: slug,
            href: '#' + slug
        });
        a.text(layers[slug].title);
        var li = $('<li/>')
            .append(a)
            .appendTo(list);
    }
    return list;
}

function refreshMap(slug) {    
    var tiles = getTiles(slug);
    var url = baseurl + tiles + '.jsonp';

    wax.tilejson(url, function(tilejson) {
        window.tilejson = tilejson;
        tilejson.minzoom = 5;
        tilejson.maxzoom = 9;
        
        if (map.setProvider) {
            map.setProvider(new wax.mm.connector(tilejson));
        } else {
            map = new mm.Map('map', new wax.mm.connector(tilejson));
            map.setCenterZoom(CENTER, 7);
            wax.mm.zoomer(map).appendTo(map.parent);
            wax.mm.hash(map);
        }
        map.activeLayer = slug;
        
        if (window.legend) {
            $(window.legend.element()).remove();
        }
        window.legend = wax.mm.legend(map, tilejson).appendTo(map.parent);
        //window.fullscreen = wax.mm.fullscreen(map, tilejson).appendTo(map.parent);
        if (window.attribution) {
            $(window.attribution.element()).remove()
        }
        window.attribution = wax.mm.attribution(map, tilejson).appendTo(map.parent);
        

        if (window.interaction) {
            window.interaction.remove();
        }
        window.interaction = wax.mm.interaction(map, tilejson);
    });
    return map;
}


$(function() {
    // Open a modal window
    function openModal(element) {
      $('#overlay, ' + element).css('display', 'block');
    }
    
    $('a.embed').click(function(e) {
        e.preventDefault();
        var layers = getTiles(map.activeLayer);
        var center = map.pointLocation(new mm.Point(map.dimensions.x/2,map.dimensions.y/2));
        var embedUrl = 'http://api.tiles.mapbox.com/v2/' + layers + '/mm/tooltips,legend,bwdetect.html#' + map.coordinate.zoom + '/' + center.lat + '/' + center.lon;
        $('#embed-code-field input').attr('value', '<iframe src="' + embedUrl + '" frameborder="0" width="650" height="500"></iframe>');
        openModal('#modal-embed');
        $('#embed-code')[0].tabindex = 0;
        $('#embed-code')[0].focus();
        $('#embed-code')[0].select();
    });
    
    
    // Close modals
    $('.modal a.close').click(function (e){
        e.preventDefault();
        $('#overlay').hide();
        $(this).closest('.modal').hide();
    });
    
    $(document.documentElement).keydown(function (e) {
        if (event.keyCode == 27) {
            $('a.close').trigger('click');
        }
    });
});

$(function() {
    refreshMap(DEFAULT_MAP);
    var list = buildMapList();
    list.appendTo($('#map-container'));
    
    // set the initial map as active
    $('#' + DEFAULT_MAP).addClass('active');
    
    // layer switching
    list.find('a').click(function(e) {
        e.preventDefault();
        if ($(this).hasClass('active')) return;
        
        var slug = $(this).attr('id');
        if (slug in layers) {
            // clear active class from all list items
            // the right item will get a class added
            // in refreshMap
            $('ul.maps li a').removeClass('active');
            refreshMap(slug);
            $(this).addClass('active');
        }
    });
});

$(window).resize(function() {
    var p = new mm.Point($(window).width(), $(window).height())
    if (map.setSize) {
        map.setSize(p);
    }
});

$(function($) {
    $(document).mousemove(function(e) {
        $('.wax-tooltip').css({ 'display' : 'block' });
        if ( (e.pageX +  $('.wax-tooltip').width()) > $(window).width()){
            $('.wax-tooltip').css({
                'right' : $(window).width() - e.pageX,
                'left' : 'auto'
            });
        } else {
            $('.wax-tooltip').css({
                'left' : e.pageX,
                'right' : 'auto'
            });
        }
        if ( e.pageY + $('.wax-tooltip').height() > ($('#map').height() - 80)){
            $('.wax-tooltip').css({
                'bottom' : $('#map').height() - e.pageY + 10,
                'top' : 'auto' 
            });
        } else {
            $('.wax-tooltip').css({
                'top' : e.pageY + 20,
                'bottom' : 'auto'
            });
        }   
    });
    $('a,header,.wax-legends').mouseover(function(){
        $('.wax-tooltip').css('opacity','0 !important');
    }).mouseleave(function(){
        $('.wax-tooltip').css('opacity','1');
    })
});

