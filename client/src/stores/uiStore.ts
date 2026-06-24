import { create } from 'zustand';

interface UIStore {
  theme: 'dark' | 'light';
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  modalState: {
    aiGenerate: boolean;
    joinGame: boolean;
    quizPreview: boolean;
    confirmation: boolean;
  };
  confirmationData: {
    title: string;
    message: string;
    onConfirm: (() => void) | null;
  };

  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  openModal: (modal: keyof UIStore['modalState']) => void;
  closeModal: (modal: keyof UIStore['modalState']) => void;
  showConfirmation: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirmation: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  theme: 'dark',
  sidebarOpen: true,
  mobileMenuOpen: false,
  modalState: {
    aiGenerate: false,
    joinGame: false,
    quizPreview: false,
    confirmation: false,
  },
  confirmationData: {
    title: '',
    message: '',
    onConfirm: null,
  },

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('quizverse_theme', theme);
      if (theme === 'light') {
        document.body.classList.add('light');
      } else {
        document.body.classList.remove('light');
      }
    }
    set({ theme });
  },

  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('quizverse_theme', newTheme);
        if (newTheme === 'light') {
          document.body.classList.add('light');
        } else {
          document.body.classList.remove('light');
        }
      }
      return { theme: newTheme };
    }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

  openModal: (modal) =>
    set((state) => ({
      modalState: { ...state.modalState, [modal]: true },
    })),

  closeModal: (modal) =>
    set((state) => ({
      modalState: { ...state.modalState, [modal]: false },
    })),

  showConfirmation: (title, message, onConfirm) =>
    set((state) => ({
      modalState: { ...state.modalState, confirmation: true },
      confirmationData: { title, message, onConfirm },
    })),

  closeConfirmation: () =>
    set((state) => ({
      modalState: { ...state.modalState, confirmation: false },
      confirmationData: { title: '', message: '', onConfirm: null },
    })),
}));
