import {
  derivarPresentacionSync,
  type EntradaSync,
  type EstadoSync,
} from "../../hooks/syncPresentation";

/**
 * Congela la tabla de presentacion de sincronizacion (change sync-status-ui, #83).
 *
 * Esta suite es el contrato: si alguien cambia la precedencia, el copy o el tono de un
 * estado, falla aqui antes de llegar a una pantalla. Antes de este change la traduccion
 * vivia en tres lugares y ninguna prueba la cubria.
 */

const SESION_SANA: EntradaSync = {
  syncEnabled: true,
  isOnline: true,
  status: "synced",
  pendingCount: 0,
  authError: false,
};

const entrada = (parcial: Partial<EntradaSync>): EntradaSync => ({ ...SESION_SANA, ...parcial });

describe("derivarPresentacionSync: los siete estados", () => {
  it("sincronizacion desactivada se presenta como guardado local, no como sincronizado", () => {
    const resultado = derivarPresentacionSync(entrada({ syncEnabled: false }));

    expect(resultado.estado).toBe<EstadoSync>("local");
    expect(resultado.titulo).toBe("Guardado en este dispositivo");
    expect(resultado.tono).toBe("neutro");
    expect(resultado.icono).toBe("smartphone");
    expect(resultado.accion).toBeNull();
  });

  it("sin conexion conserva el texto tranquilizador vigente", () => {
    const resultado = derivarPresentacionSync(entrada({ isOnline: false }));

    expect(resultado.estado).toBe<EstadoSync>("sin-conexion");
    expect(resultado.titulo).toBe("Sin conexion");
    expect(resultado.detalle).toBe(
      "Puedes seguir trabajando: tus cambios se guardan en este dispositivo."
    );
    expect(resultado.tono).toBe("aviso");
  });

  it("sesion expirada ofrece reingreso", () => {
    const resultado = derivarPresentacionSync(entrada({ authError: true }));

    expect(resultado.estado).toBe<EstadoSync>("sesion-expirada");
    expect(resultado.titulo).toBe("Tu sesion expiro");
    expect(resultado.accion).toBe("reingresar");
    expect(resultado.icono).toBe("lock-outline");
  });

  it("sincronizando marca ocupado para aria-busy", () => {
    const resultado = derivarPresentacionSync(entrada({ status: "syncing" }));

    expect(resultado.estado).toBe<EstadoSync>("sincronizando");
    expect(resultado.ocupado).toBe(true);
    expect(resultado.tono).toBe("info");
  });

  it("servidor caido titula que el trabajo esta a salvo y ofrece reintentar", () => {
    const resultado = derivarPresentacionSync(entrada({ status: "error" }));

    expect(resultado.estado).toBe<EstadoSync>("sin-servidor");
    // El titulo dice lo que el docente necesita saber, no la causa tecnica.
    expect(resultado.titulo).toBe("Guardado en este dispositivo");
    expect(resultado.accion).toBe("reintentar");
    expect(resultado.tono).toBe("aviso");
  });

  it("trabajo en cola informa el conteo, con plural correcto", () => {
    const uno = derivarPresentacionSync(entrada({ status: "idle", pendingCount: 1 }));
    const varios = derivarPresentacionSync(entrada({ status: "idle", pendingCount: 4 }));

    expect(uno.estado).toBe<EstadoSync>("pendiente");
    expect(uno.titulo).toBe("1 cambio por sincronizar");
    expect(varios.titulo).toBe("4 cambios por sincronizar");
    expect(varios.tono).toBe("info");
  });

  it("todo al dia se presenta en tono de exito", () => {
    const resultado = derivarPresentacionSync(SESION_SANA);

    expect(resultado.estado).toBe<EstadoSync>("sincronizado");
    expect(resultado.titulo).toBe("Todo sincronizado");
    expect(resultado.tono).toBe("exito");
    expect(resultado.ocupado).toBe(false);
  });
});

