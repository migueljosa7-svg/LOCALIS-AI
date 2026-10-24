/**
 * Orbes ambientales flotantes. Capa fija detrás del contenido:
 * solo se anima `transform` (compositor GPU), sin filtros blur ni repaints.
 * Se oculta con prefers-reduced-motion (ver globals.css).
 */
export default function AmbientOrbs() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="orb orb-cyan animate-drift" style={{ width: "70vmax", height: "70vmax", top: "-30vmax", left: "-25vmax" }} />
      <div className="orb orb-cobalt animate-drift-slow" style={{ width: "65vmax", height: "65vmax", top: "20vh", right: "-30vmax" }} />
      <div className="orb orb-emerald animate-drift" style={{ width: "50vmax", height: "50vmax", bottom: "-25vmax", left: "15vw", animationDelay: "-12s" }} />
    </div>
  );
}
