// Tipografías de la vista previa (autoalojadas por next/font: sin peticiones a Google desde el navegador).
// Solo se cargan en las páginas que usan builderFontClass (el editor y el panel de diseños).
import { Inter, Lora, Montserrat, Playfair_Display, Poppins } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], display: "swap", variable: "--bf-playfair" });
const lora = Lora({ subsets: ["latin"], display: "swap", variable: "--bf-lora" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700", "900"], display: "swap", variable: "--bf-poppins" });
const montserrat = Montserrat({ subsets: ["latin"], display: "swap", variable: "--bf-montserrat" });
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--bf-inter" });

export const builderFontClass = [playfair, lora, poppins, montserrat, inter].map((f) => f.variable).join(" ");
