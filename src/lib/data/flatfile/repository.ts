import { promises as fs } from 'fs';
import path from 'path';
import type {
  DataRepository, Task, Item, User, LabelTemplate,
  PrintJob, AuditEntry, AppSettings, Workstation
} from '../types';

const DATA_FILE = path.join(process.cwd(), 'data', 'demo-data.json');

interface DemoData {
  users: (User & { password?: string })[];
  items: Item[];
  tasks: Task[];
  labelTemplates: LabelTemplate[];
  printJobs: PrintJob[];
  auditLog: AuditEntry[];
  workstations: Workstation[];
  settings: AppSettings;
}

async function readData(): Promise<DemoData> {
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

async function writeData(data: DemoData): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

function now(): string {
  return new Date().toISOString();
}

export const flatFileRepository: DataRepository = {
  // ---- Tasks ----
  async getTasks() {
    const data = await readData();
    // Enrich with item data
    return data.tasks.map(task => ({
      ...task,
      item: data.items.find(i => i.id === task.itemId),
      assignedToUser: data.users.find(u => u.id === task.assignedTo),
    }));
  },

  async getTask(id: string) {
    const data = await readData();
    const task = data.tasks.find(t => t.id === id);
    if (!task) return null;
    return {
      ...task,
      item: data.items.find(i => i.id === task.itemId),
      assignedToUser: data.users.find(u => u.id === task.assignedTo),
    };
  },

  async createTask(taskData) {
    const data = await readData();
    const task: Task = {
      ...taskData,
      id: generateId('task'),
      createdAt: now(),
      updatedAt: now(),
      activityLog: [{
        id: generateId('act'),
        timestamp: now(),
        userId: taskData.createdBy,
        userName: data.users.find(u => u.id === taskData.createdBy)?.name || 'System',
        action: 'Task erstellt',
        details: `Task "${taskData.title}" angelegt.`,
      }],
    };
    data.tasks.push(task);
    await writeData(data);
    return task;
  },

  async updateTask(id: string, updates: Partial<Task>) {
    const data = await readData();
    const index = data.tasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    data.tasks[index] = { ...data.tasks[index], ...updates, updatedAt: now() };
    await writeData(data);
    return data.tasks[index];
  },

  async deleteTask(id: string) {
    const data = await readData();
    const index = data.tasks.findIndex(t => t.id === id);
    if (index === -1) return false;
    data.tasks.splice(index, 1);
    await writeData(data);
    return true;
  },

  // ---- Items ----
  async getItems() {
    const data = await readData();
    return data.items;
  },

  async getItem(id: string) {
    const data = await readData();
    return data.items.find(i => i.id === id) || null;
  },

  async createItem(itemData) {
    const data = await readData();
    const item: Item = {
      ...itemData,
      id: generateId('item'),
      createdAt: now(),
      updatedAt: now(),
      changeHistory: [],
    };
    data.items.push(item);
    await writeData(data);
    return item;
  },

  async updateItem(id: string, updates: Partial<Item>) {
    const data = await readData();
    const index = data.items.findIndex(i => i.id === id);
    if (index === -1) return null;
    data.items[index] = { ...data.items[index], ...updates, updatedAt: now() };
    await writeData(data);
    return data.items[index];
  },

  async deleteItem(id: string) {
    const data = await readData();
    const index = data.items.findIndex(i => i.id === id);
    if (index === -1) return false;
    data.items.splice(index, 1);
    await writeData(data);
    return true;
  },

  // ---- Users ----
  async getUsers() {
    const data = await readData();
    // Strip passwords
    return data.users.map(({ password: _pw, ...user }) => user as User);
  },

  async getUser(id: string) {
    const data = await readData();
    const user = data.users.find(u => u.id === id);
    if (!user) return null;
    const { password: _pw, ...safeUser } = user;
    return safeUser as User;
  },

  async getUserByEmail(email: string) {
    const data = await readData();
    const user = data.users.find(u => u.email === email);
    if (!user) return null;
    const { password: _pw, ...safeUser } = user;
    return safeUser as User;
  },

  async createUser(userData) {
    const data = await readData();
    const user: User = {
      ...userData,
      id: generateId('usr'),
      createdAt: now(),
      updatedAt: now(),
    };
    data.users.push(user as User & { password?: string });
    await writeData(data);
    return user;
  },

  async updateUser(id: string, updates: Partial<User>) {
    const data = await readData();
    const index = data.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    data.users[index] = { ...data.users[index], ...updates, updatedAt: now() };
    await writeData(data);
    const { password: _pw, ...safeUser } = data.users[index];
    return safeUser as User;
  },

  async deleteUser(id: string) {
    const data = await readData();
    const index = data.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    data.users.splice(index, 1);
    await writeData(data);
    return true;
  },

  // ---- Label Templates ----
  async getLabelTemplates() {
    const data = await readData();
    return data.labelTemplates;
  },

  async getLabelTemplate(id: string) {
    const data = await readData();
    return data.labelTemplates.find(t => t.id === id) || null;
  },

  async createLabelTemplate(templateData) {
    const data = await readData();
    const template: LabelTemplate = {
      ...templateData,
      id: generateId('lbl'),
      createdAt: now(),
      updatedAt: now(),
    };
    data.labelTemplates.push(template);
    await writeData(data);
    return template;
  },

  async updateLabelTemplate(id: string, updates: Partial<LabelTemplate>) {
    const data = await readData();
    const index = data.labelTemplates.findIndex(t => t.id === id);
    if (index === -1) return null;
    data.labelTemplates[index] = { ...data.labelTemplates[index], ...updates, updatedAt: now() };
    await writeData(data);
    return data.labelTemplates[index];
  },

  async deleteLabelTemplate(id: string) {
    const data = await readData();
    const index = data.labelTemplates.findIndex(t => t.id === id);
    if (index === -1) return false;
    data.labelTemplates.splice(index, 1);
    await writeData(data);
    return true;
  },

  // ---- Print Jobs ----
  async getPrintJobs() {
    const data = await readData();
    return data.printJobs;
  },

  async createPrintJob(jobData) {
    const data = await readData();
    const job: PrintJob = {
      ...jobData,
      id: generateId('pj'),
      createdAt: now(),
    };
    data.printJobs.push(job);
    await writeData(data);
    return job;
  },

  // ---- Audit ----
  async getAuditLog() {
    const data = await readData();
    return data.auditLog.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async createAuditEntry(entryData) {
    const data = await readData();
    const entry: AuditEntry = {
      ...entryData,
      id: generateId('audit'),
      timestamp: now(),
    };
    data.auditLog.push(entry);
    await writeData(data);
    return entry;
  },

  // ---- Settings ----
  async getSettings() {
    const data = await readData();
    return data.settings;
  },

  async updateSettings(updates: Partial<AppSettings>) {
    const data = await readData();
    data.settings = {
      ...data.settings,
      ...updates,
      general: { ...data.settings.general, ...(updates.general || {}) },
      tasks: { ...data.settings.tasks, ...(updates.tasks || {}) },
      labels: { ...data.settings.labels, ...(updates.labels || {}) },
      qzTray: { ...data.settings.qzTray, ...(updates.qzTray || {}) },
      weclapp: { ...data.settings.weclapp, ...(updates.weclapp || {}) },
      wms: { ...data.settings.wms, ...(updates.wms || {}) },
      userSync: { ...(data.settings as any).userSync, ...(updates as any).userSync || {} },
      api: { ...data.settings.api, ...(updates.api || {}) },
      system: { ...data.settings.system, ...(updates.system || {}) },
    };
    await writeData(data);
    return data.settings;
  },

  // ---- Workstations ----
  async getWorkstations() {
    const data = await readData();
    return data.workstations || [];
  },

  async getWorkstation(id: string) {
    const data = await readData();
    return (data.workstations || []).find(w => w.id === id) || null;
  },

  async createWorkstation(wsData) {
    const data = await readData();
    if (!data.workstations) data.workstations = [];
    const ws: Workstation = {
      ...wsData,
      id: generateId('ws'),
      createdAt: now(),
      updatedAt: now(),
    };
    data.workstations.push(ws);
    await writeData(data);
    return ws;
  },

  async updateWorkstation(id: string, updates: Partial<Workstation>) {
    const data = await readData();
    if (!data.workstations) return null;
    const index = data.workstations.findIndex(w => w.id === id);
    if (index === -1) return null;
    data.workstations[index] = { ...data.workstations[index], ...updates, updatedAt: now() };
    await writeData(data);
    return data.workstations[index];
  },

  async deleteWorkstation(id: string) {
    const data = await readData();
    if (!data.workstations) return false;
    const index = data.workstations.findIndex(w => w.id === id);
    if (index === -1) return false;
    data.workstations.splice(index, 1);
    await writeData(data);
    return true;
  },
};
