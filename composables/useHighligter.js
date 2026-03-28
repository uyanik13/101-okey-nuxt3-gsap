export function useHighlighter() {
  const highlightedElement = ref(null);

  const highlight = (element) => {
    if (highlightedElement.value) {
      highlightedElement.value.classList.remove('highlight');
    }
    highlightedElement.value = element;
    if (element) {
      element.classList.add('highlight');
    }
  };

  const clearHighlight = () => {
    if (highlightedElement.value) {
      highlightedElement.value.classList.remove('highlight');
      highlightedElement.value = null;
    }
  };

  return {
    highlightedElement,
    highlight,
    clearHighlight,
  };
}