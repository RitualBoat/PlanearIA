import { goBackOrHubLanding, navigateToHub } from "../../navigation/navigateToHub";

describe("navigateToHub", () => {
  it("sin pantalla, abre el hub conservando su estado", () => {
    const navigate = jest.fn();
    navigateToHub({ navigate }, "ClasesTab");
    expect(navigate).toHaveBeenCalledWith("MainTabs", { screen: "ClasesTab" });
  });

  it("con pantalla, usa la forma anidada explicita", () => {
    const navigate = jest.fn();
    navigateToHub({ navigate }, "OfficeTab", "ListaRecursos");
    expect(navigate).toHaveBeenCalledWith("MainTabs", {
      screen: "OfficeTab",
      params: { screen: "ListaRecursos", params: undefined },
    });
  });

  it("con pantalla y parametros, los anida completos", () => {
    const navigate = jest.fn();
    navigateToHub({ navigate }, "OfficeTab", "Contenido", {
      selectionMode: true,
      targetGroupId: "7",
    });
    expect(navigate).toHaveBeenCalledWith("MainTabs", {
      screen: "OfficeTab",
      params: {
        screen: "Contenido",
        params: { selectionMode: true, targetGroupId: "7" },
      },
    });
  });
});

describe("goBackOrHubLanding", () => {
  it("con historial, regresa al origen real", () => {
    const navigation = {
      navigate: jest.fn(),
      canGoBack: jest.fn().mockReturnValue(true),
      goBack: jest.fn(),
    };
    goBackOrHubLanding(navigation, "ClasesTab");
    expect(navigation.goBack).toHaveBeenCalled();
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it("sin historial, aterriza en la pantalla inicial del hub", () => {
    const navigation = {
      navigate: jest.fn(),
      canGoBack: jest.fn().mockReturnValue(false),
      goBack: jest.fn(),
    };
    goBackOrHubLanding(navigation, "OfficeTab");
    expect(navigation.goBack).not.toHaveBeenCalled();
    expect(navigation.navigate).toHaveBeenCalledWith("MainTabs", {
      screen: "OfficeTab",
      params: { screen: "OfficeHome", params: undefined },
    });
  });
});
