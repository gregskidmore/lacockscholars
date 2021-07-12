// Define global variables for this file

var tabs = $('.cd-tabs');
var concertsSwipe;
var aboutSwipe;
var listenSwipe;
var contactSwipe;
var doSwipe = false;
var gridwidthvar;
// Variable that stores whether a tab move has come from a swipe gesture or not
var fromSwipe = false;
var soundCloudWidget;

// Set a variable to a default value which will be used to determine what to do with the location hash string
var matchedID = "dog";

function linerScrollToTop() {
	$('#liner-panel').scrollTo($('#liner-table-of-contents'),500,{offset: {top:-5,left:-50}});
}

function linerScroll(where) {
	$('#liner-panel').scrollTo(
		$(where),500,{offset: {top:-5,left:-50}}
	);
}

function initialiseCDRecordingAccordion() {
			$("button.cd-accordion").click(function() {
			contentheight = parseInt(calculateCDAccordionHeight($("button.cd-accordion").first()), 10);
			contentheight = contentheight.toString() + "px";
			$(this).toggleClass("active");
			$(this).next().toggleClass("show");
			$(this).next().animate({
				'height': contentheight
			}, 500);
			$(this).siblings(".cd-accordion").removeClass("active");
			$(this).next().siblings(".panel").removeClass("show");
			$(this).next().siblings(".panel").animate({
				'height': 0
			}, 500);
			if (!$(this).hasClass("active")) {
				$(this).next().animate({
					"height": 0
				}, 200);
			}
		});
}

function redrawcdrecordings() {
						
			// Determine the correct height based on the size of the resized window
			var contentheight;
			contentheight = parseInt(calculateCDAccordionHeight($('button.cd-accordion').first()), 10);
			contentheight = contentheight.toString() + "px";
			
			// Assign the calculated height from above to the relevant panel
				$(".cd-accordion.active").next().css({
					"height": contentheight
				});
}

function playSoundcloud(trackid){
 	soundCloudWidget.skip(trackid);
}

function pauseSoundcloud() {
	soundCloudWidget.pause();
}

// Height finding function for the CD Recordings accordion

function calculateCDAccordionHeight(accordionpanel) {
	
	var accmarginBottom;
	if ($(".cd-tabs-content").width() < 1032 || ($(window).height()) < 700) {
		accmarginBottom = 1;
	} else {
		accmarginBottom = 23;
	}

	// Subtract the last panel top from the window height and a bottom margin 
	// to determine the tab content height.

	return $(window).height() - accordionpanel.offset().top - ($(".cd-accordion").length * accordionpanel.outerHeight()) - accmarginBottom + "px";
}

// Height finding function for the Past events accordion

function calculateAccordionHeight(accordionpanel) {
	
	var accmarginBottom;
	if ($(".cd-tabs-content").width() < 1032 || ($(window).height()) < 700) {
		accmarginBottom = 1;
	} else {
		accmarginBottom = 23;
	}

	// Subtract the  last panel top from the window height and a bottom margin 
	// to determine the tab content height.
	
	//console.log();

	return $(window).height() - accordionpanel.offset().top - (pastgrids.length * accordionpanel.outerHeight()) - accmarginBottom + "px";
}

// Height finding function for the Future events container <div>

function calculateTabContentHeight(selectedItem) {

	// Test the window dimensions and find a vertical dimension to fit the window.
	
	if (selectedItem.width() < 1032 || ($(window).height()) < 700) {
		marginBottom = 0;
	} else {
		marginBottom = 22;
	}
	
	// Because this function is called as the page loads initially, you can set doSwipe here

	// If the window is shorter than 700px in any circumstance, set doSwipe true
	if (($(window).height() < 700)) {
		doSwipe = true;
	}
	
	// If taller than 700px, set doSwipe to true if width is less than 768px and do other things
	else {
		if (($(window).width() < 768)) {
			doSwipe = true;
		}
		
		// If window is taller than 700px and between 768px and 960px in width, bind swipe actions to Learn pop-ups.
		if (($(window).width() >= 768) && ($(window).width() < 960)) {
			
			$(".learn-content").hammer().bind("swiperight", function() {
				$(".learn-content").addClass('animated slideOutRight');
				$.modal.close();
				setTimeout(function() {
					$(".learn-content").removeClass('animated slideOutRight');
				}, 500);
			});

			$(".learn-content").hammer().bind("swipeleft", function() {
				$(".learn-content").addClass('animated slideOutLeft');
				$.modal.close();
				setTimeout(function() {
					$(".learn-content").removeClass('animated slideOutLeft');
				}, 500);
			});
		
		}
	}

	// Subtract the tab content top from the window height and a bottom margin 
	// to determine the tab content height. This is here because return has to be
	// the last statement in the function.
	return $(window).height() - $(selectedItem).offset().top - marginBottom + "px";
}


