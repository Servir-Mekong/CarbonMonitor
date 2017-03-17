/**
 * @fileoverview Runs the Ecodash Tool application. The code is executed in the
 * user's browser. It communicates with the App Engine backend, renders output
 * to the screen, and handles user interactions.
 */


ecodash = {};  // Our namespace.


// define a number of global variabiles

var Country = new google.maps.Data();
var Province = new google.maps.Data();
var CSS_COLOR_NAMES = ["Black","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];
var CountryorProvince = 0;
var myName = [];
var DataArr = [];
var all_overlays = [];
var firstGraph = 0;
var map;
var currentShape; 

 /**
 * Starts the Surface Water Tool application. The main entry point for the app.
 * @param {string} eeMapId The Earth Engine map ID.
 * @param {string} eeToken The Earth Engine map token.
 */
var boot = function(eeMapId, eeToken,serializedPolygonIds_country,serializedPolygonIds_province) {
	
	google.load('visualization', '1.0');

	var app = new App(eeMapId, 
					  eeToken,
					  JSON.parse(serializedPolygonIds_country),
					  JSON.parse(serializedPolygonIds_province));
};



// ---------------------------------------------------------------------------------- //
// The application
// ---------------------------------------------------------------------------------- //
/**
 * The main Surface Water Tool application.
 * @param {google.maps.ImageMapType} mapType The map type to render on the map.
 */
var App = function(eeMapId, eeToken,countryNames,provinceNames) {
  
  // Create and display the map.
  map = createMap();
 
  // Load the default image.
  refreshImage(eeMapId, eeToken,countryNames,provinceNames);
  
  // parse to global variables
  PROVINCES = provinceNames;
  COUNTRIES = countryNames;
  
  channel = new goog.appengine.Channel(eeToken);
    
  // create listeners for buttons and sliders
  setupListeners();
  
  // run the slider function to initialize the dates  
  slider();
  
  // set the mouseover functions for the 
  infotexts();
  
 };

/**
 * Creates a Google Map for the given map type rendered.
 * The map is anchored to the DOM element with the CSS class 'map'.
 * @param {google.maps.ImageMapType} mapType The map type to include on the map.
 * @return {google.maps.Map} A map instance with the map type rendered.
 */
var createMap = function() {
  
  // set the map options
  var mapOptions = {
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
	maxZoom: MAX_ZOOM,
	streetViewControl: false
  };

  var map = new google.maps.Map(document.getElementById('map'), mapOptions);

  return map;
};


/**
* setup the event listeners for the buttons and sliders
**/
function setupListeners() {

  document.getElementById('homebutton').addEventListener("click", homePage);
  document.getElementById('aboutbutton').addEventListener("click", aboutPage);
  document.getElementById('info-button').addEventListener("click", showInfo);
  document.getElementById('start-button').addEventListener("click", getStarted);
  document.getElementById('collapse-button').addEventListener("click", collapseMenu);
  document.getElementById('settings-button').addEventListener("click", collapseMenu);
  
  document.getElementById('updateMap').addEventListener("click", updateButton);
  
  document.getElementById('clearchart').addEventListener("click", clearChart);
  
  document.getElementById('export').addEventListener("click", exportMap);
  
  document.getElementById('chart').addEventListener("click", showgraph);
  
  document.getElementById('chart-info').addEventListener("click", showgraph);
  
  document.getElementById('slider1').addEventListener("change", slider);
  document.getElementById('slider2').addEventListener("change", slider);
  document.getElementById('slider3').addEventListener("change", slider);
  //document.getElementById('slider4').addEventListener("change", slider);
  
  document.getElementById('opacitySlider').addEventListener("change", opacitySliders);

  $("input[name='polygon-selection-method']").change(polygonSelectionMethod)

  // the polygon click handler
  map.data.addListener('click', handlePolygonClick.bind(this));	
  
  // kml upload function
  document.getElementById('files').addEventListener('change', fileOpenDialog, false);
}

/**
* function to show info screen
* using the info button
 */
var showInfo = function() {

   // get infoscreen by id
   var infoscreen = document.getElementById('general-info');

   // open or close screen
   if  (infoscreen.style.display === 'none') {
	infoscreen.style.display = 'block';
	} else {
      infoscreen.style.display = 'none';
    }
}


/**
* function to show info screen
* using the info button
 */
var showgraph = function() {

   // get infoscreen by id
   var graphscreen = document.getElementById('chart-info');

   // open or close screen
   if  (graphscreen.style.display === 'none') {
	graphscreen.style.display = 'block';
	} else {
      graphscreen.style.display = 'none';
    }
}


/**
* function to close info screen
* using the get started button
 */
var getStarted = function() {

   // get infoscreen by id
   var infoscreen = document.getElementById('general-info');

   // close the screen
   infoscreen.style.display = 'none';
}

/**
* function to collapse menu
**/
function collapseMenu() {

   var menu = document.getElementById('ui');
   var settings_button = document.getElementById('settings-button');

	if  (menu.style.display == 'none') {
		 menu.style.display = 'block';
		 settings_button.style.display="none";
	} else {
		menu.style.display = 'none';
		settings_button.style.display = 'block';	
    }
}

/**
* toggle between the home and about page
* go to the home page
**/
var homePage = function(){
	showmap = document.getElementById('map');
	showmap.style.display = "block";
	
	showUI = document.getElementById('ui');
	showUI.style.display = "block";
	
	hideAbout = document.getElementById('about');
	hideAbout.style.display = "hide";

	showLegend = document.getElementById('legend');
	showLegend.style.display = "block";
}

/**
* toggle between the home and about page
* go to the about page
**/
var aboutPage = function(){
	hidemap = document.getElementById('map');
	hidemap.style.display = "none";

	hideUI = document.getElementById('ui');
	hideUI.style.display = "none";

	showAbout = document.getElementById('about');
	showAbout.style.display = "block";

	hideLegend = document.getElementById('legend');
	hideLegend.style.display = "none";
}

/**
* hide the update button and show the map
**/
function updateButton() {

	update_button = document.getElementById('updateMap')
	update_button.style.display = 'none';
	
	ShowMap();
}


/**
* show the download kml button
**/
var updateKMLButton = function() {
	update_button = document.getElementById('downloadkml')
	update_button.style.display = 'block';
	
	// Setup the click event listeners
    google.maps.event.addDomListener(update_button, 'click', function () {
        saveKMLFile();
    });
}

/**
* set the onmouseover events of the info buttons
**/
var infotexts = function(){
	
   var s1 = document.getElementById('step1');
	s1.onmouseover = function() {
	  document.getElementById('info1').style.display = 'block';
	}
	s1.onmouseout = function() {
	  document.getElementById('info1').style.display = 'none';
	}
	
  var s2 = document.getElementById('step2');
    s2.onmouseover = function() {
	  document.getElementById('info2').style.display = 'block';
	}
	s2.onmouseout = function() {
	  document.getElementById('info2').style.display = 'none';
	}

  var s3 = document.getElementById('step3');
	s3.onmouseover = function() {
	  document.getElementById('info3').style.display = 'block';
	}
	s3.onmouseout = function() {
	  document.getElementById('info3').style.display = 'none';
	}
}


/**
* function to close info screen
* using the get started button
 */
var slider = function() {

	update_button = document.getElementById('updateMap')
	update_button.style.display = 'block';
		
	refStart = $("#slider1").val();
	refStop = $("#slider2").val();

	studyStart = $("#slider3").val();
	studyStop = $("#slider4").val();
	
	var slider1 = document.getElementById("sliderval1");
    slider1.innerHTML = refStart;

	var slider2 = document.getElementById("sliderval2");
    slider2.innerHTML = refStop;	

	var slider3 = document.getElementById("sliderval3");
    slider3.innerHTML =studyStart;

	//var slider4 = document.getElementById("sliderval4");
    //slider4.innerHTML = studyStop;	
	
	clearChart();
}

/**
* function to close info screen
* using the get started button
 */
var GetDates = function() {

	refStart = $("#slider1").val();
	refStop = $("#slider2").val();

	studyStart = $("#slider3").val();
	studyStop = $("#slider4").val();
	
	return [refStart, refStop, studyStart, studyStop]
}

/**
* Display the polygons when the radio button changes
**/
function polygonSelectionMethod(){

	// hide the download kml button
	update_button = document.getElementById('downloadkml')
	update_button.style.display = 'none';

	// get the variable name
	var selection  = $("input[name='polygon-selection-method']:checked").val();
	
	if (selection == "Province"){

		CountryorProvince = 0;

		// remove the drawing manager
		if (drawingManager){
			drawingManager.setMap(null);
		}

		// clear existing overlays
		clearMap();

		PROVINCES.forEach((function(provinceName) {
		map.data.loadGeoJson('static/province/' +provinceName + '.json')}).bind());
			map.data.setStyle(function(feature) {
			return {
			  fillColor: 'white',
			  strokeColor: 'white',
			  strokeWeight: 2
				};
			  });
		}

	if (selection == "Country"){
		
		CountryorProvince = 1;

		// remove the drawing manager
		if (drawingManager){
			drawingManager.setMap(null);
		}

		// clear existing overlays
		clearMap();

		COUNTRIES.forEach((function(country) {
		map.data.loadGeoJson('static/country/' +country + '.json')}).bind());
			map.data.setStyle(function(feature) {
			return {
			  fillColor: 'white',
			  strokeColor: 'white',
			  strokeWeight: 2
				};
			  });
		}		

	if (selection == "Draw Polygon"){	
		
		CountryorProvince = 0;
	
		// clear existing overlays
		clearMap();
	
		// setup drawing 
		createDrawingManager();
		}

}

/**
* create the drawingmanager
**/
var createDrawingManager = function(){
		drawingManager = new google.maps.drawing.DrawingManager({
		drawingMode: google.maps.drawing.OverlayType.POLYGON,
		drawingControl: false,
		polygonOptions: {
			fillColor: CSS_COLOR_NAMES[counter],
			strokeColor: CSS_COLOR_NAMES[counter]
		  }
		});
		
		drawingManager.setMap(map);
		
		// Respond when a new polygon is drawn.
		google.maps.event.addListener(drawingManager, 'overlaycomplete',

		function(event) {
			all_overlays.push(event);
			counter = counter + 1;
			var title = "Custom polygon";
			myName.push(title);
			drawingManager.setOptions({
			polygonOptions: {
			fillColor: CSS_COLOR_NAMES[counter],
			strokeColor: CSS_COLOR_NAMES[counter]
			  }
		});

          var geom = event.overlay.getPath().getArray();
                      
          // fire the analysis
          GEE_call_graph_poly(geom);
          
          currentShape = new google.maps.Polygon({ paths: geom})       
        });
			
		updateKMLButton();
			
}


/**
* Clear polygons from the map when changing from country to province
**/
var clearMap = function(){

	// remove all polygons 
	map.data.forEach(function (feature) {
		 map.data.remove(feature);});

	for (var i=0; i < all_overlays.length; i++)
	 {
		all_overlays[i].overlay.setMap(null);
	}
	
	all_overlays = [];

}


/**
* Clear polygons from the map when changing from country to province
**/
var clearChart = function(){

	// clear colored polygons
	map.data.revertStyle();

	firstGraph = 0;
	
	$('#ui #chart').empty(); 
	$('#ui #chart').hide();

	$('#largechart').empty(); 
	$('#largechart').hide();
	
	var chartbutton = document.getElementById('clearchart');
    chartbutton.style.display = 'none';
    
    var graphscreen = document.getElementById('chart-info');
    graphscreen.style.display = 'none';
    
    var myName = [];
	DataArr = [];

	counter = 0;
}


/**
 * Handles a on click a polygon. Highlights the polygon and shows details about
 * it in a panel.
 * @param {Object} event The event object, which contains details about the
 *     polygon clicked.
 */

var handlePolygonClick = function(event) {
    
  var feature = event.feature;
    
  var showlink = document.getElementById("link")
  showlink.style.display = 'none';
		
  // get geometry of polygon
  var polyPath = event.feature.getGeometry().getAt(0).getArray();
  // parse geometry to global variable
  currentShape = new google.maps.Polygon({paths: polyPath});
	
   
  // Instantly higlight the polygon and show the title of the polygon.
  map.data.overrideStyle(feature, {strokeWeight: 6,
								   fillcolor: CSS_COLOR_NAMES[counter],
								   strokeColor: CSS_COLOR_NAMES[counter]  	
									});
   
   // get the name of the polygon  
   var title = feature.getProperty('title');
    
   // add the name of the polygon to the array
   myName.push(title);
   
   // show selection on panel
   document.getElementById("name").innerHTML = title;
   
   // Get the data
   var myoutput = GEE_call_graph(feature);
   
   counter = counter + 1;
}


/**
* ajax call to get data for graph on polygon click
**/
var GEE_call_graph = function(feature){
    
  // get the feature id
  var id = feature.getProperty('id');

  var Dates = GetDates();
  
   var carbonPrice = document.getElementById("carbonPrice").value;
   console.log(carbonPrice);
  



  var data = {mycounter: counter,
			  folder : CountryorProvince,
			  refLow : Dates[0],									 
			  refHigh : Dates[1],
			  studyLow : Dates[2],
			  studyHigh : Dates[3],
			  carbonPrice :  carbonPrice								 
			  } 
  
  $(".spinner").toggle();

  $.get('/details?polygon_id=' + id,data).done((function(data) {    
    if (data['error']) {
      alert("An error! This is embarrassing! Please report to the sys admin. ");
    } else {
		$(".spinner").toggle();
		showChart(data['timeSeries']);
    }
  }).bind(this));
  
}  


/**
* ajax call to get data for graph for custom polygon
**/
var GEE_call_graph_poly = function(geom){
  
    var Dates = GetDates();
  
    var data = {mycounter: counter,
			  refLow : Dates[0],									 
			  refHigh : Dates[1],
			  studyLow : Dates[2],
			  studyHigh : Dates[3]									 
			  } 
  
  $(".spinner").toggle();
  
  $.get('/polygon?polygon=' + geom,data).done((function(data) {    
    if (data['error']) {
      alert("An error! This is embarrassing! Please report to the sys admin. ");
    } else {
		$(".spinner").toggle();
		showChart(data);
    }
  }).bind(this)); 
}  

/**
* ajax call to get data for graph for uploaded
**/
var GEE_call_graph_uploaded_poly = function(geom){
  
    var Dates = GetDates();
    
    var coords = getCoordinates(currentShape);

    var data = {mycounter: counter,
			  refLow : Dates[0],									 
			  refHigh : Dates[1],
			  studyLow : Dates[2],
			  studyHigh : Dates[3]									 
			  } 
  
  $(".spinner").toggle();
  $.get('/uploadHandler?polygon=' + JSON.stringify(coords),data).done((function(data) {    
    if (data['error']) {
      alert("An error! This is embarrassing! Please report to the sys admin. ");
    } else {
		$(".spinner").toggle();
		showChart(data);
    }
  }).bind(this)); 
}  

/**
* Function need for kml downlaod function
**/
// Extract an array of coordinates for the given polygon.
var getCoordinates = function (shape) {
    
   
    //Check if drawn shape is rectangle or polygon
    if (shape.type == google.maps.drawing.OverlayType.RECTANGLE) {
        var bounds = shape.getBounds();
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();
        var xmin = sw.lng();
        var ymin = sw.lat();
        var xmax = ne.lng();
        var ymax = ne.lat();


        return [[xmin, ymin], [xmax, ymin], [xmax, ymax], [xmin, ymax]];

    }
    else {
        var points = shape.getPath().getArray();
        return points.map(function (point) {
            return [point.lng(), point.lat()];
        });
    }
};


/**
* Function need for kml download function
**/
var setRectanglePolygon = function (newShape) {
    clearPolygon();
    currentShape = newShape;
    
};

/** Clears the current polygon and cancels any outstanding analysis.
 * * Function need for kml download function
**/
var clearPolygon = function () {
    if (currentShape) {
        currentShape.setMap(null);
        currentShape = undefined;
    }
};


/**
 * Shows a chart with the given timeseries.
 * @param {Array<Array<number>>} timeseries The timeseries data
 *     to plot in the chart.
 */
var showChart = function(timeseries) {

  // unwrap the download png outerhtml 	
  $('png').contents().unwrap();

  if (firstGraph == 0){
	timeseries.forEach(function(point) {
		point[0] = new Date(parseInt(point[0], 10));
		DataArr.push([point[0]]);
	firstGraph = 1
  });
  }
  
  var count = 0;
  timeseries.forEach(function(point) {
	  DataArr[count].push(point[1]);
	  count = count +1;
  });
  
  var data = new google.visualization.DataTable();
  data.addColumn('date');
  for (i = 0; i < counter; i++) { 
	data.addColumn('number', myName[i]);
  }

  data.addRows(DataArr);
 
  var wrapper = createWrapper(300,200,data);
 
  $('#ui #chart').show();
  var chartEl = $('#chart').get(0);
  wrapper.setContainerId(chartEl);
  wrapper.draw();

  var chart = createWrapper(900,500,data);

  $('#largechart').show();
  var chartEl = $('#largechart').get(0);
  chart.setContainerId(chartEl);
  chart.draw();
	
  // show the clear chart button
   var chartbutton = document.getElementById('clearchart');
   chartbutton.style.display = 'block';
   
   var exportButton = document.getElementById('export')
   exportButton.style.display = 'block';

   var showlink = document.getElementById("link")
   showlink.style.display = 'none'; 

   // export as png
   google.visualization.events.addListener(chart, 'ready', function () {
		document.getElementById('png').innerHTML = '<a href="' + chart.getChart().getImageURI() + '" target="_blank"' + '>Printable version</a>';
		});
	
	// export as csv
    $('#Export').click(function () {
        var csvFormattedDataTable = google.visualization.dataTableToCsv(data);
        var encodedUri = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csvFormattedDataTable);
        this.href = encodedUri;
        this.download = 'table-data.csv';
        this.target = '_blank';
    });

};



