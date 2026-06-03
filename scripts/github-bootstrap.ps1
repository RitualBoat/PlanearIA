# Bootstrap GitHub para PlanearIA
# Requiere instalar GitHub CLI: https://cli.github.com/
# Requiere login: gh auth login

$ErrorActionPreference = "Stop"

$repo = "RitualBoat/PlanearIA"

$labels = @(
  @{ Name = "epic"; Color = "5319e7"; Description = "Agrupador grande de producto" },
  @{ Name = "plan-maestro"; Color = "0052cc"; Description = "Plan maestro de modulo o experiencia" },
  @{ Name = "fase"; Color = "1d76db"; Description = "Tarea de fase dentro de un plan" },
  @{ Name = "bug"; Color = "d73a4a"; Description = "Error reproducible" },
  @{ Name = "ux-ui"; Color = "c2e0c6"; Description = "UX, UI, navegacion o accesibilidad" },
  @{ Name = "legacy"; Color = "f9d0c4"; Description = "Deuda legacy, flujo viejo o duplicado" },
  @{ Name = "offline-first"; Color = "0e8a16"; Description = "AsyncStorage, sync, conflictos u offline" },
  @{ Name = "ai"; Color = "bfdadc"; Description = "IA, prompts, gateway, fallback o limites" },
  @{ Name = "infra"; Color = "fbca04"; Description = "CI/CD, deploy, backend o entorno" },
  @{ Name = "docs"; Color = "0075ca"; Description = "Documentacion" },
  @{ Name = "testing"; Color = "fef2c0"; Description = "Tests o validacion manual" },
  @{ Name = "needs-input"; Color = "d876e3"; Description = "Requiere decision o input del usuario" },
  @{ Name = "low-cost"; Color = "bfe5bf"; Description = "Decision low-cost, free tier o local-first" }
)

foreach ($label in $labels) {
  gh label create $($label.Name) --repo $repo --color $($label.Color) --description $($label.Description) --force
}

$milestones = @(
  "Ciclo 0 - Reorientacion y GitHub",
  "Ciclo 1 - Plan Classroom",
  "Ciclo 2 - Fundacion Classroom",
  "Ciclo 3 - UX/Navegacion Global"
)

foreach ($milestone in $milestones) {
  $existing = gh api "repos/$repo/milestones?state=all" |
    ConvertFrom-Json |
    Where-Object { $_.title -eq $milestone } |
    Select-Object -First 1

  if (-not $existing) {
    gh api "repos/$repo/milestones" -f title="$milestone" -f state="open" | Out-Null
    Write-Host "Milestone creado: $milestone"
  } else {
    Write-Host "Milestone ya existe: $milestone"
  }
}

Write-Host "Labels y milestones listos. Crea o verifica el Project v2: PlanearIA Product OS."
Write-Host "Si gh project requiere permisos extra, ejecuta: gh auth refresh -s project"
