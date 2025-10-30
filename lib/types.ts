export type DeviceSize = 'desktop' | 'tablet' | 'mobile';

export interface ComponentInstance {
  id: string;
  type: string;
  props?: Record<string, any>;
  name?: string;
  snippet?: string;
  language?: string;
  version?: string;

}

export interface EditorField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'color' | 'image' | 'select' | 'switch';
  options?: { value: string; label: string }[];
}

export interface ComponentDefinition {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  editorFields?: EditorField[];
}

export interface ProjectSettings {
  title: string;
  description: string;
  favicon: string;
  siteUrl: string;
  author: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

export interface DeploymentResult {
  success: boolean;
  url: string;
  error?: string;
}

export interface ExportOptions {
  format: 'next' | 'astro' | 'html';
  components: ComponentInstance[];
  settings: ProjectSettings;
}