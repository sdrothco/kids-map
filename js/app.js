// Set up an associative array of all the searchable place categories.
// Keyword searches are disabled until I can add that enhancement.
var place_categories = {
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
	var myMap = new Map();			// the main search map
	var modal = null;				// the modal dialog box
	var currentDetailsPlace = null; // The Place obj that we are showing details for.

	initMain(myMap);	// Initialize all the basic page data.


// **** START category box events **** //
	// When the "All" checkbox is selected, select all the other checkboxes,
	// and vice versa.
	$('#all-chkbox').click( function() {
		if( this.checked ) {
			$('.chkbox-item input').prop('checked', true);
		} else {
			$('.chkbox-item input').prop('checked', false);
		}
	});
	// Start the page off with all the categories checked
	if ( $('#all-chkbox').prop('checked', false) )
		$('#all-chkbox').click();

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
// **** END category box events **** //


// **** START modal dialog box events **** //
	// These two event handlers are for the "About" modal dialog box.
	$('.about-button').click( function (e) {	// open it
		e.preventDefault();
		modal = $('div.modal').omniWindow();
		modal.trigger('show');
	});
	$('.close-button').click( function (e) {	// close it
		e.preventDefault();
		modal.trigger('hide');
	});
// **** END modal dialog box events **** //


// **** START main page events **** //
	// The user submitted a search: get the location and the categories and perform
	// the search.  Display the results.
	$( "#search-form" ).submit(function( e ) {
		e.preventDefault();

		var search_cats = [];
		var search_loc = $('input#search').val();
		$('.category-boxes .search-cats:checked').each( function() {
			search_cats.push($(this).attr('value'));
		});

		// Clear all results & markers between searches
		$('.result-list ol').empty();
		myMap.clearMarkers();

		var searchKeys = processCategories(search_cats);
		//console.log(searchKeys);

		myMap.doMapSearch( search_loc, searchKeys );
	});

	// User clicked a search result from the list of headers next to the map.
	// Open the info window for that search result in the map window.
	$('.result-list').on('click', "li", function() {
		myMap.triggerMapMarker( $(this).attr('data-markeridx') );
	});

	// User clicked the "Get Details" link on a map marker or result header, so show the details page.
	$('#map, .result-list').on('click', '.get-details-link', function(e) {
		e.preventDefault();
		e.stopPropagation();

		$('.details').show();
		$('.search-map').hide();

		// Close any open infowindows, because otherwise they'll stil be open when you
		// return from the details -- even if it wasn't the same place.
		if ( myMap.infowindow.isOpened ) myMap.infowindow.close();

		var ref = $(this).attr('data-ref');
		var placeObj = myMap.searchResultPlaces[ref];
		currentDetailsPlace = placeObj;
		placeObj.showDetails();

	});
// **** END main page events **** //

	
// **** START detail page events **** //
	// The user clicked the Back To Search Results button, so close the detail page
	// and reopen the main search map page.
	$('.back-to-main').click( function (e) {
		e.preventDefault();
		$('.details').hide();
		$('.directions').hide();
		$('.search-map').show();
		
		// force the map to refresh because otherwise it is all hokey.
		google.maps.event.trigger(myMap.map,'resize');

		currentDetailsPlace.closeDirections();
		resetDetails();
	});

	// The user clicked one of the accordian tabs for the Hours, Reviews, and Photos sections.
	// Open the section they clicked, close the others.
    $('.collapsible-section a').click( function(e) {
		var displaySpeed = 450;
		e.preventDefault();
        
        if ( $(this).parent().hasClass('section-1') ) {
            $('.section-2 div, .section-3 div').hide(displaySpeed);
            $('.section-2 .section-header, .section-3 .section-header').removeClass('arrow-down').addClass('arrow-right');
            $(this).parent().find('div').show(displaySpeed);
            $(this).find('.section-header').removeClass('arrow-right').addClass('arrow-down');
            
        } else if ( $(this).parent().hasClass('section-2') ) {
            $('.section-1 div, .section-3 div').hide(displaySpeed);
            $('.section-1 .section-header, .section-3 .section-header').removeClass('arrow-down').addClass('arrow-right');
            $(this).parent().find('div').show(displaySpeed);
            $(this).find('.section-header').removeClass('arrow-right').addClass('arrow-down');
            
        } else if ( $(this).parent().hasClass('section-3') ) {
            $('.section-1 div, .section-2 div').hide(displaySpeed);
            $('.section-1 .section-header, .section-2 .section-header').removeClass('arrow-down').addClass('arrow-right');
            $(this).parent().find('div').show(displaySpeed);
            $(this).find('.section-header').removeClass('arrow-right').addClass('arrow-down');
        }
    });
    
	// The user clicked the get directions button for this detail place.
    $('.detail-get-directions a').click( function (e) {
		e.preventDefault();

		$('.details').hide();
		$('.directions').show();
		currentDetailsPlace.showDirectionsPage();
    });
// **** END detail page events **** //


// **** START directions page events **** //

    // Clicked back to details page button, close directions and reopen details.
	$('.back-to-details a').click( function (e) {
		e.preventDefault();

		$('.details').show();
		$('.directions').hide();
		currentDetailsPlace.closeDirections();
	});

	// The user submitted the directions form.  Show the directions from their start
	// location to the detail place.
	$( "#directions-form" ).submit(function( e ) {
		e.preventDefault();
		currentDetailsPlace.displayDirections();
	});
// **** END directions page events **** //

});


