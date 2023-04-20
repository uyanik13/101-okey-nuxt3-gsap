import { ref } from 'vue';

export const useOverlap = () => {
  const getIntersection = (element1, element2) => {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    const x1 = Math.max(rect1.x, rect2.x);
    const y1 = Math.max(rect1.y, rect2.y);
    const x2 = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
    const y2 = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);

    if (x2 >= x1 && y2 >= y1) {
      return {
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1,
      };
    } else {
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      };
    }
  };

  const getOverlapRatio = (element1, element2) => {
    const intersection = getIntersection(element1, element2);
    const area1 = element1.offsetWidth * element1.offsetHeight;
    const area2 = element2.offsetWidth * element2.offsetHeight;
    const overlapArea = intersection.width * intersection.height;
    const overlapRatio = overlapArea / (area1 + area2 - overlapArea);
    return overlapRatio;
  };

  return {
    getIntersection,
    getOverlapRatio,
  };
};
