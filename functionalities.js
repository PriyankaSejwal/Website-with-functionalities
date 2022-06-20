// function to convert the co-ordinates from degree to radian

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// function to convert radian to degree
// Converts from radians to degrees.
function rad2deg(rad) {
  return (rad * 180) / Math.PI;
}

//LINK DISTANCE AND AZIMUTH ANGLE
// function to calculate link distance, azimuth angle
function hopazimuth() {
  var arr = document.getElementsByClassName("towerinput");
  var latlongarr = [];
  Array.from(arr).forEach(function (e) {
    latlongarr.push(e.value.split(","));
  });
  var latA = latlongarr[0][0];
  var latB = latlongarr[1][0];
  var longA = latlongarr[0][1];
  var longB = latlongarr[1][1];
  var R = 6371; //Radius of the earth in km
  var deglat = deg2rad(latB - latA);
  var deglong = deg2rad(longB - longA);
  var deglat1 = deg2rad(latA);
  var deglat2 = deg2rad(latB);
  var deglong1 = deg2rad(longA);
  var deglong2 = deg2rad(longB);
  console.log(latA, latB, longA, longB);

  // Calculating hop distance
  var a =
    Math.sin(deglat / 2) * Math.sin(deglat / 2) +
    Math.sin(deglong / 2) *
      Math.sin(deglong / 2) *
      Math.cos(deglat1) *
      Math.cos(deglat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var distance = Math.round(R * c * 100) / 100; // Distance in km

  // Calculating azimuth angle
  var y = Math.sin(deglong2 - deglong1) * Math.cos(deglat2);
  var x =
    Math.cos(deglat1) * Math.sin(deglat2) -
    Math.sin(deglat1) * Math.cos(deglat2) * Math.cos(deglong2 - deglong1);
  var brng = Math.atan2(y, x);
  brng = rad2deg(brng);
  var anglea = Math.round((brng + 360) % 360);
  var angleb = Math.round((anglea - 180 + 360) % 360);

  document.getElementById("linkDistance").innerHTML = distance;
  document.getElementById("reportlinkdistance").innerHTML = distance;
  document.getElementById("azimuthA").innerHTML = anglea;
  document.getElementById("azimuthB").innerHTML = angleb;

  // fresneleirp();
}

// Function to populate the options into the channel frequency select query.
function populatefreq(s1, s2) {
  // document.getElementById("eirpvalue").value = "";
  var s1 = document.getElementById("channelBandwidth");
  var s2 = document.getElementById("channelFrequency");
  s2.innerHTML = "";
  if (s1.value == "20") {
    var optionarr = [
      "|Channel frequency",
      "5160 | 5160",
      "5180 | 5180",
      "5200 | 5200",
      "5220 | 5220",
      "5240 | 5240",
      "5735 | 5735",
      "5755 | 5755",
      "5775 | 5775",
      "5795 | 5795",
      "5815 | 5815",
      "5835 | 5835",
      "5855 | 5855",
    ];
  } else if (s1.value == "40") {
    var optionarr = [
      "|Channel frequency",
      "5170 | 5170",
      "5210 | 5210",
      "5745 | 5745",
      "5785 | 5785",
      "5825 | 5825",
    ];
  } else if (s1.value == "80") {
    var optionarr = ["|Channel frequency", "5190 | 5190", "5765 | 5765"];
  }
  for (var option in optionarr) {
    var pair = optionarr[option].split("|");
    var newoption = document.createElement("option");
    newoption.value = pair[0];
    newoption.innerHTML = pair[1];
    s2.options.add(newoption);
  }
}

document.getElementById("reportbtn").addEventListener("click", function () {
  document.querySelector(".popup").style.display = "block";
});

document.querySelector("#close-btn").addEventListener("click", function () {
  document.querySelector(".popup").style.display = "none";
});

// EIRP VALUE

// Function to calculate the eirp using the eirp referecne table
function fresneleirp() {
  var bndwdth = parseFloat(document.getElementById("channelBandwidth").value);
  var freq = parseFloat(document.getElementById("channelFrequency").value);
  document.getElementById("reportbandwidth").innerHTML = bndwdth;
  document.getElementById("reportfrequency").innerHTML = freq;

  // Calculating fresnel zone radius
  var distance = parseFloat(document.getElementById("linkDistance").innerHTML);
  var fres =
    Math.round(17.32 * Math.sqrt(distance / ((4 * freq) / 1000)) * 100) / 100;

  document.getElementById("fresnelRadius").innerHTML = fres;
  document.getElementById("reportfresradius").innerHTML = fres;

  if (bndwdth == 20) {
    console.log(fres);
    var eirptable = document.getElementById("eirp20MHz");
    var length = eirptable.rows.length;
    for (var i = 1; i < length; i++) {
      var cf = parseFloat(eirptable.rows[i].cells.item(0).innerHTML);
      var eirpval = parseFloat(eirptable.rows[i].cells.item(2).innerHTML);
      if (cf == freq) {
        console.log(cf, freq);
        document.getElementById("eirpMax").innerHTML = eirpval;
        break;
      } else {
        console.log("not matched", cf, freq);
      }
    }
  }
  if (bndwdth == 40) {
    var eirptable = document.getElementById("eirp40MHz");
    var length = eirptable.rows.length;
    for (var i = 1; i < length; i++) {
      var cf = eirptable.rows[i].cells.item(0).innerHTML;
      var eirpval = eirptable.rows[i].cells.item(2).innerHTML;
      if (cf == freq) {
        document.getElementById("eirpMax").innerHTML = eirpval;
        break;
      } else {
        continue;
      }
    }
  }
  if (bndwdth == 80) {
    var eirptable = document.getElementById("eirp80MHz");
    var length = eirptable.rows.length;
    for (var i = 1; i < length; i++) {
      var cf = eirptable.rows[i].cells.item(0).innerHTML;
      var eirpval = eirptable.rows[i].cells.item(2).innerHTML;
      if (cf == freq) {
        document.getElementById("eirpMax").innerHTML = eirpval;
        break;
      } else {
        continue;
      }
    }
  }
  deviceinfo();
}

// function to check the factor depending on the link distance
function disfactor() {
  var distance = parseFloat(document.getElementById("linkDistance").innerHTML);
  if (distance <= 2) {
    var distfac = 4;
  } else if (distance <= 3) {
    var distfac = 5;
  } else if (distance <= 5) {
    var distfac = 6;
  } else if (distance <= 8) {
    var distfac = 6;
  } else {
    var distfac = 8;
  }
  return parseFloat(distfac);
}

// A function which returns tx power and rx power based on the channel bandwidth

// A function to calculate RSL based on the radio selected by the user

function deviceinfo() {
  //   form.bandWidth.value = "";
  // resetTable();
  var dist = parseFloat(document.getElementById("linkDistance").innerHTML);
  var bandwidth = parseFloat(document.getElementById("channelBandwidth").value);
  var freq = parseFloat(document.getElementById("channelFrequency").value);
  var loss = parseInt(document.getElementById("cableLoss").value);
  var eirp = parseInt(document.getElementById("eirpMax").innerHTML);
  var value = document.getElementById("radio");
  var radio = value.options[value.selectedIndex].innerHTML;
  console.log(dist, bandwidth, freq, loss, eirp);
  var rsl;
  var distfactor = disfactor();
  console.log(distfactor);
  if (radio == "ion4l1_BTS") {
    var txgaina = 23;
    var txgainb = 23;
    var antgaina = 0;
    var antgainb = 0;
  } else if (radio == "ion4l2") {
    var txgaina = 23;
    var txgainb = 23;
    var antgaina = 11;
    var antgainb = 11;
  } else if (radio == "ion4l2_CPE") {
    var txgaina = 23;
    var txgainb = 23;
    var antgaina = 19;
    var antgainb = 19;
  } else if (radio == "ion4l3") {
    var antgaina = 25;
    var antgainb = 25;
    var txgaina = eirp - antgaina + loss;
    var txgainb = eirp - antgainb + loss;
    if (txgaina > 27) {
      txgaina = 27;
      txgainb = 27;
    } else {
    }
  } else if (radio == "ion4l3_CPE") {
    var antgaina = 25;
    var antgainb = 25;
    var txgaina = eirp - antgaina + loss;
    var txgainb = eirp - antgainb + loss;
    if (txgaina > 27) {
      txgaina = 27;
      txgainb = 27;
    } else {
    }
  } else if (radio == "ion4le") {
    var antgaina = 25;
    var antgainb = 25;
    var txgaina = eirp - antgaina + loss;
    var txgainb = eirp - antgainb + loss;
    if (txgaina > 27) {
      txgaina = 27;
      txgainb = 27;
    } else {
    }
  }

  if (bandwidth == 20) {
    var additional_loss = 0;
  } else if (bandwidth == 40) {
    var additional_loss = 2;
  } else if (bandwidth == 80) {
    var additional_loss = 3;
  }
  rsl =
    Math.round(
      (txgainb -
        additional_loss +
        antgaina +
        antgainb -
        loss * 2 -
        distfactor -
        (20 * Math.log10(dist) + 20 * Math.log10(freq / 1000) + 92.45)) *
        100
    ) / 100;

  // RSL populated at main page and report
  document.getElementById("rsl").innerHTML = rsl;
  document.getElementById("reportrsl").innerHTML = rsl;

  // Cable loss populated at report
  document.getElementById("reportloss").innerHTML = loss;

  // Antenna gain and transmit power populated at report
  document.getElementById("txA").innerHTML = txgaina;
  document.getElementById("txB").innerHTML = txgaina;
  document.getElementById("antGain").innerHTML = antgaina;

  selectTable();
}

// A function to calculate the link throughtput based on the bandwidth selected by the user

function selectTable() {
  var rsl = parseFloat(document.getElementById("rsl").innerHTML);
  var val = document.getElementById("channelBandwidth").value;
  var refertable;

  if (val == 20) {
    refertable = document.getElementById("throughput20MHz");
    var snr = Math.round((rsl + 92) * 100) / 100;
    var fademargin =
      Math.round((snr - refertable.rows[1].cells.item(0).innerHTML) * 100) /
      100;
  } else if (val == 40) {
    refertable = document.getElementById("throughput40MHz");
    var snr = Math.round((rsl + 90) * 100) / 100;
    var fademargin =
      Math.round((snr - refertable.rows[1].cells.item(0).innerHTML) * 100) /
      100;
  } else if (val == 80) {
    refertable = document.getElementById("throughput80MHz");
    var snr = Math.round((rsl + 90) * 100) / 100;
    var fademargin =
      Math.round((snr - refertable.rows[1].cells.item(0).innerHTML) * 100) /
      100;
  }
  document.getElementById("snr").innerHTML = snr;
  document.getElementById("reportsnr").innerHTML = snr;
  document.getElementById("fadeMargin").innerHTML = fademargin;
  var rowlength = refertable.rows.length;
  for (i = 1; i <= rowlength; i++) {
    var snr = parseFloat(document.getElementById("snr").innerHTML);
    var min = refertable.rows[i].cells.item(0).innerHTML;
    var max = refertable.rows[i].cells.item(1).innerHTML;
    if (snr >= min && snr <= max) {
      console.log("running");
      document.getElementById("mcs").innerHTML =
        refertable.rows[i].cells.item(2).innerHTML;
      document.getElementById("modulation").innerHTML =
        refertable.rows[i].cells.item(3).innerHTML;
      // form.fecA.value = refertable.rows[i].cells.item(4).innerHTML;
      // form.fecB.value = refertable.rows[i].cells.item(4).innerHTML;
      document.getElementById("linkRate").innerHTML =
        refertable.rows[i].cells.item(5).innerHTML;
      document.getElementById("throughput").innerHTML =
        refertable.rows[i].cells.item(6).innerHTML / 2;
      document.getElementById("reportthroughput").innerHTML =
        refertable.rows[i].cells.item(6).innerHTML / 2;
      break;
    } else if (snr < min) {
      break;
    } else {
      continue;
    }
  }
  availability();
}

// Function to calculate LINK AVAILABILITY
function availability() {
  var anthta = parseFloat(document.getElementById("aheight1").value);
  var anthtb = parseFloat(document.getElementById("aheight2").value);
  var min_antht = Math.min(anthta, anthtb);
  var linkdist = parseFloat(document.getElementById("linkDistance").innerHTML);
  var path_inclination = Math.abs((anthta - anthtb) / linkdist);
  var operating_frequency = 71.125;
  var flat_fade_margin = parseFloat(
    document.getElementById("fadeMargin").innerHTML
  );
  var geoclimatic_factor = 0.00003647539;
  var fading_occurance_factor =
    (geoclimatic_factor *
      linkdist ** 3.1 *
      (1 + path_inclination) ** -1.29 *
      operating_frequency ** 0.8 *
      10 ** (-0.00089 * min_antht - flat_fade_margin / 10)) /
    100;
  var fade_depth = 25 + 1.2 * Math.log10(fading_occurance_factor);
  var flat_fade_exceeded_in_WM = 1 - (1 - 2 * fading_occurance_factor);
  var link_availability_due_to_multipath = 1 - flat_fade_exceeded_in_WM;

  // To be deleted
  console.log(path_inclination);
  console.log(flat_fade_margin);
  console.log(fading_occurance_factor);
  console.log(fade_depth);
  console.log(flat_fade_exceeded_in_WM);
  console.log(link_availability_due_to_multipath);

  //  populating the link availability column with the value calculated
  document.getElementById("reportlinkAvailability").innerHTML =
    link_availability_due_to_multipath;
  document.getElementById("linkAvailability").innerHTML =
    link_availability_due_to_multipath;
}
