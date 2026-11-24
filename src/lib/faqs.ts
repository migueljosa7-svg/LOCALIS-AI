import type { FaqItem } from "@/types";

// Preguntas frecuentes de /preguntas-frecuentes (y su JSON-LD FAQPage: Google exige que lo marcado sea visible en la página).
// Regla: solo se describe como disponible lo que ya funciona hoy. Sin precios definitivos hasta su aprobación.
export const FAQS: FaqItem[] = [
  {
    id: "faq1",
    question: "¿Qué hace LOCALIS AI?",
    answer:
      "Diseñamos y construimos páginas web para negocios, autónomos y empresas de Zaragoza y Aragón. Una web pensada para que te contacten: formulario de presupuesto, botón de WhatsApp, mapa de Google y buena base para aparecer en Google. Puedes diseñarla tú mismo en nuestro configurador y nosotros la construimos.",
    category: "General",
  },
  {
    id: "faq2",
    question: "¿Necesito saber de tecnología?",
    answer: "No. Tú eliges cómo la quieres (colores, secciones, botones, imágenes) y nosotros nos encargamos de construirla y publicarla. Te explicamos cada paso en lenguaje sencillo y tienes soporte cercano en Zaragoza.",
    category: "General",
  },
  {
    id: "faq3",
    question: "¿Cómo contrato mi web?",
    answer:
      "Diseñas tu web en «Diseña tu web» y pulsas «Quiero esta web», o nos escribes por WhatsApp o desde la página de contacto. Revisamos tu diseño, te enviamos un presupuesto por escrito y, cuando lo aceptes, empezamos. No se cobra ni se contrata nada por enviarnos tu diseño.",
    category: "Contratación",
  },
  {
    id: "faq4",
    question: "¿Cuánto cuesta?",
    answer:
      "Nuestra Web Esencial cuesta 390 € con el IVA incluido y es una oferta de entrada para autónomos y pequeños negocios: hasta 5 páginas, dominio propio con el primer año incluido y publicación. La Web Pro, para más páginas y más contenido, parte de 590 € + IVA. Son precios de referencia: tras revisar tu diseño te enviamos un presupuesto por escrito adaptado a tu proyecto, antes de empezar y sin compromiso. El alojamiento y el mantenimiento no están incluidos en esos importes; todo está explicado en la página de Tarifas.",
    category: "Contratación",
  },
  {
    id: "faq4b",
    question: "¿Qué incluye y qué no incluye el precio de la Web Esencial?",
    answer:
      "Incluye hasta 5 páginas, diseño adaptado a móvil, dominio propio con el registro del primer año (.es o .com estándar, según disponibilidad), SEO básico inicial, botones de teléfono, WhatsApp y contacto, formulario de contacto, configuración y publicación. No incluye el alojamiento, la renovación del dominio a partir del segundo año ni el mantenimiento: te explicamos cada coste antes de empezar. Tú aportas los textos, las fotografías y los datos de tu negocio; si necesitas ayuda con textos o imágenes, se presupuesta aparte.",
    category: "Contratación",
  },
  {
    id: "faq5",
    question: "¿Cuánto tarda en estar lista mi web?",
    answer:
      "Normalmente entre 5 y 10 días laborables desde que tenemos tus contenidos (logotipo, fotos, servicios y precios). El plazo exacto te lo confirmamos en el presupuesto, porque depende de lo que tardes en facilitarnos los materiales y del tamaño de la web.",
    category: "Plazos",
  },
  {
    id: "faq6",
    question: "¿Qué necesito aportar?",
    answer:
      "Lo ideal: nombre y datos de contacto del negocio, tus servicios, el logotipo si lo tienes, fotos propias y, si ya tienes uno, el dominio. Si no lo tienes todo, no pasa nada: lo vemos juntos. Solo publicamos imágenes de las que tengas derecho de uso.",
    category: "Contratación",
  },
  {
    id: "faq7",
    question: "¿Qué incluye el mantenimiento?",
    answer:
      "Incluye cambios razonables de contenido (textos, imágenes, datos de contacto), pequeños ajustes y soporte por email o WhatsApp en horario laboral. Como referencia, 15 € por página al mes + IVA (una web de 5 páginas, 75 € al mes); el importe final depende del número de páginas, de la complejidad y de los cambios que necesites. No son modificaciones ilimitadas: si necesitas un cambio grande, te lo presupuestamos antes. Es opcional y no se activa ni se cobra nada sin tu confirmación.",
    category: "Mantenimiento",
  },
  {
    id: "faq8",
    question: "¿La web saldrá en Google?",
    answer:
      "La construimos con una base técnica sólida para que Google pueda encontrarla y entenderla (títulos, descripciones, estructura, velocidad y datos locales de Zaragoza). Aun así, nadie puede garantizar posiciones concretas: dependen de la competencia y del tiempo. Te ayudamos a dar los pasos correctos, como registrar la web en Google Search Console.",
    category: "Google y SEO",
  },
  {
    id: "faq9",
    question: "¿Qué es Stella?",
    answer:
      "Stella es un asistente virtual con inteligencia artificial para la web de tu negocio: responde dudas con la información que tú le das (servicios, precios, horarios), reconoce cuándo no sabe algo y ofrece tu WhatsApp. Está en fase piloto: puedes solicitarla y te avisamos cuando abramos plazas. No se activa ni se cobra nada sin tu confirmación.",
    category: "Stella",
  },
  {
    id: "faq10",
    question: "¿Puedo tener reservas online, pedidos o seguimiento de repartos?",
    answer:
      "Todavía no. Las citas con calendario, los pedidos online, el WhatsApp automático, la facturación y el seguimiento GPS de repartos están en desarrollo y no se pueden contratar hoy. Las demostraciones que ves en la web explican cómo serían. En cuanto estén listos y probados te lo comunicaremos.",
    category: "Plataforma",
  },
  {
    id: "faq11",
    question: "¿Y si ya tengo dominio o una web?",
    answer: "Podemos usar tu dominio y, si ya tienes una web, aprovechar sus textos e imágenes (con tu permiso) para preparar la nueva. Te decimos con claridad qué hay que cambiar y qué se puede conservar.",
    category: "Contratación",
  },
  {
    id: "faq12",
    question: "¿Cómo trato mis datos y los de mis clientes?",
    answer:
      "Los datos que nos envías se usan únicamente para atender tu solicitud. Puedes consultar la política de privacidad y la de cookies en el pie de la web. Si usas un formulario o un asistente en tu web, te ayudamos a configurarlo con el consentimiento correspondiente.",
    category: "Privacidad",
  },
];
