import { ref, watch, onMounted, onUnmounted } from "vue";

/**
 * Composable to make a modal draggable by its header.
 * Use the returned refs and handlers on the modal content div and its header.
 */
export function useDraggableModal() {
  const modalRef = ref<HTMLElement | null>(null);
  const pos = ref<{ x: number; y: number } | null>(null);
  const dragStart = ref<{ clientX: number; clientY: number; left: number; top: number } | null>(null);

  const modalStyle = ref<Record<string, string>>({
    position: "fixed",
    zIndex: "50",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
  });

  watch(
    pos,
    (p) => {
      if (p) {
        modalStyle.value = {
          position: "fixed",
          zIndex: "50",
          left: `${p.x}px`,
          top: `${p.y}px`,
          transform: "none",
        };
      } else {
        modalStyle.value = {
          position: "fixed",
          zIndex: "50",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        };
      }
    },
    { immediate: true },
  );

  function onHandleMouseDown(e: MouseEvent) {
    const el = modalRef.value;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragStart.value = {
      clientX: e.clientX,
      clientY: e.clientY,
      left: rect.left,
      top: rect.top,
    };
  }

  function onMouseMove(e: MouseEvent) {
    if (!dragStart.value) return;
    pos.value = {
      x: dragStart.value.left + (e.clientX - dragStart.value.clientX),
      y: dragStart.value.top + (e.clientY - dragStart.value.clientY),
    };
    dragStart.value = {
      clientX: e.clientX,
      clientY: e.clientY,
      left: pos.value.x,
      top: pos.value.y,
    };
  }

  function onMouseUp() {
    dragStart.value = null;
  }

  onMounted(() => {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  onUnmounted(() => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  });

  function resetPosition() {
    pos.value = null;
  }

  return {
    modalRef,
    modalStyle,
    onHandleMouseDown,
    resetPosition,
  };
}
