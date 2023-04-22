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
import { ref, defineProps, onMounted } from "vue";
import tiles from "@/assets/fixtures/tiles.json";
import Tile from "@/components/Tile.vue";
import { useOverlap } from "@/composables/useOverlap.js";
import consolaGlobalInstance from "consola";
import { remove } from "@vue/shared";
const { $gsap: gsap, $Draggable: Draggable } = useNuxtApp();
const { getOverlapRatio } = useOverlap();

const playerTiles = ref([...tiles]);

const tilesRef = ref(null);
const tileDivs = ref([]);

const onDrag = (tile, event) => {
  const target = findTargetTile(tile);
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
};

const findTargetTile = (movedTile) => {
  let target = {
    item: false,
    index: null,
  };
  let foundTargetInHitTest = false;
  tileDivs.value.forEach((tile) => {
    if (tile !== movedTile) {
      const hitTestResult = Draggable.hitTest(movedTile, tile, "50%");
      if (hitTestResult) {
        target.item = true;
        target.index = tile.dataset.index;
        foundTargetInHitTest = true;
      }
    }
  });

  if (!foundTargetInHitTest) {
    let minDistance = Infinity;
    tileDivs.value.forEach((targetTile) => {
      if (targetTile !== movedTile) {
        const distance = calculateDistance(movedTile, targetTile);
        if (distance < minDistance) {
          target.item = true;
          target.index = targetTile.dataset.index;
          minDistance = distance;
        }
      }
    });
  }

  return target;
};

const calculateDistance = (element1, element2) => {
  const dx = element1.offsetLeft - element2.offsetLeft;
  const dy = element1.offsetTop - element2.offsetTop;
  return Math.sqrt(dx * dx + dy * dy);
};


const changePosition = (tile, target) => {
  console.log(target);
  const tileIndex = parseInt(tile.dataset.index);
  if (target.item) {
    const movedElement = playerTiles.value.splice(tileIndex, 1)[0];
    playerTiles.value.splice(target.index, 0, movedElement);
    gsap.to(tile, {
      duration: 1,
      x: 1,
      y: 0,
      onComplete: () => {
        gsap.set(tile, {
          x: 0,
          y: 0,
          zIndex: 1,
        });
      },
    });
  }
};

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

