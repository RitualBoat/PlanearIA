// Fixture POSITIVO del check de codificacion. Contiene mojibake a proposito
// en lineas conocidas (6 a 11) para probar la deteccion: acentos doble
// codificados, signos de apertura, puntuacion doble codificada, box-drawing
// y emoji. Excluido del escaneo del repo; no importar desde codigo real.
export const textosRotos = {
  evaluacion: "EvaluaciÃ³n",
  inclusion: "InclusiÃ³n",
  exito: "Â¡PlaneaciÃ³n exportada!",
  separador: "128 KB â€¢ Creado ahora mismo",
  decoracion: "â”€â”€â”€ Mocks â”€â”€â”€",
  emojiRoto: "ðŸ“š",
};
