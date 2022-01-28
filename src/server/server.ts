import express from "express";
import livereload from "livereload";
import connectLiveReload from "connect-livereload";
import path from "node:path";
const app = express();
const port = 8080;

const liveReloadServer = livereload.createServer();
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

app.use(express.static("public"));
app.use("/js", express.static(path.join("built", "client")));

app.use(connectLiveReload());

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
