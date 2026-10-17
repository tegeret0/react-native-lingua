import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type LanguageState = {
  selectedLanguageId: string | null;
  hasHydrated: boolean;
  setSelectedLanguage: (languageId: string) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  clearLanguageSelection: () => Promise<void>;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      selectedLanguageId: null,
      hasHydrated: false,
      setSelectedLanguage: (languageId) => set({ selectedLanguageId: languageId }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      clearLanguageSelection: async () => {
        await AsyncStorage.clear();
        set({ selectedLanguageId: null });
      },
    }),
    {
      name: "language-preferences",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ selectedLanguageId: state.selectedLanguageId }) as LanguageState,
      onRehydrateStorage: (state) => () => state?.setHasHydrated(true),
    },
  ),
);
