
//Add routine to generate heatmap
//to "Generate" button
const GENERATE_BUTTON = document.querySelector( ".heatmap-button" ) ;
GENERATE_BUTTON.addEventListener( "click" , plotHeatMap ) ;

//Add display overlay
//to copyright text at bottom
const COPYRIGHT_TEXT = document.querySelector( ".footer" ) ;
COPYRIGHT_TEXT.addEventListener( "click" , showModal ) ;

//Add hide overlay
//to whole page
const CLOSE_BUTTON = document.querySelector( ".close-button" ) ;
CLOSE_BUTTON.addEventListener( "click" , hideModal ) ;
