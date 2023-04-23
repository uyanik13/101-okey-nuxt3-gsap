import {
  ref
} from 'vue';

export const useHelpers = () => {

  const getNearEmptyIndex = (playerTiles, targetIndex, tileIndex = null) => {
    let nearestIndex = -1;
    let nearestDistance = Infinity;

    if(!findEmptyTileBetween(playerTiles, tileIndex, targetIndex))return null;
  
    for (let i = 0; i < playerTiles.length; i++) {
      if (playerTiles[i].number === null) {
        const distance = Math.abs(targetIndex - i);
  
        if (distance < nearestDistance) {
          nearestIndex = i;
          nearestDistance = distance;
        }
      }
    }
  
    return nearestIndex === -1 ? null : nearestIndex;
  };
  
  const findEmptyTileBetween = (playerTiles, tileIndex, targetIndex) => {
    // console.log('TILE_INDEX', tileIndex)
    // console.log('TARGET_INDEX', targetIndex)
    if(targetIndex > tileIndex){
      for (let i = tileIndex + 1; i < targetIndex ; i++) {
        if (playerTiles[i].number === null) {
          return true;
        }
      }
    } else {
      for (let i = targetIndex + 1; i < tileIndex && i < playerTiles.length ; i++) {
        if (playerTiles[i].number === null) {
          return true;
        }
      }
    }
    return false;
  };
  
  
  




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
    getFindEmptTilesBetweenTargetAndTile,
    getNearEmptyIndex,
  };
};