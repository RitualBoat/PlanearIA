import assert from "node:assert/strict";
import {
  CHECKS_FAILED,
  CHECKS_NOT_REGISTERED,
  CHECKS_PASSED,
  CHECKS_PENDING,
  classifyChecksOutcome,
  waitForChecks,
} from "./lib/prChecksWait.mjs";

// Texto real de gh 2.96.0 (cli/cli, pkg/cmd/pr/checks/checks.go): fmt.Errorf("no checks reported on the
// '%s' branch", pr.HeadRefName). Fijarlo aqui hace que una actualizacion de gh que lo cambie rompa esta
// prueba antes que el cierre real.
const EMPTY_ROLLUP_STDERR = "no checks reported on the 'chore/mi-change' branch\n";
const EMPTY_REQUIRED_STDERR = "no required checks reported on the 'chore/mi-change' branch\n";

// Reloj virtual: sleep solo adelanta el tiempo, asi que la suite corre instantanea y sin depender del reloj real.
function fakeClock() {
  let current = 0;
  return {
    now: () => current,
    sleep: async (ms) => {
      current += ms;
    },
    advance: (ms) => {
      current += ms;
    },
  };
}

// Ejecutor guionizado: cada entrada es una respuesta de gh en orden. Agota la ultima si se piden mas.
function scriptedRuns(responses) {
  const calls = [];
  return {
    calls,
    runChecks: async () => {
      const response = responses[Math.min(calls.length, responses.length - 1)];
      calls.push(response);
      return response;
    },
  };
}

const PASS = { exitCode: 0, stderr: "" };
const PENDING = { exitCode: 8, stderr: "" };
const NOT_REGISTERED = { exitCode: 1, stderr: EMPTY_ROLLUP_STDERR };
const FAILED = { exitCode: 1, stderr: "" };

// --- classifyChecksOutcome: los cuatro estados y las fronteras ---

assert.equal(classifyChecksOutcome(PASS), CHECKS_PASSED);
assert.equal(classifyChecksOutcome(PENDING), CHECKS_PENDING);
assert.equal(classifyChecksOutcome(NOT_REGISTERED), CHECKS_NOT_REGISTERED);
assert.equal(classifyChecksOutcome({ exitCode: 1, stderr: EMPTY_REQUIRED_STDERR }), CHECKS_NOT_REGISTERED);

// El caso que motiva el change: gh usa exit 1 tanto para rollup vacio como para checks en rojo
// (SilentError, sin mensaje). Sin el stderr, estos dos serian indistinguibles.
assert.equal(classifyChecksOutcome(FAILED), CHECKS_FAILED);
assert.notEqual(classifyChecksOutcome(FAILED), classifyChecksOutcome(NOT_REGISTERED));

// Un stderr desconocido nunca se toma como ausencia de checks: falla cerrado.
assert.equal(classifyChecksOutcome({ exitCode: 1, stderr: "HTTP 500: server error" }), CHECKS_FAILED);
assert.equal(classifyChecksOutcome({ exitCode: 2, stderr: EMPTY_ROLLUP_STDERR }), CHECKS_NOT_REGISTERED);
assert.equal(classifyChecksOutcome({ exitCode: 1, stderr: "" }), CHECKS_FAILED);

// Mencionar checks sin ser el mensaje de rollup vacio sigue siendo fallo.
assert.equal(classifyChecksOutcome({ exitCode: 1, stderr: "some checks were not successful" }), CHECKS_FAILED);

// gh ausente: spawnSync devuelve status null y stderr undefined en vez de lanzar. Debe clasificar como
// fallo (nunca como rollup vacio) para que el cierre aborte con diagnostico y no con un volcado de pila.
assert.equal(classifyChecksOutcome({ exitCode: null, stderr: "" }), CHECKS_FAILED);
assert.equal(classifyChecksOutcome({ exitCode: null }), CHECKS_FAILED);
assert.equal(classifyChecksOutcome({}), CHECKS_FAILED);

// git admite apostrofes en un nombre de rama; el mensaje debe seguir reconociendose.
assert.equal(
  classifyChecksOutcome({ exitCode: 1, stderr: "no checks reported on the 'chore/it's-raro' branch" }),
  CHECKS_NOT_REGISTERED,
);

// --- Caso 1: checks que aparecen tarde ---

{
  const clock = fakeClock();
  const { runChecks, calls } = scriptedRuns([NOT_REGISTERED, NOT_REGISTERED, NOT_REGISTERED, PENDING]);
  const result = await waitForChecks({ runChecks, sleep: clock.sleep, now: clock.now, deadlineMs: 120_000, intervalMs: 5_000 });

  // El rollup aparecio dentro del deadline: el cierre continua hacia la espera normal, sin intervencion manual.
  assert.equal(result.outcome, CHECKS_PENDING);
  assert.equal(result.timedOut, undefined);
  assert.equal(calls.length, 4);
  assert.equal(result.attempts, 4);
  assert.equal(result.waitedMs, 15_000);
}