/**
 * Create the wrapper for the chart
 */
var createWrapper = function(w,h,data){

  var wrapper = new google.visualization.ChartWrapper({
    chartType: 'LineChart',
    dataTable: data,
    options: {
	  width: w,
	  height: h,
      title: 'Carbon',
      curveType: 'function',
      legend: {position: 'right'},
      titleTextStyle: {fontName: 'Roboto'},
      chartArea: {width: '50%'},
      colors: CSS_COLOR_NAMES,
      vAxis: { 
		  title: 'Million $',
		  format:'0.00'}
    }
  });
  
  return wrapper;
}

/**
 * Shows a chart with the given timeseries.
 * @param {Array<Array<number>>} timeseries The timeseries data
 *     to plot in the chart.
 */
var showLargeChart = function(timeseries) {

  if (firstGraph == 0){
	timeseries.forEach(function(point) {
		point[0] = new Date(parseInt(point[0], 10));
		DataArr.push([point[0]]);
	firstGraph = 1
  });
  }
  
  var count = 0;
  timeseries.forEach(function(point) {
	  DataArr[count].push(point[1]);
	  count = count +1;
  });
  
  var data = new google.visualization.DataTable();
  data.addColumn('date');
  for (i = 0; i < counter; i++) { 
	data.addColumn('number', myName[i]);
  }
  
  data.addRows(DataArr);
  
  // show the clear chart button
   var chartbutton = document.getElementById('clearchart');
   chartbutton.style.display = 'block';
   
   var exportButton = document.getElementById('export')
   exportButton.style.display = 'block';

   var showlink = document.getElementById("link")
   showlink.style.display = 'none';

};

