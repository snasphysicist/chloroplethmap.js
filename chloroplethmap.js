
//UI Elements
const INPUT_BOX = document.querySelector( ".heatmap-input" ) ;
const HEATMAP_DISPLAY = document.querySelector( "#heatmap-display" ) ;

//The map data
var mapData = new MapData() ;

//The colour map data
var colourMap = new ColourMap() ;

//The current super region, global variable
var superRegion = "" ;

//A function to populate a plotData
//object with the right postcodes for the UK
//from a mapData object
function setupPostcodes( plotData , mapData ) {
  var postcodes = mapData.getAllSubregionIdentifiers( "UK" ) ;
  var len , i ;
  for( len = postcodes.length , i=0 ; i<len ; i++ ) {
    plotData[ postcodes[i] ] = 0 ;
  }
}

//Finds the first number in a text string
function locateFirstNumber( textString ) {
  var firstIndex = 100 ;
  var i , index ;
  for( i=0 ; i<10 ; i++ ) {
    index = textString.search( i.toString() ) ;
    if( index > 0 && index < firstIndex ) {
      firstIndex = index ;
    }
  }
  return firstIndex ;
}

//Takes the raw input data, parses in
//then adds the data to the plotData
function parseTextData( dataIn , plotData ) {
  //Local copy of the input data
  //to do whatever we want with
  var textData = String( dataIn ).replace( /\n/g , ";" ) ;
  //Indices of points of interest in data
  var startIndex, endIndex ;
  //Temporary postcode and associated values
  var postcode , value ;
  //While there is another entry
  while( textData.search( ";" ) > 0 ) {
    /*
      Everything before the first comma
      should be the postcode for the
      current entry
    */
    startIndex = textData.search( "," ) ;
    postcode = textData.slice( 0 , startIndex ) ;
    /*
      Find the first number in the string
      which will be just after the first
      letters of the postcode
    */
    endIndex = locateFirstNumber( postcode ) ;
    //Get first letters of postcode
    if( endIndex !== 100 ) {
      postcode = postcode.slice( 0 , endIndex ) ;
    }
    /*
      Convert it to upper case for
      compatibility with inbuilt list
    */
    postcode = postcode.toUpperCase() ;
    //Next, find the first semicolon
    endIndex = textData.search( ";" ) ;
    //Up to this is the value we want
    //to add to this postcode region
    value = textData.slice( startIndex+1 , endIndex ) ;
    //Add the value to the plotData
    plotData[ postcode ] += Number( value ) ;
    //Get rid of the postcode/value pair
    //that was just read in
    textData = textData.slice( endIndex+1 ) ;
  }

}

//Find the minimum and maximum values
//for a given object in format
//{ key1 : number1 , key2 : number2 , ... }
function getMinimumMaximum( object ) {
  var minimum = object[ Object.keys( object )[0] ] ;
  var maximum = object[ Object.keys( object )[0]  ] ;
  for ( entry in object ) {
    if ( object[ entry ] < minimum ) {
      minimum = object[ entry ] ;
    } else if ( object[ entry ] > maximum ) {
      maximum = object[ entry ] ;
    }
  }
  return [ minimum , maximum ] ;
}

//Takes in an array [ r , g , b ]
//and output a string that can be used
//in a fill attribute as a colour
function formatrgbString( rgbArray ) {
  var stringOut = "rgb(" ;
  stringOut += rgbArray[0] + "," ;
  stringOut += rgbArray[1] + "," ;
  stringOut += rgbArray[2] + ")" ;
  return stringOut ;
}

/*
 * Plot a chloropleth map based
 * on the values the user has input
 */
function plotUserChloroplethMap() {

  //Create an object containing all of
  //the path and postcode data
  let mapData = new MapData ;

  //Create an object containing
  //all the colour map dataIn
  let colourMap = new ColourMap ;

  //The data that is to be plotted
  let plotData = new Object ;

  //Setup an object with all the postcodes
  //but zero values next to them
  setupPostcodes( plotData , mapData ) ;

  //Grab the data from the input box
  let dataIn = INPUT_BOX.value ;

  //Add the values to the plot data
  parseTextData( dataIn , plotData ) ;

  let extrema = getMinimumMaximum( plotData ) ;

  //Rescale & get colours for each data point
  for ( let postcode in plotData ) {
    plotData[ postcode ] = ( plotData[ postcode ] - extrema[0] ) / ( extrema[1] - extrema[0] ) ;
    plotData[ postcode ] = [ plotData[ postcode ] ,
        colourMap.getInterpolatedColour( plotData[ postcode ] , "Heat Basic" ) ] ;
  }

  //Add paths to the SVG for each postcode
  for ( let postcode in plotData ) {
    //Create the new path element
    let addPath = document.createElementNS( "http://www.w3.org/2000/svg" , "path" ) ;
    //Get the id for this postcode's path
    addPath.setAttribute( "id" , mapData.getIdFromPostcode( postcode ) ) ;
    //Set the colours
    addPath.setAttribute( "stroke" , "black" ) ;
    addPath.setAttribute( "fill" , formatrgbString( plotData[ postcode ][1] ) ) ;
    //Set the points in the path from the map data
    addPath.setAttribute( "d" , mapData.getPointsFromPostcode( postcode ) ) ;

    //Push the new path into the SVG
    HEATMAP_DISPLAY.appendChild( addPath ) ;
  }

  //Make the thing re-render
  HEATMAP_DISPLAY.style.visibility = "hidden" ;
  HEATMAP_DISPLAY.style.visibility = "visible " ;

}

