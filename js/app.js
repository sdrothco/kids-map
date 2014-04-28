// Set up an associative array of all the searchable place categories.
var place_categories = {
	//playgrounds: { name: 'Playgrounds',	search_type: 'name',	value: 'playground' },
	parks: { name: 'Parks',		search_type: 'type',	value: 'park' },
	//pools: { name: 'Public pools',	search_type: 'keyword',	value: '\"public swimming pool\"' },
	libraries: { name: 'Libraries',	search_type: 'type',	value: 'library' },
	zoos: { name: 'Zoos',			search_type: 'type',	value: 'zoo' },
	museums: { name: 'Museums',		search_type: 'type',	value: 'museum' },
	aquariums: { name: 'Aquariums',	search_type: 'type',	value: 'aquarium' },
	//golf: { name: 'Mini golf',	search_type: 'keyword',	value: '\"miniature golf course\"' },
	bowling: { name: 'Bowling',		search_type: 'type',	value: 'bowling_alley' },
	movies: { name: 'Movie theaters',		search_type: 'type',	value: 'movie_theater' },
	//ice_skate: { name: 'Ice skating rinks',	search_type: 'keyword',	value: '\"ice skating rink\"' },
	//roller_skate: { name: 'Roller skating rinks',	search_type: 'keyword', value: '\"roller skating rink\"' },
	amusement: { name: 'Amusement parks & centers', search_type: 'type', value: 'amusement_park' },
};


$(document).ready(function(){
	var box = null;
	var myMap = new Map();

	google.maps.event.addDomListener(window, 'load', myMap);


	// Add the place category checkboxes to the form.
	for ( var key in place_categories ) {
		// console.log(key);
		box = $('.hidden .chkbox-example').clone();
		box.find('.box-label').text( place_categories[key].name );
		box.find('input').attr('value', key )
			.parent().appendTo('.category-boxes');
	}

	// When the "All" checkbox is selected, select all the other checkboxes,
	// and vice versa.
	$('#all-chkbox').click( function() {
		if( this.checked ) {
			$('.chkbox-example input').prop('checked', true);
		} else {
			$('.chkbox-example input').prop('checked', false);
		}
	});

	// Roll up or roll down the categories boxes when the user clicks the toggle arrow.
	$('.category-label').on('click', function(e) {
		e.preventDefault();

		$('.category-boxes').toggle();
		if( $('.category-boxes').is(':visible') ) {
			$('.arrow-down').css('display', 'inline-block');
			$('.arrow-right').css('display', 'none');
		} else {
			$('.arrow-down').css('display', 'none');
			$('.arrow-right').css('display', 'inline-block');
		}
		
	});

	// User clicked a search result from the list of headers next to the map.
	$('.result-list').on('click', 'li', function() {
		myMap.triggerMapMarker( $(this).data('markeridx') );
	});

	// The user submitted a search
	$( "#search-form" ).submit(function( e ) {
		e.preventDefault();
		console.log( "Handler for .submit() called." );
		console.log( $( this ).serialize() );

		var search_cats = [];
		var search_loc = $('input#search').val();
		//console.log( search_loc );
		$('.category-boxes .search-cats:checked').each( function() {
			console.log($(this).attr('value'));
			search_cats.push($(this).attr('value'));
		});

		// Clear all results & markers between searches
		$('.result-list ol').empty();
		myMap.clearMarkers();

		var searchKeys = processCategories(search_cats);
		console.log(searchKeys);
		

		myMap.doMapSearch( search_loc, searchKeys );
	});

	$('#all-chkbox').click();
	
});


function processCategories( searchCategories ) {
	console.log( "In processCategories, searchCats = ", searchCategories);
	// console.log( searchCategories );

	var keywordCategories = "";
	var typeCategories = [];
	for (var i=0; i<searchCategories.length; i++) {
		if ( place_categories[ searchCategories[i] ].search_type === 'type' ) {

			typeCategories.push( place_categories[ searchCategories[i] ].value );

		} else if ( place_categories[ searchCategories[i] ].search_type === 'keyword' ) {
			// concatenate the keywords into a pipe deliminated string.
			if ( keywordCategories.length ) keywordCategories += '|';
			keywordCategories += place_categories[ searchCategories[i] ].value;
		}
	}

	return { types: typeCategories, keywords: keywordCategories };
}



