/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** External API base for the timetable proxy (see AGENTS.md § Deployment). */
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
