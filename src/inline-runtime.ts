import assets, { scripts } from "virtual:vitality-assets";
const root = new URL(import.meta.env.BASE_URL, location.href);
const modules: Record<string, () => Promise<unknown>> = {};
function installEmbedded(assets, scripts, rootHref, modules = {}) {
const root = new URL(rootHref);
const own = (object: object, key: string) => Object.prototype.hasOwnProperty.call(object, key);
function key(value: string | URL, from = root.href) {
  let url;
  try { url = new URL(String(value), /^(?:blob|data):/.test(from) ? root.href : from); }
  catch { return undefined; }
  if (url.origin !== root.origin) return undefined;
  return decodeURIComponent(url.pathname.startsWith(root.pathname) ? url.pathname.slice(root.pathname.length) : url.pathname.replace(/^\//, ""));
}
const realFetch = globalThis.fetch.bind(globalThis);
const scriptURLs = new Map<string, string>();
globalThis.__vitalityEmbedded = {
  root: root.href,
  asset(name: string) { if (!own(assets, name)) throw new Error("Unknown embedded asset: " + name); return new URL(assets[name], root).href; },
  script(name: string) {
    if (!own(scripts, name)) throw new Error("Unknown embedded script: " + name);
    if (scripts[name].startsWith("url:")) return new URL(scripts[name].slice(4), root).href;
    if (!scriptURLs.has(name)) {
      const setup = "if(!globalThis.__vitalityEmbedded)(" + installEmbedded.toString() + ")(" + JSON.stringify(assets) + "," + JSON.stringify(scripts) + "," + JSON.stringify(root.href) + ");\n";
      scriptURLs.set(name, URL.createObjectURL(new Blob([setup, Uint8Array.from(atob(scripts[name]), c => c.charCodeAt(0))], {type: "text/javascript"})));
    }
    return scriptURLs.get(name)!;
  },
  import(value: string | URL, from: string, options?: object) {
    const name = key(value, from);
    return name && own(modules, name) ? modules[name]() : import(/* @vite-ignore */ new URL(String(value), from).href, options);
  },
};
globalThis.fetch = async (input, init) => {
  const request = new Request(input instanceof Request ? input : new URL(String(input), root.href), init);
  const name = key(request.url);
  if (name && own(assets, name) && (request.method === "GET" || request.method === "HEAD")) {
    const response = await realFetch(new URL(assets[name], root), { signal: request.signal });
    const result = request.method === "HEAD" ? new Response(null, { headers: response.headers }) : response;
    Object.defineProperty(result, "url", { value: request.url });
    return result;
  }
  return realFetch(request);
};
if (typeof globalThis.importScripts === "function") {
  const original = globalThis.importScripts.bind(globalThis);
  globalThis.importScripts = (...urls) => original(...urls.map(value => {
    const name = key(value);
    return name && own(scripts, name) ? globalThis.__vitalityEmbedded.script(name) : value;
  }));
}
if (typeof XMLHttpRequest !== "undefined") {
  const open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    const name = key(url);
    return open.call(this, method, name && own(assets, name) ? new URL(assets[name], root).href : url, ...args);
  };
}
}
installEmbedded(assets, scripts, root.href, modules);
