import type { MutableState, State } from "../types";
import { addListener, midi } from "./helpers/midi-controls.js";
const { useEffect, useState } = React;

const postState = (state: MutableState) => {
  fetch("/state", {
    method: "POST",
    headers: { "Content-Type": "application/JSON" },
    body: JSON.stringify(state),
  });
};

const initialState = await (await fetch("/state")).json();

const ClientCount: React.FunctionComponent = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const source = new EventSource("/client-count");
    source.addEventListener("message", (message) =>
      setCount(JSON.parse(message.data))
    );
    source.addEventListener("error", (event) => {
      console.error(event);
      return () => {
        source.close();
      };
    });
  }, []);
  return <div>Client Count: {count}</div>;
};

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
      {midi ? <img src="/img/MIDI_LOGO.svg" height="20px"></img> : null}
      <ClientCount />
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
