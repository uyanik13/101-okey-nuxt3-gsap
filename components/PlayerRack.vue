<template>
  <div class="brightness-110">
    <div class="flex justify-between">
      <div class="flex flex-col">
        <div class="table-side items-center rounded-tl-lg">
          <span class="bg-black rounded-full w-1 h-1"></span>
        </div>
        <div
          class="bg-gradient-to-tl from-gray-100 to-gray-500 h-2 shadow-xl"
        ></div>
        <div class="table-side items-center">
          <span class="bg-black rounded-full w-1 h-1"></span>
        </div>
      </div>
      <!--CONTENT SECTION START -->
      <div class="flex flex-col justify-between w-full brightness-125">
        <div
          ref="tilesRef"
          id="tiles"
          class="flex flex-wrap tiles rack-bg border-t-2 border-b-2 border-gray-200 h-42 tiles"
        >
          <Tile
            v-for="(tile, index) in playerTiles"
            :key="index"
            :dataIndex="index"
            :number="tile.number"
            :color="tile.color"
          />
        </div>

        <div
          class="rack-bg w-full h-2 absolute top-20"
          style="box-shadow: inset 0 0 0 5px rgba(0, 0, 0, 0.2)"
        ></div>
      </div>
      <!--CONTENT SECTION END -->
      <div class="flex flex-col">
        <div class="table-side items-center rounded-tr-lg">
          <span class="bg-black rounded-full w-1 h-1"></span>
        </div>
        <div
          class="bg-gradient-to-tl from-gray-100 to-gray-500 h-2 shadow-xl"
        ></div>
        <div class="table-side items-center">
          <span class="bg-black rounded-full w-1 h-1"></span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onMounted } from "vue";
import tiles from "@/assets/fixtures/tiles-test.json";
import Tile from "@/components/Tile.vue";
import { useHelpers } from "~~/composables/useHelpers.js";
const { $gsap: gsap, $Draggable: Draggable } = useNuxtApp();
const {
  getFirstEmptyTileIndex,
  getLastEmptyTileIndex,
  getFirstEmptyNearTileIndex,
  getFindEmptTilesBetweenTargetAndTile,
} = useHelpers();

const playerTiles = ref(tiles);

const highlightedTarget = ref(null);
const tilesRef = ref(null);
const tileDivs = ref([]);

const onDrag = (tile, event) => {
  const target = findTargetTile(tile);
  addCustomStyle(target);
  if (target) {
    gsap.killTweensOf(tile);
  }
};

const addCustomStyle = (target) => {
  const newTarget = target.div;
  if (newTarget !== highlightedTarget.value) {
    if (highlightedTarget.value) {
      highlightedTarget.value.classList.remove("highlight");
    }
    highlightedTarget.value = newTarget;
    if (highlightedTarget.value) {
      highlightedTarget.value.classList.add("highlight");
    }
  }
};

const removeCustoms = () => {
  if (highlightedTarget.value) {
    highlightedTarget.value.classList.remove("highlight");
  }
};

const onPress = (tile) => {
  gsap.to(tile, { opacity: 0.75, scale: 0.95, duration: 0.3 });
};
const onRelease = (tile) => {
  gsap.to(tile, { opacity: 1, scale: 1 });
};

const onDragEnd = (tile, event) => {
  const target = findTargetTile(tile);
  if (target.index) {
    changePosition(tile, target);
    gsap.set(tile, {
      clearProps: "transform",
      zIndex: 1000,
    });
  } else {
    gsap.set(tile, {
      clearProps: "transform",
      zIndex: 1000,
    });
  }
  removeCustoms(tile);
};

const findTargetTile = (movedTile) => {
  let target = {
    item: false,
    div: null,
    index: null,
  };
  tileDivs.value.forEach((tile) => {
    if (tile !== movedTile) {
      const hitTestResult = Draggable.hitTest(movedTile, tile, "50%");
      if (hitTestResult) {
        target.item = true;
        target.div = tile;
        target.index = tile.dataset.index;
      }
    }
  });

  return target;
};

