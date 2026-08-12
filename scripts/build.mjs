import { cpSync, mkdirSync, rmSync } from "node:fs";

const out = new URL("../out/", import.meta.url);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(new URL("../index.html", import.meta.url), new URL("index.html", out));
cpSync(new URL("../style.css", import.meta.url), new URL("style.css", out));
cpSync(new URL("../public/", import.meta.url), out, { recursive: true });
