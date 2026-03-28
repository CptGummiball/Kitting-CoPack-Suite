/* =============================================
   KITTING & COPACK SUITE — Data Types
   ============================================= */

// ---- Enums ----

export type TaskStatus = 'open' | 'planned' | 'in-progress' | 'paused' | 'completed' | 'blocked';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low' | 'none';
export type UserRole = 'admin' | 'supervisor' | 'user';
export type UserStatus = 'active' | 'inactive';

// ---- Permission System ----

export const PERMISSIONS = [
  'tasks.view',
  'tasks.create',
  'tasks.edit',
  'tasks.delete',
  'tasks.assign',
  'tasks.status',
  'items.view',
  'items.create',
  'items.edit',
  'items.delete',
  'users.view',
  'users.create',
  'users.edit',
  'users.delete',
  'users.permissions',
  'labels.view',
  'labels.create',
  'labels.edit',
  'labels.delete',
  'labels.print',
  'settings.view',
  'settings.edit',
  'settings.api',
  'settings.system',
  'audit.view',
  'reports.view',
] as const;

export type Permission = typeof PERMISSIONS[number];

export const ROLE_TEMPLATES: Record<UserRole, Permission[]> = {
  admin: [...PERMISSIONS],
  supervisor: [
    'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.assign', 'tasks.status',
    'items.view', 'items.create', 'items.edit',
    'users.view',
    'labels.view', 'labels.create', 'labels.edit', 'labels.print',
    'settings.view',
    'audit.view',
    'reports.view',
  ],
  user: [
    'tasks.view', 'tasks.status',
    'items.view',
    'labels.view', 'labels.print',
  ],
};

// ---- Core Entities ----

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  permissions: Permission[];
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface Component {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  alternativeComponent?: string;
  notes?: string;
}

export interface InstructionStep {
  step: number;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface LabelConfig {
  templateId: string;
  templateName: string;
  size: string;
  defaultQuantity: number;
}

export interface Item {
  id: string;
  sku: string;
  ean?: string;
  name: string;
  description: string;
  components: Component[];
  instructions: InstructionStep[];
  specialNotes: string;
  labelConfigs: LabelConfig[];
  packagingData?: string;
  isActive: boolean;
  requiresBatchNumber?: boolean;
  createdAt: string;
  updatedAt: string;
  changeHistory: AuditEntry[];
}

export interface Task {
  id: string;
  title: string;
  referenceId: string;
  itemId: string;
  item?: Item;
  status: TaskStatus;
  priority: TaskPriority;
  batchNumber?: string;
  plannedDate: string;
  dueDate: string;
  estimatedQuantity: number;
  completedQuantity: number;
  assignedTo?: string;
  assignedToUser?: User;
  specialInstructions: string;
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  activityLog: ActivityEntry[];
}

export interface ActivityEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  entityType: string;
  entityId: string;
  action: string;
  changes: string;
}

// ---- Label System ----

export interface LabelTemplate {
  id: string;
  name: string;
  description: string;
  size: string; // e.g. "100x50mm"
  width: number;
  height: number;
  zplTemplate: string;
  fields: LabelField[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LabelField {
  name: string;
  type: 'text' | 'barcode' | 'qrcode' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  dataSource: string; // e.g. "item.sku", "task.referenceId"
  defaultValue?: string;
}

export interface PrintJob {
  id: string;
  templateId: string;
  templateName: string;
  taskId?: string;
  itemId?: string;
  quantity: number;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  printedBy: string;
  printedByName: string;
  printerName?: string;
  error?: string;
  createdAt: string;
}

// ---- Settings ----

export interface AppSettings {
  general: {
    companyName: string;
    appTitle: string;
    language: string;
    timezone: string;
    dateFormat: string;
  };
  tasks: {
    statuses: { value: TaskStatus; label: string; color: string }[];
    priorities: { value: TaskPriority; label: string; color: string }[];
    defaultStatus: TaskStatus;
    defaultPriority: TaskPriority;
    batchPrefix: string;
  };
  labels: {
    defaultPrinterName: string;
    printerIp: string;
    printerPort: number;
    defaultLabelSize: string;
  };
  api: {
    enabled: boolean;
    apiKey: string;
    webhookUrl: string;
    webhookEvents: string[];
  };
  system: {
    dataBackend: 'flatfile' | 'mysql' | 'firebase';
    databaseUrl?: string;
    debugMode: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
  };
  theme: {
    primaryColor: string;
  };
}

// ---- Webhook Events ----

export type WebhookEvent =
  | 'task.created'
  | 'task.started'
  | 'task.completed'
  | 'task.updated'
  | 'item.created'
  | 'item.updated'
  | 'label.printed'
  | 'user.created'
  | 'user.updated';

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}

// ---- Repository Interface ----

export interface DataRepository {
  // Tasks
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | null>;
  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'activityLog'>): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | null>;
  deleteTask(id: string): Promise<boolean>;

  // Items
  getItems(): Promise<Item[]>;
  getItem(id: string): Promise<Item | null>;
  createItem(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'changeHistory'>): Promise<Item>;
  updateItem(id: string, updates: Partial<Item>): Promise<Item | null>;
  deleteItem(id: string): Promise<boolean>;

  // Users
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | null>;
  deleteUser(id: string): Promise<boolean>;

  // Labels
  getLabelTemplates(): Promise<LabelTemplate[]>;
  getLabelTemplate(id: string): Promise<LabelTemplate | null>;
  createLabelTemplate(template: Omit<LabelTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<LabelTemplate>;
  updateLabelTemplate(id: string, updates: Partial<LabelTemplate>): Promise<LabelTemplate | null>;
  deleteLabelTemplate(id: string): Promise<boolean>;

  // Print Jobs
  getPrintJobs(): Promise<PrintJob[]>;
  createPrintJob(job: Omit<PrintJob, 'id' | 'createdAt'>): Promise<PrintJob>;

  // Audit
  getAuditLog(): Promise<AuditEntry[]>;
  createAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<AuditEntry>;

  // Settings
  getSettings(): Promise<AppSettings>;
  updateSettings(settings: Partial<AppSettings>): Promise<AppSettings>;
}
