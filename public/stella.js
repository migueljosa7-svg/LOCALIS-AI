/*
 * Stella · asistente virtual con IA de LOCALIS AI
 *
 * Instalación en la web del cliente (antes de </body>):
 *   <script src="https://localis-ai-one.vercel.app/stella.js" data-negocio="ID-DEL-NEGOCIO" defer></script>
 *
 * Atributos opcionales:
 *   data-color="#00C2D8"      color del botón
 *   data-position="right|left" lado de la pantalla (por defecto right)
 *   data-bottom="20"          separación inferior en px (útil si la web ya tiene una barra fija)
 *
 * Aislamiento: el botón vive en un Shadow DOM (los estilos de la web no le afectan ni él a ellos) y el
 * chat se abre en un iframe de nuestro dominio (sin acceso a la página ni a sus cookies). El iframe solo
 * se carga al abrir el chat, así que no ralentiza la web. Solo funciona en los dominios autorizados.
 */
(function () {
  "use strict";
  var script = document.currentScript;
  if (!script || window.__stellaLoaded) return;
  var negocio = script.getAttribute("data-negocio");
  if (!negocio || !/^[a-z0-9-]{2,40}$/.test(negocio)) {
    console.warn("[Stella] Falta un data-negocio válido en la etiqueta <script>.");
    return;
  }
  var origin;
  try {
    origin = new URL(script.src).origin;
  } catch (e) {
    return;
  }
  window.__stellaLoaded = true;

  var colorAttr = script.getAttribute("data-color") || "";
  var color = /^#[0-9a-fA-F]{3,8}$/.test(colorAttr) ? colorAttr : "#00C2D8";
  var side = script.getAttribute("data-position") === "left" ? "left" : "right";
  var bottomAttr = parseInt(script.getAttribute("data-bottom") || "20", 10);
  var bottom = isFinite(bottomAttr) && bottomAttr >= 0 && bottomAttr <= 400 ? bottomAttr : 20;

  var open = false;
  var frame = null;
  var host, root, btn, panel;

  function build() {
    if (!document.body || host) return;
    host = document.createElement("div");
    host.setAttribute("data-stella", "");
    host.style.cssText = "all:initial;position:static;";
    root = host.attachShadow({ mode: "open" });
    var style = document.createElement("style");
    style.textContent =
      ":host{all:initial}" +
      "button{all:unset;box-sizing:border-box;cursor:pointer;position:fixed;" + side + ":16px;bottom:calc(" + bottom + "px + env(safe-area-inset-bottom,0px));" +
      "z-index:2147483646;width:60px;height:60px;border-radius:999px;display:flex;align-items:center;justify-content:center;" +
      "background:" + color + ";color:#04121a;box-shadow:0 12px 32px -8px rgba(0,0,0,.45);transition:transform .15s ease}" +
      "button:hover{transform:translateY(-2px)}" +
      "button:focus-visible{outline:3px solid #fff;outline-offset:3px;box-shadow:0 0 0 6px #0B0F17}" +
      "@media (prefers-reduced-motion:reduce){button{transition:none}button:hover{transform:none}}" +
      ".panel{position:fixed;z-index:2147483647;display:none;overflow:hidden;background:#0B0F17;" +
      "box-shadow:0 30px 80px -20px rgba(0,0,0,.6);inset:0;width:100%;height:100%;border-radius:0}" +
      ".panel[data-open='1']{display:block}" +
      "iframe{border:0;width:100%;height:100%;display:block;background:#0B0F17}" +
      "@media (min-width:641px){.panel{inset:auto;" + side + ":16px;bottom:calc(" + (bottom + 72) + "px + env(safe-area-inset-bottom,0px));" +
      "width:390px;max-width:calc(100vw - 32px);height:620px;max-height:calc(100vh - " + (bottom + 96) + "px);border-radius:24px}}" +
      "@media (max-width:640px){button[aria-expanded='true']{display:none}}";

    btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", "Abrir el chat con Stella, asistente virtual con IA");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "stella-panel");
    btn.innerHTML =
      '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></svg>';

    panel = document.createElement("div");
    panel.id = "stella-panel";
    panel.className = "panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Chat con Stella");

    root.appendChild(style);
    root.appendChild(btn);
    root.appendChild(panel);
    document.body.appendChild(host);

    btn.addEventListener("click", toggle);
    // Precalienta la conexión cuando la persona se acerca al botón.
    var warmed = false;
    function warm() {
      if (warmed) return;
      warmed = true;
      var l = document.createElement("link");
      l.rel = "preconnect";
      l.href = origin;
      document.head.appendChild(l);
    }
    btn.addEventListener("mouseenter", warm);
    btn.addEventListener("focus", warm);
    btn.addEventListener("touchstart", warm, { passive: true });
  }

  function toggle() {
    open = !open;
    if (open && !frame) {
      frame = document.createElement("iframe");
      frame.title = "Chat con Stella";
      frame.src = origin + "/stella/embed?negocio=" + encodeURIComponent(negocio);
      frame.setAttribute("referrerpolicy", "origin"); // el servidor comprueba desde qué web se carga
      frame.setAttribute("allow", "");
      panel.appendChild(frame);
    }
    panel.setAttribute("data-open", open ? "1" : "0");
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Cerrar el chat con Stella" : "Abrir el chat con Stella, asistente virtual con IA");
    if (open && frame) {
      try {
        frame.focus();
      } catch (e) {}
    } else if (!open) {
      try {
        btn.focus();
      } catch (e) {}
    }
  }

  // El botón «cerrar» del chat (dentro del iframe) pide cerrarlo. Solo se acepta nuestro origen.
  window.addEventListener("message", function (e) {
    if (e.origin === origin && e.data && e.data.type === "stella:close" && open) toggle();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && open) toggle();
  });

  if (document.body) build();
  else document.addEventListener("DOMContentLoaded", build);
})();
