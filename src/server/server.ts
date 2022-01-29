import http2 from "http2";
import express from "express";
import expressHttp2 from "http2-express-bridge";
import { EventEmitter } from "node:events";
import path from "node:path";
import fs from "node:fs/promises";
import { MutableState, State } from "../types";
import { addLiveReload } from "./live-reload.js";
import { useHttp2 } from "./utils/use-http2.js";
import { addClientCount, decClients, incClients } from "./client-count.js";

const app = expressHttp2(express);
const port = 8080;

addLiveReload(app);
addClientCount(app);

const stateUpdate = Symbol("state update");
const stateEmitter = new EventEmitter();
let state: State = { active: false, browserFPS: false };

const updateState = (nextState: State) => {
  state = nextState;
  stateEmitter.emit(stateUpdate);
};

app.use(express.json());
app.use(express.static("public"));
app.use("/js", express.static(path.join("built", "client")));

app.get("/state-updates", (req, res) => {
  incClients();
  res.set({
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
  });
  if (!useHttp2) {
    res.set({ Connection: "keep-alive" });
  }
  res.flushHeaders();
  res.write("retry: 1000\n\n");
  res.write(`data: ${JSON.stringify(state)}\n\n`);

  const listener = () => {
    res.write(`data: ${JSON.stringify(state)}\n\n`);
  };
  stateEmitter.addListener(stateUpdate, listener);
  req.on("close", () => {
    decClients();
    stateEmitter.removeListener(stateUpdate, listener);
  });
});

app.post("/state", (req, res) => {
  const nextState: MutableState = req.body;
  updateState(nextState);
  res.send("ok");
});

app.get("/state", (req, res) => {
  res.json(state);
});

if (useHttp2) {
  const options = {
    key: await fs.readFile("./localhost-key.pem"),
    cert: await fs.readFile("./localhost.pem"),
  };
  http2.createSecureServer(options, app).listen(port, () => {
    console.log(`Server started at https://localhost:${port}`);
  });
} else {
  app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
  });
}