//Plot a chloropleth map with random data
function plotRandomChloroplethMap() {
  /*
   * For the selected superregion
   * Get a list of subregions
   * Get a random number 0 < r < 1
   * Create plotData object in
   * format described above plotChloroplethMap
   */
   //Set superregion in plotData
   let plotData = { "superregion" : superRegion } ;
   //Empty object, to contain regions and random values
   plotData[ "data" ] = {} ;
   //Get list of subregions
   let subRegions = mapData.getAllSubregionIdentifiers( superRegion ) ;
   //Add random value with subregion key in plotData
   for ( index in subRegions ) {
     plotData[ "data" ][ subRegions[ index ] ] = Math.random() ;
   }
   plotChloroplethMap( plotData ) ;
}

//A function to clear the current chloropleth map
function clearChloroplethMap() {
  HEATMAP_DISPLAY.innerHTML = "" ;
}

/*
 * Will plot a heat map based on the
 * values provided in the plotData
 * input object
 * Format: { "superregion" : string , "data" : object }
 * Where string is "US", "UK", etc...
 * object has format
 *    { subRegionCode1 : value1 ,
 *       subRegionCode2 : value2 , ... }
 */
function plotChloroplethMap( plotData ) {

  //Clear existing map
  clearChloroplethMap() ;

  let subRegionData = plotData[ "data" ] ;

  //Minimum and maximum values
  let extrema = getMinimumMaximum( subRegionData ) ;

  //Rescale & get colours for each data point
  for ( let subRegionCode in subRegionData ) {
    subRegionData[ subRegionCode ] = ( subRegionData[ subRegionCode ] - extrema[0] ) / ( extrema[1] - extrema[0] ) ;
    subRegionData[ subRegionCode ] = [ subRegionData[ subRegionCode ] ,
        colourMap.getInterpolatedColour( subRegionData[ subRegionCode ] , "Heat Basic" ) ] ;
  }

  /*
   * Add new paths to the SVG part of the page
   * for each subregion
   */
  for ( let subRegionCode in subRegionData ) {
    //Create the new path element
    let addPath = document.createElementNS( "http://www.w3.org/2000/svg" , "path" ) ;
    //Get the id for this postcode's path
    addPath.setAttribute( "id" , subRegionCode ) ;
    //Set the colours
    addPath.setAttribute( "stroke" , "black" ) ;
    addPath.setAttribute( "fill" , formatrgbString( subRegionData[ subRegionCode ][1] ) ) ;
    //Set the points in the path from the map data
    addPath.setAttribute( "d" , mapData.getRegionPath( superRegion , subRegionCode ) ) ;

    //Push the new path into the SVG
    HEATMAP_DISPLAY.appendChild( addPath ) ;
  }

  //Calculate and set the viewBox for the map SVG
  let viewBoxCoordinates = mapData.getBoundingBox( superRegion ) ;
  let viewBoxAttribute = String( viewBoxCoordinates[ 0 ][ 0 ] ) ;
  viewBoxAttribute += " " + viewBoxCoordinates[ 0 ][ 1 ] ;
  viewBoxAttribute += " " + ( viewBoxCoordinates[ 1 ][ 0 ] - viewBoxCoordinates[ 0 ][ 0 ] )  ;
  viewBoxAttribute += " " + ( viewBoxCoordinates[ 1 ][ 1 ] - viewBoxCoordinates[ 0 ][ 1 ] )  ;

  HEATMAP_DISPLAY.setAttribute( "viewBox" , viewBoxAttribute ) ;

  //Make the thing re-render
  //HEATMAP_DISPLAY.style.visibility = "hidden" ;
  //HEATMAP_DISPLAY.style.visibility = "visible " ;
}



/*

//Get input data from the input box
//var dataIn = "cb1 1gh,10;ab12lk,5;E11JK,1;" ;



//Colour data for each postcode plotted
var colourData = new Object ;



//Create an object containing
//all the colour map dataIn
var colourMap = new ColourMap ;

//Minimum and maximum values to be plotted
var minimumValue , maximumValue ;

//Used for an iterator
var postcode ;



//Take the input data and
//add the values to the plotData
parseTextData( dataIn , plotData ) ;

//Get the maximum and minimum values
//that will be plotted
maximumValue = 0 ;
for ( postcode in plotData ) {
  if( plotData[ postcode ] > maximumValue ) {
    maximumValue = plotData[ postcode ] ;
  }
}

minimumValue = maximumValue ;
for ( postcode in plotData ) {
  if( plotData[ postcode ] < minimumValue ) {
    minimumValue = plotData[ postcode ] ;
  }
}

//Get colours for each data point
for ( postcode in plotData ) {
  colourData[ postcode ] = colourMap.getInterpolatedColour( plotData[ postcode ] , minimumValue , maximumValue , "Heat Basic" ) ;
}

*/