function checkScrolling(tabs) {
	
	// Check to see whether to apply .is-ended to the sequence of tabs and then do it if necessary
	
	var totalTabWidth = parseInt(tabs.children('.cd-tabs-navigation').width());
	var tabsViewport = parseInt(tabs.width());

	if (tabs.scrollLeft() >= totalTabWidth - tabsViewport) {
		tabs.parent('.cd-tabs').addClass('is-ended');
	} else {
		tabs.parent('.cd-tabs').removeClass('is-ended');
	}
}

function initialiseListen() {
					
	// Only do it once, so if there's already the iframe element, don't append another one
			if (!$('#soundcloudwidget').length){
				$('#listen-content').append('<center><iframe id="soundcloudwidget" width="80%" height="500" scrolling="no" frameborder="no" src="http://w.soundcloud.com/player/?url=http%3A//api.soundcloud.com/playlists/242922576&amp;color=6a498a&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false"></iframe></center>');
									
	// If the browser is not Internet Explorer, declare the SoundCloud widget object as a variable
			if (!isIE) {
					soundCloudWidget = SC.Widget("soundcloudwidget");
				}
			
			}
}

function initialiseTabs() {
	
	// Both the tabs list and the content pane list are <ul> lists, with each item an <li> element.
	
	// Loop through each collection of tabs and content panes that may be in the page
	tabs.each(function() {
		
		// Define variables for each set of tabs and content panes 
		var tab = $(this);
		var tabItems = tab.find('ul.cd-tabs-navigation');
		var tabContentWrapper = tab.children('ul.cd-tabs-content');
		var tabNavigation = tab.find('nav');

		// Bind necessary things to the click event for each tab itself
		tabItems.on('click', 'a', function(event) {
			event.preventDefault();
			var selectedItem = $(this);
			// Only do anything if the clicked tab isn't already selected
			if (!selectedItem.hasClass('selected')) {
				var selectedTab = selectedItem.data('content');
				var selectedContent = tabContentWrapper.find('li[data-content="' + selectedTab + '"]');
				var selectedContentHeight = calculateTabContentHeight(tabContentWrapper);
				
				// Remove .selected class from the current selected tab
				tabItems.find('a.selected').removeClass('selected');
				// Add .selected to the clicked tab
				selectedItem.addClass('selected');
				// Remove .selected class from all the <li> sibling elements
				selectedContent.addClass('selected').siblings('li').removeClass('selected');
				
				// If swipe gestures are on, set the fade-out time of all the <li> elements other than the one
				// selected to zero. If not, set it to 200ms
				if (doSwipe && fromSwipe) {
					selectedContent.addClass('selected').siblings('li').animate({
						'opacity': '0'
					}, 0);
				} else {
					selectedContent.addClass('selected').siblings('li').animate({
						'opacity': '0'
					}, 200);
				}
				
				// Apply the calculated height of the container <div>
				tabContentWrapper.css({
					'height': selectedContentHeight
				});
				
				// When the user clicks on the Listen tab, append the SoundCloud iframe element to the listen-content div and create the javascript API object				
				if (selectedTab == "listen"){
						initialiseListen();
				}
				
				if (selectedTab == "cd-recording"){
					if (!$(".cd-accordion.active").length){
					$("button.cd-accordion").last().trigger("click");
				}
				}
				
				// Change the opacity of the selected <li> element.
				tabContentWrapper.find('li.selected').css({
					'opacity': '1'
				});
			}
		});

		// Hide the .cd-tabs::after element when tabbed navigation has scrolled to the end (mobile version)
		checkScrolling(tabNavigation);
		// Bind the checkScrolling function to group of tabs
		tabNavigation.on('scroll', function() {
			checkScrolling($(this));
		});
		
	});

}

