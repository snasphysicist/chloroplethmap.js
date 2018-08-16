
/*
 * This file handles "initialisation"
 * for most things (currently)
 * Including binding events, setting up
 * list boxes dynamically, etc...
 */

//Add routine to generate heatmap
//to "Generate" button
const GENERATE_BUTTON = document.querySelector( "#generate-button" ) ;
GENERATE_BUTTON.addEventListener( "click" , plotUserChloroplethMap ) ;

//Add display overlay
//to copyright text at bottom
const COPYRIGHT_TEXT = document.querySelector( "#copyright-footer" ) ;
COPYRIGHT_TEXT.addEventListener( "click" , showModal ) ;

//Add hide overlay
//to whole page
const CLOSE_BUTTON = document.querySelector( "#close-button" ) ;
CLOSE_BUTTON.addEventListener( "click" , hideModal ) ;

/*
 * Set up the superregion options in the drop down box
 * i.e. UK/US/World/etc
 * note: Depends upon mapData variable from chloroplethmap.js
 */
const REGION_SELECTOR = document.querySelector( "#super-region-selector" ) ;

for( superRegion in mapData.getAllSuperregionIdentifiers() ) {
  //Create a new option element for each
  let newOption = document.createElement( "option" ) ;
  newOption.setAttribute( "value" , mapData.getAllSuperregionIdentifiers()[ superRegion ] ) ;
  newOption.innerHTML = mapData.getAllSuperregionIdentifiers()[ superRegion ] ;
  REGION_SELECTOR.appendChild( newOption ) ;
}

/*
 * Updates the value stored in the superRegion variable
 * (the currently selected superregion)
 * note: Depends on the superRegion varible from chloroplethmap.js
 * note: Depends on the plotRandomChloroplethMap function from chloroplethmap.js
 */
function updateSuperRegion() {
  superRegion = REGION_SELECTOR.value ;
  plotRandomChloroplethMap() ;
}
//Run it once to ensure that the variable has the default value1
updateSuperRegion() ;

//Run the function when the superregion selection changes
REGION_SELECTOR.addEventListener( "change" , updateSuperRegion ) ;
