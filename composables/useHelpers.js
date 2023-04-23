import {
  useNuxtApp
} from '#app';

export const useHelpers = () => {

  const {
    $gsap: gsap,
    $Draggable: Draggable
  } = useNuxtApp();

  const getNearEmptyIndex = (playerTiles, targetIndex, tileIndex = null) => {
    let nearestIndex = -1;
    let nearestDistance = Infinity;

    if (!findEmptyTileBetween(playerTiles, tileIndex, targetIndex)) return null;

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
    if (targetIndex > tileIndex) {
      for (let i = tileIndex; i < targetIndex; i++) {
        if (playerTiles[i].number === null) {
          return true;
        }
      }
    } else {
      for (let i = targetIndex; i < tileIndex && i < playerTiles.length; i++) {
        if (playerTiles[i].number === null) {
          return true;
        }
      }
    }
    return false;
  };

  const animateTileSwap = (fromIndex, toIndex, tiles) => {
    const fromTile = tiles[fromIndex];
    const toTile = tiles[toIndex];

    const fromRect = fromTile.getBoundingClientRect();
    const toRect = toTile.getBoundingClientRect();

    const deltaX = toRect.left - fromRect.left;

    const duration = 0.1;

    gsap.to(fromTile, {
      x: deltaX,
      duration,
      rotation: 0,
      ease: "SlowMo",
      clearProps: 'transform'
    });
  };

  const getOddTiles = (tiles) => {
    let validTileGroups = [];
    let groupSums = [];
    let emptyTiles = []
    let startIndex = 0;

    const isSameNumberDifferentColors = (group) => {
      if (group.length < 3) return false;
      const sameNumber = group[0].number;
      return group.every(tile => tile.number === sameNumber);
    };

    const isValidGroup = (group) => {
      if (group.length < 3) return false;

      const isConsecutive = group.every((tile, idx, arr) => idx === 0 || (tile.color === arr[idx - 1].color && tile.number === arr[idx - 1].number + 1));

      const hasDifferentColors = group.some((tile, index, arr) => {
        if (index === 0) return false;
        return tile.color !== arr[index - 1].color;
      });

      if (hasDifferentColors) {
        return isSameNumberDifferentColors(group);
      }

      return isConsecutive;
    };

    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      if (tile.number === null) {
        emptyTiles.push(i)
      } else if (i === 15 && tile.number !== null) {
        emptyTiles.push(16)
      }
      if (i === 31 && tile.number !== null) {
        emptyTiles.push(32)
      }

    }


    for (let i = 0; i < emptyTiles.length; i++) {
      const endIndex = emptyTiles[i];
      const group = tiles.slice(startIndex, endIndex);

      if (group.length && isValidGroup(group)) {
        validTileGroups.push(group);
        groupSums.push(group.reduce((acc, tile) => acc + tile.number, 0));
      }
      if (endIndex === 16) {
        startIndex = 16
      } else {
        startIndex = emptyTiles[i] + 1
      }

    }

    let totalSum = groupSums.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    return {
      'tiles': validTileGroups,
      'totalSum': totalSum
    };
  };










  return {
    getNearEmptyIndex,
    animateTileSwap,
    getOddTiles,
  };
};