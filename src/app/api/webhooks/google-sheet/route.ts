import { NextRequest, NextResponse } from 'next/server';
import { StartupRepository } from '@/lib/store';
import { BusinessSector } from '@/types';

export const dynamic = 'force-dynamic';

const VALID_SECTORS: BusinessSector[] = [
  'FinTech & Banking',
  'AgriTech & Food',
  'HealthTech & Med',
  'EdTech & Learning',
  'AI & Smart Systems',
  'Green & CleanTech',
  'E-Commerce & Logistics',
];

function normalizeSector(raw?: string): BusinessSector {
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

// Parse CSV text handling quoted fields with commas/newlines
function parseCsv(csvText: string): Record<string, string>[] {
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
    const obj: Record<string, string> = {};
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sheetUrl, googleFormUrl, csvData, autoApprove = true } = body;

    let rawCsv = csvData || '';

    if (sheetUrl && !rawCsv) {
      // Extract Spreadsheet ID from standard Google Sheet URL
      const match = String(sheetUrl).match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid Google Sheet URL. Make sure it looks like https://docs.google.com/spreadsheets/d/.../edit',
          },
          { status: 400 }
        );
      }

      // Persist the shared Google Sheet URL (and optional Google Form URL) so Admin, Registration Team, and Student Affairs all share it
      const configUpdate: Record<string, string> = { googleSheetUrl: String(sheetUrl).trim() };
      if (googleFormUrl) configUpdate.googleFormUrl = String(googleFormUrl).trim();
      await StartupRepository.updateEventConfig(configUpdate);

      const spreadsheetId = match[1];
      const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;

      const response = await fetch(exportUrl, { cache: 'no-store' });
      if (!response.ok) {
        return NextResponse.json(
          {
            success: false,
            error: 'Could not read Google Sheet. Please make sure the Sheet sharing is set to "Anyone with the link can view".',
          },
          { status: 400 }
        );
      }

      rawCsv = await response.text();
    }

    if (!rawCsv) {
      return NextResponse.json(
        { success: false, error: 'Please provide either a Google Sheet URL or CSV content.' },
        { status: 400 }
      );
    }

    const rows = parseCsv(rawCsv);
    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No registration rows found in the sheet.' },
        { status: 400 }
      );
    }

    const existingStartups = await StartupRepository.getAll({ status: 'all' });
    let importedCount = 0;
    let skippedCount = 0;

    for (const row of rows) {
      const name =
        pickColumn(row, ['startup', 'stall name', 'venture', 'project', 'business name', 'title', 'team name']) ||
        Object.values(row)[1] || // Usually column B right after Timestamp in Google Forms
        '';

      if (!name) {
        skippedCount++;
        continue;
      }

      const contactEmail =
        pickColumn(row, ['email', 'contact']) ||
        `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@imsciences.edu.pk`;

      // Prevent duplicate imports if already synced
      const alreadyExists = existingStartups.some(
        (s) => s.name.toLowerCase() === name.toLowerCase()
      );
      if (alreadyExists) {
        skippedCount++;
        continue;
      }

      const tagline =
        pickColumn(row, ['tagline', 'one-liner', 'short pitch', 'idea', 'summary']) ||
        'Registered Stall at Business Fest 2027';
      const description =
        pickColumn(row, ['description', 'detail', 'about', 'overview']) || tagline;
      const problem = pickColumn(row, ['problem', 'challenge']);
      const solution = pickColumn(row, ['solution', 'product']);
      const sectorRaw = pickColumn(row, ['sector', 'category', 'industry', 'domain', 'track']);
      const founderName =
        pickColumn(row, ['founder', 'leader', 'student name', 'full name', 'owner', 'member']) ||
        'Student Team Lead';
      const founderRole =
        pickColumn(row, ['role', 'department', 'program', 'semester']) || 'Founder';
      const boothNumber =
        pickColumn(row, ['stall no', 'booth', 'table']) || 'Pending Allocation';

      const created = await StartupRepository.register({
        name,
        tagline,
        description,
        problem,
        solution,
        sector: normalizeSector(sectorRaw),
        logo: '🚀',
        website: pickColumn(row, ['website', 'link', 'url']),
        contactEmail,
        founders: [{ name: founderName, role: founderRole }],
        boothNumber,
        submittedBy: 'google-sheet-sync',
      });

      if (autoApprove) {
        await StartupRepository.updateStatus(created.id, 'approved', true);
      }

      existingStartups.push(created);
      importedCount++;
    }

    return NextResponse.json({
      success: true,
      importedCount,
      skippedCount,
      message: `Synced Google Sheet: ${importedCount} new stall(s) imported, ${skippedCount} existing/empty row(s) skipped.`,
    });
  } catch (error: any) {
    console.error('Error syncing Google Sheet:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync Google Sheet.' },
      { status: 500 }
    );
  }
}

