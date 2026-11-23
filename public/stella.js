/*
 * Stella · asistente virtual de LOCALIS AI
 * Instalación en cualquier web (antes de </body>):
 *   <script src="https://localis-ai-one.vercel.app/stella.js" data-negocio="ID-DEL-NEGOCIO" defer></script>
 * El chat se abre en un iframe aislado: no comparte cookies ni estilos con la web del cliente.
 */
(function () {
  var script = document.currentScript;
  if (!script || window.__stellaLoaded) return;
  window.__stellaLoaded = true;
  var negocio = script.getAttribute("data-negocio");
  if (!negocio || !/^[a-z0-9-]{2,40}$/.test(negocio)) {
    console.warn("[Stella] Falta data-negocio en la etiqueta <script>.");
    return;
  }
  var origin = new URL(script.src).origin;
  var color = script.getAttribute("data-color") || "#00C2D8";
  var open = false;
  var frame = null;

  var btn = document.createElement("button");
  btn.type = "button";
  btn.setAttribute("aria-label", "Abrir el chat con Stella, asistente virtual");
  btn.innerHTML =
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></svg>';
  btn.style.cssText =
    "position:fixed;right:20px;bottom:20px;z-index:2147483646;width:60px;height:60px;border:0;border-radius:999px;cursor:pointer;" +
    "display:flex;align-items:center;justify-content:center;color:#04121a;background:" + color + ";box-shadow:0 12px 32px -8px rgba(0,0,0,.45);";

  function toggle() {
    open = !open;
    if (!frame) {
      frame = document.createElement("iframe");
      frame.title = "Chat con Stella";
      frame.src = origin + "/stella/embed?negocio=" + encodeURIComponent(negocio);
      frame.setAttribute("loading", "lazy");
      var mobile = window.matchMedia("(max-width: 640px)").matches;
      frame.style.cssText =
        "position:fixed;z-index:2147483647;border:0;background:#0B0F17;box-shadow:0 30px 80px -20px rgba(0,0,0,.6);" +
        (mobile ? "inset:0;width:100%;height:100%;" : "right:20px;bottom:92px;width:390px;height:min(620px,calc(100vh - 120px));border-radius:24px;");
      document.body.appendChild(frame);
    }
    frame.style.display = open ? "block" : "none";
    btn.setAttribute("aria-expanded", String(open));
    if (window.matchMedia("(max-width: 640px)").matches) btn.style.display = open ? "none" : "flex";
  }
  btn.addEventListener("click", toggle);
  // El botón de cerrar del chat (dentro del iframe) pide cerrarlo.
  window.addEventListener("message", function (e) {
    if (e.origin === origin && e.data && e.data.type === "stella:close" && open) toggle();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && open) toggle();
  });
  function mount() {
    document.body.appendChild(btn);
  }
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
