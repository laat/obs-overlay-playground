import type express from "express";
import { EventEmitter } from "node:events";
import { useHttp2 } from "./utils/use-http2.js";
const clientsConnectedEvent = Symbol("count update");
const clientsConnectedEmitter = new EventEmitter();
let clientsConnected = 0;

export const incClients = () => {
  clientsConnected++;
  clientsConnectedEmitter.emit(clientsConnectedEvent);
};

export const decClients = () => {
  clientsConnected--;
  clientsConnectedEmitter.emit(clientsConnectedEvent);
};

export const addClientCount = (app: express.Application) => {
  app.get("/client-count", (req, res) => {
    res.set({
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream",
    });
    if (!useHttp2) {
      res.set({ Connection: "keep-alive" });
    }
    res.flushHeaders();
    res.write("retry: 1000\n\n");
    res.write(`data: ${JSON.stringify(clientsConnected)}\n\n`);

    const listener = () => {
      res.write(`data: ${JSON.stringify(clientsConnected)}\n\n`);
    };
    clientsConnectedEmitter.addListener(clientsConnectedEvent, listener);
    req.on("close", () => {
      clientsConnectedEmitter.removeListener(clientsConnectedEvent, listener);
    });
  });
};
