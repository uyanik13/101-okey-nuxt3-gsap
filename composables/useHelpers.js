export const useHelpers = () => {
  const ROW_SIZE = 16;
  const RACK_SIZE = 32;
  const EMPTY = { number: null, color: null };

  // --- Validation helpers ---
  const isSameNumberDifferentColors = (group) => {
    if (group.length < 3 || group.length > 4) return false;
    const sameNumber = group[0].number;
    const colors = group.map(t => t.color);
    const uniqueColors = new Set(colors);
    return group.every(t => t.number === sameNumber) && uniqueColors.size === group.length;
  };

  const isConsecutiveRun = (group) => {
    if (group.length < 3) return false;
    const firstColor = group[0].color;
    return group.every((tile, idx, arr) => {
      if (idx === 0) return true;
      return tile.color === firstColor && tile.number === arr[idx - 1].number + 1;
    });
  };

  const isValidGroup = (group) => {
    if (group.length < 3) return false;
    return isConsecutiveRun(group) || isSameNumberDifferentColors(group);
  };

  // --- Odd tiles scoring ---
  const getOddTiles = (tiles) => {
    const validTileGroups = [];
    const groupSums = [];

    for (let row = 0; row < 2; row++) {
      const rowStart = row * ROW_SIZE;
      const rowEnd = Math.min(rowStart + ROW_SIZE, tiles.length);
      const rowTiles = tiles.slice(rowStart, rowEnd);

      let currentGroup = [];
      for (let i = 0; i < rowTiles.length; i++) {
        const tile = rowTiles[i];
        if (tile.number == null) {
          if (currentGroup.length > 0 && isValidGroup(currentGroup)) {
            validTileGroups.push([...currentGroup]);
            groupSums.push(currentGroup.reduce((acc, t) => acc + t.number, 0));
          }
          currentGroup = [];
        } else {
          currentGroup.push(tile);
        }
      }
      if (currentGroup.length > 0 && isValidGroup(currentGroup)) {
        validTileGroups.push([...currentGroup]);
        groupSums.push(currentGroup.reduce((acc, t) => acc + t.number, 0));
      }
    }

    return {
      tiles: validTileGroups,
      totalSum: groupSums.reduce((acc, val) => acc + val, 0),
    };
  };

  // --- Sort by RUNS (Seri Diz) ---
  // Groups tiles by color, then finds consecutive runs (3+), places them in rack with empties between groups
  const sortByRuns = (tiles) => {
    const realTiles = tiles.filter(t => t.number != null);
    const jokers = realTiles.filter(t => t.isJoker);
    const normalTiles = realTiles.filter(t => !t.isJoker);

    // Group by color
    const byColor = {};
    normalTiles.forEach(t => {
      if (!byColor[t.color]) byColor[t.color] = [];
      byColor[t.color].push({ ...t });
    });

    const groups = [];
    const used = new Set();

    // For each color, find consecutive runs
    const colorOrder = ['black', 'red', 'blue', 'orange'];
    colorOrder.forEach(color => {
      const colorTiles = (byColor[color] || []).sort((a, b) => a.number - b.number);
      let run = [];
      for (let i = 0; i < colorTiles.length; i++) {
        const tile = colorTiles[i];
        if (run.length === 0) {
          run.push(tile);
        } else {
          const lastNum = run[run.length - 1].number;
          if (tile.number === lastNum + 1) {
            run.push(tile);
          } else if (tile.number === lastNum) {
            // Duplicate - skip for this run, will be leftover
            continue;
          } else {
            if (run.length >= 3) {
              groups.push([...run]);
              run.forEach(t => used.add(`${t.color}-${t.number}-${groups.length}`));
            }
            run = [tile];
          }
        }
      }
      if (run.length >= 3) {
        groups.push([...run]);
      }
    });

    // Collect leftover tiles (not in any run group)
    const usedInGroups = new Set();
    groups.forEach(group => {
      group.forEach(t => {
        // Mark one instance as used
        for (let i = 0; i < normalTiles.length; i++) {
          const key = `${i}`;
          if (!usedInGroups.has(key) && normalTiles[i].number === t.number && normalTiles[i].color === t.color) {
            usedInGroups.add(key);
            break;
          }
        }
      });
    });

    const leftovers = [];
    normalTiles.forEach((t, i) => {
      if (!usedInGroups.has(`${i}`)) {
        leftovers.push({ ...t });
      }
    });

    return buildRackFromGroups(groups, [...jokers, ...leftovers]);
  };

  // --- Sort by PAIRS/SETS (Çift Diz) ---
  // Groups tiles by number (same number, different colors), then places them in rack
  const sortByPairs = (tiles) => {
    const realTiles = tiles.filter(t => t.number != null);
    const jokers = realTiles.filter(t => t.isJoker);
    const normalTiles = realTiles.filter(t => !t.isJoker);

    // Group by number
    const byNumber = {};
    normalTiles.forEach(t => {
      if (!byNumber[t.number]) byNumber[t.number] = [];
      byNumber[t.number].push({ ...t });
    });

    const groups = [];
    const usedInGroups = new Set();

    // For each number, find sets of 3-4 different colors
    const numbers = Object.keys(byNumber).map(Number).sort((a, b) => a - b);
    numbers.forEach(num => {
      const numTiles = byNumber[num];
      // Get unique colors
      const uniqueByColor = [];
      const seenColors = new Set();
      numTiles.forEach((t, i) => {
        if (!seenColors.has(t.color)) {
          seenColors.add(t.color);
          uniqueByColor.push(t);
        }
      });

      if (uniqueByColor.length >= 3) {
        groups.push([...uniqueByColor]);
        uniqueByColor.forEach(t => {
          for (let i = 0; i < normalTiles.length; i++) {
            const key = `${i}`;
            if (!usedInGroups.has(key) && normalTiles[i].number === t.number && normalTiles[i].color === t.color) {
              usedInGroups.add(key);
              break;
            }
          }
        });
      }
    });

    const leftovers = [];
    normalTiles.forEach((t, i) => {
      if (!usedInGroups.has(`${i}`)) {
        leftovers.push({ ...t });
      }
    });

    return buildRackFromGroups(groups, [...jokers, ...leftovers]);
  };

  // Place groups into rack with empties separating them
  const buildRackFromGroups = (groups, leftovers) => {
    const result = [];

    groups.forEach((group, idx) => {
      group.forEach(t => result.push({ ...t }));
      // Add separator empty between groups
      if (idx < groups.length - 1 || leftovers.length > 0) {
        result.push({ ...EMPTY });
      }
    });

    // Add leftovers after a gap
    if (leftovers.length > 0) {
      // Sort leftovers by number
      leftovers.sort((a, b) => a.number - b.number);
      leftovers.forEach(t => result.push({ ...t }));
    }

    // Pad to RACK_SIZE
    while (result.length < RACK_SIZE) {
      result.push({ ...EMPTY });
    }

    // Truncate if somehow too long
    return result.slice(0, RACK_SIZE);
  };

  return {
    getOddTiles,
    sortByRuns,
    sortByPairs,
  };
};