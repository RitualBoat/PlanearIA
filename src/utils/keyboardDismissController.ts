let keyboardDismissHandler: (() => void) | null = null;

export const setGlobalKeyboardDismissHandler = (handler: (() => void) | null) => {
  keyboardDismissHandler = handler;
};

export const runGlobalKeyboardDismissHandler = () => {
  keyboardDismissHandler?.();
};
