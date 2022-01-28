import type { MutableState, State } from "../types";
import { addListener } from "./helpers/midi-controls.js";
const { useEffect, useState } = React;

const postState = (state: MutableState) => {
  fetch("/state", {
    method: "POST",
    headers: { "Content-Type": "application/JSON" },
    body: JSON.stringify(state),
  });
};

const initialState = await (await fetch("/state")).json();

const App: React.FunctionComponent<{ initialState: State }> = ({
  initialState,
}) => {
  const [active, setActive] = useState(initialState.active);
  const [fps, setFPS] = useState(initialState.browserFPS);
  const toggleActive = () => setActive((value) => !value);
  const toggleFPS = () => setFPS((value) => !value);
  const notifyClients = () => postState({ active, browserFPS: fps });

  useEffect(() => notifyClients(), [active, fps]);
  useEffect(() => addListener(0x35, () => toggleActive()), []);
  useEffect(() => addListener(0x36, (e) => e === "on" && toggleFPS()), []);
  return (
    <>
      <div>clients: {initialState.clientsConnected}</div>
      <label>
        active
        <input type="checkbox" checked={active} onChange={toggleActive}></input>
      </label>
      <label>
        FPS
        <input type="checkbox" checked={fps} onChange={toggleFPS}></input>
      </label>
    </>
  );
};

window.ReactDOM.render(
  <App initialState={initialState}></App>,
  document.getElementById("root")
);
