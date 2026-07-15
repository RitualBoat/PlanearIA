import { PreferenciasUsuario } from "./AuthContext";

export const PREFERENCIAS_DEFAULT: PreferenciasUsuario = {
  recibirRecomendaciones: true,
  compartirDatos: false,
  contenidoAdulto: false,
  tema: "sistema",
  tamanoFuente: "medio",
  notificaciones: true,
};
