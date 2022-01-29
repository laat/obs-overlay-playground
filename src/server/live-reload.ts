import express from "express";
import chokidar from "chokidar";
import { EventEmitter } from "node:events";
import { useHttp2 } from "./utils/use-http2.js";

const reload = Symbol("reload");
const reloadEmitter = new EventEmitter();
chokidar.watch("public").on("all", () => {
  reloadEmitter.emit(reload);
});

export const addLiveReload = (app: express.Application) => {
  app.get("/live", (req, res) => {
    res.set({
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream",
    });
    if (!useHttp2) {
      res.set({ Connection: "keep-alive" });
    }
    res.flushHeaders();
    res.write("retry: 1000\n\n");
    res.write(`data: online\n\n`);

    const listener = () => {
      res.write(`data: reload\n\n`);
    };
    reloadEmitter.addListener(reload, listener);
    req.on("close", () => {
      reloadEmitter.removeListener(reload, listener);
    });
  });
};
