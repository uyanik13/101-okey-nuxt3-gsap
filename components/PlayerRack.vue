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
            <Tile
              v-if="tile.number"
              :number="tile.number"
              :color="tile.color"
              @dragover.prevent
              @drop="onDrop(i, $event)"
              @mousemove="onMouseMove($event)"
              @mousedown="onMouseDown($event, index)"
              @mouseup="onMouseUp($event, index)"
              draggable="true"
              :class="{ dragging: draggedTileIndex === index }"
            />
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
import { ref, defineProps } from "vue";

const props = defineProps({
  tiles: Array,
});

const section1Ref = ref(null);

const section1Tiles = ref([
  ...props.tiles.slice(0, 21),
  ...Array(11).fill({ number: null, color: null }),
]);

let draggedTile = null;
let draggedTileIndex = null;
let offsetX = 0;
let offsetY = 0;

const onMouseDown = (event, index) => {
  event.preventDefault();
  if (!draggedTile) {
    draggedTileIndex = index;
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

const onMouseUp = (event) => {
  onDrop(event);
};

const onDrop = (event) => {
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
    const targetIndex = parseInt(nearestDropArea.dataset.index);
    const sourceIndex = draggedTileIndex;
    const existingTile = nearestDropArea.querySelector(".tile");
    if (existingTile) {
      if (draggedTile.getBoundingClientRect().top >= existingTile.getBoundingClientRect().top) {
        // Dragged tile is already on top of another tile, return it to its original position
        leaveTileOnLastPos();
        return;
      }
      const nextEmptyContainer = findNextEmptyContainer(dropAreas, targetIndex, draggedTile, event.clientX);
      if (nextEmptyContainer) {
        // Move the existing tile to the next empty container
        nextEmptyContainer.appendChild(existingTile);
      } else {
        // No empty container found, return the dragged tile to its original position
        leaveTileOnLastPos();
        return;
      }
    }

    const targetTile = section1Tiles.value[targetIndex];
    if (targetTile.number || targetTile.color) {
      // There is already a tile in the target tile container, don't swap
      leaveTileOnLastPos();
      return;
    }

    // Swap tiles
    [section1Tiles.value[sourceIndex], section1Tiles.value[targetIndex]] = [
      section1Tiles.value[targetIndex],
      section1Tiles.value[sourceIndex],
    ];

    // Move the dragged tile to the nearest tile container
    nearestDropArea.appendChild(draggedTile);
  }

  leaveTileOnLastPos();
};


const findNextEmptyContainer = (dropAreas, index, existingTile, mouseX) => {
  const existingTileRect = existingTile.getBoundingClientRect();
  const existingTileCenterX = existingTileRect.left + existingTileRect.width / 2;

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

const leaveTileOnLastPos = () => {
  if (!draggedTile) return;
  draggedTile.style.zIndex = "";
  draggedTile.classList.remove("dragging-active");
  draggedTile = null;

  const dropAreas = document.querySelectorAll(".tile-container");
  for (const dropArea of dropAreas) {
    dropArea.classList.remove("highlight");
  }
};
</script>
