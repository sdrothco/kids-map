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

	// $( "#tabs" ).tabs();
	$( "#accordion" ).accordion();

	google.maps.event.addDomListener(window, 'load', myMap);

	// Add the place category checkboxes to the form.
	for ( var key in place_categories ) {
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
            $('.category-label span').removeClass('arrow-right').addClass('arrow-down');
		} else {
            $('.category-label span').removeClass('arrow-down').addClass('arrow-right');
		}
		
	});


	$('.about-button').click( function (e) {

	});


	// User clicked a search result from the list of headers next to the map.
	$('.result-list').on('click', 'li', function() {
		myMap.triggerMapMarker( $(this).data('markeridx') );
	});

	// The user submitted a search
	$( "#search-form" ).submit(function( e ) {
		e.preventDefault();
		// console.log( "Handler for .submit() called." );
		// console.log( $( this ).serialize() );

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
	
	// Get the details for a map marker or result header
	// show the details page.
	$('#map, .results-wrapper').on('click', '.get-details-link', function(e) {
		e.preventDefault();

		$('.details').show();
		$('.search-map').hide();

		var ref = $(this).data('ref');
		var placeObj = myMap.searchResultPlaces[ref];
		placeObj.showDetails();

	});

	$('.back-to-main').click( function (e) {
		e.preventDefault();
		$('.details').hide();
		$('.search-map').show();
		// force the map to refresh because otherwise it is all hokey.
		google.maps.event.trigger(myMap,'resize');

		// empty the elements where I append cloned child elements.
		// todo: will need to empty hours too
		$('.detail-hours').empty();
		$('.detail-reviews').empty();
		$('.detail-photos').empty();
	});

	$('.back-to-details').click( function (e) {
		e.preventDefault();

		$('.show-for-directions').hide();
		$('.hide-for-directions').show();

		$('.detail-page-top').css('height', '40%');
		google.maps.event.trigger(this.miniMap, "resize");

		//$('.details').hide();
		//$('.search-map').show();
		// force the map to refresh because otherwise it is all hokey.
		//google.maps.event.trigger(myMap,'resize');

		// empty the elements where I append cloned child elements.
		// todo: will need to empty hours too
		//$('.detail-reviews').empty();
		//$('.detail-photos').empty();
	});

    $('.collapsible-section a').click( function(e) {
       e.preventDefault();
        console.log($(this));
        
        if ( $(this).parent().hasClass('section-1') ) {
            $('.section-2 div, .section-3 div').hide(450);
            $('.section-2 .section-header, .section-3 .section-header').removeClass('arrow-down').addClass('arrow-right');
            $(this).parent().find('div').show(450);
            $(this).find('.section-header').removeClass('arrow-right').addClass('arrow-down');
            
        } else if ( $(this).parent().hasClass('section-2') ) {
            $('.section-1 div, .section-3 div').hide(450);
            $('.section-1 .section-header, .section-3 .section-header').removeClass('arrow-down').addClass('arrow-right');
            $(this).parent().find('div').show(450);
            $(this).find('.section-header').removeClass('arrow-right').addClass('arrow-down');
            
        } else if ( $(this).parent().hasClass('section-3') ) {
            $('.section-1 div, .section-2 div').hide(450);
            $('.section-1 .section-header, .section-2 .section-header').removeClass('arrow-down').addClass('arrow-right');
            $(this).parent().find('div').show(450);
            $(this).find('.section-header').removeClass('arrow-right').addClass('arrow-down');
        }
    });
    

    $('.detail-get-directions a').click( function (e) {
		console.log("clicked get directions");
		e.preventDefault();

		var ref = $(this).data('ref');
		var placeObj = myMap.searchResultPlaces[ref];
		placeObj.showDirections();
    });

	$( "#directions-form" ).submit(function( e ) {
		e.preventDefault();
		console.log("in submit directions form");

		var ref = $('.detail-get-directions a').data('ref');
		var placeObj = myMap.searchResultPlaces[ref];
		placeObj.displayDirections();
	});

	// Start the page off with all the categories checked
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

// Make the ratings show up as stars based on the rating number returned in the place details.
$.fn.stars = function() {
	return $(this).each(function() {
		// Get the value
		var val = parseFloat($(this).html());
		// Make sure that the value is in 0 - 5 range, multiply to get width
		val = Math.round(val * 4) / 4; /* To round to nearest quarter */
		var size = Math.max(0, (Math.min(5, val))) * 16;
		// Create stars holder
		var $span = $('<span />').width(size);
		// Replace the numerical value with stars
		$(this).html($span);
	});
};


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
		// console.log("searching for: " + address + ", and category: " + categories);

		geocoder.geocode({address: address}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {

				self.centralLocation = results[0].geometry.location;
				console.log( self.centralLocation );
				self.map.setCenter(self.centralLocation);
				self.map.fitBounds(results[0].geometry.viewport);

				request.location = self.centralLocation;

				// console.log("doing custom search, request = ");
				// console.log(request);
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

				var place = new Place( results[i], self.mapService );
				self.searchResultPlaces[results[i].reference] = place;
				place.showHeader( self.centralLocation, i );

			}
		}
	}

	function createMarker(place) {
		var marker = new google.maps.Marker({
			map: self.map,
			position: place.geometry.location,
			title: place.name
		});
		self.bounds.extend(place.geometry.location);
		self.mapMarkers.push(marker);

		// set up the listener callback for when the map markers are clicked
		google.maps.event.addListener(marker, 'click', function() {

			var infoWinExample = $('.hidden .info-win').clone();
			infoWinExample.find('.info-win-name').text(place.name)
				.parent().find('.info-win-vicinity').text(place.vicinity)
				.parent().find('.info-win-link a').data('ref', place.reference);
			self.infowindow.setContent(infoWinExample.get(0));

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


function Place( placeResult, placeService ) {
	console.log("In Place()");
	var self = this;
	this.simple_place = placeResult; // a stripped down version of PlaceResult returned by the search.
	this.detailed_place = null;
	this.miniMapMarkers = [];
	this.infowindow = null;
	this.miniMap = null;
	this.myService = placeService;
	
	this.directionsService = new google.maps.DirectionsService();
	this.directionsDisplay = new google.maps.DirectionsRenderer();
	//this.directionsDisplay.setMap(this.miniMap);

	this.showHeader = function ( searchAddr, markerIdx ) {
		$('.results-wrapper').css('visibility', 'visible');

		//console.log("In showHeader");
		var resultItem = $('.hidden .result-item').clone();

		var dist = (google.maps.geometry.spherical.computeDistanceBetween(searchAddr, this.simple_place.geometry.location)/1609.344).toFixed(2);
		resultItem.data('markeridx', markerIdx);
		resultItem.find('.result-name').text( this.simple_place.name )
			.parent().find('.result-cat').text( this.simple_place.types.toString() )
			.parent().find('.result-dist').text( dist + " miles")
			.parent().find('.get-details-link').data('ref', this.simple_place.reference);
			// .parent().appendTo('.result-list ol');

		// TODO: fix this to remove magic number
		if ( markerIdx <= 9 )	{
			resultItem.appendTo('.result-list.left ol');
		} else {
			resultItem.appendTo('.result-list.right ol');
		}
	};

	this.showDetails = function () {
		console.log("in showDetails");
		var request = { reference: this.simple_place.reference };
		this.myService.getDetails(request, function(place, status) {
			console.log(status);
			if (status == google.maps.places.PlacesServiceStatus.OK) {

				self.detailed_place = place;
				console.log("details = ");
				console.log(self.detailed_place);

				self.showContactInfo();
				self.showMiniMap();

				self.showHours();
				self.showReviews();
				self.showPhotos();
			}
		});
	};

	this.showContactInfo = function () {
		console.log("in showContactInfo");
		console.log(this);

		var detailInfo = $('.detail-info');
		console.log(detailInfo);

		detailInfo.detach().find('.detail-name').text( this.detailed_place.name )
			//.parent().find('.detail-address').text( this.detailed_place.formatted_address )
			.parent().find('.detail-address').html( this.detailed_place.adr_address )
			.parent().find('.detail-phone').text( this.detailed_place.formatted_phone_number )
			.parent().find('.detail-get-directions a').attr('data-ref', this.simple_place.reference);

		if ( this.detailed_place.rating ) {
			detailInfo.find('.detail-rating').removeClass('hidden')
				.find('span').text( this.detailed_place.rating );
		} else {
			detailInfo.find('.detail-rating').addClass('hidden');
		}
		if ( this.detailed_place.website ) {
			detailInfo.find('.detail-website a').attr('href', this.detailed_place.website );
			// .text( this.detailed_place.website );
		}
			
		detailInfo.prependTo('.detail-wrapper');
		// this must be called after we re-attach the details to the DOM
		if ( this.detailed_place.rating ) $('.stars').stars();
	};

	this.showMiniMap = function () {
		console.log("in showMiniMap");
		this.infowindow = new google.maps.InfoWindow();
		var mapOptions = {
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			center: this.simple_place.geometry.location
		};
		this.miniMap = new google.maps.Map(document.getElementById('mini-map'), mapOptions);
		var marker = new google.maps.Marker({
			map: this.miniMap,
			position: this.simple_place.geometry.location
		});
		this.miniMapMarkers.push(marker);
		google.maps.event.addListener(marker, 'click', function() {

			var infoWinExample = $('.hidden .info-win').clone();
			infoWinExample.find('.info-win-name').text(self.simple_place.name)
				.parent().find('.info-win-vicinity').text(self.simple_place.vicinity);
			infoWinExample.remove('.info-win-link');
			self.infowindow.setContent(infoWinExample.get(0));

			self.infowindow.setContent("<div class='info-win'><div><strong>" + 
				self.simple_place.name + "</strong></div><div>" + 
				self.simple_place.vicinity + "</div></div>");
		
			self.infowindow.open(self.miniMap, this);
		});

		this.directionsDisplay.setMap(this.miniMap);


		google.maps.event.addDomListener(window, 'load', this.miniMap);


	};
	
	this.showHours = function () {
		console.log("in showHours");

		var hoursData = this.detailed_place.opening_hours;
		if ( !hoursData ) {
			console.log("No hours available.");
			return;
		}

		var today = new Date();
		console.log( "found hours" );
		console.log(hoursData);

		for ( var i=0; i < hoursData.periods.length; i++) {
			
			var openTime = formatTime(hoursData.periods[i].open.time);
			var closeTime = formatTime(hoursData.periods[i].close.time);
			var newHours = $('.hidden .hours').clone();
			newHours.find('.day').text(dayOfWeekAsInteger(i))
				.next().text(openTime + " - " + closeTime);
			if ( today.getDay() === i ) newHours.addClass('today');

			$('.detail-hours').append(newHours);
		}

		function dayOfWeekAsInteger(day) {
				return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][day];
		}
		function formatTime( time ) {
			var hour = (time/100).toString().slice(0,2);
			var period = hour < 12 ? " am" : " pm";
			if ( hour > 12 ) hour -= 12;
			if ( hour == 0 ) hour = 12;
			time = hour + ':' + time.substr(-2) + period;
			console.log(time);
			return time;
		}

	};

	this.showPhotos = function () {
		console.log("In showPhotos");
		var photoArr = this.detailed_place.photos;
		if ( !photoArr ) {
			console.log("No photos");
			return;
		}

		for (var i =0; photoArr && i<photoArr.length; i++) {

			var newPhoto = $('.hidden .photo').clone();
			console.log(photoArr[i]);
			newPhoto.find('img').attr('src', photoArr[i].getUrl({maxHeight: 200, maxWidth: 200}));
			
			var attributionsArr =  photoArr[i].html_attributions;

			for (var j=0; attributionsArr && j<attributionsArr.length; j++ ) {
				var newAttribution = $('.hidden .photo-attribution').clone();
				newAttribution.html( attributionsArr[j] ).appendTo(newPhoto);
			}
			newPhoto.appendTo('.detail-photos');
		}
	};

	this.showReviews = function () {
		console.log("In showReviews");
		var reviewsArr = this.detailed_place.reviews;
		if ( !reviewsArr ) {
			console.log("No reviews");
			return;
		}

		for (var i =0; reviewsArr && i<reviewsArr.length; i++) {

			var newReview = $('.hidden .review').clone();
			console.log(reviewsArr[i]);

			newReview.find('.review-author a').attr('href', reviewsArr[i].author_url)
				.text(reviewsArr[i].author_name)
				.closest('.review').find('.review-rating').text(reviewsArr[i].rating + " out of 5 stars")
				.parent().find('.review-date').text(new Date( reviewsArr[i].time ).toDateString())
				.parent().find('.review-text').text(reviewsArr[i].text);

			newReview.appendTo('.detail-reviews');
		}
	};

	this.showDirections = function () {
		console.log("in showDirections");

		// hide the parts of the screen that are not needed for directions display.
		$('.hide-for-directions').hide();

		// resize the top of the detail page to make the map bigger for directions display.
		$('.detail-page-top').css('height', '80%');
		google.maps.event.trigger(this.miniMap, "resize");

		$('.show-for-directions').show();

	};

	this.displayDirections = function () {

		//var start = prompt( "Enter starting location:" );
		var start = $('#directions-start').val();
		var end = this.simple_place.geometry.location;
		console.log("Calculating from " + start + " to " + end);

		calcRoute(start, end);

	};


	function calcRoute(start, end) {
		// DRIVING, WALKING, BICYCLING, TRANSIT
		var selectedMode = "DRIVING";

		var request = {
			origin:start,
			destination:end,
			// Note that Javascript allows us to access the constant
			// using square brackets and a string value as its
			// "property."
			travelMode: google.maps.TravelMode[selectedMode]
		};
		self.directionsService.route(request, function(response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				console.log("directions ok");
				self.directionsDisplay.setDirections(response);
			}
			else console.log("directions NOT  ok");
		});

		self.directionsDisplay.setPanel(document.getElementById("directions-text"));

	}



}  // end Place