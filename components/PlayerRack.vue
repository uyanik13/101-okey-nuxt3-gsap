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
          >
            <Tile
              v-if="tile.number"
              :number="tile.number"
              :color="tile.color"
              @dragstart="dragStart(i, $event)" 
              @dragover.prevent 
              @dragenter="dragEnter"
              @dragleave="dragLeave" @dragend="dragEnd"
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
import { ref, computed, defineProps } from "vue";

const props = defineProps({
  tiles: Array,
});

const tiles = computed(() => {
  return props.tiles;
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
    draggedTileIndex = index
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

const moveAt = (event) => {
  if (!draggedTile) return;
  draggedTile.style.left = event.pageX - offsetX + "px";
  draggedTile.style.top = event.pageY - offsetY + "px";
};

const onDrop = (event) => {
  event.preventDefault();
  
  console.log(event)

  if (!draggedTile) return;

  const target = event.target.closest(".tile-container");


  if (!target) return;

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
    const sourceIndex = section1Tiles.value.findIndex(
      (tile) => tile === draggedTile
    );

    // Swap tiles
    [section1Tiles.value[sourceIndex], section1Tiles.value[targetIndex]] = [
      section1Tiles.value[targetIndex],
      section1Tiles.value[sourceIndex],
    ];

    // Move the dragged tile to the nearest tile container
    nearestDropArea.appendChild(draggedTile);
  }

  onMouseUp(event);
};

const onMouseUp = (event) => {
  if (!draggedTile) return;
  draggedTile.style.zIndex = "";
  draggedTile.classList.remove("dragging-active");
  draggedTile = null;

  const dropAreas = document.querySelectorAll(".tile-container");
  for (const dropArea of dropAreas) {
    dropArea.classList.remove("highlight");
  }
};

const  dragStart = (index, event) => {
  event.dataTransfer.setData('Text', index)
}


</script>
