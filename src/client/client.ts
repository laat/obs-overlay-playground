import type { State } from "../types";
import { handleBrowserFPS } from "./elements/browserFPS.js";

const source = new EventSource("/state-updates");
let activeTL = gsap.timeline();

const handleActive = (state: State) => {
  activeTL.kill();
  const tl = (activeTL = gsap.timeline());
  if (state.active) {
    tl.to(".box1", { rotation: 27, x: 100, duration: 0.5 })
      .to(".box2", { rotation: 50, x: 100, duration: 0.5 }, "<0.2")
      .to(".box3", { rotation: 90, x: 100, duration: 0.5 }, "<0.2");
  } else {
    gsap.to(".box", { rotation: 0, x: 0, duration: 0.5 });
  }
};

source.addEventListener("message", (message) => {
  const state = JSON.parse(message.data) as State;
  handleActive(state);
  handleBrowserFPS(state);
  console.log(state);
});
source.addEventListener("error", (event) => {
  console.error(event);
});

export {};
