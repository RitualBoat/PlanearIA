import { Store } from '@tauri-apps/plugin-store';
import { TLUserPreferences, defaultUserPreferences } from 'tldraw';

const SETTINGS_FILE = 'rishah-settings.json';
const USER_PREFS_KEY = 'userPreferences';
const INSTANCE_STATE_KEY = 'instanceState';
const DEFAULT_USER_ID = 'rishah-user';

export interface InstanceState {
  isGridMode: boolean;
}

// Calculate diff between prefs and defaults
const getDiff = <T extends Record<string, any>>(obj: T, defaults: Partial<T>): Partial<T> =>
  Object.fromEntries(
    Object.entries(obj).filter(([key, value]) =>
      key === 'id' || (key in defaults && defaults[key] !== value)
    )
  ) as Partial<T>;

// Get store instance
async function getStore(): Promise<Store> {
  return Store.load(SETTINGS_FILE);
}

// Create default user preferences with custom settings
function createDefaultPreferences(): TLUserPreferences {
  return {
    ...defaultUserPreferences,
    isSnapMode: true,
    id: DEFAULT_USER_ID
  };
}

// Initialize user preferences (load or create)
export async function initializeUserPreferences(): Promise<TLUserPreferences> {
  try {
    const store = await getStore();
    const savedPrefs = await store.get<Partial<TLUserPreferences>>(USER_PREFS_KEY);

    if (savedPrefs) {
      // Merge saved changes with defaults
      return {
        ...createDefaultPreferences(),
        ...savedPrefs,
      };
    }

    // First time - save only the ID
    await store.set(USER_PREFS_KEY, { id: DEFAULT_USER_ID });
    await store.save();

    return createDefaultPreferences();
  } catch (error) {
    console.error('Failed to load user preferences:', error);
    return createDefaultPreferences();
  }
}

// Save user preferences (only what changed from defaults)
export async function saveUserPreferences(prefs: TLUserPreferences): Promise<void> {
  try {
    const store = await getStore();
    const changedPrefs = getDiff(prefs, defaultUserPreferences);

    await store.set(USER_PREFS_KEY, changedPrefs);
    await store.save();
  } catch (error) {
    console.error('Failed to save user preferences:', error);
  }
}

// Load instance state
export async function loadInstanceState(): Promise<InstanceState | null> {
  try {
    const store = await getStore();
    return await store.get<InstanceState>(INSTANCE_STATE_KEY) ?? null;
  } catch (error) {
    console.error('Failed to load instance state:', error);
    return null;
  }
}

// Save instance state
export async function saveInstanceState(state: InstanceState): Promise<void> {
  try {
    const store = await getStore();
    await store.set(INSTANCE_STATE_KEY, state);
    await store.save();
  } catch (error) {
    console.error('Failed to save instance state:', error);
  }
}