/**
 * Update map
 */
var ShowMap = function() {

	// clear the map
	map.overlayMapTypes.clear();
	
	var Dates = GetDates();
	
	var params = {};
	
	// set the parameters
	params['refLow'] = Dates[0]
	params['refHigh'] = Dates[1]
	params['studyLow'] = Dates[2]
	params['studyHigh'] = Dates[3]
	
	$(".spinner").toggle();

	$.ajax({
      url: "/getmap",
	  data: params,
      dataType: "json",
      success: function (data) {
		 var mapType = getEeMapType(data.eeMapId, data.eeToken);
		 map.overlayMapTypes.push(mapType);
		 $(".spinner").toggle();
		
      },
      error: function (data) {
        alert("An error occured! Please refresh the page.");
      }
    });	
	
	
}


// ---------------------------------------------------------------------------------- //
// export function
// ---------------------------------------------------------------------------------- //

/**
* function to close info screen
* using the get started button
 */
var exportMap = function() {

	var coords = getCoordinates(currentShape);
	
	data = {}
		
	$.get('/downloadHandler?polygon=' + JSON.stringify(coords),data).done((function(data) {    
    if (data['error']) {
       alert("An error! This is embarrassing! Please report to the sys admin. ");
    } else {
		
	var showlink = document.getElementById("link")
	showlink.style.display = 'block';
	showlink.setAttribute("href",data);      
		
	var showexport = document.getElementById("export")
	showexport.style.display = 'none';

    }
	}).bind(this)); 

}  
	

