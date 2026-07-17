module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    es2022: true,
    node: true,
    jest: true,
  },
  plugins: ["@typescript-eslint", "react", "react-hooks", "react-native"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier",
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  ignorePatterns: [
    "node_modules/",
    ".expo/",
    "dist/",
    "coverage/",
    "backend/node_modules/",
    "context/referencias-opensource/",
    "context/planeaciones-ground-truth/referencias-opensource/",
    "roadmap-context/*.csv",
  ],
  rules: {
    "no-undef": "off",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/display-name": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-require-imports": "off",
    "react-native/no-inline-styles": "off",
    "react-native/no-color-literals": "off",
    "react-native/no-raw-text": "off",
    "react-native/no-unused-styles": "warn",
    "react-native/split-platform-components": "warn",
    "react-hooks/set-state-in-effect": "off",
    "react-hooks/immutability": "off",
    "react-hooks/exhaustive-deps": "off",
  },
  overrides: [
    {
      // El color estatico congela el tema al importar: la pantalla no reacciona a tema,
      // fuente ni daltonismo. Las pantallas migradas consumen useAppTheme en runtime.
      // Los tests quedan fuera: importan COLORS para afirmar la equivalencia legacy
      // (COLORS === lightTheme) y no son superficie de rollout.
      files: ["src/**/*.ts", "src/**/*.tsx", "App.tsx"],
      excludedFiles: ["src/__tests__/**"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                // Dos rutas, no una: `types` reexporta COLORS desde themes/colors
                // (types/index.ts:700) y es la ruta que usan todos los consumidores
                // vigentes. Restringir solo themes/colors dejaria el trinquete sin efecto.
                // Solo se restringe el especificador COLORS: FONT_SIZES y el resto del
                // barrel `types` siguen libres.
                group: ["**/themes/colors", "**/types"],
                importNames: ["COLORS"],
                message:
                  "COLORS estatico congela el tema al importar. Usa useAppTheme() de src/themes/useAppTheme y una fabrica getStyles({ colors, isDark, scaled, highContrast }). Si este archivo es legacy y aun no migra, agregalo a la lista de LEGACY_COLORS_ROLLOUT en .eslintrc.cjs.",
              },
            ],
          },
        ],
      },
    },
    {
      // LEGACY_COLORS_ROLLOUT: registro rastreable del rollout de theming (issue #78, H12a).
      //
      // Esta lista ES el mecanismo de rastreo: su largo es el trabajo pendiente y CI lo
      // verifica en cada PR. Solo puede encoger. Al migrar un archivo, quitalo de aqui;
      // a partir de ese momento no puede reincidir en COLORS.
      //
      // Pendiente: 61 archivos (2026-07-17). Origen: 64 archivos de produccion importaban
      // COLORS; el lote de #78 migro los 3 de src/screens/cuenta/.
      files: [
        "src/components/alumnos/importar/ErrorStage.tsx",
        "src/components/alumnos/importar/ExitoStage.tsx",
        "src/components/alumnos/importar/ProcesandoStage.tsx",
        "src/components/alumnos/importar/SeleccionArchivoStage.tsx",
        "src/components/alumnos/importar/styles.ts",
        "src/components/alumnos/importar/VistaPreviaStage.tsx",
        "src/components/AnimatedTopPill.tsx",
        "src/components/CarreraSelector.tsx",
        "src/components/DeliveryDistributionMini.tsx",
        "src/components/FloatingActionIcons.tsx",
        "src/components/grupos/ColaboradorListItem.tsx",
        "src/components/grupos/MenuContextualColaborador.tsx",
        "src/components/grupos/ModalInvitacionColaborador.tsx",
        "src/components/ScreenBackButton.tsx",
        "src/components/social/ModalSelectorContactos.tsx",
        "src/components/StatCard.tsx",
        "src/components/SyncStatusBanner.tsx",
        "src/components/TrendMiniChart.tsx",
        "src/hooks/useListaPlantillasViewModel.ts",
        "src/hooks/useListaRecursosViewModel.ts",
        "src/navigation/AppTabsNavigator.tsx",
        "src/navigation/StackNavigator.tsx",
        "src/screens/alumnos/CrearAlumnoScreen.tsx",
        "src/screens/alumnos/DetalleAlumnoScreen.tsx",
        "src/screens/alumnos/ExportarAlumnosScreen.tsx",
        "src/screens/alumnos/ImportarAlumnosScreen.tsx",
        "src/screens/alumnos/ListaAlumnosScreen.tsx",
        "src/screens/alumnos/NotasAlumnoScreen.tsx",
        "src/screens/alumnos/ReportesAlumnoScreen.tsx",
        "src/screens/asistencia/HistorialAsistenciaScreen.tsx",
        "src/screens/asistencia/RegistrarAsistenciaScreen.tsx",
        "src/screens/auth/LoginScreen.tsx",
        "src/screens/auth/RecuperarContrasenaScreen.tsx",
        "src/screens/auth/RegistroScreen.tsx",
        "src/screens/biblioteca/CrearRecursoScreen.tsx",
        "src/screens/biblioteca/ListaRecursosScreen.tsx",
        "src/screens/biblioteca/RecursosDidacticosScreen.tsx",
        "src/screens/calificaciones/CapturarCalificacionesScreen.tsx",
        "src/screens/calificaciones/PromediosCalificacionesScreen.tsx",
        "src/screens/classroom/AgregarContenidoClassroomScreen.tsx",
        "src/screens/classroom/ClassroomGroupScreen.tsx",
        "src/screens/classroom/ClassroomHomeScreen.tsx",
        "src/screens/classroom/DetalleActividadClassroomScreen.tsx",
        "src/screens/classroom/DetalleRecursoClassroomScreen.tsx",
        "src/screens/contenido/ContenidoScreen.tsx",
        "src/screens/grupos/CrearGrupoScreen.tsx",
        "src/screens/grupos/DetalleGrupoScreen.tsx",
        "src/screens/grupos/ImportarGruposScreen.tsx",
        "src/screens/grupos/ListaGruposScreen.tsx",
        "src/screens/grupos/ReportesGrupoScreen.tsx",
        "src/screens/grupos/tareas/AsignarRecursoScreen.tsx",
        "src/screens/grupos/tareas/CalificarEntregasScreen.tsx",
        "src/screens/grupos/tareas/CrearTareaGrupoScreen.tsx",
        "src/screens/grupos/tareas/DetalleTareaScreen.tsx",
        "src/screens/planeaciones/ExportarPlaneacionScreen.tsx",
        "src/screens/planeaciones/ImportarPlaneacionScreen.tsx",
        "src/screens/plantillas/DetallePlantillaScreen.tsx",
        "src/screens/plantillas/EditorPlantillaScreen.tsx",
        "src/screens/plantillas/ListaPlantillasScreen.tsx",
        "src/screens/tareas/ListaEntregablesScreen.tsx",
        "src/services/reportesExportService.ts",
      ],
      rules: {
        "no-restricted-imports": "off",
      },
    },
  ],
};
