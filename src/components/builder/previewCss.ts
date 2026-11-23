// Estilos de la vista previa. Se aplican dentro de un contenedor (container query), así el diseño responde al
// ANCHO DEL DISPOSITIVO simulado (ordenador, tablet, móvil) y no al de la ventana del editor.
export const PREVIEW_CSS = `
.bp{container-type:inline-size;container-name:bp;background:var(--c-bg);color:var(--c-text);font-family:var(--fb);font-size:var(--fs);line-height:1.6;position:relative;min-height:100%}
.bp *{box-sizing:border-box}
.bp{overflow-x:clip;overflow-wrap:break-word}
.bp h1,.bp h2,.bp h3{font-family:var(--fh);font-weight:var(--fw);line-height:1.12;margin:0;letter-spacing:-.01em}
.bp h1{font-size:calc(var(--h1) * 1px)}
.bp h2{font-size:calc(var(--h1) * .62px)}
.bp h3{font-size:calc(var(--fs) * 1.25)}
.bp p{margin:0}
.bp a{color:inherit}
.bp img{display:block;max-width:100%}
.bp .wrap{max-width:1080px;margin:0 auto;padding:0 28px}
.bp section{padding:64px 0}
.bp .muted{opacity:.72}
.bp .tag{display:inline-block;font-size:11px;letter-spacing:.06em;text-transform:uppercase;padding:2px 8px;border-radius:99px;background:color-mix(in srgb,var(--c-primary) 14%,transparent);color:var(--c-primary)}
.bp .ex{outline:1.5px dashed color-mix(in srgb,var(--c-text) 28%,transparent);outline-offset:6px}

/* Botones */
.bp .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:10px 20px;font:inherit;font-weight:600;cursor:pointer;border:2px solid var(--bc);background:var(--bc);color:var(--on-bc);text-decoration:none;transition:transform .15s ease,filter .15s ease}
.bp .btn:hover{filter:brightness(1.07);transform:translateY(-1px)}
.bp .btn:focus-visible{outline:3px solid var(--c-text);outline-offset:2px}
.bp .btn.s-contorno{background:transparent;color:var(--bc)}
.bp .btn.s-suave{background:color-mix(in srgb,var(--bc) 16%,transparent);color:var(--bc);border-color:transparent}
.bp .btn.s-texto{background:transparent;border-color:transparent;color:var(--bc);text-decoration:underline;text-underline-offset:4px;padding-inline:8px}
.bp .btn.sh-cuadrado{border-radius:0}
.bp .btn.sh-redondeado{border-radius:var(--r)}
.bp .btn.sh-pildora{border-radius:999px}
.bp .btn.pend{border-style:dashed;opacity:.85}
.bp .btns{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}
.bp .btns.row-center{justify-content:center}
.bp .strip{padding:28px 0;text-align:center}

/* Cabecera */
.bp .hd{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--c-bg) 92%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid color-mix(in srgb,var(--c-text) 10%,transparent)}
.bp .hd .wrap{display:flex;align-items:center;gap:20px;min-height:68px;flex-wrap:wrap}
.bp .brand{font-family:var(--fh);font-weight:var(--fw);font-size:1.25em;display:flex;align-items:center;gap:10px;text-decoration:none}
.bp .brand img{height:34px;width:auto;border-radius:6px}
.bp .nav{display:flex;flex-wrap:wrap;gap:6px 20px;margin-left:auto;align-items:center;min-width:0}
.bp .nav a{text-decoration:none;opacity:.8;cursor:pointer;font-size:.92em}
.bp .nav a:hover{opacity:1;color:var(--c-primary)}
.bp .hd-actions{display:flex;gap:10px;align-items:center}
.bp .burger{display:none;margin-left:auto;min-width:44px;min-height:44px;border-radius:10px;border:1px solid color-mix(in srgb,var(--c-text) 22%,transparent);background:transparent;color:inherit;font-size:20px;cursor:pointer}
.bp .hd.h-centrada .wrap{flex-direction:column;gap:8px;padding-block:12px}
.bp .hd.h-centrada .nav{margin:0}
.bp .hd.h-dividida .wrap{display:grid;grid-template-columns:1fr auto 1fr}
.bp .hd.h-dividida .nav{margin:0}
.bp .hd.h-dividida .hd-actions{justify-content:flex-end}
.bp .hd.h-minima .nav{display:none}
.bp .hd.h-minima .burger{display:inline-flex;align-items:center;justify-content:center}
.bp .menu{display:none;border-top:1px solid color-mix(in srgb,var(--c-text) 10%,transparent);padding:10px 28px 16px}
.bp .menu a{display:block;padding:12px 0;text-decoration:none;cursor:pointer}
.bp .menu.open{display:block}

/* Portada */
.bp .hero{padding:72px 0}
.bp .hero .lead{font-size:1.12em;max-width:56ch;margin-top:18px;opacity:.85}
.bp .hero.l-dividida .wrap{display:grid;grid-template-columns:1.1fr 1fr;gap:44px;align-items:center}
.bp .hero .pic{aspect-ratio:4/3;border-radius:var(--r);overflow:hidden;background:color-mix(in srgb,var(--c-text) 8%,transparent)}
.bp .hero .pic img{width:100%;height:100%;object-fit:cover}
.bp .hero.l-centrada .wrap{text-align:center}
.bp .hero.l-centrada .lead{margin-inline:auto}
.bp .hero.l-centrada .btns{justify-content:center}
.bp .hero.l-centrada .pic{margin-top:40px;aspect-ratio:16/7}
.bp .hero.l-imagen{position:relative;color:#fff;padding:120px 0;background-size:cover;background-position:center}
.bp .hero.l-imagen::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.45),rgba(0,0,0,.65))}
.bp .hero.l-imagen .wrap{position:relative;text-align:center}
.bp .hero.l-imagen .lead{margin-inline:auto}
.bp .hero.l-imagen .btns{justify-content:center}

/* Tarjetas */
.bp .head{margin-bottom:32px}
.bp .head p{margin-top:8px;opacity:.75;max-width:60ch}
.bp .grid{display:grid;gap:20px;grid-template-columns:repeat(3,1fr)}
.bp .card{background:var(--c-card);border:1px solid color-mix(in srgb,var(--c-text) 9%,transparent);border-radius:var(--r);padding:24px;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.bp .card .price{color:var(--c-primary);font-weight:700;margin-top:6px}
.bp .card p{opacity:.78;margin-top:6px}
.bp .ico{width:44px;height:44px;border-radius:calc(var(--r) * .7);background:color-mix(in srgb,var(--c-primary) 16%,transparent);color:var(--c-primary);display:flex;align-items:center;justify-content:center;font-weight:800;margin-bottom:14px}
.bp .prod img{aspect-ratio:4/3;object-fit:cover;width:100%;border-radius:calc(var(--r) * .7);margin-bottom:14px}

/* Galería */
.bp .gal{display:grid;gap:12px}
.bp .gal img{width:100%;height:100%;object-fit:cover;border-radius:calc(var(--r) * .8)}
.bp .gal.g-cuadricula{grid-template-columns:repeat(4,1fr)}
.bp .gal.g-cuadricula img{aspect-ratio:1}
.bp .gal.g-mosaico{grid-template-columns:repeat(4,1fr);grid-auto-rows:150px}
.bp .gal.g-mosaico img:first-child{grid-column:span 2;grid-row:span 2}
.bp .gal.g-columnas{display:block;column-count:3;column-gap:12px}
.bp .gal.g-columnas img{margin-bottom:12px;height:auto;break-inside:avoid}
.bp .empty{padding:40px;text-align:center;border:2px dashed color-mix(in srgb,var(--c-text) 24%,transparent);border-radius:var(--r);opacity:.7}

/* Carrusel */
.bp .car{position:relative}
.bp .car .view{overflow:hidden;border-radius:var(--r);background:color-mix(in srgb,var(--c-text) 8%,transparent)}
.bp .car .track{display:flex;transition:transform .5s ease}
.bp .car .slide{flex:0 0 100%;aspect-ratio:16/8}
.bp .car .slide img{width:100%;height:100%;object-fit:cover}
.bp .car.c-fundido .view{position:relative;aspect-ratio:16/8}
.bp .car.c-fundido .slide{position:absolute;inset:0;opacity:0;transition:opacity .6s ease;aspect-ratio:auto}
.bp .car.c-fundido .slide.on{opacity:1}
.bp .car.c-tarjetas .view{background:none;border-radius:0;overflow:visible}
.bp .car.c-tarjetas .track{gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;transition:none;padding-bottom:4px}
.bp .car.c-tarjetas .slide{flex:0 0 calc((100% - 32px)/3);scroll-snap-align:start;aspect-ratio:4/3;border-radius:var(--r);overflow:hidden}
.bp .car .nb{position:absolute;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:50%;border:0;background:rgba(0,0,0,.55);color:#fff;font-size:20px;cursor:pointer;z-index:2}
.bp .car .nb.prev{left:10px}.bp .car .nb.next{right:10px}
.bp .car .dots{display:flex;gap:8px;justify-content:center;margin-top:14px}
.bp .car .dots button{width:12px;height:12px;padding:0;border-radius:50%;border:0;background:color-mix(in srgb,var(--c-text) 25%,transparent);cursor:pointer}
.bp .car .dots button[aria-current="true"]{background:var(--c-primary);width:28px;border-radius:99px}
.bp .car .thumbs{display:flex;gap:10px;margin-top:12px;overflow-x:auto}
.bp .car .thumbs button{flex:0 0 84px;padding:0;border:2px solid transparent;border-radius:calc(var(--r) * .6);overflow:hidden;cursor:pointer;background:none;opacity:.6}
.bp .car .thumbs button[aria-current="true"]{border-color:var(--c-primary);opacity:1}
.bp .car .thumbs img{width:100%;aspect-ratio:4/3;object-fit:cover}

/* Equipo, opiniones, FAQ, ubicación, contacto, pie */
.bp .avatar{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--c-primary),var(--c-secondary));color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.3em;margin-bottom:12px}
.bp .quote{font-size:1.05em;font-style:italic}
.bp .faq details{background:var(--c-card);border:1px solid color-mix(in srgb,var(--c-text) 9%,transparent);border-radius:var(--r);padding:16px 20px;margin-bottom:10px}
.bp .faq summary{cursor:pointer;font-weight:600;min-height:28px}
.bp .faq details p{margin-top:8px;opacity:.78}
.bp .loc{display:grid;grid-template-columns:1fr 1.2fr;gap:28px;align-items:stretch}
.bp .map{min-height:240px;border-radius:var(--r);overflow:hidden;background:color-mix(in srgb,var(--c-secondary) 14%,var(--c-card));position:relative;border:1px solid color-mix(in srgb,var(--c-text) 10%,transparent)}
.bp .map svg{position:absolute;inset:0;width:100%;height:100%}
.bp .map .pin{position:absolute;left:50%;top:46%;transform:translate(-50%,-100%);font-size:34px}
.bp .contact{display:grid;grid-template-columns:1fr 1fr;gap:28px}
.bp form.cf{display:grid;gap:12px}
.bp .in{width:100%;min-height:46px;padding:10px 14px;font:inherit;color:var(--c-text);background:var(--c-card);border:1px solid color-mix(in srgb,var(--c-text) 22%,transparent);border-radius:calc(var(--r) * .7)}
.bp .in:focus-visible{outline:3px solid var(--c-primary);outline-offset:1px}
.bp .ft{padding:36px 0;border-top:1px solid color-mix(in srgb,var(--c-text) 10%,transparent);font-size:.9em}
.bp .ft .wrap{display:flex;flex-wrap:wrap;gap:12px 28px;justify-content:space-between}
.bp .sticky{position:sticky;bottom:0;z-index:6;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;padding:10px 14px;background:color-mix(in srgb,var(--c-bg) 94%,transparent);backdrop-filter:blur(8px);border-top:1px solid color-mix(in srgb,var(--c-text) 12%,transparent)}
.bp .toast{position:sticky;bottom:72px;z-index:8;margin:0 auto;width:max-content;max-width:calc(100% - 32px);background:#111;color:#fff;padding:10px 16px;border-radius:12px;font-size:13px;box-shadow:0 8px 28px rgba(0,0,0,.35)}

/* Adaptación según el ancho del dispositivo simulado */
@container bp (max-width: 980px){
  .bp .nav{display:none}
  .bp .burger{display:inline-flex;align-items:center;justify-content:center}
  .bp .hd .wrap{flex-wrap:nowrap}
}
@container bp (max-width: 860px){
  .bp .wrap{padding:0 22px}
  .bp section{padding:48px 0}
  .bp .hero.l-dividida .wrap{grid-template-columns:1fr;gap:28px}
  .bp .grid{grid-template-columns:repeat(2,1fr)}
  .bp .gal.g-cuadricula,.bp .gal.g-mosaico{grid-template-columns:repeat(3,1fr)}
  .bp .gal.g-columnas{column-count:2}
  .bp .loc,.bp .contact{grid-template-columns:1fr}
  .bp .car .slide{aspect-ratio:16/9}
  .bp .car.c-tarjetas .slide{flex-basis:calc((100% - 16px)/2)}
}
@container bp (max-width: 620px){
  .bp .nav{display:none}
  .bp .burger{display:inline-flex;align-items:center;justify-content:center}
  .bp .hd .hd-actions{display:none}
  .bp .hd.h-centrada .wrap,.bp .hd.h-dividida .wrap{display:flex;flex-direction:row;padding-block:0}
  .bp .hero{padding:44px 0}
  .bp .hero.l-imagen{padding:72px 0}
  .bp .grid{grid-template-columns:1fr}
  .bp .gal.g-cuadricula,.bp .gal.g-mosaico{grid-template-columns:repeat(2,1fr)}
  .bp .gal.g-mosaico{grid-auto-rows:120px}
  .bp .gal.g-columnas{column-count:2}
  .bp .car .slide{aspect-ratio:4/3}
  .bp .car.c-tarjetas .slide{flex-basis:84%}
  .bp .btns .btn{flex:1 1 100%}
  .bp .sticky .btn{flex:1 1 40%}
}
@media (prefers-reduced-motion:reduce){.bp .car .track,.bp .car.c-fundido .slide,.bp .btn{transition:none}}
`;
