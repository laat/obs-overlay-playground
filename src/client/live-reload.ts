// simple live reload
const source = new EventSource("/live");
let errorState = false;

source.addEventListener("message", (message) => {
  if (errorState) {
    window.location.reload();
  } else if (message.data === "reload") {
    window.location.reload();
  }
});
source.addEventListener("error", () => {
  errorState = true;
});

export {};
