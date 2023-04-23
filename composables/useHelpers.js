import {
  ref
} from 'vue';

export const useHelpers = () => {

  const getFirstEmptyTileIndex = (playerTiles, condition = '>') => playerTiles.findIndex((item, index) => {
    if (condition == '>') {
      return index > 15 && item.number == null;
    } else {
      return index < 15 && item.number == null;
    }
  });

  const getFirstEmptyNearTileIndex = (playerTiles, targetIndex = 0, condition = '>') => playerTiles.findIndex((item, index) => {
    if (condition == '>') {
      return index > 15 && index > targetIndex && item.number == null;
    } else {
      return index < 15 && index > targetIndex && item.number == null;
    }
  });

  const getFindEmptTilesBetweenTargetAndTile = (playerTiles, targetIndex = null, tileIndex = null) => {
      return playerTiles.filter((tile, index)=>{
          if (index > targetIndex && index < tileIndex || index < targetIndex && index > tileIndex ){
            return tile.number == null
          }
      })
  } 



  const getLastEmptyTileIndex = (playerTiles, condition = '>',) => {
    let filteredArr = null
    if(condition == '>'){
      filteredArr = playerTiles.filter((tile, index) => index > 15 && tile.number == null);
    }else{
      filteredArr = playerTiles.filter((tile, index) => index < 16 && tile.number == null);
    }
    
    const lastIndex =   playerTiles.lastIndexOf(filteredArr[filteredArr.length - 1]);
  
    return lastIndex;
  };
  
  


  return {
    getFirstEmptyTileIndex,
    getLastEmptyTileIndex,
    getFirstEmptyNearTileIndex,
    getFindEmptTilesBetweenTargetAndTile
  };
};