const changePosition = (tile, target) => {
  const tileIndex = parseInt(tile.dataset.index);
  const targetIndex = target.index;
  const targetTile = playerTiles.value[targetIndex];
  const movedElement = playerTiles.value[tileIndex];
  if (target.item && targetTile.number) {
    if (targetIndex < 15) {
      const firstEmptyTileIndex = getFirstEmptyTileIndex(
        playerTiles.value,
        "<"
      );

      if (firstEmptyTileIndex && tileIndex > 15) {
        //IF THERE IS AN EMPTY TILES ON UP SECTION TILE AREA  1 -> 5 - NULL - 4
        console.log("1");
        playerTiles.value.splice(firstEmptyTileIndex, 1);
        playerTiles.value.splice(targetIndex, 0, movedElement);
        playerTiles.value.splice(tileIndex, 1);
        playerTiles.value.splice(tileIndex, 0, { number: null, color: null });
      } else {
        //IF TILE MOVED IN UP SECTION BETWEEN TILES 2-3 | 3-2

        const emptyTiles = getFindEmptTilesBetweenTargetAndTile(playerTiles.value, targetIndex, tileIndex)

        if(emptyTiles.length){
          const firstNearEmptyTileIndex = getFirstEmptyNearTileIndex(
            playerTiles.value,
            targetIndex,
            "<"
          );

          if (firstNearEmptyTileIndex && firstNearEmptyTileIndex !== -1) {
            //integrate deleting empty from left or right
            console.log("2 -2 ");
            console.log("firstNearEmptyTileIndex", firstNearEmptyTileIndex);
            playerTiles.value.splice(firstNearEmptyTileIndex, 1); //REMOVE EMPTY FROM UP
            playerTiles.value.splice(targetIndex, 0, movedElement); //REMOVE target tile and drop tile
            playerTiles.value.splice(tileIndex, 1, {
              number: null,
              color: null,
            });
          }
        }else{
          console.log("2 -3 ");
          playerTiles.value.splice(tileIndex, 1);
          playerTiles.value.splice(targetIndex, 0, movedElement);
        }

        //console.log("2 -4 ");

       
      }
    } else {
      //THAT SECTION IS FINE
      const firstEmptyTileIndex = getFirstEmptyTileIndex(
        playerTiles.value,
        ">"
      );

      if (firstEmptyTileIndex && targetIndex > 15 && tileIndex < 15) {
        console.log("3");
        playerTiles.value.splice(firstEmptyTileIndex, 1);
        playerTiles.value.splice(targetIndex, 0, movedElement);
        playerTiles.value.splice(tileIndex, 1);
        playerTiles.value.splice(tileIndex, 0, { number: null, color: null });
      } else {
        const lastEmptyTileIndex = getLastEmptyTileIndex(
          playerTiles.value,
          "<"
        );
        if (targetIndex == 15 && tileIndex >= 16 && lastEmptyTileIndex) {
          console.log("4");
          playerTiles.value.splice(lastEmptyTileIndex, 1);
          playerTiles.value.splice(targetIndex, 0, movedElement);
          playerTiles.value.splice(tileIndex, 1);
          playerTiles.value.splice(tileIndex, 0, { number: null, color: null });
        } else {
          console.log("5");
          playerTiles.value.splice(tileIndex, 1);
          playerTiles.value.splice(targetIndex, 0, movedElement);
        }
      }
    }
  } else {
    console.log("6");
    // IF THE TILE IS MOVED TO EMPTY SECTION TILE AREA
    playerTiles.value[targetIndex] = movedElement;
    playerTiles.value[tileIndex] = { number: null, color: null };
  }

  // console.log("PLAYER_TILES", playerTiles.value);
  console.log("PLAYER_TILES_COUNT", playerTiles.value.length);
};

// watch(playerTiles.value, (newValue, oldValue) => {
//   if (newValue.length > 32) {
//     let lastElement = playerTiles.value[playerTiles.value.length - 1];
//     if (lastElement.number === null) {
//       //playerTiles.value.splice(playerTiles.value.length - 1, 1);
//     }
//   }
// });

onMounted(() => {
  tileDivs.value = tilesRef.value.querySelectorAll(".tile");
  tileDivs.value.forEach((tile) => {
    Draggable.create(tile, {
      bounds: ".game-area",
      type: "x,y",
      dragResistance: 0,
      activeCursor: "grabbing",
      onDrag: onDrag.bind(this, tile),
      onDragEnd: onDragEnd.bind(this, tile),
      onPress: onPress.bind(this, tile),
      onRelease: onRelease.bind(this, tile),
    });
  });
});
</script>

