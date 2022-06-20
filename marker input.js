// Defining Global variables

var map;
var pos;
var marker;
var markersarr = [];
var polyline = null;
var latlongarr = [];
var bounds;
var report;

google.load("visualization", "1", { packages: ["corechart"] });

// Function which creates map
function initMap() {
  // Map options
  var options = {
    center: { lat: 28.7041, lng: 77.1025 },
    zoom: 12,
  };
  // New Map
  map = new google.maps.Map(document.getElementById("map3d"), options);
  report = new google.maps.Map(document.getElementById("reportmap"), options);

  // Map centered around the current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      map.setCenter(pos);
    });
  }

  // Create an ElevationService.
  elevator = new google.maps.ElevationService();

  map.addListener("click", function (e) {
    if (markersarr.length < 2) {
      addMarker(e.latLng);
      drawPolyline();
    }
  });
}

// Adding Markers on the map by clicking on the map
function addMarker(latLng) {
  marker = new google.maps.Marker({
    map: map,
    position: latLng,
    draggable: true,
    // icon can be added
  });
  console.log(marker.getPosition());
  // add listener to redraw the polyline when markers position change
  marker.addListener("dragend", function () {
    drawPolyline();
  });
  //extend the bounds to include each marker's position
  markersarr.push(marker);
}

// Adding Markers to the report map

function reportMarker() {
  polyarr = [];
  bounds = new google.maps.LatLngBounds();
  markersarr.forEach(function (e) {
    pos = e.getPosition();
    polyarr.push(pos);
    marker = new google.maps.Marker({
      map: report,
      position: pos,
    });
    bounds.extend(marker.getPosition());
  });
  // adding polyline to the Map
  polyline = new google.maps.Polyline({
    map: report,
    path: polyarr,
    strokeOpacity: 0.4,
  });
  report.fitBounds(bounds);
  report.setZoom(11);
}

// Adding Markers on the map using the input values

function inputMarker() {
  arr = document.getElementsByClassName("towerinput");
  if (arr.length == 2) {
    Array.from(arr).forEach(function (e) {
      latlongarr.push(e.value.split(","));
      console.log(latlongarr);
    });
    bounds = new google.maps.LatLngBounds();
    for (i = 0; i < latlongarr.length; i++) {
      console.log(latlongarr[i][0], latlongarr[i][1]);
      marker = new google.maps.Marker({
        map: map,
        position: new google.maps.LatLng(latlongarr[i][0], latlongarr[i][1]),
        draggable: true,
      });
      bounds.extend(marker.getPosition());
      markersarr.push(marker);
      drawPolyline();
      // add listener to redraw the polyline when markers position change
      marker.addListener("dragend", function () {
        drawPolyline();
      });
    }
    map.fitBounds(bounds);
  }
}

function drawPolyline() {
  let markersPositionArr = [];
  markersarr.forEach(function (e) {
    markersPositionArr.push(e.getPosition());
    // console.log(e.getPosition().lat());
  });

  // Populating the position of the markers in the input fields
  if (markersPositionArr.length == 2) {
    document.getElementById("searchtowerA").value =
      markersarr[0].getPosition().lat().toFixed(6) +
      "," +
      markersarr[0].getPosition().lng().toFixed(6);
    document.getElementById("searchtowerB").value =
      markersarr[1].getPosition().lat().toFixed(6) +
      "," +
      markersarr[1].getPosition().lng().toFixed(6);
  }

  // checking if polyline is not null
  if (polyline != null) {
    polyline.setMap(null);
  }

  // adding polyline to the Map
  polyline = new google.maps.Polyline({
    map: map,
    path: markersPositionArr,
    strokeOpacity: 0.4,
  });
  document.getElementById("reportbtn").disabled = false;
  document.getElementById("reportbtn").style.cursor = "pointer";

  if (markersPositionArr.length == 2) {
    hopazimuth();
    fresneleirp();
  }

  elevator
    .getElevationAlongPath({
      path: markersPositionArr,
      samples: 100,
    })
    .then(plotElevation)
    .catch((e) => {
      const chartDiv = document.getElementById("elevation_profile");
      // Show the error code inside the chartDiv.
      chartDiv.innerHTML = "Cannot show elevation: request failed because " + e;
    });
}
function plotElevation({ results }) {
  const chartDiv = document.getElementById("elevation_profile");
  const reportchartDiv = document.getElementById("report_elevation_profile");
  // const dist = document.getElementById("linkDistance").innerHTML;

  // Create a new chart in the elevation_chart DIV.
  const chart = new google.visualization.LineChart(chartDiv);
  const reportchart = new google.visualization.LineChart(reportchartDiv);
  // Extract the data from which to populate the chart.
  // Because the samples are equidistant, the 'Sample'
  // column here does double duty as distance along the
  // X axis.
  const data = new google.visualization.DataTable();

  data.addColumn("number", "Distance");
  data.addColumn("number", "Elevation");
  // const step = dist / results.length;
  // const distarr = [];
  // for (let i = 0; i <= dist; i + step) {
  //   distarr.push(i);
  // }
  // console.log(distarr);
  for (let i = 0; i < results.length; i++) {
    data.addRow([i, results[i].elevation]);
  }

  // Draw the chart using the data within its DIV.
  chart.draw(data, {
    width: 370,
    height: 235,
    // width: 250,
    // height: 200,
    legend: { position: "bottom" },
    // @ts-ignore TODO update to newest visualization library
    titleY: "Elevation (m)",
    titleX: "Distance (Km)",
    tooltip: { isHtml: true },
  });

  // Draw the chart using the data within its DIV.
  reportchart.draw(data, {
    width: 550,
    height: 265,
    // width: 250,
    // height: 200,
    legend: { position: "bottom" },
    // @ts-ignore TODO update to newest visualization library
    titleY: "Elevation (m)",
    titleX: "Distance (Km)",
    tooltip: { isHtml: true },
  });
}
