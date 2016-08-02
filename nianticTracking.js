//Here it is in JavaScript, but the algorithms are really simple to port over to Java

/*
***SOURCES FOR CODE AND INSPIRATION***

Haversine Distance: http://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates-shows-wrong
Bearing: http://www.igismap.com/formula-to-find-bearing-or-heading-angle-between-two-points-latitude-longitude/
Bearing Differences: http://stackoverflow.com/questions/24392062/finding-the-closest-difference-between-2-degrees-of-a-compass-javascript
*/

//First, get (or import as the case may be in Java) the nearby pokemon
var nearbyPokemon = GetNearbyPokemon();

//Next, get the current location
var currLoc = GetCurrentLocation();

//Set one step and two step distances in meters. Everything larger is three steps.
var oneStep = 50;
var twoStep = 100;

function convertDegreesToRadians(degrees){
  return degrees * (Math.PI/180);
}

function getDistanceAndDirection(coordinates1, coordinates2){
  var earthRadius = 6371;
  //GET DISTANCE
  //I presume coordinates are stored as objects with keys lat and lon

  var latitudeDistance = convertDegreesToRadians(coordinates2.lat - coordinates1.lat);
  var longitudeDistance = convertDegreesToRadians(coordinates2.lon - coordinates1.lon);

  var step1 = 
    //sin(latitude/2)^2 +
    Math.pow(Math.sin(latitudeDistance/2), 2) +
    //sin(longitude/2)^2 *
    Math.pow(Math.sin(longitudeDistance/2), 2) *
    //cos(latitude1) *
    Math.cos(coordinates1.lat) *
    //cos(latitude2);
    Math.cos(coordinates2.lat);

  var step2 = 
    //atan2 returns the arctangent of the quotient of the arguements
    2 * Math.atan2(Math.sqrt(step1), Math.sqrt(1 - step1));

  //step3 is distance in km
  var step3 = earthRadius * step2;
  //step4 is distance in meters
  var step4 = step3 * 1000;

  //GET HEADING
  var x = 
    //cos(latitude2) *
    Math.cos(coordinates2.lat) *
    //sin(longitude2 - longitude1)
    Math.sin(coordinates2.lon - coordinates1.lon);
  var y = 
    //cos(latitude1) * sin(latitude2) -
    Math.cos(coordinates1.lat) * Math.sin(coordinates2.lat) -
    //sin(latitude1) * cos(latitude2) *
    Math.sin(coordinates1.lat) * Math.cos(coordinates2.lat) *
    //cos(longitude2 - longitude1);
    Math.cos(coordinates2.lon - coordinates1.lon);
  //Put it all together and you get the bearing from north in degrees!
  var bearing = atan2(x, y);

  var returnObj = {
    distance: step3,
    direction: bearing
  }
  return returnObj;
}

//I presume the nearby pokemon are stored as an array of objects
//So now we simply iterate through the array
for(var i = 0; i < nearbyPokemon.length; i++){
  //I assume the coordinates of the pokemon is stored in a key called coordinates
  var disAndDir = getDistanceAndDirection(currLoc, nearbyPokemon[i].coordinates);
  //Here we can do all kinds of things
  if(disAndDir.distance < oneStep){
    nearbyPokemon[i].steps = 1;
  } else if(disAndDir.distance < twoStep){
    nearbyPokemon[i].steps = 2;
  } else {
    nearbyPokemon[i].steps = 3;
  }

  nearbyPokemon[i].bearing = disAndDir.direction;
  //Giving the exact bearing too precise? Give them cardinal directions!
  if(disAndDir.direction >= 337.5 && disAndDir.direction < 22.5){
    nearbyPokemon[i].bearing = 'N';
  } else if(disAndDir.direction >= 22.5 && disAndDir.direction < 67.5){
    nearbyPokemon[i].bearing = 'NE';
  } else if(disAndDir.direction >= 67.5 && disAndDir.direction < 112.5){
    nearbyPokemon[i].bearing = 'E';
  } else if(disAndDir.direction >= 112.5 && disAndDir.direction < 157.5){
    nearbyPokemon[i].bearing = 'SE';
  } else if(disAndDir.direction >= 157.5 && disAndDir.direction < 202.5){
    nearbyPokemon[i].bearing = 'S';
  } else if(disAndDir.direction >= 202.5 && disAndDir.direction < 247.5){
    nearbyPokemon[i].bearing = 'SW';
  } else if(disAndDir.direction >= 247.5 && disAndDir.direction < 292.5){
    nearbyPokemon[i].bearing = 'W';
  } else if(disAndDir.direction >= 292.5 && disAndDir.direction < 337.5){
    nearbyPokemon[i].bearing = 'NW';
  }
  //That still too much information? Just query their bearing vs pokemon bearing
  var playerBearing = GetPlayerCurrentBearing();
  //How close does their bearing have to be in degrees
  var accuracyRequired = 30;
  function bearingDifference(bearing1, bearing2){
    return (bearing2 - bearing1 + 540) % 360 - 180;
  }
  if(Math.abs(bearingDifference(playerBearing, disAndDir.direction)) < (accuracyRequired/2)){
    nearbyPokemon[i].flashing = true;
  }
}