// Initialize all the main screen basic setup.
function initMain(myMap) {
	var box = null;	// A checkbox control to add to the form.

	google.maps.event.addDomListener(window, 'load', myMap);

	// Add the place category checkboxes to the form.
	for ( var key in place_categories ) {
		box = $('.hidden .chkbox-item').clone();
		box.find('.box-label').text( place_categories[key].name );
		box.find('input').attr('value', key )
			.parent().appendTo('.category-boxes');
	}
}


// Clear out the details page so that it is ready for the next place.
function resetDetails() {
	// empty the elements where I append cloned child elements.
	$('.detail-hours').empty().hide().parent().hide();
	$('.detail-reviews').empty().hide().parent().hide();
	$('.detail-photos').empty().hide().parent().hide();
	currentDetailsPlace = null;

}

// This helper function is to process the form categories the user has selected into a search
// string that works with google maps.
// TODO: Later enhancement - Add the ability to do keyword searches in addition to type searches.  
function processCategories( searchCategories ) {
	//console.log( "In processCategories, searchCats = ", searchCategories);

	var keywordCategories = "";
	var typeCategories = [];
	for (var i=0; i<searchCategories.length; i++) {
		// Type search.
		if ( place_categories[ searchCategories[i] ].search_type === 'type' ) {

			typeCategories.push( place_categories[ searchCategories[i] ].value );

		}
		// Keyword search is currently disabled. 
		else if ( place_categories[ searchCategories[i] ].search_type === 'keyword' ) {
			// concatenate the keywords into a pipe deliminated string.
			if ( keywordCategories.length ) keywordCategories += '|';
			keywordCategories += place_categories[ searchCategories[i] ].value;
		}
	}

	return { types: typeCategories, keywords: keywordCategories };
}

// Make the place ratings show up as stars based on the rating number returned in the place details.
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

