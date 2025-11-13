import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";

//Ahora importamos los tipos que definimos
import { RootStackParamList } from "../../navigation/StackNavigator";
import { LoginFormData, COLORS, FONT_SIZES } from "../../../types/index";

//Ahora se importa la imagen
const loginImage = require("../../../assets/PlanearIA.png");
//Tipo para las props de navegación de esta pantalla
type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Login"
>;

//Props que recibe el componente LoginScreen
interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

//Pantalla de inicio de sesion
//Permite a los usuarios autenticar con su correo y contraseña
const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  //Estados del formulario usando el tipo LoginFormData
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });

  //Estado para controlar si esta cargando
  const [isLoading, setIsLoading] = useState<boolean>(false);

  //Actualiza los datos del formulario
  //@param field - campo a actualizar ('username' o 'password')
  //@param value - nuevo valor del campo
  const updateFormData = (field: keyof LoginFormData, value: string): void => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  //Valida que los campos del formulario no esten vacios
  //@return true si los campos son validos, false en caso contrario
  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      Alert.alert("Error", "Por favor ingrese su nombre de usuario");
      return false;
    }
    if (!formData.password.trim()) {
      Alert.alert("Error", "Por favor ingrese su contraseña");
      return false;
    }
    if (formData.password.length < 4) {
      Alert.alert("Error", "La contraseña debe tener al menos 4 caracteres");
      return false;
    }
    return true;
  };

  //Simula el proceso de autenticación del usuario
  const authenticateUser = (): void => {
    setIsLoading(true);

    //Simulamos una peticion al servidor (2 segundos)
    setTimeout(() => {
      setIsLoading(false);

      //Aqui iria la logica real de autenticacion
      //por ahora, cualquier usuario/contraseña es valido
      console.log("Usuario autenticado:", formData.username);
      //Navegamos a la pantalla de Home
      navigation.replace("Home");
    }, 2000);
  };

  //Maneja el proceso de inicio de sesion
  const handleLogin = (): void => {
    if (!validateForm()) {
      return;
    }
    Alert.alert(
      "Confirmación de Inicio de Sesión",
      `¿Desea iniciar sesión con el usuario: ${formData.username}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Aceptar",
          onPress: authenticateUser,
        },
      ],
      { cancelable: false }
    );
  };

  //Maneja la recuperacion de contraseña
  const handleForgotPassword = (): void => {
    Alert.alert(
      "Recuperar Contraseña",
      "Esta funcionalidad estara disponible proximamente.",
      [{ text: "Entendido" }]
    );
  };

  //Maneja el registro de un nuevo usuario
  const handleRegister = (): void => {
    Alert.alert(
      "Registro",
      "Esta funcionalidad estara disponible proximamente.",
      [{ text: "Entendido" }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        {/* Logo de la aplicacion */}
        <Image source={loginImage} style={styles.loginImage} />
        {/* titulo */}
        <Text style={styles.title}>Sistema de Planeaciones</Text>
        <Text style={styles.subtitle}>PlanearIA</Text>

        {/* formulario */}
        <View style={styles.formContainer}>
          {/* Campo de usuario */}
          <TextInput
            style={styles.input}
            placeholder="Usuario"
            placeholderTextColor={COLORS.textSecondary}
            value={formData.username}
            onChangeText={(text) => updateFormData("username", text)}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
          {/* Campo de contraseña */}
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={COLORS.textSecondary}
            value={formData.password}
            onChangeText={(text) => updateFormData("password", text)}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
          {/* Boton de iniciar sesion */}
          <TouchableOpacity
            style={[styles.loginButton, { opacity: isLoading ? 0.6 : 1 }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? "Cargando..." : "Iniciar Sesión"}
            </Text>
          </TouchableOpacity>
        </View>
        {/* Enlaces adicionales */}
        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRegister}>
            <Text style={styles.link}>Registrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loginImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: 60,
  },
  title: {
    fontSize: FONT_SIZES.xxlarge,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FONT_SIZES.large,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 30,
  },
  formContainer: {
    width: "100%",
    maxWidth: 300,
  },
  input: {
    height: 50,
    borderColor: COLORS.textSecondary,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: FONT_SIZES.medium,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    elevation: 2,
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loginButtonText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
  },
  linksContainer: {
    marginTop: 30,
    alignItems: "center",
    gap: 15,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.medium,
  },
  link: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.medium,
    textDecorationLine: "underline",
  },
});
export default LoginScreen;
