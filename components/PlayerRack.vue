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
      <div
        ref="section1Ref"
        class="flex flex-col justify-between w-full brightness-125"
      >
        <div
          id="tiles"
          class="flex flex-wrap tiles rack-bg border-t-2 border-b-2 border-gray-200 h-42 tiles"
        >
          <div
            v-for="(tile, index) in section1Tiles"
            :key="index"
            class="tile-container flex w-14 h-20 border-dashed border-1 border-indigo-600"
            :data-index="index"
          >
          <!-- <Tile
              :number="tile.number"
              :color="tile.color"
              @dragover.prevent
              @drop="onDrop(i, $event)"
              @mousemove="onMouseMove($event)"
              @mousedown="onMouseDown($event, index)"
              @mouseup="onMouseUp($event, index)"
              draggable="true"
            /> -->
          </div>
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
import { ref, defineProps, computed } from "vue";
import tiles from "@/assets/fixtures/tiles.json";
import Tile from '@/components/Tile.vue'
import { defineComponent } from "vue";

// const props = defineProps({
//   tiles: Array,
// });

const section1Ref = ref(null);

const section1Tiles = ref([
  ...tiles,
  ...Array(11).fill({ number: null, color: null }),
]);

const targetTileIndex = ref(null);
const targetTile = computed(() => {
  if (targetTileIndex.value === null) {
    return null;
  }
  return section1Tiles.value[targetTileIndex.value];
});

const existingTileIndex = ref(null);
const existingTile = computed(()=> {
  if (existingTileIndex.value === null) {
    return null;
  }
  return section1Tiles.value[existingTileIndex.value];
})


let draggedTile = null;
let draggedTileData = null;
let offsetX = 0;
let offsetY = 0;

const onMouseDown = (event, index) => {
  event.preventDefault();
  if (!draggedTile) {
    draggedTileData = section1Tiles.value[index];
    draggedTile = event.target.closest(".tile");
    offsetX = event.clientX - draggedTile.getBoundingClientRect().left;
    offsetY = event.clientY - draggedTile.getBoundingClientRect().top;
    draggedTile.style.position = "absolute";
    draggedTile.style.zIndex = "1000";
    document.body.appendChild(draggedTile);
    moveAt(event);

    let tilesContainer = null;
    section1Ref.value.classList.add("dragging-active");
    tilesContainer = section1Ref.value.querySelector(".tile-container");
    tilesContainer.style.height = `${tilesContainer.offsetHeight}px`;
  }
};