{
  // Variante: los checks aparecen ya aprobados.
  const clock = fakeClock();
  const { runChecks } = scriptedRuns([NOT_REGISTERED, PASS]);
  const result = await waitForChecks({ runChecks, sleep: clock.sleep, now: clock.now, deadlineMs: 60_000, intervalMs: 5_000 });
  assert.equal(result.outcome, CHECKS_PASSED);
  assert.equal(result.attempts, 2);
}

// --- Caso 2: timeout con diagnostico ---

{
  const clock = fakeClock();
  const { runChecks, calls } = scriptedRuns([NOT_REGISTERED]);
  const result = await waitForChecks({ runChecks, sleep: clock.sleep, now: clock.now, deadlineMs: 30_000, intervalMs: 5_000 });

  assert.equal(result.outcome, CHECKS_NOT_REGISTERED);
  assert.equal(result.timedOut, true);
  // El deadline se respeta: no se sondea mas alla de lo declarado.
  assert.ok(result.waitedMs <= 30_000, `waitedMs ${result.waitedMs} excede el deadline`);
  // Consulta en t=0,5,10,15,20,25,30: sondea hasta el deadline inclusive y no lo rebasa.
  assert.equal(calls.length, 7);
  // waitedMs alimenta el diagnostico del script: debe reportar tiempo real esperado, no cero.
  assert.equal(result.waitedMs, 30_000);
}

// --- Caso 3: checks realmente fallidos ---

{
  const clock = fakeClock();
  const { runChecks, calls } = scriptedRuns([FAILED]);
  const result = await waitForChecks({ runChecks, sleep: clock.sleep, now: clock.now, deadlineMs: 120_000, intervalMs: 5_000 });

  // Aborta al primer intento: un check en rojo nunca se reintenta ni consume el deadline.
  assert.equal(result.outcome, CHECKS_FAILED);
  assert.equal(result.timedOut, undefined);
  assert.equal(calls.length, 1);
  assert.equal(result.waitedMs, 0);
}

{
  // Un fallo que aparece durante el sondeo corta de inmediato, sin agotar el deadline.
  const clock = fakeClock();
  const { runChecks, calls } = scriptedRuns([NOT_REGISTERED, NOT_REGISTERED, FAILED]);
  const result = await waitForChecks({ runChecks, sleep: clock.sleep, now: clock.now, deadlineMs: 120_000, intervalMs: 5_000 });
  assert.equal(result.outcome, CHECKS_FAILED);
  assert.equal(calls.length, 3);
  assert.ok(result.waitedMs < 120_000);
}

// --- Frontera: deadline 0 reproduce el comportamiento previo al sondeo ---

{
  const clock = fakeClock();
  const { runChecks, calls } = scriptedRuns([NOT_REGISTERED]);
  const result = await waitForChecks({ runChecks, sleep: clock.sleep, now: clock.now, deadlineMs: 0, intervalMs: 5_000 });

  // Una sola consulta y sin espera: la via de desactivacion documentada en el rollback.
  assert.equal(result.outcome, CHECKS_NOT_REGISTERED);
  assert.equal(result.timedOut, true);
  assert.equal(calls.length, 1);
  assert.equal(result.waitedMs, 0);
}

{
  // Con deadline 0, un PR con checks ya registrados sigue avanzando.
  const clock = fakeClock();
  const { runChecks } = scriptedRuns([PASS]);
  const result = await waitForChecks({ runChecks, sleep: clock.sleep, now: clock.now, deadlineMs: 0, intervalMs: 5_000 });
  assert.equal(result.outcome, CHECKS_PASSED);
}

// --- Frontera: el sondeo no depende de dormir en tiempo real ---

{
  // sleep se invoca exactamente una vez por reintento, y nunca tras el ultimo intento.
  let sleeps = 0;
  const clock = fakeClock();
  const sleep = async (ms) => {
    sleeps += 1;
    await clock.sleep(ms);
  };
  const { runChecks } = scriptedRuns([NOT_REGISTERED, NOT_REGISTERED, PASS]);
  await waitForChecks({ runChecks, sleep, now: clock.now, deadlineMs: 120_000, intervalMs: 5_000 });
  assert.equal(sleeps, 2);
}

console.log("opsx-finish checks wait: OK (clasificacion, checks tardios, timeout, checks fallidos y fronteras)");