function reinitialiseTabs() {
	
	// Do the things that are needed in order to size the tab set on window resize.
	// Do checkScrolling and assign the height required.

	tabs.each(function() {
		var tab = $(this);
		checkScrolling(tab.find('nav'));

		var tabItems = tab.find('ul.cd-tabs-navigation');
		var tabContentWrapper = tab.children('ul.cd-tabs-content');

		tabItems.each(function() {
			var selectedItem = $(this);
			var selectedTab = selectedItem.data('content');
			var selectedContent = tabContentWrapper.find('li[data-content="' + selectedTab + '"]');
			var selectedContentHeight = calculateTabContentHeight(tabContentWrapper);
			tabContentWrapper.animate({
				'height': selectedContentHeight
			}, 0);

		});
	});

}

function initialiseHammer() {
	
	// Set up swipe actions, binding them to various things using the Hammer library
	
	// Only swipeleft is required for Concerts tab	
	$("#concerts-content").hammer().bind("swipeleft", function() {
		$("#concerts-content").addClass('animated slideOutLeft');
		setTimeout(function() {
			fromSwipe = true;
			$("#about_tab").trigger("click");
			fromSwipe = false;
			$("#concerts-content").removeClass('animated slideOutLeft');
		}, 80);
	});
	
	// Only swiperight required for Contact tab
	$("#contact-content").hammer().bind("swiperight", function() {
		$("#contact-content").addClass('animated slideOutRight');
		setTimeout(function() {
			fromSwipe = true;
			$("#cd-recording_tab").trigger("click");
			fromSwipe = false;
			$("#contact-content").removeClass('animated slideOutRight');
		}, 80);
	});
	
	// For any remaining tabs, cycle through them and bind swipe events.
	
	// Find how many .tabitself elements there are and cycle through those
	for (var j = 2; j<$(".tabitself").length; j++) {
		
		contentid=".content"+j;
		
		$(contentid).hammer().bind("swipeleft", function() {
			ThingThatFired=this;
			ThingName=ThingThatFired.classList.item(1);
			number=ThingName.slice(-1);
			tableft=".tab"+(parseInt(number)+1);
		$(this).addClass('animated slideOutLeft');
		setTimeout(function() {
			fromSwipe = true;
			$(tableft).trigger("click");
			fromSwipe = false;
			$(ThingThatFired).removeClass('animated slideOutLeft');
		}, 80);
	});
	
		$(contentid).hammer().bind("swiperight", function() {
			ThingThatFired=this;
			ThingName=ThingThatFired.classList.item(1);
			number=ThingName.slice(-1);
			tabright=".tab"+(parseInt(number)-1);
		$(this).addClass('animated slideOutRight');
		setTimeout(function() {
			fromSwipe = true;
			$(tabright).trigger("click");
			fromSwipe = false;
			$(ThingThatFired).removeClass('animated slideOutRight');
		}, 80);
	});
		
		// Reset this variable for the next time through the loop
		contentid=".content";
		
	}
	
}

function lauchLearnFromURL(URLstring) {
	
	// Figure how which Learn pop-up to show based on what the # string is.
	
	for (var j = 0; j < Events.length; j++) {
		if (Events[j].URLString == URLstring) {
			matchedID = Events[j].ID;
		}
	}
	
	// Check to see if the string was found in the LSevents spreadsheet, thereby
	// having a value other than "dog". If not, show error. If so, launch that Learn pop-up.
	
	if (matchedID == "dog") {
		$("#notfound").modal();
	} else {
		launchLearn(matchedID);
	}
}