// ---------------------------------------------------------------------------------- //
// Layer management
// ---------------------------------------------------------------------------------- //

/** Updates the image based on the current control panel config. */
var refreshImage = function(eeMapId, eeToken) {
  var mapType = getEeMapType(eeMapId, eeToken);
  map.overlayMapTypes.push(mapType);
};

var opacitySliders = function() {

  setLayerOpacity($("#opacitySlider").val());
  
}

var setLayerOpacity = function(value) {
  map.overlayMapTypes.forEach((function(mapType, index) {
    if (mapType) {
	  var overlay = map.overlayMapTypes.getAt(index);
      overlay.setOpacity(parseFloat(value));
    }
  }).bind(this));
};

// ---------------------------------------------------------------------------------- //
// Static helpers and constants
// ---------------------------------------------------------------------------------- //

/**
 * Generates a Google Maps map type (or layer) for the passed-in EE map id. See:
 * https://developers.google.com/maps/documentation/javascript/maptypes#ImageMapTypes
 * @param {string} eeMapId The Earth Engine map ID.
 * @param {string} eeToken The Earth Engine map token.
 * @return {google.maps.ImageMapType} A Google Maps ImageMapType object for the
 *     EE map with the given ID and token.
 */
var getEeMapType = function(eeMapId, eeToken) {
  var eeMapOptions = {
    getTileUrl: function(tile, zoom) {
      var url = EE_URL + '/map/';
      url += [eeMapId, zoom, tile.x, tile.y].join('/');
      url += '?token=' + eeToken;
      return url;
    },
    tileSize: new google.maps.Size(256, 256),
    name: 'ecomap',
	opacity: 1.0
  };
  return new google.maps.ImageMapType(eeMapOptions);
};

/** @type {string} The Earth Engine API URL. */
var EE_URL = 'https://earthengine.googleapis.com';

/** @type {number} The default zoom level for the map. */
var DEFAULT_ZOOM = 5;

/** @type {number} The max allowed zoom level for the map. */
var MAX_ZOOM = 12;

/** @type {Object} The default center of the map. */
var DEFAULT_CENTER = {lng: 105.8, lat: 11.8};

/** @type {string} The default date format. */
var DATE_FORMAT = 'yyyy-mm-dd';

/** global counter	*/
var counter = 0;

/** global provinces	*/
var PROVINCES;

/** global Countries	*/
var COUNTRIES;

/** The drawing manager	*/
var drawingManager;