////////////////////////////////////////////////////////////////////////////////////////////
// The Map object encapsulates the Google Maps service and provides methods to manipulate,
// and display our main page map.  It also provides the way to search for places to display
// on our map.
//
function Map() {

	var self = this; // Keep a pointer to itself because "this" gets confused with the callbacks

	// An associative array of search result Place objects, with the unique google maps
	// reference id for a key.
	this.searchResultPlaces = [];
	
	// default to central US and zoom out to see whole US.
	this.centralLocation = new google.maps.LatLng(37.090240, -95.712891);
	this.mapZoom = 4;				// default zoom level for the whole US.
	this.mapMarkers = [];			// A list of all the map markers.
	this.bounds = new google.maps.LatLngBounds();	// The google maps boundaries for this map.

	// Add a way to tell if an infoWindow is currently displayed on the map or not,
	// so we can tell it to close itself when switching between display modes.
	google.maps.InfoWindow.prototype.isOpened = false;
	this.infowindow = new google.maps.InfoWindow();

	var mapOptions = {		// The map display options for the main window map.
		zoom: this.mapZoom,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		center: this.centralLocation
	};
	this.map = new google.maps.Map(document.getElementById('map'), mapOptions);  // The google maps service.
	this.mapService = new google.maps.places.PlacesService(this.map); // The google places service.


	// When the user clicks a list item, trigger the event that fires when
	// a map marker is clicked.  (Open an info window on the map.)
	this.triggerMapMarker = function( markerIdx ) {
		google.maps.event.trigger( self.mapMarkers[ markerIdx ],"click");
	};

	// Do the search for the specified area for the specified type categories.
	// Add all the results to the result list and show them on the map.
	//
	// TODO: Later enhancement - Add the ability to do keyword searches in 
	// addition to type searches.  Consolidate the results and display them as one search.
	this.doMapSearch = function (searchAddress, categories) {
		var request, geocoder;

		request = {
			location: self.centralLocation,
			keyword: categories.keywords,
			//keyword: '\"public swimming pool\"|\"roller skating rink\"',
			types: categories.types,
			rankBy: google.maps.places.RankBy.DISTANCE
			//radius: 16094 // in meters = 10 miles, max = 50000
		};
		// Find the search address/ location.
		address = unescape(searchAddress);
		geocoder = new google.maps.Geocoder();
		// console.log("searching for: " + address + ", and category: " + categories);

		geocoder.geocode({address: address}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {

				self.centralLocation = results[0].geometry.location;
				self.map.setCenter(self.centralLocation);
				self.map.fitBounds(results[0].geometry.viewport);

				request.location = self.centralLocation;
				self.mapService.nearbySearch(request, placeSearchCallback);

			} else {
				alert("Address " + address + " not found.");
			}
		});
	};

	// Process each place result.  Show them on the map and in the result list
	// and create a Place object for them and keep it in the result list.
	function placeSearchCallback(results, status) {
		var place;
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			for (var i = 0; i < results.length; i++) {
				createMarker(results[i]);

				place = new Place( results[i], self.mapService );
				self.searchResultPlaces[results[i].reference] = place;
				place.showHeader( self.centralLocation, i );
			}
		}
	}

	// Create a map marker for the passed-in place.  Add it to the array of markers
	// so that we can keep track of them and open them as info windows.
	function createMarker(place) {
		var marker = new google.maps.Marker({
			map: self.map,
			position: place.geometry.location,
			title: place.name
		});
		// Grow the map boundaries if need be to show all the markers.
		self.bounds.extend(place.geometry.location);
		self.mapMarkers.push(marker);

		// set up the listener callback for when the map markers are clicked
		google.maps.event.addListener(marker, 'click', function() {

			var infoWinExample = $('.hidden .info-win').clone();
			infoWinExample.find('.info-win-name').text(place.name)
				.parent().find('.info-win-vicinity').text(place.vicinity)
				.parent().find('.info-win-link a').attr('data-ref', place.reference);
			self.infowindow.setContent(infoWinExample.get(0));

			self.infowindow.open(self.map, this);
			self.infowindow.isOpened = true;
		});

		// monitor the closeclick event and set opened state false when the close
		// button is clicked.
		google.maps.event.addListener(self.infowindow, "closeclick", function () {
			self.infowindow.isOpened = false;
		});

		// display the updated boundaries in the map window so that all the markers are showing.
		self.map.fitBounds(self.bounds);
	}

	// Remove all the markers from the map and empty out the markers array. 
	this.clearMarkers = function () {
		// clear the map bounds object & create a new one for the next search
		this.bounds = new google.maps.LatLngBounds();

		for (var i = 0; i < this.mapMarkers.length; i++) {
			this.mapMarkers[i].setMap(null);
		}
		this.mapMarkers = [];
	};

}  // end Map


