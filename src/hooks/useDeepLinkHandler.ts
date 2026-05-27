import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { onIncomingLink, ParsedInvite } from "../services/inviteLinkService";
import { useContactos } from "../context/ContactosContext";
import { useAuth } from "../context/AuthContext";

/**
 * Hook that listens for incoming deep links (invite URLs)
 * and automatically sends a connection request when an invite is opened.
 *
 * Should be mounted once in App.tsx or a top-level navigator.
 */
export function useDeepLinkHandler() {
  const navigation = useNavigation<any>();
  const { enviarSolicitud } = useContactos();
  const { usuario, isGuest } = useAuth();
  const processedTokens = useRef<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = onIncomingLink((parsed: ParsedInvite) => {
      // Prevent processing the same token twice
      if (processedTokens.current.has(parsed.token)) return;
      processedTokens.current.add(parsed.token);

      if (isGuest) {
        Alert.alert("Cuenta requerida", "Necesitas iniciar sesión para aceptar esta invitación.", [
          { text: "OK" },
        ]);
        return;
      }

      if (!parsed.fromUserId) {
        // Navigate to BuscadorPerfiles as fallback
        navigation.navigate("BuscadorPerfiles");
        return;
      }

      // Auto-send connection request
      enviarSolicitud({
        deUsuarioId: usuario?.id?.toString() ?? "",
        deUsuarioNombre: usuario ? `${usuario.nombre} ${usuario.apellidos}` : "",
        deUsuarioAvatar: usuario?.fotoPerfil ?? undefined,
        deUsuarioMateria: undefined,
        deUsuarioInstitucion: undefined,
        paraUsuarioId: parsed.fromUserId,
        mensaje: "Conectado por enlace de invitación",
      }).then(() => {
        Alert.alert(
          "Invitación aceptada",
          "Se ha enviado la solicitud de conexión automáticamente.",
          [{ text: "OK" }]
        );
        navigation.navigate("MainTabs", { screen: "SocialTab" });
      });
    });

    return unsubscribe;
  }, [navigation, enviarSolicitud, usuario, isGuest]);
}