const onMouseMove = (event) => {
  if (!draggedTile) return;
  moveAt(event, event);
  const dropAreas = document.querySelectorAll(".tile-container");

  let nearestDropArea = null;
  let minDistance = Number.MAX_VALUE;

  for (const dropArea of dropAreas) {
    if (!section1Ref.value.contains(dropArea)) {
      dropArea.classList.remove("highlight");
      continue;
    }

    const dropAreaRect = dropArea.getBoundingClientRect();
    const dropAreaCenterX = dropAreaRect.left + dropAreaRect.width / 2;
    const dropAreaCenterY = dropAreaRect.top + dropAreaRect.height / 2;
    const distance = Math.sqrt(
      Math.pow(event.clientX - dropAreaCenterX, 2) +
        Math.pow(event.clientY - dropAreaCenterY, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestDropArea = dropArea;
    }
  }

  for (const dropArea of dropAreas) {
    if (dropArea === nearestDropArea) {
      dropArea.classList.add("highlight");
    } else {
      dropArea.classList.remove("highlight");
    }
  }
};

const onMouseUp = (event, index) => {
  onDrop(event, index);
};

const onDrop = (event, index) => {
  event.preventDefault();

  if (!draggedTile) return;

  let nearestDropArea = null;
  let minDistance = Number.MAX_VALUE;
  const dropAreas = document.querySelectorAll(".tile-container");

  for (const dropArea of dropAreas) {
    if (!section1Ref.value.contains(dropArea)) continue;

    const dropAreaRect = dropArea.getBoundingClientRect();
    const dropAreaCenterX = dropAreaRect.left + dropAreaRect.width / 2;
    const dropAreaCenterY = dropAreaRect.top + dropAreaRect.height / 2;

    const distance = Math.sqrt(
      Math.pow(event.clientX - dropAreaCenterX, 2) +
        Math.pow(event.clientY - dropAreaCenterY, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestDropArea = dropArea;
    }
  }


  if (nearestDropArea) {
    targetTileIndex.value = parseInt(nearestDropArea.dataset.index);
    const sourceIndex = index;
    existingTile.value = nearestDropArea.querySelector(".tile");
    const sourceTile = section1Tiles.value[sourceIndex];


    console.log("TARGET_TILE:", targetTile.value);
    console.log("EXISTING_TILE:", existingTile.value);
    console.log("SOURCE_TILE:", sourceTile);
    console.log("SOURCE_INDEX:", sourceIndex);
    console.log("TARGET_INDEX:", targetTileIndex.value);
    console.log("DRAGGED_TILE:", draggedTileData);

    if (!existingTile.value ) {
      // IF NO EXISTING TILE AND EMPTY TILE CONTAINER
        if (!targetTile.value.number ) {
          swapTile(sourceIndex);
          nearestDropArea.appendChild(draggedTile);
          
          leaveTileOnLastPos();
          
        }else{
          console.log('2')
        }
        

      // else {
      //IF EXIST TILE AND HOLDED TILE CONTAINER
      // if (
      //   draggedTile.getBoundingClientRect().top >=
      //   existingTile.getBoundingClientRect().top
      // ) {
      //   leaveTileOnLastPos();
      //   return;
      // }

      // const nextEmptyContainer = findNextEmptyContainer(
      //   dropAreas,
      //   targetIndex,
      //   draggedTile,
      //   event.clientX
      // );
      // if (nextEmptyContainer) {
      //   // nextEmptyContainer.appendChild(draggedTile);
      //   //swapTile(sourceIndex, targetIndex);
      // }
    }
  }

  leaveTileOnLastPos();
};

const leaveTileOnLastPos = () => {
  if (!draggedTile) return;

  try {
    draggedTile.style.zIndex = "";
    draggedTile.classList.remove("dragging-active");
    draggedTile = null;

    const dropAreas = document.querySelectorAll(".tile-container");
    for (const dropArea of dropAreas) {
      dropArea.classList.remove("highlight");
    }
    
    //sourceTileContainer.appendChild('<span></span>');
  } catch (error) {
    console.error("Error in leaveTileOnLastPos function:", error);
  }
};

const swapTile = (sourceIndex) => {
  if (targetTileIndex.value === null) {
    console.warn("Target index is not set. Cannot swap tiles.");
    return;
  }
  [section1Tiles.value[sourceIndex], section1Tiles.value[targetTileIndex.value]] = [
    section1Tiles.value[targetTileIndex.value],
    section1Tiles.value[sourceIndex],
  ];
};

const findNextEmptyContainer = (dropAreas, index, existingTile, mouseX) => {
  const existingTileRect = existingTile.getBoundingClientRect();
  const existingTileCenterX =
    existingTileRect.left + existingTileRect.width / 2;

  // Check for empty container on the left side
  if (mouseX > existingTileCenterX) {
    for (let i = index - 1; i >= 0; i--) {
      const container = dropAreas[i];
      if (!container.querySelector(".tile")) {
        return container;
      }
    }
  }

  // Check for empty container on the right side
  if (mouseX <= existingTileCenterX) {
    for (let i = index + 1; i < dropAreas.length; i++) {
      const container = dropAreas[i];
      if (!container.querySelector(".tile")) {
        return container;
      }
    }
  }

  return null;
};





const moveAt = (event) => {
  if (!draggedTile) return;
  draggedTile.style.left = event.pageX - offsetX + "px";
  draggedTile.style.top = event.pageY - offsetY + "px";
};


</script>
