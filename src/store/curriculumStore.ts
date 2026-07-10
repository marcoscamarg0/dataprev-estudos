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
  isSyncing: boolean;
  
  // Syncs all editais from DB
  fetchEditais: () => Promise<void>;
  
  addEdital: (edital: Omit<EditalData, "id" | "createdAt">) => Promise<void>;
  updateEdital: (id: string, data: Partial<Omit<EditalData, "id" | "createdAt">>) => Promise<void>;
  removeEdital: (id: string) => Promise<void>;
  setActiveEdital: (id: string) => void;
}

export const useCurriculumStore = create<CurriculumState>()(
  persist(
    (set, get) => ({
      editais: [DEFAULT_EDITAL],
      activeEditalId: "dataprev-2026",
      isSyncing: false,

      fetchEditais: async () => {
        set({ isSyncing: true });
        try {
          const res = await fetch("/api/editais");
          if (res.ok) {
            const data = await res.json();
            if (data.editais && data.editais.length > 0) {
              set({ editais: data.editais });
              // If active edital doesn't exist anymore, set to first
              const currentActive = get().activeEditalId;
              if (!data.editais.find((e: EditalData) => e.id === currentActive)) {
                set({ activeEditalId: data.editais[0].id });
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch editais:", error);
        } finally {
          set({ isSyncing: false });
        }
      },

      addEdital: async (editalData) => {
        try {
          const res = await fetch("/api/editais", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editalData),
          });
          if (res.ok) {
            const data = await res.json();
            set((state) => ({
              editais: [data.edital, ...state.editais],
              activeEditalId: data.edital.id, // Auto-select on add
            }));
          }
        } catch (error) {
          console.error("Failed to add edital:", error);
        }
      },

      updateEdital: async (id, data) => {
        try {
          const res = await fetch(`/api/editais/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (res.ok) {
            const updated = await res.json();
            set((state) => ({
              editais: state.editais.map((e) => (e.id === id ? updated.edital : e)),
            }));
          }
        } catch (error) {
          console.error("Failed to update edital:", error);
        }
      },

      removeEdital: async (id) => {
        if (id === "dataprev-2026") return; // Keep default if needed, or remove this check if DB driven
        try {
          const res = await fetch(`/api/editais/${id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            set((state) => ({
              editais: state.editais.filter((e) => e.id !== id),
              activeEditalId:
                state.activeEditalId === id
                  ? state.editais.find((e) => e.id !== id)?.id || "dataprev-2026"
                  : state.activeEditalId,
            }));
          }
        } catch (error) {
          console.error("Failed to delete edital:", error);
        }
      },

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
