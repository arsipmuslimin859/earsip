export interface Archive {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  file_path: string | null;
  file_name: string;
  file_size: number;
  file_type: string | null;
  external_url: string | null;
  is_public: boolean;
  version: number;
  parent_version_id: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  tags?: Tag[];
  metadata?: ArchiveMetadata[];
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface ArchiveMetadata {
  id: string;
  archive_id: string;
  field_name: string;
  field_value: string | null;
  field_type: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export interface ModuleConfig {
  id: string;
  name: string;
  enabled: boolean;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MetadataField {
  field: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'number' | 'select';
  required: boolean;
  options?: string[];
}

export interface InstitutionConfig {
  institutionName: string;
  modules: {
    retention: boolean;
    publicArchive: boolean;
    tagging: boolean;
    versioning: boolean;
    metadataDynamic: boolean;
  };
  metadataSchema: MetadataField[];
  theme: {
    primaryColor: string;
    defaultColorScheme: 'light' | 'dark';
  };
  storage: {
    bucketName: string;
    maxFileSize: number;
    allowedFileTypes: string[];
  };
}