////////////////////////////////////////////////////////////////////////////////////////////////////
// The Place object encapsulates the google places data for the map's search results.  It 
// keeps header and sometimes detailed place data for each place and provides methods to 
// manipulate and display that data.
//
// The place object holds the reference to the place details for each location we searched for.
// It always holds a reference to the minimal version of the google place with just header info, and 
// if the user gets details for this place, then it will also hold a reference to the detailed info.
function Place( placeResult, placeService ) {
	var self = this;			// keep a reference to itself to use inside the google maps callbacks.
	this.simple_place = placeResult; // a stripped down/ minimal version of PlaceResult returned by the search.
	this.detailed_place = null;	// More detailed version of this place, will be NULL unless user displayed details for this place.
	
	this.miniMap = null;		// The mini map for this place, shown on the details page.
	this.miniMapMarker = null;	// The google map marker for this place.
	this.infowindow = null;		// The info window for the mini map markers.

	this.directionsMap = null;	// The directions map for this place, shown on the directions page.
	this.directionsMarker = null;	// The google map marker for this place.
	
	this.myService = placeService;	// The google place API service used to get details for this place.
	this.directionsService = new google.maps.DirectionsService();	// Google maps API service to get directions.
	this.directionsDisplay = new google.maps.DirectionsRenderer();	// The renderer that shows the route on the map.


	// Show the search result list on the main page with the header/ minimal information for each result place.
	this.showHeader = function ( searchAddr, markerIdx ) {
		var columnSize = 9;		// 0-based column height for the main page result list.
		var resultItem, dist;

		$('.results-wrapper').show();
		resultItem = $('.hidden .result-item').clone();
		// Compute the distance from the result place to the search center, convert to miles 
		// from meters and stop at two decimal places.
		dist = (google.maps.geometry.spherical.computeDistanceBetween(searchAddr, this.simple_place.geometry.location)/1609.344).toFixed(2);
		resultItem.attr('data-markeridx', markerIdx);
		resultItem.find('.result-name').text( this.simple_place.name )
			.parent().find('.result-dist').text( dist + " miles")
			.parent().find('.get-details-link').attr('data-ref', this.simple_place.reference);

		// Display it in two columns.
		if ( markerIdx <= columnSize )	{
			resultItem.appendTo('.result-list.left ol');
		} else {
			resultItem.appendTo('.result-list.right ol');
		}
	};


	// Get the detailed information for this Place from the google places API.
	this.showDetails = function () {
		var request = { reference: this.simple_place.reference };
		this.myService.getDetails(request, function(place, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {

				self.detailed_place = place;
				self.showContactInfo();
				self.showMiniMap();
				self.showHours();
				self.showReviews();
				self.showPhotos();

				// Adjust the accordian tabs to show the first available tab pane that has content.
				$('.section-header').addClass('arrow-right').removeClass('arrow-down');
				$('.detail-tabbed-section .collapsible-section:visible:first div').show()
					.parent().find('.section-header').addClass('arrow-down').removeClass('arrow-right');
			}
		});
	};


	// Show the detail place's contact info, including name, phone, etc.
	this.showContactInfo = function () {
		var detailInfo = $('.detail-info');

		detailInfo.detach().find('.detail-name').text( this.detailed_place.name )
			.parent().find('.detail-address').text( this.detailed_place.formatted_address )
			.parent().find('.detail-phone').text( this.detailed_place.formatted_phone_number );

		if ( this.detailed_place.rating ) {
			detailInfo.find('.detail-rating').show().find('span').text( this.detailed_place.rating );
		} else {
			detailInfo.find('.detail-rating').hide();
		}

		if ( this.detailed_place.website ) {
			detailInfo.find('.detail-website').show().find('a').attr('href', this.detailed_place.website );
		} else {
			detailInfo.find('.detail-website').hide();
		}
		detailInfo.prependTo('.detail-wrapper');

		// this must be called after we re-attach the details to the DOM
		if ( this.detailed_place.rating ) $('.stars').stars();
	};


	// Show the mini map on the details page.  Put a marker on the venue.
	this.showMiniMap = function () {
		var mapOptions = {}, marker;

		this.infowindow = new google.maps.InfoWindow();
		mapOptions = {
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			center: this.simple_place.geometry.location
		};
		this.miniMap = new google.maps.Map(document.getElementById('mini-map'), mapOptions);
		marker = new google.maps.Marker({
			map: this.miniMap,
			position: this.simple_place.geometry.location
		});
		this.miniMapMarker = marker;
		google.maps.event.addListener(marker, 'click', function() {

			var infoWinExample = $('.hidden .info-win').clone();
			infoWinExample.find('.info-win-name').text(self.simple_place.name)
				.parent().find('.info-win-vicinity').text(self.simple_place.vicinity)
				.parent().find('.info-win-link').hide();
			self.infowindow.setContent(infoWinExample.get(0));
		
			self.infowindow.open(self.miniMap, this);
		});

		google.maps.event.addDomListener(window, 'load', this.miniMap);
	};
	

	// Gather and add the venue hours to the DOM in the accordian panel.
	this.showHours = function () {
		var hoursData, openTime, closeTime, newHours;
		var today = new Date();

		hoursData = this.detailed_place.opening_hours;
		if ( !hoursData ) {
			console.log("No hours available.");
			$('.detail-tabbed-section .section-1').hide();
			return;
		}

		$('.detail-tabbed-section .section-1').show();

		for ( var i=0; i < hoursData.periods.length; i++) {
			
			openTime = formatTime(hoursData.periods[i].open.time);
			closeTime = formatTime(hoursData.periods[i].close.time);
			newHours = $('.hidden .hours').clone();
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
			return time;
		}

	};


	// Gather and add the photos to the DOM in the accordian panel.
	this.showPhotos = function () {
		var photoArr, newPhoto, attributionsArr, newAttribution, attrLink;

		photoArr = this.detailed_place.photos;
		if ( !photoArr ) {
			console.log("No photos available.");
			$('.detail-tabbed-section .section-3').hide();
			return;
		}
		$('.detail-tabbed-section .section-3').show();

		for (var i =0; photoArr && i<photoArr.length; i++) {

			newPhoto = $('.hidden .photo').clone();
			newPhoto.find('img').attr('src', photoArr[i].getUrl({maxHeight: 175, maxWidth: 175}));
			attributionsArr =  photoArr[i].html_attributions;

			for (var j=0; attributionsArr && j<attributionsArr.length; j++ ) {
				newAttribution = $('.hidden .photo-attribution').clone();
				attrLink = $(attributionsArr[j]).attr('target', '_blank');
				newAttribution.html( attrLink ).appendTo(newPhoto);
			}
			newPhoto.appendTo('.detail-photos');
		}
	};


	// Gather and add the reviews to the DOM in the accordian panel.
	this.showReviews = function () {
		var reviewsArr, newReview;

		reviewsArr = this.detailed_place.reviews;
		if ( !reviewsArr ) {
			console.log("No reviews available.");
			$('.detail-tabbed-section .section-2').hide();
			return;
		}
		$('.detail-tabbed-section .section-2').show();

		for (var i =0; reviewsArr && i<reviewsArr.length; i++) {

			newReview = $('.hidden .review').clone();
			newReview.find('.review-author a').attr('href', reviewsArr[i].author_url)
				.text(reviewsArr[i].author_name)
				.closest('.review').find('.review-rating')
				.text(reviewsArr[i].rating + " out of 5 stars")
				.parent().find('.review-text').html(reviewsArr[i].text);

			newReview.appendTo('.detail-reviews');
		}
	};


	// Show the directions section of the page.  Show the basic contact info for the detail 
	// place, and then show the directions directions map without route info for now. 
	this.showDirectionsPage = function () {

		var directionsInfo = $('.directions-info');
		directionsInfo.detach().find('.directions-name').text( this.detailed_place.name )
			.parent().find('.directions-address').text( this.detailed_place.formatted_address )
			.parent().find('.directions-phone').text( this.detailed_place.formatted_phone_number );

		directionsInfo.prependTo('.directions-wrapper');
		this.showDirectionsMap();
	};


	// Gather the starting location from the form and then call the function
	// to calculate and display the directions.
	this.displayDirections = function () {

		var start = $('#directions-start').val();
		var end = this.simple_place.geometry.location;
		this.calcRoute(start, end);
	};


	// Calculate and display the driving directions from a specified location
	// to the detail place.
	this.calcRoute = function (start, end) {
		// DRIVING, WALKING, BICYCLING, TRANSIT
		var selectedMode = "DRIVING";

		// Remove the original marker so it doesn't cover the route markers.
		this.directionsMarker.setMap(null);

		var request = {
			origin:start,
			destination:end,
			// Note that Javascript allows us to access the constant
			// using square brackets and a string value as its "property."
			travelMode: google.maps.TravelMode[selectedMode]
		};
		this.directionsService.route(request, function(response, status) {
			console.log("Directions service status", status);
			if (status == google.maps.DirectionsStatus.OK) {
				self.directionsDisplay.setDirections(response);
			}
			else alert("Could not find address: " + start);
		});

		this.directionsDisplay.setPanel(document.getElementById("directions-text"));
	};


	// Create and display the medium sized map where the directions will be shown.
	// Show a marker at the location to which we are finding directions.
	this.showDirectionsMap = function () {
		var mapOptions = {
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			center: this.simple_place.geometry.location
		};
		this.directionsMap = new google.maps.Map(document.getElementById('directions-map'), mapOptions);
		this.directionsMarker = new google.maps.Marker({
			map: this.directionsMap,
			position: this.simple_place.geometry.location
		});

		google.maps.event.addListener(this.directionsMarker, 'click', function() {
			var infoWinExample = $('.hidden .info-win').clone();
			infoWinExample.find('.info-win-name').text(self.simple_place.name)
				.parent().find('.info-win-vicinity').text(self.simple_place.vicinity)
				.parent().find('.info-win-link').hide();
			self.infowindow.setContent(infoWinExample.get(0));
		
			self.infowindow.open(self.directionsMap, this);
		});

		this.directionsDisplay.setMap(this.directionsMap);
		google.maps.event.addDomListener(window, 'load', this.directionsMap);
	};


	// Close and reset all variables and DOM elements having to do with directions
	// so that we have a fresh page each time.
	this.closeDirections = function () {

		// clear the directions text
		this.directionsDisplay.setPanel(null);
		this.directionsDisplay.setDirections({routes: []});

		google.maps.event.trigger(this.miniMap, "resize");
	};

}  // end Place