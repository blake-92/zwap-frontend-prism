import { ref, onMounted } from "vue";

export function usePerformanceMode() {
  const isPerformanceMode = ref(false);

  onMounted(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined")
      return;

    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const touchDevice = coarsePointer || navigator.maxTouchPoints > 0;
    const lowCpu = (navigator.hardwareConcurrency ?? 8) <= 4;
    const lowMemory = (navigator.deviceMemory ?? 8) <= 4;
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    isPerformanceMode.value =
      touchDevice && (reducedMotion || lowCpu || lowMemory || isIOS);
  });

  return isPerformanceMode;
}
