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
          <div
            ref="tileContainers"
            v-for="(tile, index) in section1Tiles"
            :key="index"
            class="tile-container"
            :data-index="index"
          >
            <Tile :number="tile.number" :color="tile.color" />
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
import { ref, defineProps, onMounted } from "vue";
import tiles from "@/assets/fixtures/tiles.json";
import Tile from "@/components/Tile.vue";
import { useOverlap } from '@/composables/useOverlap.js';
const { $gsap: gsap, $Draggable: Draggable } = useNuxtApp();
const { getOverlapRatio } = useOverlap();

const section1Tiles = ref([
  ...tiles,
  ...Array(11).fill({ number: null, color: null }),
]);

const tileContainers = ref([]);
const tilesRef = ref(null);
const highlightedTarget = ref(null);

const onDrag = (tile, event) => {
  addCustoms(tile);
  const target = findTargetContainer(tile);
  if (target) {
    gsap.killTweensOf(tile);
  }
};

const onPress = (tile) => {
  gsap.to(tile, { opacity: 0.75, scale: 0.95, duration: 0.3 });
};
const onRelease = (tile) => {
  gsap.to(tile, { opacity: 1, scale: 1 });
};

const onDragEnd = (tile, event) => {
  const target = findTargetContainer(tile);
  changePosIfHasTarget(tile, target);
  if (target) {
    changePosition(tile, target);
    gsap.set(tile, {
      clearProps: "transform",
      zIndex: 1000,
    });
  }
  removeCustoms(tile);
  reorderTiles();
};

const reorderTiles = () => {
  tileContainers.value.forEach((container) => {
    const tiles = Array.from(container.children).sort((a, b) => {
      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();
      return aRect.left - bRect.left;
    });
    tiles.forEach((tile) => container.appendChild(tile));
  });
};

const addCustoms = (tile) => {
  const newTarget = findTargetContainer(tile);
  if (newTarget !== highlightedTarget.value) {
    if (highlightedTarget.value) {
      highlightedTarget.value.classList.remove("highlight");
    }
    highlightedTarget.value = newTarget;
    if (highlightedTarget.value) {
      highlightedTarget.value.classList.add("highlight");
    }
  }
  tile.classList.add("dragging");
};

const removeCustoms = (tile) => {
  const target = findTargetContainer(tile);
  target.classList.remove("highlight");
  tile.classList.remove("dragging");
  highlightedTarget.value.classList.remove("highlight");
};

const findTargetContainer = (tile) => {
  let target = null;
  let maxOverlapRatio = 0;

  tileContainers.value.forEach((container) => {
    const overlapRatio = getOverlapRatio(tile, container);
    if (overlapRatio > maxOverlapRatio) {
      target = container;
      maxOverlapRatio = overlapRatio;
    }
  });

  if (maxOverlapRatio > 0.1) {
    return target;
  } else {
    return tile.parentElement;
  }
};


const changePosIfHasTarget = (tile1, target) => {

  if (target) {
    const tilesInTarget = Array.from(target.children);
    if (tilesInTarget.length) {
      const tile2 = tilesInTarget[tilesInTarget.length - 1];
      let tile1Index = tile1.dataset.index;
      let tile2Index = tile2.dataset.index;
      tile1.dataset.moved = "true";
      tile2.dataset.moved = "true";
      tile1Index > tile2Index ? tile2.after(tile1) : tile1.after(tile2);

      console.log(tile2)
      // Move the rest of the tiles
      for (let i = 1; i < tilesInTarget.length - 1; i++) {
        const tile = tilesInTarget[i];
      
        tile.dataset.moved = "true";
        tile1Index > tile2Index ? tile2.after(tile) : tile.before(tile2);
      }
    }
  }
};


const changePosition = (tile, zone) => {
  while (zone.firstChild) {
    zone.removeChild(zone.firstChild);
  }
  zone.appendChild(tile);
    gsap.to(tile, {
      keyframes: {
        x: [1, -1],
      },
      onComplete: function () {
        tile.style.transform = "";
        tile.style.rotate = "";
        tile.dataset.moved = "false";
      },
    });

};

onMounted(() => {
  const tiles = tilesRef.value.querySelectorAll(".tile");
  tiles.forEach((tile) => {
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
  tileContainers.value = Array.from(tileContainers.value);
});
</script>

