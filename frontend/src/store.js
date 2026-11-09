import { create } from 'zustand'

export const useAppStore = create((set, get) => ({
  session: null,
  snippets: [],
  activeSnippetId: null,
  setSession: value => set(state => ({ session: typeof value === 'function' ? value(state.session) : value })),
  setSnippets: value => set(state => ({ snippets: typeof value === 'function' ? value(state.snippets) : value })),
  setActiveSnippetId: activeSnippetId => set(state => state.activeSnippetId === activeSnippetId ? state : { activeSnippetId }),
  resetWorkspace: () => set({ session: null, snippets: [], activeSnippetId: null }),
  getActiveSnippet: () => get().snippets.find(item => item._id === get().activeSnippetId) || null,
}))
