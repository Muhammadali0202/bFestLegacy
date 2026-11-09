import { BusinessSector } from '@/types';
import { StartupRepository } from './store';
import { initialEventConfig } from './mockData';

const VALID_SECTORS: BusinessSector[] = [
  'FinTech & Banking',
  'AgriTech & Food',
  'HealthTech & Med',
  'EdTech & Learning',
  'AI & Smart Systems',
  'Green & CleanTech',
  'E-Commerce & Logistics',
];

const SECTOR_LOGOS: Record<BusinessSector, string> = {
  'FinTech & Banking': '💳',
  'AgriTech & Food': '🌱',
  'HealthTech & Med': '🩺',
  'EdTech & Learning': '📚',
  'AI & Smart Systems': '🤖',
  'Green & CleanTech': '☀️',
  'E-Commerce & Logistics': '🚚',
};

export function normalizeSector(raw?: string): BusinessSector {
  if (!raw) return 'AI & Smart Systems';
  const cleaned = raw.trim().toLowerCase();
  const match = VALID_SECTORS.find(
    (s) =>
      s.toLowerCase() === cleaned ||
      s.toLowerCase().includes(cleaned) ||
      cleaned.includes(s.split(' ')[0].toLowerCase())
  );
  return match || 'AI & Smart Systems';
}

export function parseCsv(csvText: string): Record<string, string>[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentRow.push(currentField.trim());
        if (currentRow.some((cell) => cell.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
        if (char === '\r') i++;
      } else {
        currentField += char;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((cell) => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim());
  const records: Record<string, string>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const obj: Record<string, string>[] | any = {};
    headers.forEach((h, idx) => {
      if (h) obj[h] = row[idx] || '';
    });
    records.push(obj);
  }

  return records;
}

function pickColumn(row: Record<string, string>, keywords: string[]): string {
  const keys = Object.keys(row);
  for (const key of keys) {
    const lower = key.toLowerCase();
    if (keywords.some((kw) => lower === kw || lower.includes(kw))) {
      if (row[key] && row[key].trim()) {
        return row[key].trim();
      }
    }
  }
  return '';
}

let lastAutoSyncTime = 0;

export async function syncGoogleSheetToDatabase(options?: {
  sheetUrl?: string;
  googleFormUrl?: string;
  csvData?: string;
  autoApprove?: boolean;
  force?: boolean;
}) {
  const now = Date.now();
  if (!options?.force && now - lastAutoSyncTime < 15000) {
    return { success: true, importedCount: 0, skippedCount: 0, cached: true };
  }
  lastAutoSyncTime = now;

  const autoApprove = options?.autoApprove ?? true;
  let rawCsv = options?.csvData || '';

  if (!rawCsv) {
    const config = await StartupRepository.getEventConfig();
    const targetSheetUrl =
      options?.sheetUrl || config.googleSheetUrl || initialEventConfig.googleSheetUrl || '';

    if (!targetSheetUrl) {
      return { success: false, error: 'No Google Sheet URL configured.' };
    }

    const match = String(targetSheetUrl).match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      return {
        success: false,
        error: 'Invalid Google Sheet URL. Make sure it looks like https://docs.google.com/spreadsheets/d/.../edit',
      };
    }

    if (options?.sheetUrl || options?.googleFormUrl) {
      const updatePayload: Record<string, string> = {};
      if (options.sheetUrl) updatePayload.googleSheetUrl = options.sheetUrl.trim();
      if (options.googleFormUrl) updatePayload.googleFormUrl = options.googleFormUrl.trim();
      await StartupRepository.updateEventConfig(updatePayload);
    }

    const spreadsheetId = match[1];
    const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;

    const response = await fetch(exportUrl, { cache: 'no-store' });
    if (!response.ok) {
      return {
        success: false,
        error: 'Could not read Google Sheet. Ensure sharing is set to "Anyone with the link can view".',
      };
    }

    rawCsv = await response.text();
  }

  const rows = parseCsv(rawCsv);
  if (rows.length === 0) {
    return {
      success: true,
      importedCount: 0,
      skippedCount: 0,
      message: 'Google Sheet is connected (0 response rows currently in sheet).',
    };
  }

  const existingStartups = await StartupRepository.getAll({ status: 'all', skipAutoSync: true } as any);
  let importedCount = 0;
  let skippedCount = 0;

  for (const row of rows) {
    const name =
      pickColumn(row, ['stall name', 'startup name', 'startup', 'venture', 'project', 'business name', 'title', 'team name']) ||
      Object.values(row)[1] ||
      '';

    if (!name) {
      skippedCount++;
      continue;
    }

    const alreadyExists = existingStartups.some(
      (s) => s.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
    if (alreadyExists) {
      skippedCount++;
      continue;
    }

    const contactEmail =
      pickColumn(row, ['email', 'contact']) ||
      `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@imsciences.edu.pk`;
    const tagline =
      pickColumn(row, ['tagline', 'one-liner', 'short pitch', 'idea', 'summary']) ||
      'Registered Stall at Business Fest 2027';
    const description =
      pickColumn(row, ['description', 'detail', 'about', 'overview']) || tagline;
    const problem = pickColumn(row, ['problem', 'challenge']);
    const solution = pickColumn(row, ['solution', 'product']);
    const sector = normalizeSector(pickColumn(row, ['sector', 'category', 'industry', 'domain', 'track']));
    const founderName =
      pickColumn(row, ['founder', 'leader', 'student name', 'full name', 'owner', 'member']) ||
      'Student Team Lead';
    const department =
      pickColumn(row, ['department', 'role', 'program', 'semester']) || 'Founder';
    const boothNumber =
      pickColumn(row, ['stall no', 'booth', 'table']) || 'Allocated Stall';

    const created = await StartupRepository.register({
      name: name.trim(),
      tagline,
      description,
      problem,
      solution,
      sector,
      logo: SECTOR_LOGOS[sector] || '🚀',
      website: pickColumn(row, ['website', 'link', 'url']),
      contactEmail,
      founders: [{ name: founderName, role: department }],
      boothNumber,
      submittedBy: 'google-sheet-sync',
    });

    if (autoApprove) {
      await StartupRepository.updateStatus(created.id, 'approved', true);
    }

    existingStartups.push(created);
    importedCount++;
  }

  return {
    success: true,
    importedCount,
    skippedCount,
    message: `Synced Google Sheet: ${importedCount} new stall(s) imported to live website, ${skippedCount} already synced.`,
  };
}
