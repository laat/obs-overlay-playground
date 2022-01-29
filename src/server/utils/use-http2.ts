import fs from "node:fs/promises";
export const useHttp2 = await (async () => {
  try {
    await fs.stat("localhost.pem"); // use mkcert
    return true;
  } catch {
    return false;
  }
})();