describe("derivarPresentacionSync: precedencia", () => {
  /**
   * Este es el defecto exacto que el change cierra: `buildSyncState` caia en su rama final
   * y pintaba "Sincronizado" en verde a un invitado que no tiene sincronizacion alguna.
   */
  it("el invitado nunca ve sincronizado, aunque el status residual lo sugiera", () => {
    const resultado = derivarPresentacionSync(
      entrada({ syncEnabled: false, status: "synced", pendingCount: 0 })
    );

    expect(resultado.estado).toBe<EstadoSync>("local");
  });

  it("el invitado sin conexion sigue leyendose como guardado local", () => {
    const resultado = derivarPresentacionSync(
      entrada({ syncEnabled: false, isOnline: false, authError: true })
    );

    expect(resultado.estado).toBe<EstadoSync>("local");
  });

  /**
   * Sin red, "vuelve a iniciar sesion" es una instruccion imposible de cumplir. La falta de
   * conexion gana para no convertir un estado tranquilo en una alarma sin salida.
   */
  it("sin conexion gana sobre sesion expirada y no ofrece una accion imposible", () => {
    const resultado = derivarPresentacionSync(entrada({ isOnline: false, authError: true }));

    expect(resultado.estado).toBe<EstadoSync>("sin-conexion");
    expect(resultado.accion).toBeNull();
  });

  it("la sesion expirada gana sobre un ciclo en curso y sobre el conteo de pendientes", () => {
    const resultado = derivarPresentacionSync(
      entrada({ authError: true, status: "syncing", pendingCount: 7 })
    );

    expect(resultado.estado).toBe<EstadoSync>("sesion-expirada");
  });

  it("el servidor caido gana sobre el conteo de pendientes", () => {
    const resultado = derivarPresentacionSync(entrada({ status: "error", pendingCount: 3 }));

    expect(resultado.estado).toBe<EstadoSync>("sin-servidor");
  });
});

describe("derivarPresentacionSync: garantias transversales", () => {
  const TODAS_LAS_ENTRADAS: EntradaSync[] = [
    entrada({ syncEnabled: false }),
    entrada({ isOnline: false }),
    entrada({ authError: true }),
    entrada({ status: "syncing" }),
    entrada({ status: "error" }),
    entrada({ status: "idle", pendingCount: 2 }),
    SESION_SANA,
  ];

  /**
   * Ningun estado de sincronizacion usa el tono de error. El tipo `TonoSync` ya lo impide
   * en compilacion; esta prueba lo afirma tambien en ejecucion, porque el guardarrail
   * importa mas que el mecanismo que lo sostiene.
   */
  it("ningun estado de sincronizacion se presenta como error", () => {
    const tonos = TODAS_LAS_ENTRADAS.map((caso) => derivarPresentacionSync(caso).tono);

    expect(tonos).not.toContain("error");
    expect(new Set(tonos)).toEqual(new Set(["neutro", "aviso", "info", "exito"]));
  });

  it("todos los estados se entienden por texto, sin depender de color ni icono", () => {
    for (const caso of TODAS_LAS_ENTRADAS) {
      const { etiquetaA11y, titulo, detalle } = derivarPresentacionSync(caso);

      expect(etiquetaA11y.length).toBeGreaterThan(titulo.length - 1);
      expect(etiquetaA11y).toContain(titulo);
      if (detalle) expect(etiquetaA11y).toContain(detalle);
    }
  });

  it("cubre los siete estados sin repetir ninguno", () => {
    const estados = TODAS_LAS_ENTRADAS.map((caso) => derivarPresentacionSync(caso).estado);

    expect(new Set(estados).size).toBe(7);
  });

  it("solo los estados recuperables ofrecen accion", () => {
    const conAccion = TODAS_LAS_ENTRADAS.map((caso) => derivarPresentacionSync(caso))
      .filter((resultado) => resultado.accion !== null)
      .map((resultado) => resultado.estado);

    expect(conAccion.sort()).toEqual(["sesion-expirada", "sin-servidor"]);
  });
});
