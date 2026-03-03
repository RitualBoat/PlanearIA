import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  StatusBar,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Entypo from "@expo/vector-icons/Entypo";
import { COLORS, FONT_SIZES } from "../../../types";
import { isWeb, responsive, isLargeScreen } from "../../utils/responsive";
import { useHomeViewModel, MenuOption } from "../../hooks/useHomeViewModel";

/**
 * Componente para renderizar el icono de una opción del menú
 */
const MenuOptionIcon: React.FC<{ option: MenuOption }> = React.memo(
  ({ option }) => {
    if (option.iconImage) {
      return (
        <Image
          source={option.iconImage}
          style={styles.iconImage}
          resizeMode="contain"
        />
      );
    }

    const iconProps = {
      size: 50,
      color: option.color,
    };
    switch (option.iconLibrary) {
      case "FontAwesome5":
        return <FontAwesome5 name={option.icon as any} {...iconProps} />;
      case "MaterialIcons":
        return <MaterialIcons name={option.icon as any} {...iconProps} />;
      case "Entypo":
        return <Entypo name={option.icon as any} {...iconProps} />;
      default:
        return <MaterialIcons name="help-outline" {...iconProps} />;
    }
  },
);

/**
 * Pantalla principal del sistema (View)
 * Solo JSX y StyleSheet - la logica vive en useHomeViewModel
 */
const HomeScreen: React.FC = () => {
  const {
    menuVisible,
    menuOptions,
    openMenu,
    closeMenu,
    handleLogout,
    handleProfile,
    handleNavigation,
  } = useHomeViewModel();
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      {/* Modal del menú de hamburguesa */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={menuVisible}
        onRequestClose={closeMenu}
      >
        <View style={styles.menuOverlay}>
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Menú de Usuario</Text>
            <Pressable style={styles.menuOption} onPress={handleProfile}>
              <MaterialIcons name="person" size={20} color={COLORS.primary} />
              <Text style={styles.menuText}>Mi Perfil</Text>
            </Pressable>
            <Pressable style={styles.menuOption} onPress={handleLogout}>
              <MaterialIcons name="logout" size={20} color={COLORS.error} />
              <Text style={[styles.menuText, { color: COLORS.error }]}>
                Cerrar Sesión
              </Text>
            </Pressable>
            <Pressable style={styles.closeMenuButton} onPress={closeMenu}>
              <Text style={styles.closeMenuText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {/* Grid de opciones principales */}
      <SafeAreaView style={styles.contentContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.welcomeText}>¡Bienvenido a PlanearIA!</Text>
          <Text style={styles.instructionText}>
            Selecciona una opción para comenzar
          </Text>
          <View style={styles.gridContainer}>
            {menuOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.card}
                onPress={() => handleNavigation(option)}
                activeOpacity={0.7}
              >
                <MenuOptionIcon option={option} />
                <Text style={styles.cardText}>{option.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
      {/* Header Bar - Movido a la parte de abajo */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menú</Text>
        <TouchableOpacity style={styles.iconButton} onPress={openMenu}>
          <MaterialIcons name="menu" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
/**
 * Estilos del componente
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: responsive(30, 40, 60),
    paddingVertical: responsive(20, 22, 25),
    boxShadow: "0px 2px 3.84px rgba(26, 26, 26, 0.25)",
  },
  headerTitle: {
    fontSize: responsive(
      FONT_SIZES.large,
      FONT_SIZES.large + 2,
      FONT_SIZES.large + 4,
    ),
    fontWeight: "bold",
    color: COLORS.background,
    flex: 1,
    textAlign: "center",
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: responsive(20, 30, 40),
    paddingHorizontal: isWeb() ? 20 : 0,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: responsive(
      FONT_SIZES.xlarge,
      FONT_SIZES.xlarge + 4,
      FONT_SIZES.xlarge + 8,
    ),
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: responsive(30, 50, 60),
    marginTop: responsive(30, 40, 50),
  },
  instructionText: {
    fontSize: responsive(
      FONT_SIZES.medium,
      FONT_SIZES.medium + 2,
      FONT_SIZES.medium + 4,
    ),
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: responsive(30, 35, 40),
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: isLargeScreen() ? "center" : "space-around",
    paddingHorizontal: 20,
    maxWidth: isWeb() ? 1200 : "100%",
    width: "100%",
    gap: isWeb() ? 20 : 0,
  },
  card: {
    width: isLargeScreen() ? (isWeb() ? "23%" : "30%") : "42%",
    minWidth: isWeb() ? 200 : undefined,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: responsive(35, 40, 45),
    paddingHorizontal: responsive(20, 25, 30),
    marginBottom: 15,
    borderRadius: responsive(12, 14, 16),
    boxShadow: "0px 2px 5px rgba(26, 26, 26, 0.2)",
    ...(isWeb() && {
      cursor: "pointer",
      transition: "all 0.2s ease",
    }),
  },
  iconImage: {
    width: 60,
    height: 60,
  } as const,
  cardText: {
    marginTop: 12,
    fontSize: responsive(
      FONT_SIZES.medium,
      FONT_SIZES.medium + 1,
      FONT_SIZES.medium + 2,
    ),
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  menuContainer: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 200,
  },
  menuTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 20,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  menuText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    marginLeft: 15,
    fontWeight: "500",
  },
  closeMenuButton: {
    alignSelf: "center",
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeMenuText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
});
export default HomeScreen;
