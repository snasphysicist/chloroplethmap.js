
//UI Elements
const INPUT_BOX = document.querySelector( ".heatmap-input" ) ;
const HEATMAP_DISPLAY = document.querySelector( "#heatmap-display" ) ;

//The map data
var mapData = new MapData() ;

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

/*
  * Takes the raw input data, parses in
  * then adds the data to the plotData
  */
function parseTextData( dataIn , plotData ) {
  //Local copy of the input data
  //to do whatever we want with
  let textData = String( dataIn ).replace( /\n/g , ";" ) ;
  //Indices of points of interest in data
  let startIndex, endIndex ;
  //Temporary postcode and associated values
  let subregionCode , value ;
  //While there is another entry
  while( textData.search( ";" ) > 0 ) {
    /*
      Everything before the first comma
      should be the regionCode for the
      current entry
    */
    startIndex = textData.search( "," ) ;
    subregionCode = textData.slice( 0 , startIndex ) ;
    /*
      Find the first number in the string
      which will be just after the first
      letters of the subregionCode
    */
    endIndex = locateFirstNumber( subregionCode ) ;
    //Get first letters of subregionCode
    if( endIndex !== 100 ) {
      subregionCode = subregionCode.slice( 0 , endIndex ) ;
    }
    /*
     * Convert it to upper case for
     * compatibility with inbuilt list
    */
    subregionCode = subregionCode.toUpperCase() ;
    //Next, find the first semicolon
    endIndex = textData.search( ";" ) ;
    //Up to this is the value we want
    //to add to this subregion
    value = textData.slice( startIndex+1 , endIndex ) ;
    //Add the value to the plotData
    plotData[ subregionCode ] += Number( value ) ;
    //Get rid of the region/value pair
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

function plotHeatMap() {

  //Create an object containing all of
  //the path and postcode data
  var mapData = new MapData ;

  //Create an object containing
  //all the colour map dataIn
  var colourMap = new ColourMap ;

  //The data that is to be plotted
  var plotData = new Object ;

  //Setup an object with all the postcodes
  //but zero values next to them
  setupPostcodes( plotData , mapData  ) ;

  //Grab the data from the input box
  var dataIn = INPUT_BOX.value ;

  //Add the values to the plot data
  parseTextData( dataIn , plotData ) ;

  var extrema = getMinimumMaximum( plotData ) ;

  //Rescale & get colours for each data point
  for ( var postcode in plotData ) {
    plotData[ postcode ] = ( plotData[ postcode ] - extrema[0] ) / ( extrema[1] - extrema[0] ) ;
    plotData[ postcode ] = [ plotData[ postcode ] ,
        colourMap.getInterpolatedColour( plotData[ postcode ] , "Heat Basic" ) ] ;
  }

  //Add paths to the SVG for each postcode
  for ( var postcode in plotData ) {
    //Create the new path element
    var addPath = document.createElementNS( "http://www.w3.org/2000/svg" , "path" ) ;
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
  subRegionCodes = mapData.getAllSubregionIdentifiers( REGION_SELECTOR.value ) ;
  for( key in subRegionCodes ) {
    subRegionCodes[ key ] = Math.random() ;
  }
  console.log( subRegionCodes ) ;
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
