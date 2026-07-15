import React, { useState } from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import AnimatedTopPill from "../../components/AnimatedTopPill";
import { useTheme } from "../../hooks/useTheme";

interface FAQItemProps {
  pregunta: string;
  respuesta: string;
  colors: any;
  styles: any;
}

function FAQAccordionItem({ pregunta, respuesta, colors, styles }: FAQItemProps) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    setExpanded(!expanded);
  };

  return (
    <View style={styles.faqCard}>
      <Pressable
        style={({ pressed }) => [styles.faqHeader, pressed && { opacity: 0.7 }]}
        onPress={toggle}
      >
        <Text style={styles.faqQuestion}>{pregunta}</Text>
        <MaterialIcons
          name={expanded ? "expand-less" : "expand-more"}
          size={24}
          color={colors.primary}
        />
      </Pressable>
      {expanded && (
        <View style={styles.faqBody}>
          <Text style={styles.faqAnswer}>{respuesta}</Text>
        </View>
      )}
    </View>
  );
}

const FAQS = [
  {
    pregunta: "¿Cómo funciona el asistente de planeación con IA?",
    respuesta:
      "El asistente utiliza modelos avanzados de inteligencia artificial para generar secuencias didácticas alineadas con los planes de estudio oficiales. Solo ingresa la materia, el tema central y el nivel escolar para obtener una propuesta pedagógica completa.",
  },
  {
    pregunta: "¿Puedo usar la aplicación sin conexión a Internet?",
    respuesta:
      "¡Sí! PlanearIA está diseñada con un motor 'offline-first'. Todos tus cambios se guardan localmente en tu dispositivo y se sincronizarán de forma segura con la nube automáticamente cuando recuperes la conexión.",
  },
  {
    pregunta: "¿Cómo colaboro con otros docentes?",
    respuesta:
      "Dirígete a la pestaña 'Social' para buscar perfiles de otros profesores. Puedes enviarles una solicitud de conexión, chatear y compartir recursos didácticos o planeaciones de tu biblioteca directamente desde el chat.",
  },
  {
    pregunta: "¿Cómo exporto mis planeaciones o calificaciones?",
    respuesta:
      "Dentro del hub de 'Contenido' o en el panel de 'Grupos', abre el menú contextual de tres puntos en el recurso deseado y selecciona 'Exportar'. Podrás descargarlo en formatos PDF, Word o Excel de forma instantánea.",
  },
  {
    pregunta: "¿Cómo agrego alumnos a mis grupos?",
    respuesta:
      "En la pestaña 'Grupos', selecciona el grupo correspondiente y entra a la sección de 'Alumnos'. Desde ahí puedes agregar estudiantes de forma manual, importar una lista CSV o enviarles un código de invitación único.",
  },
];

export const AyudaScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar
        backgroundColor={colors.surfaceContainerLowest}
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      {/* Header Fijo */}
      <View style={styles.headerBar}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Centro de Ayuda</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && { maxWidth: 720, alignSelf: "center", width: "100%" },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedTopPill
          icon="help-outline"
          title="¿Cómo podemos ayudarte?"
          subtitle="Resuelve tus dudas y contacta a nuestro equipo de soporte"
        />

        {/* Sección de FAQs */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>PREGUNTAS FRECUENTES</Text>
          <View style={styles.faqList}>
            {FAQS.map((faq) => (
              <FAQAccordionItem
                key={faq.pregunta}
                pregunta={faq.pregunta}
                respuesta={faq.respuesta}
                colors={colors}
                styles={styles}
              />
            ))}
          </View>
        </View>

        {/* Sección de Canales de Soporte */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>CANALES DE SOPORTE</Text>

          <View style={styles.supportChannels}>
            {/* Tarjeta de Chatbot */}
            <Pressable
              style={({ pressed }) => [styles.supportCard, pressed && { opacity: 0.8 }]}
              onPress={() => {
                navigation.navigate("MainTabs", { screen: "SocialTab" });
              }}
            >
              <View style={[styles.supportIconWrap, { backgroundColor: colors.purpleTint }]}>
                <MaterialIcons name="smart-toy" size={26} color={colors.purple} />
              </View>
              <View style={styles.supportInfo}>
                <Text style={styles.supportTitle}>Asistente de Soporte IA</Text>
                <Text style={styles.supportDesc}>
                  Chatbot disponible 24/7 para responder dudas sobre el uso de la app.
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
            </Pressable>

            {/* Tarjeta de Correo */}
            <View style={styles.supportCard}>
              <View style={[styles.supportIconWrap, { backgroundColor: colors.primaryTint }]}>
                <MaterialIcons name="mail-outline" size={26} color={colors.primaryContainer} />
              </View>
              <View style={styles.supportInfo}>
                <Text style={styles.supportTitle}>Soporte por Correo</Text>
                <Text style={styles.supportDesc}>
                  soporte@planearia.com{"\n"}Tiempo promedio de respuesta: &lt; 24 horas.
                </Text>
              </View>
            </View>

            {/* Tarjeta de WhatsApp */}
            <View style={styles.supportCard}>
              <View style={[styles.supportIconWrap, { backgroundColor: colors.successTint }]}>
                <MaterialIcons name="call" size={26} color={colors.success} />
              </View>
              <View style={styles.supportInfo}>
                <Text style={styles.supportTitle}>Centro de Atención Telefónica</Text>
                <Text style={styles.supportDesc}>
                  +52 (55) 1234-5678{"\n"}Lunes a Viernes de 9:00 AM a 6:00 PM.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info Legal y Versión */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>PlanearIA v3.1.2</Text>
          <Text style={styles.footerText}>© 2026 Todos los derechos reservados.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, isDark: boolean) => {
  const cardShadow = Platform.select({
    web: { boxShadow: `0px 2px 8px ${colors.shadowBlue}` } as any,
    default: {
      shadowColor: colors.primaryDark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
  });

  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    scrollView: { flex: 1 },
    scrollContent: { padding: 16, paddingTop: 10, paddingBottom: 60, gap: 18 },

    // Header Bar
    headerBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.surfaceContainerLowest,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceContainerLow,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.primary,
    },

    // Bloques de sección
    sectionBlock: { gap: 12 },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.textMuted,
      letterSpacing: 1.2,
      marginBottom: 2,
    },

    // FAQ Accordion
    faqList: { gap: 10 },
    faqCard: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      ...cardShadow,
    },
    faqHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      gap: 12,
    },
    faqQuestion: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.primary,
      flex: 1,
      lineHeight: 20,
    },
    faqBody: {
      padding: 16,
      paddingTop: 0,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surfaceContainerLow,
    },
    faqAnswer: {
      fontSize: 13.5,
      color: colors.textSecondary,
      lineHeight: 20,
    },

    // Canales de soporte
    supportChannels: { gap: 12 },
    supportCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 16,
      padding: 16,
      gap: 14,
      borderWidth: 1,
      borderColor: colors.border,
      ...cardShadow,
    },
    supportIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    supportInfo: {
      flex: 1,
      gap: 4,
    },
    supportTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },
    supportDesc: {
      fontSize: 12.5,
      color: colors.textSecondary,
      lineHeight: 18,
    },

    // Footer
    footerInfo: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 20,
      gap: 4,
    },
    footerText: {
      fontSize: 11,
      color: colors.textMuted,
    },
  });
};
