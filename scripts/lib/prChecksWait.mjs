// Espera de checks de un PR para el cierre de un change. Vive aparte de scripts/opsxFinishChange.mjs
// porque ese script ejecuta git y gh al importarse: las pruebas necesitan la clasificacion y el sondeo
// sin lanzar procesos ni dormir en tiempo real.

export const CHECKS_PASSED = "passed";
export const CHECKS_PENDING = "pending";
export const CHECKS_NOT_REGISTERED = "not-registered";
export const CHECKS_FAILED = "failed";

// gh reserva este codigo para checks pendientes (cmdutil.PendingError). Es el unico estado que su codigo
// de salida distingue por si solo.
const GH_EXIT_PENDING = 8;

// GitHub registra el statusCheckRollup del commit de forma asincrona tras el push. Mientras esta vacio, gh
// falla desde populateStatusChecks -- antes del bucle de --watch, que por eso no cubre este caso.
//
// El texto es el unico discriminante disponible: gh sale con 1 tanto aqui como cuando un check esta en rojo
// (cmdutil.SilentError, sin mensaje). Clasificar por codigo colapsaria ambos casos, que es el bug original.
// La variante "required" solo la emite gh con --required; se reconoce por robustez aunque no la usemos.
// El nombre de rama se matchea con `.*` y no con `[^']*` porque git admite apostrofes en un ref: acotarlo
// dejaria de reconocer el mensaje y degradaria a abort justo en el caso que este modulo existe para cubrir.
const EMPTY_ROLLUP = /no (?:required )?checks reported on the '.*' branch/i;

// Un stderr no reconocido cae en CHECKS_FAILED a proposito: si gh cambia el mensaje, el cierre aborta como
// antes de este modulo en vez de sondear a ciegas. La direccion segura del fallo es detenerse, nunca mergear.
export function classifyChecksOutcome({ exitCode, stderr = "" } = {}) {
  if (exitCode === 0) return CHECKS_PASSED;
  if (exitCode === GH_EXIT_PENDING) return CHECKS_PENDING;
  if (EMPTY_ROLLUP.test(stderr)) return CHECKS_NOT_REGISTERED;
  return CHECKS_FAILED;
}

// Sondea solo mientras el rollup siga vacio. Cualquier otro estado sale de inmediato: reintentar un check
// fallido lo convertiria en un timeout confuso, y un pendiente ya prueba que el rollup existe.
//
// runChecks, sleep y now se inyectan para que las pruebas no lancen gh ni esperen en tiempo real.
export async function waitForChecks({ runChecks, sleep, now, deadlineMs = 120_000, intervalMs = 5_000 } = {}) {
  const started = now();
  let attempts = 0;

  for (;;) {
    const outcome = classifyChecksOutcome(await runChecks());
    attempts += 1;
    if (outcome !== CHECKS_NOT_REGISTERED) {
      return { outcome, attempts, waitedMs: now() - started };
    }

    // Se compara contra el proximo intento, no contra el instante actual: dormir para agotar el deadline y
    // volver a preguntar lo mismo solo retrasa el diagnostico.
    const waited = now() - started;
    if (waited + intervalMs > deadlineMs) {
      return { outcome: CHECKS_NOT_REGISTERED, attempts, waitedMs: waited, timedOut: true };
    }
    await sleep(intervalMs);
  }
}
