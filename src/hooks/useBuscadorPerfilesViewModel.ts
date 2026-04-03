import { useState, useCallback, useMemo } from "react";

// ─── Types ───

export interface DocentePerfil {
  id: string;
  nombre: string;
  apellidos: string;
  escuela: string;
  materia: string;
  nivel: string;
  avatarColor: string;
  enComun: number;
  estado: "no_conectado" | "solicitud_enviada" | "conectado";
}

export interface BuscadorPerfilesVM {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filtroNivel: string;
  setFiltroNivel: (nivel: string) => void;
  filtrosExpandidos: boolean;
  toggleFiltros: () => void;
  filtroEstado: string;
  setFiltroEstado: (e: string) => void;
  filtroMateria: string;
  setFiltroMateria: (m: string) => void;
  isSearching: boolean;
  hasSearched: boolean;
  resultados: DocentePerfil[];
  sugeridos: DocentePerfil[];
  totalResultados: number;
  isOffline: boolean;
  hasError: boolean;
  solicitudModal: { visible: boolean; docente: DocentePerfil | null };
  inviteModal: boolean;
  toast: { visible: boolean; type: "solicitud" | "enlace" | null; nombre: string };
  handleSearch: () => void;
  handleClearSearch: () => void;
  handleConectar: (docente: DocentePerfil) => void;
  handleEnviarSolicitud: (mensaje: string) => void;
  handleCerrarSolicitudModal: () => void;
  handleAbrirInviteModal: () => void;
  handleCerrarInviteModal: () => void;
  handleCopiarEnlace: () => void;
  handleReintentar: () => void;
}

// ─── Mock Data ───

const SUGERIDOS: DocentePerfil[] = [
  {
    id: "s1",
    nombre: "María",
    apellidos: "Hernández López",
    escuela: "Sec. Téc. #42",
    materia: "Matemáticas",
    nivel: "Secundaria",
    avatarColor: "#4A90D9",
    enComun: 5,
    estado: "no_conectado",
  },
  {
    id: "s2",
    nombre: "José",
    apellidos: "Ramírez Castillo",
    escuela: "Prep. Benito Juárez",
    materia: "Ciencias",
    nivel: "Preparatoria",
    avatarColor: "#E67E22",
    enComun: 3,
    estado: "no_conectado",
  },
  {
    id: "s3",
    nombre: "Ana",
    apellidos: "García Mendoza",
    escuela: "Sec. Gral. #18",
    materia: "Español",
    nivel: "Secundaria",
    avatarColor: "#0EA5A5",
    enComun: 8,
    estado: "no_conectado",
  },
];

const MOCK_RESULTADOS: DocentePerfil[] = [
  {
    id: "r1",
    nombre: "Sofía",
    apellidos: "Reyes Delgado",
    escuela: "Sec. Téc. #28",
    materia: "Matemáticas",
    nivel: "Secundaria",
    avatarColor: "#2ECC71",
    enComun: 8,
    estado: "no_conectado",
  },
  {
    id: "r2",
    nombre: "Alejandro",
    apellidos: "Mendoza Ríos",
    escuela: "Sec. Gral. #12",
    materia: "Matemáticas",
    nivel: "Secundaria",
    avatarColor: "#3498DB",
    enComun: 3,
    estado: "no_conectado",
  },
  {
    id: "r3",
    nombre: "Isabel",
    apellidos: "Guerrero Solís",
    escuela: "Sec. Téc. #15",
    materia: "Matemáticas",
    nivel: "Secundaria",
    avatarColor: "#E74C3C",
    enComun: 1,
    estado: "solicitud_enviada",
  },
  {
    id: "r4",
    nombre: "Fernando",
    apellidos: "Navarro Peña",
    escuela: "Sec. Gral. #7",
    materia: "Matemáticas",
    nivel: "Secundaria",
    avatarColor: "#F39C12",
    enComun: 5,
    estado: "no_conectado",
  },
  {
    id: "r5",
    nombre: "María",
    apellidos: "Hernández López",
    escuela: "Sec. Téc. #42",
    materia: "Matemáticas",
    nivel: "Secundaria",
    avatarColor: "#4A90D9",
    enComun: 0,
    estado: "conectado",
  },
  {
    id: "r6",
    nombre: "Ricardo",
    apellidos: "Vargas Luna",
    escuela: "Sec. Gral. #22",
    materia: "Álgebra",
    nivel: "Secundaria",
    avatarColor: "#8E44AD",
    enComun: 0,
    estado: "no_conectado",
  },
];

