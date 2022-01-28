import express from "express";
import { EventEmitter } from "node:events";
import path from "node:path";
import { MutableState, State } from "../types";
import { addLiveReload } from "./live-reload.js";

const app = express();
const port = 8080;

addLiveReload(app);

const stateUpdate = Symbol("state update");
const stateEmitter = new EventEmitter();
let state: State = { active: false, browserFPS: false, clientsConnected: 0 };
const updateState = (nextState: State) => {
  state = nextState;
  stateEmitter.emit(stateUpdate);
};

app.use(express.json());
app.use(express.static("public"));
app.use("/js", express.static(path.join("built", "client")));

app.get("/state-updates", (req, res) => {
  updateState({ ...state, clientsConnected: state.clientsConnected + 1 });
  res.set({
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
  });
  res.flushHeaders();
  res.write("retry: 1000\n\n");
  res.write(`data: ${JSON.stringify(state)}\n\n`);

  const listener = () => {
    res.write(`data: ${JSON.stringify(state)}\n\n`);
  };
  stateEmitter.addListener(stateUpdate, listener);
  req.on("close", () => {
    updateState({ ...state, clientsConnected: state.clientsConnected - 1 });
    stateEmitter.removeListener(stateUpdate, listener);
  });
});

app.post("/state", (req, res) => {
  const nextState: MutableState = req.body;
  updateState({ ...nextState, clientsConnected: state.clientsConnected });
  res.send("ok");
});

app.get("/state", (req, res) => {
  res.json(state);
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