function Map() {
	//console.log("In Map()");

	// Keep a pointer to itself because "this" gets confused with jQuery callbacks
	var self = this;
	
	// default to central US and zoom out to see whole US.
	this.centralLocation = new google.maps.LatLng(37.090240, -95.712891);
	self.searchLocMarker = null; // the marker that marks the location we searched near.
	this.mapZoom = 4;
	this.mapMarkers = [];
	this.searchResultPlaces = [];
	
	this.infowindow = new google.maps.InfoWindow();
	this.bounds = new google.maps.LatLngBounds();

	var mapOptions = {
		zoom: this.mapZoom,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		center: this.centralLocation
	};
	this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
	this.mapService = new google.maps.places.PlacesService(this.map);

	this.directionsService = new google.maps.DirectionsService();
	this.directionsDisplay = new google.maps.DirectionsRenderer();
	this.directionsDisplay.setMap(this.map);

	// When the user clicks a list item, trigger the event that fires when
	// a map marker is clicked.  (Open an info window.)
	this.triggerMapMarker = function( markerIdx ) {
		console.log( "In triggerMapMarker" );
		google.maps.event.trigger( self.mapMarkers[ markerIdx ],"click");
	};

	this.doMapSearch = function (searchAddress, categories) {
		console.log("In doMapSearch");
		var request = {
			location: self.centralLocation,
			keyword: categories.keywords,
			//keyword: '\"public swimming pool\"|\"roller skating rink\"',
			//types: ['park', 'zoo', 'museum'],
			types: categories.types,
			rankBy: google.maps.places.RankBy.DISTANCE
			//radius: 16094 // in meters = 10 miles, max = 50000
		};
		address = unescape(searchAddress);
		var geocoder = new google.maps.Geocoder();
		console.log("2searching for: " + address + ", and category: " + categories);

		geocoder.geocode({address: address}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {

				self.centralLocation = results[0].geometry.location;
				console.log( self.centralLocation );
				self.map.setCenter(self.centralLocation);
				self.map.fitBounds(results[0].geometry.viewport);

				request.location = self.centralLocation;
				self.searchLocMarker = new google.maps.Marker({ map: self.map,
					icon: { path: google.maps.SymbolPath.CIRCLE, scale: 10 },
					position: self.centralLocation });

				console.log("doing custom search, request = ");
				console.log(request);
				self.mapService.nearbySearch(request, placeSearchCallback);

			} else {
				alert("Address " + address + " not found.");
			}
		});
	};

	function placeSearchCallback(results, status) {
		console.log("in placeSearchCallback, num results = " + results.length);
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			for (var i = 0; i < results.length; i++) {
				//console.log("create marker & Place for: ");
				//console.log(results[i]);
				createMarker(results[i]);

				var place = new Place( results[i] );
				self.searchResultPlaces.push( place );
				place.showHeader( self.centralLocation, i );

			}
			//if ( results.length ) showDetails(results[0]);
			//directionsDest = results[0].geometry.location;
		}
	}

	function createMarker(place) {
		//console.log("in createMarker");

		// var image = {
		// 	url: place.icon,
		// 	size: new google.maps.Size(71, 71),
		// 	origin: new google.maps.Point(0, 0),
		// 	anchor: new google.maps.Point(17, 34),
		// 	scaledSize: new google.maps.Size(25, 25)
		// };
		var marker = new google.maps.Marker({
			map: self.map,
			//icon: image,
			position: place.geometry.location,
			title: place.name
		});
		self.bounds.extend(place.geometry.location);
		self.mapMarkers.push(marker);

		// set up the listener callback for when the map markers are clicked
		google.maps.event.addListener(marker, 'click', function() {

			// TODO: fix link - go to details page
			self.infowindow.setContent("<div class='info-win'><div><strong>" + place.name + "</strong></div><div>" + place.vicinity +
				"</div><div><a href=''>Get Details</a></div></div>");
			self.infowindow.open(self.map, this);
		});

		self.map.fitBounds(self.bounds);
	}

	this.clearMarkers = function () {
		// clear the map bounds object & create a new one for the next search
		self.bounds = new google.maps.LatLngBounds();

		// clear the marker that shows where we searched near
		if (self.searchLocMarker) {
			self.searchLocMarker.setMap(null);
			self.searchLocMarker = null;
		}

		for (var i = 0; i < self.mapMarkers.length; i++) {
			self.mapMarkers[i].setMap(null);
		}
		self.mapMarkers = [];
	};

}  // end Map


function Place( placeResult ) {
	console.log("In Place()");
	this.simple_place = placeResult; // a stripped down version of PlaceResult returned by the search.


	this.showHeader = function ( searchAddr, markerIdx ) {
		$('.result-list').css('visibility', 'visible');

		//console.log("In showHeader");
		var resultItem = $('.hidden .result-item').clone();

		var dist = (google.maps.geometry.spherical.computeDistanceBetween(searchAddr, this.simple_place.geometry.location)/1609.344).toFixed(2);
		resultItem.data('markeridx', markerIdx);
		resultItem.find('.result-name').text( this.simple_place.name )
			.parent().find('.result-cat').text( this.simple_place.types.toString() )
			.parent().find('.result-dist').text( dist + " miles")
			.parent().appendTo('.result-list ol');


	};



}  // end Place