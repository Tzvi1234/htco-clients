/** Whether this browser can draw the 3D office; the list view is used otherwise. */
export function hasWebGL(): boolean {
  try {
    if (typeof WebGLRenderingContext === "undefined") return false;
    const canvas = document.createElement("canvas");
    return (canvas.getContext("webgl2") ?? canvas.getContext("webgl")) !== null;
  } catch {
    return false;
  }
}
