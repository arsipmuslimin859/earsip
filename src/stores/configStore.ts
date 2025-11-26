import { create } from 'zustand';
import institutionConfig from '../config/institution.config.json';
import type { InstitutionConfig } from '../types';

interface ConfigState {
  config: InstitutionConfig;
  updateConfig: (config: Partial<InstitutionConfig>) => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
  config: institutionConfig as InstitutionConfig,
  updateConfig: (newConfig) =>
    set((state) => ({
      config: { ...state.config, ...newConfig },
    })),
}));
