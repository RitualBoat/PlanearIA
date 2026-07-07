import { buildAlumnoExportHtml } from "../../services/alumnoExportService";
import { buildGrupoExportHtml } from "../../services/grupoExportService";
import { buildAlumnoReportHtml, buildReportHtml } from "../../services/reportesExportService";
import { escapeHtml } from "../../utils/htmlEscape";

const dangerous = `<script>alert("x")</script><img src=x onerror='boom'> & " '`;

const stats = {
  promedioGeneral: 8.7,
  indiceAprobacion: 90,
  indiceReprobacion: 10,
  indiceAsistencia: 86,
  indiceEntregasATiempo: 72,
  indiceEntregasTarde: 18,
  indiceNoEntregadas: 10,
};

describe("safe export HTML generation", () => {
  it("escapes the shared dangerous character set", () => {
    expect(escapeHtml(dangerous)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;&lt;img src=x onerror=&#39;boom&#39;&gt; &amp; &quot; &#39;"
    );
  });

  it("escapes dynamic alumno export values", () => {
    const html = buildAlumnoExportHtml([
      {
        nombre: dangerous,
        apellidos: `O'Connor & <b>bold</b>`,
        numeroControl: `NC-"1"`,
        carrera: "ISC <admin>",
        email: "ana@example.com",
        telefono: "<svg onload=alert(1)>",
        estado: "activo",
      } as any,
    ]);

    expect(html).not.toContain(dangerous);
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("<svg");
    expect(html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
    expect(html).toContain("O&#39;Connor &amp; &lt;b&gt;bold&lt;/b&gt;");
  });

  it("escapes dynamic grupo export values", () => {
    const html = buildGrupoExportHtml({
      grupo: {
        id: 1,
        nombre: `Grupo ${dangerous}`,
        materia: "Matematicas & HTML",
        carrera: "<Ingenieria>",
        semestre: 1,
        periodo: "2026-A <script>",
        cantidadAlumnos: 1,
      } as any,
      alumnos: [
        {
          nombre: "Luis",
          apellidos: dangerous,
          numeroControl: "A&1",
          carrera: "<ISC>",
          email: "luis@example.com",
          estado: "activo",
        } as any,
      ],
    });

    expect(html).not.toContain(dangerous);
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;Ingenieria&gt;");
    expect(html).toContain("2026-A &lt;script&gt;");
  });

  it("escapes dynamic report values", () => {
    const grupoHtml = buildReportHtml({
      grupoNombre: `Grupo ${dangerous}`,
      periodo: "2026 & <b>Periodo</b>",
      estadisticas: stats as any,
    });

    const alumnoHtml = buildAlumnoReportHtml({
      alumnoNombre: `Ana ${dangerous}`,
      periodo: "Parcial <1>",
      estadisticas: stats as any,
      calificaciones: [
        {
          periodo: "Unidad <2>",
          promedio: 9.4,
          estado: `Aprobado ${dangerous}`,
        },
      ],
    });

    expect(grupoHtml).not.toContain(dangerous);
    expect(grupoHtml).not.toContain("<script>");
    expect(grupoHtml).toContain("2026 &amp; &lt;b&gt;Periodo&lt;/b&gt;");

    expect(alumnoHtml).not.toContain(dangerous);
    expect(alumnoHtml).not.toContain("<img");
    expect(alumnoHtml).toContain("Unidad &lt;2&gt;");
    expect(alumnoHtml).toContain("Aprobado &lt;script&gt;alert");
  });
});
