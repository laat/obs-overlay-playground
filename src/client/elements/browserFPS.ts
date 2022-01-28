import { State } from "../../types";

let showFPS = false;
const fps = document.createElement("div");
fps.classList.add("fps");
document.body.appendChild(fps);

const times: number[] = [];
function refreshLoop() {
  window.requestAnimationFrame(() => {
    const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
      times.shift();
    }
    times.push(now);
    fps.innerText = String(times.length);
    if (showFPS) {
      refreshLoop();
    }
  });
}
export const handleBrowserFPS = (state: State) => {
  if (state.browserFPS === showFPS) return;
  showFPS = state.browserFPS;
  if (state.browserFPS) {
    fps.classList.add("active");
    refreshLoop();
  } else {
    fps.classList.remove("active");
  }
};
