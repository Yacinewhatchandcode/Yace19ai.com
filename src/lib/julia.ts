export type JuliaSite = "yace19ai" | "prime-ai" | "amlazr";

export interface JuliaWindowSession {
  token: string;
  exp: number;
  ttl: number;
}

export interface JuliaToolHandlers {
  navigate: (input: { path: string }) => Promise<unknown>;
  scrollTo: (input: { selector: string }) => Promise<unknown>;
  highlight: (input: { selector: string }) => Promise<unknown>;
  click: (input: { selector: string }) => Promise<unknown>;
  fill: (input: { selector: string; value: string }) => Promise<unknown>;
  openConstellation: (input: Record<string, never>) => Promise<unknown>;
  switchSite: (input: { site: JuliaSite }) => Promise<unknown>;
}

export interface JuliaMountOptions {
  site: "yace19ai";
  container?: HTMLElement;
  tools?: JuliaToolHandlers;
  windowEndpoint?: string;
}

export interface JuliaInstance {
  root: unknown;
  getState: () => unknown;
  getSession: () => JuliaWindowSession | null | Promise<JuliaWindowSession | null>;
  runTool: (name: string, args: unknown) => Promise<unknown>;
  handoff: (targetWindow: Window, exactAllowedOrigin: string) => void | Promise<void>;
  open: () => void;
  unmount: () => void;
}

export interface JuliaConstellationInstance {
  root: unknown;
  open: () => void;
  close: () => void;
  unmount: () => void;
  currentSite: string;
  origin: string;
}

export interface PrimeJuliaApi {
  mount: (options: JuliaMountOptions) => JuliaInstance;
  mountConstellation: (options: { site: "yace19ai"; container?: HTMLElement }) => JuliaConstellationInstance;
}

declare global {
  interface Window {
    PrimeJulia?: PrimeJuliaApi;
  }
}

const embedUrl = import.meta.env.VITE_JULIA_EMBED_URL
  || (import.meta.env.PROD
    ? "https://prime-ai.fr/julia/embed.js"
    : "http://192.168.1.80:5176/julia/embed.js");
export const juliaWindowEndpoint = import.meta.env.VITE_JULIA_WINDOW_ENDPOINT
  || `${new URL(embedUrl).origin}/api/julia-window`;
const scriptTimeoutMs = 8000;

let runtimePromise: Promise<PrimeJuliaApi> | undefined;

export function loadJuliaRuntime(): Promise<PrimeJuliaApi> {
  if (window.PrimeJulia) return Promise.resolve(window.PrimeJulia);
  if (runtimePromise) return runtimePromise;

  runtimePromise = new Promise((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>("script[data-prime-julia]");
    let timeout = 0;
    if (!script) {
      script = document.createElement("script");
      script.src = embedUrl;
      script.type = "module";
      script.async = true;
      script.dataset.primeJulia = "true";
      document.head.append(script);
    }

    const fail = () => {
      window.clearTimeout(timeout);
      script?.remove();
      runtimePromise = undefined;
      reject(new Error(`Julia runtime could not be loaded from ${embedUrl}`));
    };
    const loaded = () => {
      window.clearTimeout(timeout);
      if (window.PrimeJulia) resolve(window.PrimeJulia);
      else fail();
    };
    timeout = window.setTimeout(fail, scriptTimeoutMs);
    script.addEventListener("error", fail, { once: true });
    script.addEventListener("load", loaded, { once: true });
  });

  return runtimePromise;
}
