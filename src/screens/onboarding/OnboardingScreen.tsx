import React, { useRef, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewToken,
  Platform,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { RootStackParamList } from "../../navigation/StackNavigator";

const ONBOARDING_KEY = "HAS_SEEN_ONBOARDING";
const DESKTOP_BREAKPOINT = 768;
const MAX_CONTAINER_WIDTH = 560;

interface Slide {
  id: string;
  title: string;
  description: string;
  image: string;
  color: string;
  gradientColors: [string, string];
  bgTint: string;
}

const SLIDES: Slide[] = [
  {
    id: "1",
    title: "Planea con Inteligencia Artificial",
    description:
      "Crea planeaciones didácticas en segundos con ayuda de IA. Manual o automática, tú decides.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCqerqUYHLZw6O3qLSaX6gfGJZXwXPQFfsuNmxe281aLZIO1w7hnovufU2j7IpW_d3SE-fJEqkxyxL2UC3eEpkUtLNA_Hsu32pVLuecae3iKmwztrXqw0l8sRhMj4DVfPAImJkyDVmTc6h3jfSxDdcggPMttipQoinfYsQDQuRGwf1LbytG2lPeBW2SscagAMtSzLnPBu5lBM0BlSKKlkLDA3oiWAHscnlm03K5Rp4aq9WXmmpV8XI2RPhuB_ZO4iVW_2wHq60ogaI",
    color: "#3B82F6",
    gradientColors: ["#1D4ED8", "#3B82F6"],
    bgTint: "#EFF6FF",
  },
  {
    id: "2",
    title: "Gestiona tus Grupos",
    description:
      "Control total de asistencia, calificaciones, tareas y reportes de todos tus grupos.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCj07N7hPjRSaGc7yiD2L62boXj45Nj6IfHub90kOWbBdau3Amf6phEVSeWzYDJ9V0BwWjOq0LXV6OEqkJLYfwwYIWzWYz13ObumOBqUwMPPCAqFkd6BgzjkTiwZ5_QA0e4OpnQWd6cn4_JwD7Zlvj_tktck8a23FBEpZVd7JTO34LTDFDHkjKcOLutyHEVKZPzCiod-W8xhKY_AoyS24jkYFQCdgvO3GF60W-C3ZVjEADZjdyRw0dR7rd2WIr3iAXBdlcugbqv6d4",
    color: "#10B981",
    gradientColors: ["#059669", "#10B981"],
    bgTint: "#ECFDF5",
  },
  {
    id: "3",
    title: "Recursos y Plantillas",
    description:
      "Exámenes, presentaciones, mapas mentales y más. Tu biblioteca personal de recursos.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDWw1mnUALaufQu4LZJTTF8T2WZNY6jhUMKZRkMneDJasVyRHAHK-cBUT_pwl7NZ7_aipUayJuAwpxSMzuKDD-QlufhXJxzhrg-O636vRwYlv3r9167GZKp305LGrncq2OvA3xXfVmaTltW6EGy8DAAoXbDp5eYw-82nc0EreVYDQmdHgPq1W8RU3CQZgwSQj__rYR9XFoqC-mzIgJn0OZXYDTH4gdxbrzmOA5Bw_OCGJjETxIiVD8uJJMy3WOs8nKF0ZOMmOoZMIY",
    color: "#F59E0B",
    gradientColors: ["#D97706", "#F59E0B"],
    bgTint: "#FFFBEB",
  },
  {
    id: "4",
    title: "Colabora con otros Docentes",
    description: "Comparte recursos, conecta con colegas y descubre contenido en el feed social.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAhWVYbTmvUC1V5aC7DcJXO_-8N55Nb0BzC7Q8YhThCgbxV_ZmYNoHlAGVCjptld-fYwK5qS1igUta-QAmRZlNtyX7Jlst50P_X3Oexj9xrrxygqWqnqtJ3uxhHfenlMXJQI4v2ntMsLTwuGBlQxdUk2bnwAGjmD40deZ0t5XjkZoThuEqO2n7-VIbBxYXhrsMV0o8vvaEhQoOLH4WtozGRkXBIxa473WVo6Pl15uAMM-vY0HIrNSHbixHjJnVQpw1w8YV9yMeEJ-w",
    color: "#8B5CF6",
    gradientColors: ["#7C3AED", "#8B5CF6"],
    bgTint: "#F5F3FF",
  },
];

type Nav = StackNavigationProp<RootStackParamList>;

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { loginComoInvitado } = useAuth();
  const flatListRef = useRef<FlatList<Slide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width: windowWidth } = useWindowDimensions();

  const isDesktop = windowWidth >= DESKTOP_BREAKPOINT;
  const slideWidth = isDesktop ? Math.min(MAX_CONTAINER_WIDTH, windowWidth) : windowWidth;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useMemo(() => ({ viewAreaCoveragePercentThreshold: 50 }), []);

  const finishOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    await loginComoInvitado();
    navigation.replace("MainTabs");
  }, [loginComoInvitado, navigation]);

  const handleNext = useCallback(() => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      finishOnboarding();
    }
  }, [currentIndex, finishOnboarding]);

  const handleSkip = useCallback(() => {
    finishOnboarding();
  }, [finishOnboarding]);

  const isLastSlide = currentIndex === SLIDES.length - 1;
  const activeSlide = SLIDES[currentIndex];

  const renderSlide = useCallback(
    ({ item }: { item: Slide }) => (
      <View style={[styles.slide, { width: slideWidth }]}>
        <View
          style={[
            styles.imageContainer,
            { backgroundColor: item.bgTint },
            isDesktop && styles.imageContainerDesktop,
          ]}
        >
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
          <LinearGradient
            colors={["transparent", "rgba(255,255,255,0.8)", "#FFFFFF"]}
            style={styles.imageGradient}
          />
        </View>
        <Text style={[styles.title, isDesktop && styles.titleDesktop]}>{item.title}</Text>
        <Text style={[styles.description, isDesktop && styles.descriptionDesktop]}>
          {item.description}
        </Text>
      </View>
    ),
    [slideWidth, isDesktop]
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={[styles.outerContainer, isDesktop && styles.outerContainerDesktop]}>
        <View
          style={[
            styles.innerContainer,
            isDesktop && { maxWidth: MAX_CONTAINER_WIDTH, alignSelf: "center" as const },
          ]}
        >
          {/* Header — glass effect on web */}
          <View
            style={[
              styles.header,
              isDesktop && styles.headerDesktop,
              Platform.OS === "web" && styles.headerGlass,
            ]}
          >
            <View style={styles.headerLeft}>
              <MaterialIcons name="school" size={24} color="#1D4ED8" />
              <Text style={styles.headerTitle}>PlanearIA</Text>
            </View>
            {!isLastSlide && (
              <TouchableOpacity
                onPress={handleSkip}
                style={styles.skipBtn}
                accessibilityRole="button"
                accessibilityLabel="Saltar introducción"
              >
                <Text style={styles.skipText}>Saltar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Carousel */}
          <FlatList
            ref={flatListRef}
            data={SLIDES}
            renderItem={renderSlide}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            style={styles.flatList}
            getItemLayout={(_, index) => ({
              length: slideWidth,
              offset: slideWidth * index,
              index,
            })}
          />

          {/* Bottom Navigation */}
          <View style={[styles.bottomNav, isDesktop && styles.bottomNavDesktop]}>
            {/* Dot Indicators */}
            <View style={styles.dotsContainer}>
              {SLIDES.map((slide, index) => (
                <TouchableOpacity
                  key={slide.id}
                  onPress={() => {
                    flatListRef.current?.scrollToIndex({ index, animated: true });
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Ir a diapositiva ${index + 1}`}
                  style={[
                    styles.dot,
                    index === currentIndex
                      ? { backgroundColor: slide.color, width: 24 }
                      : { backgroundColor: "#E2E8F0", width: 10 },
                  ]}
                />
              ))}
            </View>

            {/* Action Button with gradient */}
            <TouchableOpacity
              onPress={handleNext}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={isLastSlide ? "Comenzar a usar la app" : "Siguiente diapositiva"}
              style={[styles.actionBtnOuter, isDesktop && styles.actionBtnDesktop]}
            >
              <LinearGradient
                colors={activeSlide?.gradientColors ?? ["#1D4ED8", "#3B82F6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionBtnGradient}
              >
                <Text style={styles.actionBtnText}>{isLastSlide ? "¡Comenzar!" : "Siguiente"}</Text>
                <MaterialIcons
                  name={isLastSlide ? "check-circle" : "east"}
                  size={20}
                  color="#FFFFFF"
                  style={{ marginLeft: 8 }}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F7FAFE",
  },
  outerContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  outerContainerDesktop: {
    backgroundColor: "#F7FAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  innerContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    zIndex: 10,
  },
  headerDesktop: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  headerGlass: {    backgroundColor: "rgba(255,255,255,0.8)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  flatList: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 20,
    justifyContent: "center",
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 0.85,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 32,
  },
  imageContainerDesktop: {
    maxHeight: 360,
    aspectRatio: 1.2,
    borderRadius: 20,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#181C1F",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 28,
  },
  titleDesktop: {
    fontSize: 26,
    lineHeight: 34,
  },
  description: {
    fontSize: 15,
    color: "#414752",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  descriptionDesktop: {
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 420,
  },
  bottomNav: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 24,
    paddingTop: 16,
    gap: 20,
  },
  bottomNavDesktop: {
    paddingBottom: 32,
    paddingTop: 20,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    height: 10,
    borderRadius: 5,
  },
  actionBtnOuter: {
    width: "100%",
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  actionBtnDesktop: {
    maxWidth: 360,
  },
  actionBtnGradient: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 28,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default OnboardingScreen;

