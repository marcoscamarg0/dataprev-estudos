import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DATAPREV_CURRICULUM, SubjectData } from "@/lib/curriculum";

export interface EditalData {
  id: string;
  title: string;
  role?: string;
  overview?: string;
  createdAt: string;
  curriculum: SubjectData[];
}

const DEFAULT_EDITAL: EditalData = {
  id: "dataprev-2026",
  title: "Dataprev 2026 - Desenvolvedor",
  createdAt: new Date().toISOString(),
  curriculum: DATAPREV_CURRICULUM,
};

interface CurriculumState {
  editais: EditalData[];
  activeEditalId: string;
  addEdital: (edital: Omit<EditalData, "id" | "createdAt">) => void;
  updateEdital: (id: string, data: Partial<Omit<EditalData, "id" | "createdAt">>) => void;
  removeEdital: (id: string) => void;
  setActiveEdital: (id: string) => void;
}

export const useCurriculumStore = create<CurriculumState>()(
  persist(
    (set) => ({
      editais: [DEFAULT_EDITAL],
      activeEditalId: "dataprev-2026",
      addEdital: (editalData) =>
        set((state) => {
          const newEdital = {
            ...editalData,
            id: `edital-${Date.now()}`,
            createdAt: new Date().toISOString(),
          };
          return {
            editais: [...state.editais, newEdital],
            activeEditalId: newEdital.id, // Auto-select on add
          };
        }),
      updateEdital: (id, data) =>
        set((state) => {
          const newEditais = state.editais.map((e) =>
            e.id === id ? { ...e, ...data } : e
          );
          return { editais: newEditais };
        }),
      removeEdital: (id) =>
        set((state) => {
          if (id === "dataprev-2026") return state; // Prevent removing default
          const newEditais = state.editais.filter((e) => e.id !== id);
          return {
            editais: newEditais,
            activeEditalId:
              state.activeEditalId === id ? "dataprev-2026" : state.activeEditalId,
          };
        }),
      setActiveEdital: (id) => set({ activeEditalId: id }),
    }),
    {
      name: "trampo-hub-curriculum",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Helper hook to get just the active curriculum data directly
export const useActiveCurriculum = (): SubjectData[] => {
  const { editais, activeEditalId } = useCurriculumStore();
  const active = editais.find((e) => e.id === activeEditalId);
  return active?.curriculum || DATAPREV_CURRICULUM;
};

export const useActiveEditalTitle = () => {
  const activeId = useCurriculumStore((s) => s.activeEditalId);
  return useCurriculumStore((s) => s.editais.find((e) => e.id === activeId)?.title || "Edital Desconhecido");
};

export const useActiveEditalOverview = () => {
  const activeId = useCurriculumStore((s) => s.activeEditalId);
  return useCurriculumStore((s) => s.editais.find((e) => e.id === activeId)?.overview || "");
};
