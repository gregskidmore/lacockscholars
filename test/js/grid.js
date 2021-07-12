	// Define global variables for this file

	var dateformat = "dddd, d MMM yyyy";
	var timeformat = "h:mm tt"
	var boxescount = 0;
	var grid;
	var gridwidth;
	var boxesperrow;
	var rowcount = 0;
	var rows = 0;
	var EventIDsToWrite = [];
	var havereversed = 0;
	var nexteventkey = 0;
	var pastgrids = [];
	var highestboxheight;

	function toggleFuture(element) {
		$(element).toggleClass("futureselected");
		redrawgrid("Future");
	}

	function togglePast(element) {
		$(element).toggleClass("futureselected");
		redrawgrid("Past");
		$(".futureswitch-wrapper").css("padding-right","8px")
	}

	function comparenames(a, b) {
		var splitA = a.split(' ');
		var splitB = b.split(' ');
		var lastA = splitA[splitA.length - 1];
		var lastB = splitB[splitB.length - 1];

		if (lastA < lastB) return -1;
		if (lastA > lastB) return 1;
		return 0;
	}

	function initialiseEvents() {
		
		// Parse date information from LSevents spreadsheet, split singers, composers, and ListenUs information into relevant arrays
		
		for (var j = 0; j < Events.length; j++) {
			Events[j].DateTime = Date.parseExact(Events[j].DateTime, "d/M/yyyy, HHmm");
			Events[j].Sopranos = Events[j].Sopranos.split(',');
			Events[j].Sopranos = Events[j].Sopranos.sort(comparenames);
			Events[j].Altos = Events[j].Altos.split(',');
			Events[j].Altos = Events[j].Altos.sort(comparenames);
			Events[j].Tenors = Events[j].Tenors.split(',');
			Events[j].Tenors = Events[j].Tenors.sort(comparenames);
			Events[j].Basses = Events[j].Basses.split(',');
			Events[j].Basses = Events[j].Basses.sort(comparenames);
			Events[j].Composers = Events[j].Composers.split(',');
			if (Events[j].ListenUsIDs.length) {
				Events[j].ListenUsIDs = Events[j].ListenUsIDs.split(',');
			}
			if (Events[j].ListenUsTitles.length) {
				Events[j].ListenUsTitles = Events[j].ListenUsTitles.split(',');
			}
		}
	}

	function dimgrid(gridwidth, futurepast) {

		// Determine how many boxes per row from the width of cont-wrapper, i.e. width of window
		boxesperrow = 3;
		
		if (gridwidth >= 500 && gridwidth < 860) {
			boxesperrow = 2;
		}
		if (gridwidth < 500) {
			boxesperrow = 1;
		}
		
		// Sort the Events array by date ascending
		Events.sort(function(a, b) {
			return Date.compare(a.DateTime, b.DateTime);
		});
		
		// Empty EventIDsToWrite array

		EventIDsToWrite = [];

		// Determine how many past grids to display	

		var numofpastyears = eval(Date.today().toString("yyyy")) - 2014;
		
		for (var l = 0; l <= numofpastyears; l++) {
			
			// For each past year, define a sub array
			pastgrids[l] = [];
			
			for (var j = 0; j < Events.length; j++) {
				
				// For each event in LSevents spreadsheet, determine what year it's in
				// and push its Events index number to the correct pastgrids sub array
				if (Events[j].DateTime.getFullYear() == (Date.today().getFullYear() - l) && Events[j].DateTime <= Date.today()) {
					pastgrids[l].push(j);
				}
			}
		}

		// Determine how many boxes are needed (for future and past seperately), populate EventIDsToWrite array,
		// and determine how many rows to draw

		for (var p = 0; p < Events.length; p++) {
			
			if (futurepast == "Future") {
			
			// Find Future events, count them in boxescount, and push their index value to EventIDsToWrite
				if (Events[p].DateTime >= Date.today()) {
					boxescount++;
					EventIDsToWrite.push(p);
				}

				// Determine how many rows to draw.
				if (boxescount % boxesperrow === 0) {
					rowcount = boxescount / boxesperrow;
				} else {
					
					// Do a double bitwise NOT which returns a number without the decimal part of it.
					rowcount = ~~(boxescount / boxesperrow) + 1;
				}
			
			} 
			
			// For Past events
			else {
				
				// Set the following variables to be empty. They will eventually become multidimensional arrays for all the past accordions.
				boxescount = [];
				rowcount = [];
				
				// pastgrids is a multidimensional array with all the past IDs in it, in year groupings.
				EventIDsToWrite = pastgrids;
				
				for (var e = 0; e < pastgrids.length; e++) {
					pastgrids.reverse();
					boxescount[e] = pastgrids[e].length;
					pastgrids.reverse();
					
					// Same logic as figuring out how many rows to draw as from the Future calculation above. 
					if (boxescount[e] % boxesperrow === 0) {
						rowcount[e] = boxescount[e] / boxesperrow;
					} else {
						rowcount[e] = ~~(boxescount[e] / boxesperrow) + 1;
					}
				}
			}
		}
	}

