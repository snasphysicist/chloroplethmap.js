
class ColourMap {

  constructor() {
    this.colourMaps = new Object ;
    this.colourMaps[ "Heat Basic" ] = [  [204,216,253] , [242,241,254] , [254,229,207] , [254,199,140] ,
                                        [254,164,73] , [254,123,0] , [253,74,0] , [254,0,0] ] ;
  }

  //0<=fraction<=1
  getInterpolatedColour( fraction , colourMapName ) {

    //Local copy of the colour map we are using
    var colourMap = this.colourMaps[ colourMapName ] ;

    /*
      Suppose we have L colour levels 0| b0 1| b1 2| b2 3| ...
      We need to know in which of L-1 brackets (bi) the f sits
      Special cases: f=0 -> b0
                        index below is 0
                     f=1 -> bL-2 || L-2 because it's zero indexed
                        index below is L-2
      So we take floor( f*(L-2) ) for lowerIndex
    */
    var lowerIndex = Math.floor( fraction*(colourMap.length-2) ) ;

    //Fractional distance from this level to next
    //Basically need decimal part of f*(L-2)
    //Get it by subtracting floor of it (=lowerIndex) from itself
    var remainder = (fraction*(colourMap.length-2)) - lowerIndex ;

    console.log( fraction + "   " + lowerIndex + "   " + remainder ) ;

    //RGB components to be returned
    var rgb = [] ;

    //For r, g, b calculate the component
    for( var i=0 ; i<3 ; i++ ) {
      rgb.push( colourMap[lowerIndex+1][i]*(1-remainder) + colourMap[lowerIndex][i]*remainder ) ;
    }
    return rgb ;
  }

}