jQuery(document).ready(function($) {
	
	// This fires when the document is ready, but not necessarily when it has finished loading

	// First, bind everything that needs to happen on resize to the resize event

			$(window).on('resize', function() {

				// Turn all swipes off
				$("#concerts-content").hammer().off("swipeleft");
				$("#about-content").hammer().off("swipeleft");
				$("#about-content").hammer().off("swiperight");
				$("#listen-content").hammer().off("swipeleft");
				$("#listen-content").hammer().off("swiperight");
				$("#cd-recording-content").hammer().off("swipeleft");
				$("#cd-recording-content").hammer().off("swiperight");
				$("#contact-content").hammer().off("swiperight");
				$(".learn-content").hammer().off("swiperight");
				$(".learn-content").hammer().off("swipeleft");
				doSwipe = false;

				// Redraw tabs with a new window size
				reinitialiseTabs();

				// Keep the selected tab open in the new window size
				$("ul.cd-tabs-content li.section").each(function() {
					if ($(this).hasClass("selected")) {
						gridwidthvar = ($(this).width())
					}
				});

				// Redraw the grid of events with a new window size
				redrawgrid($('.futureselected').attr('id'));

				// Redraw CD Recordings accordion
				redrawcdrecordings();

				// If doSwipe, turn on the swipe actions
				if (doSwipe) {
					initialiseHammer();
				}

			});

	// Get content from spreadsheet
	initialiseEvents();

	// Figure out what the next event is
	findNextEvent();
	
	// Make the CD-recordings accordion work
	initialiseCDRecordingAccordion();

	// Dimension, populate, and draw the Learn pop-ups and concerts grid
	grid = $('#concerts-content');
	gridwidthvar = $('#concerts-content').width();
		
	// Insert display=none <div> at the top of the page that merely contains all of the grid images so sizeboxes() will work properly
	loadgridimages();
	
	dimgrid(gridwidthvar, "Future");
	drawgrid("Future");

	// Bind the launch modal function to the #next-event click listener
	$("#next-event").click(function() {
		launchNextModal();
	});

	$(window).load(function() {
		
		// Set the following to run when the window.load JavaScript event fires.
		
		initialiseTabs();
		
		// Check to see if there is a tab name in the location #
		
		if (window.location.hash.length) {
			switch (window.location.hash.substring(1)) {
				case "About":
					$("#about_tab").trigger("click");
					matchedID="notdog";
					break;

				case "about":
					$("#about_tab").trigger("click");
					matchedID="notdog";
					break;

				case "Listen":
					$("#listen_tab").trigger("click");
					matchedID="notdog";
					break;

				case "listen":
					$("#listen_tab").trigger("click");
					matchedID="notdog";
					break;

				case "Contact":
					$("#contact_tab").trigger("click");
					matchedID="notdog";
					break;

				case "contact":
					$("#contact_tab").trigger("click");
					matchedID="notdog";
					break;
					
				case "cd-recording":
					$("#cd-recording_tab").trigger("click");
					matchedID="notdog";
					break;
					
				case "Cd-recording":
					$("#cd-recording_tab").trigger("click");
					matchedID="notdog";
					break;
					
				case "cd-liner-notes":
					$("#cd-recording_tab").trigger("click");
					$("#liner-button").trigger("click");
					console.log('Hello')
					matchedID="notdog";
					break;
					
				case "Cd-liner-notes":
					$("#cd-recording_tab").trigger("click");
					$("#liner-button").trigger("click");
					matchedID="notdog";
					break;
					
				case "Cd-Recording":
					$("#cd-recording_tab").trigger("click");
					matchedID="notdog";
					break;
					
				case "Road201718":
					break;
					
				case "Liturgy201718":
					break;
				
				case "London201718":
					break;					
					
				default:
					$("#concerts_tab").trigger("click");			
			}
		}
		else {
			$("#concerts_tab").trigger("click");
		}
		
		// After everything has loaded (including images), size the boxes to find the right height
		
		sizeboxes("Future");
		
		if (doSwipe) {
			initialiseHammer();
		}
		
		// Create the error pop-up
		$("<div id='notfound'><h1>Sorry, but we weren't able to find that bit of our website. Please close this message and return to the main website where you can browse all of our future and past concerts and events, read about us, hear us, or get in touch.</h1></div>").insertBefore("#background");
		
		// Remove the loading <div> element
		$('#loading').animate({
			opacity:0
		},200);
		
		// Change the opacity of the #background <div> to show the page
		$("#background").animate({
			opacity: 1
		}, 500);
		
		// Animate the hero text
		$("#herobox h1").addClass("animated fadeInDown");
		$("#herobox p").addClass("animated fadeInUp");
		
		// Decide whether to launch a Learn pop-up, only if there is something after the # and it is not a tab name
		if (matchedID == "dog") {
		setTimeout(function(){
				if(window.location.hash.length){
				lauchLearnFromURL(window.location.hash.substring(1));
				}
			},500);
		}
		
		})
	
});