// Set up an associative array of all the searchable place categories.
var place_categories = {
	parks: { name: 'Parks',		search_type: 'type',	value: 'park' },
	playgrounds: { name: 'Playgrounds',	search_type: 'name',	value: 'playground' },
	pools: { name: 'Public pools',	search_type: 'keyword',	value: '\"public%20swimming%20pool\"' },
	libraries: { name: 'Libraries',	search_type: 'type',	value: 'library' },
	zoos: { name: 'Zoos',			search_type: 'type',	value: 'zoo' },
	museums: { name: 'Museums',		search_type: 'type',	value: 'museum' },
	aquariums: { name: 'Aquariums',	search_type: 'type',	value: 'aquarium' },
	golf: { name: 'Mini golf',	search_type: 'keyword',	value: '\"miniature%20golf%20course\"' },
	bowling: { name: 'Bowling',		search_type: 'type',	value: 'bowling_alley' },
	movies: { name: 'Movie theaters',		search_type: 'type',	value: 'movie_theater' },
	ice_skate: { name: 'Ice skating rinks',	search_type: 'keyword',	value: '\"ice%20skating%20rink\"' },
	roller_skate: { name: 'Roller skating rinks',	search_type: 'keyword', value: '\"roller%20skating%20rink\"' },
	amusement: { name: 'Amusement parks & centers', search_type: 'type', value: 'amusement_park' },
};


$(document).ready(function(){
	var box = null;
	var myMap = new Map();

	console.log("In document ready.");
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
	$('.category-boxes input[value="all"]').click( function() {
		if( this.checked ) {
			$('.chkbox-example input').prop('checked', true);
		} else {
			$('.chkbox-example input').prop('checked', false);
		}
	});


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

	$( "#search-form" ).submit(function( e ) {
		e.preventDefault();
		console.log( "Handler for .submit() called." );
		console.log( $( this ).serialize() );

		var search_cats = [];
		var search_loc = $('input#search').val();
		console.log( search_loc );
		$('.search-cats:checked').each( function() {
			console.log($(this).attr('value'));
			search_cats.push($(this).attr('value'));
		});
		myMap.doMapSearch( search_loc, search_cats );
	});

});


function processCategories( searchCategories ) {



}



function Map() {
	console.log("In Map()");

	var self = this;
	
	// default to central US and zoom out to see whole US.
	this.centralLocation = new google.maps.LatLng(37.090240, -95.712891);
	this.mapZoom = 4;
	this.mapMarkers = [];
	
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



	this.doMapSearch = function (searchAddress, categories) {
		console.log("In doMapSearch");
		var request = {
			location: self.centralLocation,
			types: ['park'],
			//types: categories.toString(),
			rankBy: google.maps.places.RankBy.DISTANCE
			//radius: 5000
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
				var marker = new google.maps.Marker({ map: self.map,
					icon: { path: google.maps.SymbolPath.CIRCLE, scale: 10 },
					position: self.centralLocation });

				console.log("doing custom search, request = ");
				console.log(request);
				self.mapService.nearbySearch(request, placeSearchCallback);

			} else {
				alert("Address " + address + " not found.");
			}
		});
	}

	function placeSearchCallback(results, status) {
		console.log("in placeSearchCallback, num results = " + results.length);
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			for (var i = 0; i < results.length; i++) {
				console.log("create marker for: ");
				console.log(results[i]);
				createMarker(results[i]);

			}
			//if ( results.length ) showDetails(results[0]);
			//directionsDest = results[0].geometry.location;
		}
	}

	function createMarker(place) {
		console.log("in createMarker");

		var placeLoc = place.geometry.location;
		var marker = new google.maps.Marker({
			map: self.map,
			// icon: place.icon,
			position: place.geometry.location
		});
		self.bounds.extend(place.geometry.location);
		self.mapMarkers.push(marker);
		google.maps.event.addListener(marker, 'click', function() {
			this.infowindow.setContent(place.name + "<br>" + place.vicinity + "<br>" + place.types.join(","));
			this.infowindow.open(self.map, this);
		});

		var typesList = "";
		for (var j = 0; j < place.types.length; j++) {
			typesList += place.types[j];
			if (j < place.types.length-1)
				typesList += ", ";
		}

		// $('table').append("<tr><td><a href='javascript:google.maps.event.trigger(self.mapMarkers["+ 
		// 	(self.mapMarkers.length-1)+"],\"click\");'>" + place.name + "</a></td><td>" + 
		// 	place.vicinity + "</td><td>" + typesList + "</td><td>" + 
		// 	(google.maps.geometry.spherical.computeDistanceBetween(centralLocation, place.geometry.location)/1609.344).toFixed(2) + " miles</td></tr>");

		self.map.fitBounds(self.bounds);
	}

	function clearMarkers() {
		for (var i = 0; i < self.mapMarkers.length; i++) {
			self.mapMarkers[i].setMap(null);
		}
		self.mapMarkers = [];
	}




}