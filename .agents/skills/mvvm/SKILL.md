---
name: mvvm
description: Enforce MVVM architecture in React Native/Expo apps, especially screens, hooks as ViewModels, services, and code reviews.
---

# MVVM Architecture Skill - React Native / Expo

## Purpose

Enforce Model-View-ViewModel (MVVM) pattern across the entire codebase. Every screen and component must separate concerns cleanly.

## Layer Definitions

### Model (Data Layer)
- Location: `types/`, `src/services/`, `src/sync/`
- Contains: TypeScript types/interfaces, API clients, AsyncStorage persistence, data transformation
- Rules:
  - No React imports
  - No UI logic
  - Pure functions and async service calls
  - One service file per domain entity (e.g. `gruposService.ts`, `planeacionesService.ts`)

### ViewModel (Logic Layer)
- Location: `src/hooks/` (one file per screen or shared domain)
- Naming: `use{ScreenName}ViewModel.ts` (e.g. `useCrearGrupoViewModel.ts`)
- Contains: all `useState`, `useEffect`, `useCallback`, `useMemo`, derived state, validation, business logic, navigation triggers
- Rules:
  - Custom hook that returns a typed interface
  - No JSX
  - No `StyleSheet`, no layout logic
  - May call services, context, other hooks
  - Must define a return type interface (e.g. `CrearGrupoViewModel`)
  - All event handlers live here (onSave, onDelete, onChange, etc.)
  - Navigation calls go here when triggered by logic (e.g. after save)

### View (Presentation Layer)
- Location: `src/screens/`, `src/components/`
- Contains: JSX rendering, StyleSheet, layout
- Rules:
  - Call the ViewModel hook at the top: `const vm = useXxxViewModel()`
  - Destructure only what is needed from the ViewModel
  - No `useState` for business state (UI-only state like `scrollY` or `menuVisible` is allowed)
  - No direct service calls
  - No async operations
  - No data transformation or validation logic
  - Bind ViewModel properties to JSX: `<Text>{vm.title}</Text>`
  - Bind ViewModel handlers to events: `<Button onPress={vm.onSave} />`

## ViewModel Template

```typescript
// src/hooks/useExampleViewModel.ts
import { useState, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/StackNavigator";

export interface ExampleViewModel {
  // State
  title: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  setTitle: (value: string) => void;
  onSave: () => Promise<void>;
}

export const useExampleViewModel = (): ExampleViewModel => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSave = useCallback(async () => {
    setIsLoading(true);
    try {
      // call service
      navigation.goBack();
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  }, [title, navigation]);

  return { title, isLoading, error, setTitle, onSave };
};
```

## When This Skill Applies

- Creating any new screen or component
- Modifying any existing screen
- Reviewing pull requests
- Refactoring code

## Refactoring Checklist

When modifying a screen that does NOT follow MVVM:
1. Create `src/hooks/use{Screen}ViewModel.ts`
2. Move all `useState` (except UI-only state) into the ViewModel
3. Move all `useEffect` with business logic into the ViewModel
4. Move all handler functions into the ViewModel
5. Move all service/context calls into the ViewModel
6. Define a typed return interface
7. In the screen, call the hook and bind to JSX
8. Verify the screen file contains only: JSX, StyleSheet, UI-only state

## Exceptions

- **Pure navigation screens** (no state, just menu cards that navigate): ViewModel is optional if the screen has zero state and zero logic. Still recommended for consistency.
- **UI-only state**: `menuVisible`, `scrollPosition`, `expanded` toggles that control layout can stay in the View.
- **Shared components** (`SemanaEditor`, `EvaluacionEditor`): May keep local UI state for controlled inputs. Business logic should be in the parent ViewModel, passed down as callbacks via props.

## File Organization

```
src/
  hooks/
    useGrupos.ts
    useLoginViewModel.ts
    useHomeViewModel.ts
    useCrearPlaneacionViewModel.ts
    useEditorPlaneacionViewModel.ts
    useListaPlaneacionesViewModel.ts
    useCrearGrupoViewModel.ts
    useListaGruposViewModel.ts
    useDetalleGrupoViewModel.ts
    useCrearTareaGrupoViewModel.ts
    useCalificarEntregasViewModel.ts
    useListaRecursosViewModel.ts
    useCuentaViewModel.ts
  screens/
    (Views only - JSX + StyleSheet)
  services/
    (Model - data access)
  types/
    (Model - type definitions)
```

## Do Not

- Put `useState` for domain data inside a screen component
- Call services directly from a screen component
- Put navigation logic inside JSX event handlers inline
- Skip the typed return interface on ViewModels
- Name ViewModel files without the `use` prefix