function redrawgrid(futurepast) {
		
		// Go through the following steps when resizing

		if (futurepast == "Future") {
			
			// For Future:
			// Draw the futureswitch
			
			grid = $('#concerts-content');
			grid.html('<div class="futureswitch-wrapper"><div class="futureswitch"><a onclick="toggleFuture(this);" class="futureselected" id="Future">Future Events</a>&nbsp;&nbsp;&nbsp;&nbsp;<a onclick="togglePast(this);" id="Past">Past Events</a></div></div>');
		} 
		
			// For Past:
			// Assign the currently open accordion to a variable to tell the script to open this one once the whole grid has been redrawn, if it exists on the page.
			else {
			var accordionToKeepOpen;
			if ($("button.accordion")) {
				accordionToKeepOpen = $(".accordion.active").attr("id");
			}
			
			// Draw the futureswitch
			grid = $('#concerts-content');
			grid.html('<div class="futureswitch-wrapper"><div class="futureswitch"><a onclick="toggleFuture(this);" id="Future">Future Events</a>&nbsp;&nbsp;&nbsp;&nbsp;<a onclick="togglePast(this);" class="futureselected" id="Past">Past Events</a></div></div>');
			
			// Draw the accordion buttons and panels
			for (n = 0; n < pastgrids.length; n++) {
				grid.append('<button class="accordion" id="pastbutton' + n + '">' + eval(Date.today().getFullYear() - pastgrids.length + n + 1) + '</button><div class="panel" id="past' + n + '"></div>');
			}
			
			// Determine the correct height based on the size of the resized window
			var contentheight;
			contentheight = parseInt(calculateAccordionHeight($('button.accordion').first()), 10);
			contentheight = contentheight.toString() + "px";
			
			// If there is something stored in accordionToKeepOpen, open it
			if (accordionToKeepOpen) {
				$("#" + accordionToKeepOpen).addClass("active");
				$("#" + accordionToKeepOpen).next().addClass("show");
				
				// Assign the calculated height from above to the relevant panel
				$("#" + accordionToKeepOpen).next().css({
					"height": contentheight
				});
			}

		}
		
		// Bind the click events required to make the accordion function

		$("button.accordion").click(function() {
			contentheight = parseInt(calculateAccordionHeight($("button.accordion").first()), 10);
			contentheight = contentheight.toString() + "px";
			$(this).toggleClass("active");
			$(this).next().toggleClass("show");
			$(this).next().animate({
				'height': contentheight
			}, 500);
			$(this).siblings(".accordion").removeClass("active");
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
		
		
		dimgrid(gridwidthvar, futurepast);
		drawgrid(futurepast);
		
		sizeboxes(futurepast);
		
		boxescount = 0;
		
		// If no accordion is currently with class .active trigger a click on the last accordion button
		if (futurepast == "Past" && !$(".accordion.active").length) {
			$("button.accordion").last().trigger("click");
		}
	
	}

function launchStream (stream) {
	var Road2017array = [];
	var Liturgy2017array = [];
	var London2017array = [];
	
	if ($(stream).parent().hasClass("road")) {
		$("<div id='StreamRoad2017' class='streampage'></div>").insertBefore("#background");
		$("#StreamRoad2017").append("<div class='title'>The Lacock Scholars on the Road 2017-18</div>");
		$("#StreamRoad2017").append("<div class='stream-content' id='road-content2017'></div>");
		Events.forEach(function(event) {
							if (event.Stream == "Road201718") {
									Road2017array.push(event);
									}
							})
		Road2017array.sort(function(a, b) {
			return Date.compare(a.DateTime, b.DateTime);
		});
		Road2017array.forEach(function(event) {
			$("#road-content2017").append("<h1>"+event.Title+"</h1>");
			$("#road-content2017").append("<h2>"+event.DateTime.toString(dateformat)+" at "+event.DateTime.toString(timeformat)+"</h3>");
			$("#road-content2017").append("<h3>"+event.Venue+"</h3>");
			$("#road-content2017").append("<a href='javascript:launchLearn("+event.ID+")'>Learn more</a><br><br>");
		});
				
		$("#StreamRoad2017").hammer().bind("swiperight", function() {
			$("#StreamRoad2017").addClass('animated slideOutRight');
			$.modal.close();
			setTimeout(function() {
				$("#StreamRoad2017").removeClass('animated slideOutRight');
			}, 500);
		});

		$("#StreamRoad2017").hammer().bind("swipeleft", function() {
			$("#StreamRoad2017").addClass('animated slideOutLeft');
			$.modal.close();
			setTimeout(function() {
				$("#StreamRoad2017").removeClass('animated slideOutLeft');
			}, 500);
		});
		
		$("#StreamRoad2017").modal();
	}
		
	if ($(stream).parent().hasClass("liturgy")) {
		$("<div id='StreamLiturgy2017' class='streampage'></div>").insertBefore("#background");
		$("#StreamLiturgy2017").append("<div class='title'>The Lacock Scholars and the Liturgy 2017-18</div>");
		$("#StreamLiturgy2017").append("<div class='stream-content' id='liturgy-content2017'></div>");
		Events.forEach(function(event) {
							if (event.Stream == "Liturgy201718") {
									Liturgy2017array.push(event);
									}
							})
		Liturgy2017array.sort(function(a, b) {
			return Date.compare(a.DateTime, b.DateTime);
		});
		Liturgy2017array.forEach(function(event) {
			$("#liturgy-content2017").append("<h1>"+event.Title+"</h1>");
			$("#liturgy-content2017").append("<h2>"+event.DateTime.toString(dateformat)+" at "+event.DateTime.toString(timeformat)+"</h3>");
			$("#liturgy-content2017").append("<h2>"+event.Venue+"</h2>");
			$("#liturgy-content2017").append("<a href='javascript:launchLearn("+event.ID+")'>Learn more</a><br><br>");
		});
				
		$("#StreamLiturgy2017").hammer().bind("swiperight", function() {
			$("#StreamLiturgy2017").addClass('animated slideOutRight');
			$.modal.close();
			setTimeout(function() {
				$("#StreamLiturgy2017").removeClass('animated slideOutRight');
			}, 500);
		});

		$("#StreamLiturgy2017").hammer().bind("swipeleft", function() {
			$("#StreamLiturgy2017").addClass('animated slideOutLeft');
			$.modal.close();
			setTimeout(function() {
				$("#StreamLiturgy2017").removeClass('animated slideOutLeft');
			}, 500);
		});
		
		$("#StreamLiturgy2017").modal();
	}
	
	if ($(stream).parent().hasClass("london")) {
		$("<div id='StreamLondon2017' class='streampage'></div>").insertBefore("#background");
		$("#StreamLondon2017").append("<div class='title'>The Lacock Scholars in London 2017-18</div>");
		$("#StreamLondon2017").append("<div class='stream-content' id='london-content2017'></div>");
		Events.forEach(function(event) {
							if (event.Stream == "London201718") {
									London2017array.push(event);
									}
							})
		London2017array.sort(function(a, b) {
			return Date.compare(a.DateTime, b.DateTime);
		});
		London2017array.forEach(function(event) {
			$("#london-content2017").append("<h1>"+event.Title+"</h1>");
			$("#london-content2017").append("<h2>"+event.DateTime.toString(dateformat)+" at "+event.DateTime.toString(timeformat)+"</h3>");
			$("#london-content2017").append("<h2>"+event.Venue	+"</h2>");
			$("#london-content2017").append("<a href='javascript:launchLearn("+event.ID+")'>Learn more</a><br><br>");
		});
				
		$("#StreamLondon2017").hammer().bind("swiperight", function() {
			$("#StreamLondon2017").addClass('animated slideOutRight');
			$.modal.close();
			setTimeout(function() {
				$("#StreamLondon2017").removeClass('animated slideOutRight');
			}, 500);
		});

		$("#StreamLondon2017").hammer().bind("swipeleft", function() {
			$("#StreamLondon2017").addClass('animated slideOutLeft');
			$.modal.close();
			setTimeout(function() {
				$("#StreamLondon2017").removeClass('animated slideOutLeft');
			}, 500);
		});
		
		$("#StreamLondon2017").modal();
	}
	
}

function drawgrid(futurepast) {
	
				var nolabeltext="&nbsp;"
				var streamLabelRoad2017='<div class="streamlabel road">This is part of the <br><a onclick="launchStream(this)">Lacock Scholars on the Road 2017-18</a><br>series</div>';
				var streamLabelLiturgy2017="<div class='streamlabel liturgy'>This is part of the <br><a onclick='launchStream(this)'>Lacock Scholars and the Liturgy 2017-18</a><br>series</div>";
				var streamLabelLondon2017="<div class='streamlabel london'>This is part of the <br><a onclick='launchStream(this)'>Lacock Scholars in London 2017-18 </a><br>series</div>";
	
		var q = 0;

		if (futurepast == "Future") {
			
			// The following is for future events

			// Write season PDF A4 schedule <div>
			grid.append("<div id='seasonPDF'>Download a printer-friendly PDFs of our 2017-18 seasons:<br><a target='_blank' href='http://bit.ly/2uC15CU'>London</a>&nbsp;|&nbsp;<a target='_blank' href='http://bit.ly/2tD2A2J'>On the Road</a><div>");
			
			// Append all of the required empty gridrow <div> elements to cont-wrapper. These are the rows of the grid.
			for (var i = 0; i < rowcount; i++) {
				grid.append("<div class='gridrow' id='row" + eval(i + 1) + "'></div>");
				rows++;
			}
			
			// For each box, with index q, calculate and draw the box in the right place and order using q as an index to
			// go through the EventIDsToWrite array and get the information from the Events array taken from the LSevents spreadsheet
			
			while (q < boxescount) {
				
				for (var j = 1; j <= rows; j++) {
					var rowid = "#row" + j;

					if (boxesperrow == 1) {
						
						var streamlabeltext=[];
						
						switch (Events[EventIDsToWrite[q]].Stream) {
							case "Road201718":
								streamlabeltext[q]=streamLabelRoad2017;
								break;
							case "Liturgy201718":
								streamlabeltext[q]=streamLabelLiturgy2017;
								break;
							case "London201718":
								streamlabeltext[q]=streamLabelLondon2017;
								break;
							default:
								streamlabeltext[q]=nolabeltext;
						}

						$(rowid).append("<div class='gridbox oneperrow' id='gridbox" + q + "'><h1>" + Events[EventIDsToWrite[q]].Title + "</h1><img src='img/" + Events[EventIDsToWrite[q]].Image + "'>" + streamlabeltext[q] + "<h2>" + Events[EventIDsToWrite[q]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[q]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[q]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[q]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[q]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[q]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[q]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[q]].ID + ")'>Learn more...</a></div>");
						q++;
					}

					if (boxesperrow == 2) {
						
						var streamlabeltext=[];
						
						switch (Events[EventIDsToWrite[q]].Stream) {
							case "Road201718":
								streamlabeltext[q]=streamLabelRoad2017;
								break;
							case "Liturgy201718":
								streamlabeltext[q]=streamLabelLiturgy2017;
								break;
							case "London201718":
								streamlabeltext[q]=streamLabelLondon2017;
								break;
							default:
								streamlabeltext[q]=nolabeltext;
						}
						
						//console.log(Events[EventIDsToWrite[q + 1]]);
						
						if (boxescount - (j * boxesperrow) >= 0) {
							
							switch (Events[EventIDsToWrite[q + 1]].Stream) {
							case "Road201718":
								streamlabeltext[q+1]=streamLabelRoad2017;
								break;
							case "Liturgy201718":
								streamlabeltext[q+1]=streamLabelLiturgy2017;
								break;
							case "London201718":
								streamlabeltext[q+1]=streamLabelLondon2017;
								break;
							default:
								streamlabeltext[q+1]=nolabeltext;
						}
							
							$(rowid).append("<div class='gridbox twoperrow' id='gridbox" + q + "'><h1>" + Events[EventIDsToWrite[q]].Title + "</h1><img src='img/" + Events[EventIDsToWrite[q]].Image + "'>" + streamlabeltext[q] + "<h2>" + Events[EventIDsToWrite[q]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[q]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[q]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[q]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[q]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[q]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[q]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[q]].ID + ")'>Learn more...</a></div><div class='gridbox twoperrow' id='gridbox" + eval(q + 1) + "'><h1>" + Events[EventIDsToWrite[q + 1]].Title + "</h1><img src='img/" + Events[EventIDsToWrite[q + 1]].Image + "'>" + streamlabeltext[q+1] + "<h2>" + Events[EventIDsToWrite[q + 1]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[q + 1]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[q + 1]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[q + 1]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[q + 1]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[q + 1]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[q + 1]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[q + 1]].ID + ")'>Learn more...</a></div>");
							q = q + 2;
						} else {
							$(rowid).append("<div class='gridbox twoperrow' id='gridbox" + q + "'><h1>" + Events[EventIDsToWrite[q]].Title + "</h1><img src='img/" + Events[EventIDsToWrite[q]].Image + "'>" + streamlabeltext[q] + "<h2>" + Events[EventIDsToWrite[q]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[q]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[q]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[q]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[q]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[q]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[q]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[q]].ID + ")'>Learn more...</a></div>");
							q++;
						}
					}

					if (boxesperrow == 3) {
						
						var streamlabeltext=[];
						
						switch (Events[EventIDsToWrite[q]].Stream) {
							case "Road201718":
								streamlabeltext[q]=streamLabelRoad2017;
								break;
							case "Liturgy201718":
								streamlabeltext[q]=streamLabelLiturgy2017;
								break;
							case "London201718":
								streamlabeltext[q]=streamLabelLondon2017;
								break;
							default:
								streamlabeltext[q]=nolabeltext;
						}
						
						if (boxescount - (j * boxesperrow) <= 0) {
							switch (boxescount - (j * boxesperrow)) {
								
								case 0:
									
							switch (Events[EventIDsToWrite[q + 1]].Stream) {
							case "Road201718":
								streamlabeltext[q+1]=streamLabelRoad2017;
								break;
							case "Liturgy201718":
								streamlabeltext[q+1]=streamLabelLiturgy2017;
								break;
							case "London201718":
								streamlabeltext[q+1]=streamLabelLondon2017;
								break;
							default:
								streamlabeltext[q+1]=nolabeltext;
						}
									
							switch (Events[EventIDsToWrite[q + 2]].Stream) {
							case "Road201718":
								streamlabeltext[q+2]=streamLabelRoad2017;
								break;
							case "Liturgy201718":
								streamlabeltext[q+2]=streamLabelLiturgy2017;
								break;
							case "London201718":
								streamlabeltext[q+2]=streamLabelLondon2017;
								break;
							default:
								streamlabeltext[q+2]=nolabeltext;
						}
									
									$(rowid).append("<div class='gridbox threeperrow' id='gridbox" + q + "'><h1>" + Events[EventIDsToWrite[q]].Title + "</h1><img src='img/" + Events[EventIDsToWrite[q]].Image + "'>" + streamlabeltext[q] + "<h2>" + Events[EventIDsToWrite[q]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[q]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[q]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[q]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[q]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[q]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[q]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[q]].ID + ")'>Learn more...</a></div><div class='gridbox threeperrow' id='gridbox" + eval(q + 1) + "'><h1>" + Events[EventIDsToWrite[q + 1]].Title + "</h1><img src='img/" + Events[EventIDsToWrite[q + 1]].Image + "'>" + streamlabeltext[q+1] + "<h2>" + Events[EventIDsToWrite[q + 1]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[q + 1]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[q + 1]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[q + 1]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[q + 1]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[q + 1]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[q + 1]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[q + 1]].ID + ")'>Learn more...</a></div><div class='gridbox threeperrow' id='gridbox" + eval(q + 2) + "'><h1>" + Events[EventIDsToWrite[q + 2]].Title + "</h1><img src='img/" + Events[EventIDsToWrite[q + 2]].Image + "'>" + streamlabeltext[q+2] + "<h2>" + Events[EventIDsToWrite[q + 2]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[q + 2]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[q + 2]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[q + 2]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[q + 2]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[q + 2]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[q + 2]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[q + 2]].ID + ")'>Learn more...</a></div>");
									q = q + 3;
									break;

								case -1:
									
									switch (Events[EventIDsToWrite[q + 1]].Stream) {
							case "Road201718":
								streamlabeltext[q+1]=streamLabelRoad2017;
								break;
							case "Liturgy201718":
								streamlabeltext[q+1]=streamLabelLiturgy2017;
								break;
							case "London201718":
								streamlabeltext[q+1]=streamLabelLondon2017;
								break;
							default:
								streamlabeltext[q+1]=nolabeltext;
						}
									
									$(rowid).append("<div class='gridbox threeperrow' id='gridbox" + q + "'><h1>" + Events[EventIDsToWrite[q]].Title + "</h1><img src='img/" + Events[EventIDsToWrite[q]].Image + "'>" + streamlabeltext[q] + "<h2>" + Events[EventIDsToWrite[q]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[q]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[q]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[q]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[q]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[q]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[q]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[q]].ID + ")'>Learn more...</a></div><div class='gridbox threeperrow' id='gridbox" + eval(q + 1) + "'><h1>" + Events[EventIDsToWrite[q + 1]].Title + "</h1><img src='img/" + Events[EventIDsToWrite[q + 1]].Image + "'>" + streamlabeltext[q+1] + "<h2>" + Events[EventIDsToWrite[q + 1]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[q + 1]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[q + 1]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[q + 1]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[q + 1]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[q + 1]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[q + 1]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[q + 1]].ID + ")'>Learn more...</a></div>");
									q = q + 2;
									break;

								case -2:
									$(rowid).append("<div class='gridbox threeperrow' id='gridbox" + q + "'><h1>" + Events[EventIDsToWrite[q]].Title + "</h1><img src='img/" + Events[EventIDsToWrite[q]].Image + "'>" + streamlabeltext[q] + "<h2>" + Events[EventIDsToWrite[q]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[q]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[q]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[q]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[q]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[q]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[q]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[q]].ID + ")'>Learn more...</a></div>");
									q++;
							}
						} else {
							
							switch (Events[EventIDsToWrite[q + 1]].Stream) {
							case "Road201718":
								streamlabeltext[q+1]=streamLabelRoad2017;
								break;
							case "Liturgy201718":
								streamlabeltext[q+1]=streamLabelLiturgy2017;
								break;
							case "London201718":
								streamlabeltext[q+1]=streamLabelLondon2017;
								break;
							default:
								streamlabeltext[q+1]=nolabeltext;
						}
									
							switch (Events[EventIDsToWrite[q + 2]].Stream) {
							case "Road201718":
								streamlabeltext[q+2]=streamLabelRoad2017;
								break;
							case "Liturgy201718":
								streamlabeltext[q+2]=streamLabelLiturgy2017;
								break;
							case "London201718":
								streamlabeltext[q+2]=streamLabelLondon2017;
								break;
							default:
								streamlabeltext[q+2]=nolabeltext;
						}
							
							$(rowid).append("<div class='gridbox threeperrow' id='gridbox" + q + "'><h1>" + Events[EventIDsToWrite[q]].Title + "</h1><img src='img/" + Events[EventIDsToWrite[q]].Image + "'>" + streamlabeltext[q] + "<h2>" + Events[EventIDsToWrite[q]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[q]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[q]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[q]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[q]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[q]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[q]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[q]].ID + ")'>Learn more...</a></div><div class='gridbox threeperrow' id='gridbox" + eval(q + 1) + "'><h1>" + Events[EventIDsToWrite[q + 1]].Title + "</h1><img src='img/" + Events[EventIDsToWrite[q + 1]].Image + "'>" + streamlabeltext[q+1] + "<h2>" + Events[EventIDsToWrite[q + 1]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[q + 1]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[q + 1]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[q + 1]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[q + 1]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[q + 1]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[q + 1]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[q + 1]].ID + ")'>Learn more...</a></div><div class='gridbox threeperrow' id='gridbox" + eval(q + 2) + "'><h1>" + Events[EventIDsToWrite[q + 2]].Title + "</h1><img src='img/" + Events[EventIDsToWrite[q + 2]].Image + "'>" + streamlabeltext[q+2] + "<h2>" + Events[EventIDsToWrite[q + 2]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[q + 2]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[q + 2]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[q + 2]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[q + 2]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[q + 2]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[q + 2]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[q + 2]].ID + ")'>Learn more...</a></div>");
							q = q + 3;
						}
					}
				}
			}
		} else {

			// The following is for past events

			// Reverse the order of the Events array
			EventIDsToWrite.reverse();

			// Cycle through the number of past years creating separate grids in the separate accordion panels

			for (var m = 0; m < pastgrids.length; m++) {

				grid = $("#past" + m);
				
				// Append all of the required gridrow <div> elements to their appropriate places in the accordion
				for (var v = 0; v < rowcount[m]; v++) {
					grid.append("<div class='gridrow' id='row" + eval(v + 1) + "'></div>");
				}

				q = 0;
				
				
				// Using a similar logic to the Future grid building from above, build the populate all the grid boxes in the various accordion grids
				while (q < boxescount[m]) {
					for (var j = 1; j <= rowcount[m]; j++) {
						var pastrowid = "#past" + m + " #row" + j;
						if (boxesperrow == 1) {
							
						var streamlabeltext=[];
						
						switch (Events[EventIDsToWrite[m][q]].Stream) {
							case "Road201718":
								streamlabeltext[q]=streamLabelRoad2017;
								break;
							case "Liturgy201718":
								streamlabeltext[q]=streamLabelLiturgy2017;
								break;
							case "London201718":
								streamlabeltext[q]=streamLabelLondon2017;
								break;
							default:
								streamlabeltext[q]=nolabeltext;
						}
							
							$(pastrowid).append("<div class='gridbox oneperrow' id='gridbox" + q + "'><h1>" + Events[EventIDsToWrite[m][q]].Title + "</h1><img class='pastgridimages' src='img/" + Events[EventIDsToWrite[m][q]].Image + "'><br>" + streamlabeltext[q] + "<h2>" + Events[EventIDsToWrite[m][q]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[m][q]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[m][q]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[m][q]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[m][q]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[m][q]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[m][q]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[m][q]].ID + ")'>Learn more...</a></div>");
							q++;
						}
						if (boxesperrow == 2) {
							
						var streamlabeltext=[];
						
						switch (Events[EventIDsToWrite[m][q]].Stream) {
							case "Road201718":
								streamlabeltext[q]=streamLabelRoad2017;
								break;
							case "Liturgy201718":
								streamlabeltext[q]=streamLabelLiturgy2017;
								break;
							case "London201718":
								streamlabeltext[q]=streamLabelLondon2017;
								break;
							default:
								streamlabeltext[q]=nolabeltext;
						}
						
						//console.log(Events[EventIDsToWrite[q + 1]]);
							
							if (boxescount[m] - (j * boxesperrow) >= 0) {
								
						switch (Events[EventIDsToWrite[m][q + 1]].Stream) {
							case "Road201718":
								streamlabeltext[q+1]=streamLabelRoad2017;
								break;
							case "Liturgy201718":
								streamlabeltext[q+1]=streamLabelLiturgy2017;
								break;
							case "London201718":
								streamlabeltext[q+1]=streamLabelLondon2017;
								break;
							default:
								streamlabeltext[q+1]=nolabeltext;
						}
								
								$(pastrowid).append("<div class='gridbox twoperrow' id='gridbox" + q + "'><h1>" + Events[EventIDsToWrite[m][q]].Title + "</h1><img class='pastgridimages' src='img/" + Events[EventIDsToWrite[m][q]].Image + "'>" + streamlabeltext[q] + "<h2>" + Events[EventIDsToWrite[m][q]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[m][q]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[m][q]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[m][q]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[m][q]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[m][q]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[m][q]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[m][q]].ID + ")'>Learn more...</a></div><div class='gridbox twoperrow' id='gridbox" + eval(q + 1) + "'><h1>" + Events[EventIDsToWrite[m][q + 1]].Title + "</h1><img class='pastgridimages' src='img/" + Events[EventIDsToWrite[m][q + 1]].Image + "'>" + streamlabeltext[q+1] + "<h2>" + Events[EventIDsToWrite[m][q + 1]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[m][q + 1]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[m][q + 1]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[m][q + 1]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[m][q + 1]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[m][q + 1]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[m][q + 1]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[m][q + 1]].ID + ")'>Learn more...</a></div>");
								q = q + 2;
							} else {
								$(pastrowid).append("<div class='gridbox twoperrow' id='gridbox" + q + "'><h1>" + Events[EventIDsToWrite[m][q]].Title + "</h1><img class='pastgridimages' src='img/" + Events[EventIDsToWrite[m][q]].Image + "'>" + streamlabeltext[q] + "<h2>" + Events[EventIDsToWrite[m][q]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[m][q]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[m][q]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[m][q]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[m][q]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[m][q]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[m][q]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[m][q]].ID + ")'>Learn more...</a></div>");
								q++;
							}
						}
						if (boxesperrow == 3) {
							
							var streamlabeltext=[];
						
						switch (Events[EventIDsToWrite[m][q]].Stream) {
							case "Road201718":
								streamlabeltext[q]=streamLabelRoad2017;
								break;
							case "Liturgy201718":
								streamlabeltext[q]=streamLabelLiturgy2017;
								break;
							case "London201718":
								streamlabeltext[q]=streamLabelLondon2017;
								break;
							default:
								streamlabeltext[q]=nolabeltext;
						}
							
							if (boxescount[m] - (j * boxesperrow) <= 0) {
								switch (boxescount[m] - (j * boxesperrow)) {
									case 0:
										
										switch (Events[EventIDsToWrite[m][q + 1]].Stream) {
							case "Road201718":
								streamlabeltext[q+1]=streamLabelRoad2017;
								break;
							case "Liturgy201718":
								streamlabeltext[q+1]=streamLabelLiturgy2017;
								break;
							case "London201718":
								streamlabeltext[q+1]=streamLabelLondon2017;
								break;
							default:
								streamlabeltext[q+1]=nolabeltext;
						}
									
							switch (Events[EventIDsToWrite[m][q + 2]].Stream) {
							case "Road201718":
								streamlabeltext[q+2]=streamLabelRoad2017;
								break;
							case "Liturgy201718":
								streamlabeltext[q+2]=streamLabelLiturgy2017;
								break;
							case "London201718":
								streamlabeltext[q+2]=streamLabelLondon2017;
								break;
							default:
								streamlabeltext[q+2]=nolabeltext;
						}
										
										$(pastrowid).append("<div class='gridbox threeperrow' id='gridbox" + q + "'><h1>" + Events[EventIDsToWrite[m][q]].Title + "</h1><img class='pastgridimages' src='img/" + Events[EventIDsToWrite[m][q]].Image + "'>" + streamlabeltext[q] + "<h2>" + Events[EventIDsToWrite[m][q]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[m][q]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[m][q]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[m][q]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[m][q]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[m][q]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[m][q]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[m][q]].ID + ")'>Learn more...</a></div><div class='gridbox threeperrow' id='gridbox" + eval(q + 1) + "'><h1>" + Events[EventIDsToWrite[m][q + 1]].Title + "</h1><img class='pastgridimages' src='img/" + Events[EventIDsToWrite[m][q + 1]].Image + "'>" + streamlabeltext[q+1] + "<h2>" + Events[EventIDsToWrite[m][q + 1]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[m][q + 1]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[m][q + 1]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[m][q + 1]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[m][q + 1]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[m][q + 1]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[m][q + 1]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[m][q + 1]].ID + ")'>Learn more...</a></div><div class='gridbox threeperrow' id='gridbox" + eval(q + 2) + "'><h1>" + Events[EventIDsToWrite[m][q + 2]].Title + "</h1><img class='pastgridimages' src='img/" + Events[EventIDsToWrite[m][q + 2]].Image + "'>" + streamlabeltext[q+2] + "<h2>" + Events[EventIDsToWrite[m][q + 2]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[m][q + 2]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[m][q + 2]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[m][q + 2]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[m][q + 2]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[m][q + 2]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[m][q + 2]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[m][q + 2]].ID + ")'>Learn more...</a></div>");
										q = q + 3;
										break;

									case -1:
										
										switch (Events[EventIDsToWrite[m][q + 1]].Stream) {
							case "Road201718":
								streamlabeltext[q+1]=streamLabelRoad2017;
								break;
							case "Liturgy201718":
								streamlabeltext[q+1]=streamLabelLiturgy2017;
								break;
							case "London201718":
								streamlabeltext[q+1]=streamLabelLondon2017;
								break;
							default:
								streamlabeltext[q+1]=nolabeltext;
						}
										
										$(pastrowid).append("<div class='gridbox threeperrow' id='gridbox" + q + "'><h1>" + Events[EventIDsToWrite[m][q]].Title + "</h1><img class='pastgridimages' src='img/" + Events[EventIDsToWrite[m][q]].Image + "'>" + streamlabeltext[q] + "<h2>" + Events[EventIDsToWrite[m][q]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[m][q]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[m][q]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[m][q]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[m][q]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[m][q]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[m][q]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[m][q]].ID + ")'>Learn more...</a></div><div class='gridbox threeperrow' id='gridbox" + eval(q + 1) + "'><h1>" + Events[EventIDsToWrite[m][q + 1]].Title + "</h1><img class='pastgridimages' src='img/" + Events[EventIDsToWrite[m][q + 1]].Image + "'>" + streamlabeltext[q+1] + "<h2>" + Events[EventIDsToWrite[m][q + 1]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[m][q + 1]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[m][q + 1]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[m][q + 1]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[m][q + 1]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[m][q + 1]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[m][q + 1]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[m][q + 1]].ID + ")'>Learn more...</a></div>");
										q = q + 2;
										//console.log("case -1");
										break;

									case -2:
										$(pastrowid).append("<div class='gridbox threeperrow' id='gridbox" + q + "'><h1>" + Events[EventIDsToWrite[m][q]].Title + "</h1><img class='pastgridimages' src='img/" + Events[EventIDsToWrite[m][q]].Image + "'>" + streamlabeltext[q] + "<h2>" + Events[EventIDsToWrite[m][q]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[m][q]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[m][q]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[m][q]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[m][q]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[m][q]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[m][q]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[m][q]].ID + ")'>Learn more...</a></div>");
										q++;

								}
							} else {
								
								switch (Events[EventIDsToWrite[m][q + 1]].Stream) {
							case "Road201718":
								streamlabeltext[q+1]=streamLabelRoad2017;
								break;
							case "Liturgy201718":
								streamlabeltext[q+1]=streamLabelLiturgy2017;
								break;
							case "London201718":
								streamlabeltext[q+1]=streamLabelLondon2017;
								break;
							default:
								streamlabeltext[q+1]=nolabeltext;
						}
									
							switch (Events[EventIDsToWrite[m][q + 2]].Stream) {
							case "Road201718":
								streamlabeltext[q+2]=streamLabelRoad2017;
								break;
							case "Liturgy201718":
								streamlabeltext[q+2]=streamLabelLiturgy2017;
								break;
							case "London201718":
								streamlabeltext[q+2]=streamLabelLondon2017;
								break;
							default:
								streamlabeltext[q+2]=nolabeltext;
						}
								
								$(pastrowid).append("<div class='gridbox threeperrow' id='gridbox" + q + "'><h1>" + Events[EventIDsToWrite[m][q]].Title + "</h1><img class='pastgridimages' src='img/" + Events[EventIDsToWrite[m][q]].Image + "'>" + streamlabeltext[q] + "<h2>" + Events[EventIDsToWrite[m][q]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[m][q]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[m][q]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[m][q]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[m][q]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[m][q]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[m][q]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[m][q]].ID + ")'>Learn more...</a></div><div class='gridbox threeperrow' id='gridbox" + eval(q + 1) + "'><h1>" + Events[EventIDsToWrite[m][q + 1]].Title + "</h1><img class='pastgridimages' src='img/" + Events[EventIDsToWrite[m][q + 1]].Image + "'>" + streamlabeltext[q+1] + "<h2>" + Events[EventIDsToWrite[m][q + 1]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[m][q + 1]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[m][q + 1]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[m][q + 1]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[m][q + 1]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[m][q + 1]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[m][q + 1]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[m][q + 1]].ID + ")'>Learn more...</a></div><div class='gridbox threeperrow' id='gridbox" + eval(q + 2) + "'><h1>" + Events[EventIDsToWrite[m][q + 2]].Title + "</h1><img class='pastgridimages' src='img/" + Events[EventIDsToWrite[m][q + 2]].Image + "'>" + streamlabeltext[q+2] + "<h2>" + Events[EventIDsToWrite[m][q + 2]].DateTime.toString(dateformat) + " at " + Events[EventIDsToWrite[m][q + 2]].DateTime.toString(timeformat) + "<br>" + Events[EventIDsToWrite[m][q + 2]].Venue + "<br><a target='_blank' href='http://maps.google.com/maps?q=" + Events[EventIDsToWrite[m][q + 2]].MapSearch + "'>map</a></h2><h3>" + Events[EventIDsToWrite[m][q + 2]].Price + "</h3><p class='LengthInter'>" + Events[EventIDsToWrite[m][q + 2]].LengthInterval + "</p><p class='description'>" + Events[EventIDsToWrite[m][q + 2]].Description + "</p><br><br><a class='learn' href='javascript:launchLearn(" + Events[EventIDsToWrite[m][q + 2]].ID + ")'>Learn more...</a></div>");
								q = q + 3;
							}
						}
					}
				}
			}

		}
		q = 0;
		boxescount = 0;
		rows = 0;
	}

function sizeboxes(futurepast) {
			
		// Size the gridboxes relative to the size of the images in them so they're all the same, the height of the tallest one.

		// Only do this if displaying more than one box per row
		if (!$(".oneperrow").length) {

			if (futurepast == "Future") {
				highestboxheight = 0;
				
				// Cycle through the rows so that boxes only match height with each other on a given row.
				
				for (var j=1; j<(rowcount+1); j++) {
				highestboxheight=0;
				
				var rowindicator = "#row"+j;
					
				// Cycle through all the grid boxes in the row from the above loop, finding if 'this' box is taller than any of the preceding ones
				// If so, set that height to a variable
				$(rowindicator).find(".gridbox").each(function() {
					if (highestboxheight === 0) {
						highestboxheight = $(this).outerHeight();
					} else {
						if ($(this).outerHeight() > highestboxheight) {
							highestboxheight = $(this).outerHeight();
						}
					}
				})
				
				//console.log(highestboxheight);
				highestboxheight=highestboxheight+2;
				//console.log(highestboxheight);
				//console.log("Hello");
				
				// Assign all the grid boxes' heights to that variable
				$(rowindicator).find(".gridbox").outerHeight(highestboxheight);
// 				console.log(highestboxheight);
				}
			
			}
			
			// For Past, do the same thing, but cycle through the grids in the accordions and do it seperately for each accordion
			
			else {
// 				console.log(rowcount);
				var m=0;
				$(".panel").each(function() {
// 					console.log("m = " + m);
					highestboxheight = 0;
					for (var r=1; r<(rowcount[m]+1); r++){
					highestboxheight = 0;
// 					console.log(highestboxheight);
// 					console.log("rowcount for this panel is " + rowcount[m]);
											
					var rowindicator = "#row"+r;
// 					console.log(rowindicator);
// 					console.log("panel id = " + $(this).attr("id"));
					
					$(this).find(rowindicator).find(".gridbox").each(function() {
// 						console.log("any gridboxes found?");
						if (highestboxheight === 0) {
							highestboxheight = $(this).height();
// 							console.log("getting here, 0? " + $(this).height());
						} else {
							if ($(this).height() > highestboxheight) {
								highestboxheight = $(this).height();
// 								console.log("getting here, not 0? " + $(this).height());
							}
						}
					});
						
					//console.log(highestboxheight);
					highestboxheight=highestboxheight+2;
					//console.log(highestboxheight);
					
					$(this).find(rowindicator).find(".gridbox").height(highestboxheight);
// 					console.log(highestboxheight + " to match");
					}
					m++;
				});
			}
		}
	}

	function loadgridimages() {
		$("<div id='loadedimagescontainer' style='display:none;'></div>").insertBefore('#background');
		for (var j = 0; j < Events.length; j++) {
			$('#loadedimagescontainer').append("<img src='img/" + Events[j].Image + "'>");
		}
	}


	function launchLearn(LaunchID) {
		
		var LearnToLaunch;
		
		// Cycle through the Events array to find which event we need, given that the array is currently sorted by date.
		
		for (var j = 0; j < Events.length; j++) {
			if (Events[j].ID == LaunchID) {
			LearnToLaunch = j;
			}
		}
		
			$("<div id='Learn" + Events[LearnToLaunch].ID + "' class='learn-content'></div>").insertBefore("#background");
			$("#Learn" + Events[LearnToLaunch].ID).append("<div class='title'>" + Events[LearnToLaunch].Title + "</div>");
			$("#Learn" + Events[LearnToLaunch].ID).append("<div class='imgdiv'><img class='learnimg' src='img/" + Events[LearnToLaunch].Image + "'></div>");
			$("#Learn" + Events[LearnToLaunch].ID).append("<div class='date'>" + Events[LearnToLaunch].DateTime.toString(dateformat) + "</div>");
			$("#Learn" + Events[LearnToLaunch].ID).append("<div class='venue'>" + Events[LearnToLaunch].Venue + ", " + Events[LearnToLaunch].DateTime.toString(timeformat) + "</div>");
			$("#Learn" + Events[LearnToLaunch].ID).append("<div class='price'>" + Events[LearnToLaunch].Price + "</div>");
			$("#Learn" + Events[LearnToLaunch].ID).append("<div class='LengthInt'>" + Events[LearnToLaunch].LengthInterval + "</div>");
			$("#Learn" + Events[LearnToLaunch].ID).append('<div class="buttoncontainer"><center><br><div class="fb-share-button" data-href="http://www.lacockscholars.org/#' + Events[LearnToLaunch].URLString + '" data-layout="button" data-size="small" data-mobile-iframe="true"><a class="fb-xfbml-parse-ignore" target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fwww.lacockscholars.org%2F%23' + Events[LearnToLaunch].URLString + '&amp;src=sdkpreparse">Share on Facebook</a></div><br><br><a href="https://twitter.com/share" class="twitter-share-button" data-text="Looking forward to this concert!" data-url="http://www.lacockscholars.org/#' + Events[LearnToLaunch].URLString + '" data-via="LacockScholars" data-show-count="false">Tweet</a><script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script></center></div>');
			if (Events[LearnToLaunch].LongDescription) {
				$("#Learn" + Events[LearnToLaunch].ID).append("<div class='descriptionlabel'>About this performance:</div>");
				$("#Learn" + Events[LearnToLaunch].ID).append("<div class='longdescription'>" + Events[LearnToLaunch].LongDescription + "</div>");
			}

			if (Events[LearnToLaunch].ListenUsIDs.length > 0) {
				$("#Learn" + Events[LearnToLaunch].ID).append("<div class='listenlabel'>Listen to some recordings from this performance:</div>");
				$("#Learn" + Events[LearnToLaunch].ID).append("<div class='listencontent'></div>");
				initialiseListen();

				if (isIE) {
					$("#Learn" + Events[LearnToLaunch].ID + " .listencontent").append("We recorded the following pieces live during this concert. You can listen to them by finding them in the 'Listen' section of this website.<br><br>");
				} else {
					$("#Learn" + Events[LearnToLaunch].ID + " .listencontent").append("These will begin playing in the SoundCloud widget which you can find on the Listen tab of this website. You can also control them here by clicking on 'Play' or 'Pause' buttons next to the titles.<br><br>");
				}

				if (isIE) {
					for (var d = 0; d < Events[LearnToLaunch].ListenUsIDs.length; d++) {
						$("#Learn" + Events[LearnToLaunch].ID + " .listencontent").append(Events[LearnToLaunch].ListenUsTitles[d] + "<br>");
					}
				} else {
					for (var e = 0; e < Events[LearnToLaunch].ListenUsIDs.length; e++) {
						$("#Learn" + Events[LearnToLaunch].ID + " .listencontent").append(Events[LearnToLaunch].ListenUsTitles[e] + "<div style='display:inline-block; width:15px'></div><a href='javascript:playSoundcloud(" + Events[LearnToLaunch].ListenUsIDs[e] + ");'><img src='img/play.png' height='8px'></a>&nbsp;<a href='javascript:pauseSoundcloud();'><img src='img/pause.png' height='8px'></a><br>");
					}
				}
			}

			if (Events[LearnToLaunch].Programme) {
				$("#Learn" + Events[LearnToLaunch].ID).append("<div class='programmelabel'>Programme:</div>");
				$("#Learn" + Events[LearnToLaunch].ID).append("<div class='programme'></div>");
			}
			
			if (Events[LearnToLaunch].Composers[0].length > 0) {
				$("#Learn" + Events[LearnToLaunch].ID).append("<div class='composerslabel'>Composers:</div>");
				$("#Learn" + Events[LearnToLaunch].ID).append("<div class='composers'></div>");
			}

			if (Events[LearnToLaunch].Sopranos[0] !== "" && Events[LearnToLaunch].Altos[0] !== "" && Events[LearnToLaunch].Tenors[0] !== "" && Events[LearnToLaunch].Basses[0] !== "") {
			$("#Learn" + Events[LearnToLaunch].ID).append("<div class='singerslabel'>Singers:</div>");
			$("#Learn" + Events[LearnToLaunch].ID).append("<div class='voicename'>Sopranos:</div><div class='singerlist sop'></div><br>");
			$("#Learn" + Events[LearnToLaunch].ID).append("<div class='voicename'>Altos:</div><div class='singerlist alto'></div><br>");
			$("#Learn" + Events[LearnToLaunch].ID).append("<div class='voicename'>Tenors:</div><div class='singerlist tenor'></div><br>");
			$("#Learn" + Events[LearnToLaunch].ID).append("<div class='voicename'>Basses:</div><div class='singerlist bass'></div><br>");

			$("#Learn" + Events[LearnToLaunch].ID + " .sop").append(Events[LearnToLaunch].Sopranos.join(', '));
			$("#Learn" + Events[LearnToLaunch].ID + " .alto").append(Events[LearnToLaunch].Altos.join(', '));
			$("#Learn" + Events[LearnToLaunch].ID + " .tenor").append(Events[LearnToLaunch].Tenors.join(', '));
			$("#Learn" + Events[LearnToLaunch].ID + " .bass").append(Events[LearnToLaunch].Basses.join(', '));
			}

			if (Events[LearnToLaunch].Composers[0].length > 0) {
				var g = 1;
				
				// Cycle through the Composers array making Wikipedia links
				$(Events[LearnToLaunch].Composers).each(function() {
					$("#Learn" + Events[LearnToLaunch].ID + " .composers").append("<a target='_blank' href='https://en.wikipedia.org/w/index.php?title=Special:Search&search=" + this + "'>" + this + "</a>");
					if (g < Events[LearnToLaunch].Composers.length) {
						$("#Learn" + Events[LearnToLaunch].ID + " .composers").append(", ");
					}
					g++;
				});
			}

			if (Events[LearnToLaunch].Programme) {
				$("#Learn" + Events[LearnToLaunch].ID + " .programme").append(Events[LearnToLaunch].Programme);
			}

			if (Events[LearnToLaunch].LongDescription) {
				$("#Learn" + Events[LearnToLaunch].ID + " .desription").append(Events[LearnToLaunch].LongDescription);
			}
		
		// Set up swipe actions for Learn pop-ups
		// swiperight and swipeleft are both the same, merely dismissing the Learn pop-up

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
		
		// Launch the newly created modal
		$('#Learn' + LaunchID).modal({closeExisting:false});
		
	}

	function findNextEvent() {

		Events.sort(function(a, b) {
			return Date.compare(a.DateTime, b.DateTime);
		});

		for (var j = 0; j < Events.length; j++) {
			if (!Events[j].DateTime.isBefore(Date.today())) {
				nexteventkey = j;
				break;
			}
		}

		$('#next-event p').html(Events[nexteventkey].Title + " - " + Events[nexteventkey].DateTime.toString(dateformat) + ", " + Events[nexteventkey].Venue + ", " + Events[nexteventkey].DateTime.toString(timeformat));
	}

	function launchNextModal() {
		for (var o = 0; o < Events.length; o++) {
			if (!Events[o].DateTime.isBefore(Date.today())) {
				nexteventkey = o;
				break;
			}
		}

		launchLearn(Events[nexteventkey].ID);
	}