// ─── Hook ───

export function useBuscadorPerfilesViewModel(): BuscadorPerfilesVM {
  const [searchQuery, setSearchQuery] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("Todos");
  const [filtrosExpandidos, setFiltrosExpandidos] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroMateria, setFiltroMateria] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [resultados, setResultados] = useState<DocentePerfil[]>([]);
  const [isOffline] = useState(false);
  const [hasError] = useState(false);
  const [solicitudModal, setSolicitudModal] = useState<{
    visible: boolean;
    docente: DocentePerfil | null;
  }>({ visible: false, docente: null });
  const [inviteModal, setInviteModal] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    type: "solicitud" | "enlace" | null;
    nombre: string;
  }>({ visible: false, type: null, nombre: "" });

  const sugeridos = useMemo(() => SUGERIDOS, []);
  const totalResultados = resultados.length;

  const showToast = useCallback((type: "solicitud" | "enlace", nombre: string) => {
    setToast({ visible: true, type, nombre });
    setTimeout(() => setToast({ visible: false, type: null, nombre: "" }), 3000);
  }, []);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    // Simulate search delay
    setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const filtered = MOCK_RESULTADOS.filter(
        (d) =>
          d.nombre.toLowerCase().includes(query) ||
          d.apellidos.toLowerCase().includes(query) ||
          d.materia.toLowerCase().includes(query) ||
          d.escuela.toLowerCase().includes(query)
      );
      setResultados(filtered);
      setIsSearching(false);
    }, 800);
  }, [searchQuery]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setResultados([]);
    setHasSearched(false);
  }, []);

  const handleConectar = useCallback((docente: DocentePerfil) => {
    setSolicitudModal({ visible: true, docente });
  }, []);

  const handleEnviarSolicitud = useCallback(
    (mensaje: string) => {
      const nombre = solicitudModal.docente
        ? `${solicitudModal.docente.nombre} ${solicitudModal.docente.apellidos}`
        : "";
      setSolicitudModal({ visible: false, docente: null });
      // Update the docente status to solicitud_enviada
      setResultados((prev) =>
        prev.map((d) =>
          d.id === solicitudModal.docente?.id ? { ...d, estado: "solicitud_enviada" as const } : d
        )
      );
      showToast("solicitud", nombre);
    },
    [solicitudModal.docente, showToast]
  );

  const handleCerrarSolicitudModal = useCallback(() => {
    setSolicitudModal({ visible: false, docente: null });
  }, []);

  const handleAbrirInviteModal = useCallback(() => {
    setInviteModal(true);
  }, []);

  const handleCerrarInviteModal = useCallback(() => {
    setInviteModal(false);
  }, []);

  const handleCopiarEnlace = useCallback(() => {
    setInviteModal(false);
    showToast("enlace", "");
  }, [showToast]);

  const handleReintentar = useCallback(() => {
    if (searchQuery.trim()) {
      handleSearch();
    }
  }, [searchQuery, handleSearch]);

  const toggleFiltros = useCallback(() => {
    setFiltrosExpandidos((prev) => !prev);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    filtroNivel,
    setFiltroNivel,
    filtrosExpandidos,
    toggleFiltros,
    filtroEstado,
    setFiltroEstado,
    filtroMateria,
    setFiltroMateria,
    isSearching,
    hasSearched,
    resultados,
    sugeridos,
    totalResultados,
    isOffline,
    hasError,
    solicitudModal,
    inviteModal,
    toast,
    handleSearch,
    handleClearSearch,
    handleConectar,
    handleEnviarSolicitud,
    handleCerrarSolicitudModal,
    handleAbrirInviteModal,
    handleCerrarInviteModal,
    handleCopiarEnlace,
    handleReintentar,
  };
}
