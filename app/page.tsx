'use client';

import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowsUpDownIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useMemo, useRef, useState } from 'react';

type PurchaseOrder = {
  date: string;
  po: string;
  vendor: string;
  description: string;
  amount: number;
  buyer: string;
  sent: boolean;
  acknowledged: boolean;
};

type NewPurchaseOrder = Omit<PurchaseOrder, 'amount'> & { amount: string };

type SettingsState = {
  logo: string | null;
  primaryColor: string;
  companyName: string;
};

type SortField = 'date' | 'po' | 'vendor' | 'amount' | 'sent' | 'acknowledged';
type StatusFilter = 'all' | 'not_sent' | 'sent_waiting' | 'acknowledged';

type ConfirmModalState = {
  show: boolean;
  type: 'delete' | 'clear' | null;
  data: string | null;
  step: 1 | 2;
};

type ToastState = {
  show: boolean;
  message: string;
  type: 'info' | 'success' | 'error';
};

const DEFAULT_SETTINGS: SettingsState = {
  logo: null,
  primaryColor: '#D50032',
  companyName: 'Digi PO Tracker',
};

const getTodayDate = () => new Date().toISOString().split('T')[0];

const createBlankPurchaseOrder = (date = ''): NewPurchaseOrder => ({
  date,
  po: '',
  vendor: '',
  description: '',
  amount: '',
  buyer: '',
  sent: false,
  acknowledged: false,
});

const months = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const emptyConfirmModal: ConfirmModalState = {
  show: false,
  type: null,
  data: null,
  step: 1,
};

const emptyToast: ToastState = { show: false, message: '', type: 'info' };

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-BZ', { style: 'currency', currency: 'BZD' }).format(
    value,
  );

const parseCsvLine = (line: string) => {
  const columns: string[] = [];
  let currentValue = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      currentValue += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      columns.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  columns.push(currentValue.trim());
  return columns;
};

const normalizeImportedDate = (value: string) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return new Date().toISOString().split('T')[0];
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  const slashDate = trimmedValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!slashDate) {
    return trimmedValue;
  }

  const [, day, month, year] = slashDate;
  const fullYear = year.length === 2 ? `20${year}` : year;
  return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

export default function Page() {
  const [data, setData] = useState<PurchaseOrder[]>([]);
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] =
    useState<ConfirmModalState>(emptyConfirmModal);
  const [toast, setToast] = useState<ToastState>(emptyToast);
  const [newPO, setNewPO] = useState<NewPurchaseOrder>(
    createBlankPurchaseOrder,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const savedData = window.localStorage.getItem('vendorPoTrackerData_Digi');
      if (savedData) {
        const parsed = JSON.parse(savedData) as PurchaseOrder[];
        setData(
          parsed.map((item) => ({
            ...item,
            acknowledged: item.acknowledged ?? false,
          })),
        );
      }
    } catch (error) {
      console.error('Failed to load purchase order data', error);
    }

    try {
      const savedSettings = window.localStorage.getItem(
        'vendorPoTrackerSettings_Digi',
      );
      if (savedSettings) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...(JSON.parse(savedSettings) as SettingsState),
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard settings', error);
      setSettings(DEFAULT_SETTINGS);
    }

    setNewPO(createBlankPurchaseOrder(getTodayDate()));
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    window.localStorage.setItem(
      'vendorPoTrackerData_Digi',
      JSON.stringify(data),
    );
  }, [data, hasLoaded]);

  useEffect(() => {
    if (!hasLoaded) return;
    window.localStorage.setItem(
      'vendorPoTrackerSettings_Digi',
      JSON.stringify(settings),
    );
  }, [settings, hasLoaded]);

  const showToast = (message: string, type: ToastState['type'] = 'info') => {
    setToast({ show: true, message, type });
    window.setTimeout(() => setToast(emptyToast), 4000);
  };

  const years = useMemo(() => {
    return Array.from(new Set(data.map((item) => item.date.substring(0, 4))))
      .sort()
      .reverse();
  }, [data]);

  const filteredData = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return data
      .filter((item) => {
        const matchesSearch =
          !normalizedSearch ||
          item.vendor.toLowerCase().includes(normalizedSearch) ||
          item.po.toLowerCase().includes(normalizedSearch) ||
          item.description.toLowerCase().includes(normalizedSearch) ||
          item.buyer.toLowerCase().includes(normalizedSearch);

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'not_sent' && !item.sent) ||
          (statusFilter === 'sent_waiting' &&
            item.sent &&
            !item.acknowledged) ||
          (statusFilter === 'acknowledged' && item.acknowledged);

        const matchesMonth =
          selectedMonth === 'all' ||
          item.date.substring(5, 7) === selectedMonth;
        const matchesYear =
          selectedYear === 'all' || item.date.substring(0, 4) === selectedYear;

        return matchesSearch && matchesStatus && matchesMonth && matchesYear;
      })
      .sort((a, b) => {
        const valueA =
          sortField === 'sent' || sortField === 'acknowledged'
            ? Number(a[sortField])
            : a[sortField];
        const valueB =
          sortField === 'sent' || sortField === 'acknowledged'
            ? Number(b[sortField])
            : b[sortField];

        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [
    data,
    searchTerm,
    selectedMonth,
    selectedYear,
    sortDirection,
    sortField,
    statusFilter,
  ]);

  const totalSpent = useMemo(
    () => filteredData.reduce((total, item) => total + item.amount, 0),
    [filteredData],
  );

  const vendorBreakdown = useMemo(() => {
    const breakdown = filteredData.reduce<Record<string, number>>(
      (totals, item) => {
        const vendorName =
          item.vendor.replace(/VEN\d+\s*/i, '').trim() || 'Unknown';
        totals[vendorName] = (totals[vendorName] ?? 0) + item.amount;
        return totals;
      },
      {},
    );

    return Object.entries(breakdown)
      .sort(([, amountA], [, amountB]) => amountB - amountA)
      .slice(0, 5);
  }, [filteredData]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortField(field);
    setSortDirection('desc');
  };

  const toggleSent = (poNumber: string) => {
    setData((currentData) =>
      currentData.map((item) => {
        if (item.po !== poNumber) return item;
        const sent = !item.sent;
        return {
          ...item,
          sent,
          acknowledged: sent ? item.acknowledged : false,
        };
      }),
    );
  };

  const toggleAcknowledged = (poNumber: string) => {
    setData((currentData) =>
      currentData.map((item) =>
        item.po === poNumber && item.sent
          ? { ...item, acknowledged: !item.acknowledged }
          : item,
      ),
    );
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSettings((currentSettings) => ({
        ...currentSettings,
        logo: String(reader.result),
      }));
      showToast('Logo updated successfully.', 'success');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleSubmitNewPO = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number.parseFloat(newPO.amount);
    const poNumber = newPO.po.trim().toUpperCase();

    if (
      !poNumber ||
      !newPO.vendor.trim() ||
      !newPO.description.trim() ||
      Number.isNaN(amount) ||
      amount <= 0
    ) {
      showToast(
        'Please enter a PO number, vendor, description, and positive amount.',
        'error',
      );
      return;
    }

    if (data.some((item) => item.po.toUpperCase() === poNumber)) {
      showToast(`Conflict: PO ${poNumber} already exists.`, 'error');
      return;
    }

    setData((currentData) => [
      ...currentData,
      {
        ...newPO,
        po: poNumber,
        vendor: newPO.vendor.trim(),
        description: newPO.description.trim(),
        buyer: newPO.buyer.trim(),
        amount,
      },
    ]);
    setIsAddModalOpen(false);
    setNewPO(createBlankPurchaseOrder(getTodayDate()));
    showToast('Purchase order created successfully.', 'success');
  };

  const requestDelete = (po: string) => {
    setConfirmModal({ show: true, type: 'delete', data: po, step: 1 });
  };

  const requestClearAll = () => {
    setConfirmModal({ show: true, type: 'clear', data: null, step: 1 });
  };

  const executeAction = () => {
    if (confirmModal.type === 'delete' && confirmModal.data) {
      setData((currentData) =>
        currentData.filter((item) => item.po !== confirmModal.data),
      );
      showToast(`PO ${confirmModal.data} deleted.`, 'success');
      setConfirmModal(emptyConfirmModal);
      return;
    }

    if (confirmModal.type === 'clear' && confirmModal.step === 1) {
      setConfirmModal((currentModal) => ({ ...currentModal, step: 2 }));
      return;
    }

    if (confirmModal.type === 'clear') {
      setData([]);
      showToast('System database cleared successfully.', 'success');
      setConfirmModal(emptyConfirmModal);
    }
  };

  const exportCSV = () => {
    const headers = [
      'Date',
      'PO Number',
      'Vendor',
      'Description',
      'Amount',
      'Buyer',
      'Sent',
      'Acknowledged',
    ];
    const escapeCell = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;
    const csvContent = [
      headers.map(escapeCell).join(','),
      ...filteredData.map((row) =>
        [
          row.date,
          row.po,
          row.vendor,
          row.description,
          row.amount,
          row.buyer,
          row.sent ? 'Yes' : 'No',
          row.acknowledged ? 'Yes' : 'No',
        ]
          .map(escapeCell)
          .join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `po_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (fileEvent) => {
      const text = String(fileEvent.target?.result ?? '');
      const lines = text.split(/\r?\n/).filter(Boolean);
      const newItems: PurchaseOrder[] = [];
      const existingPOs = new Set(data.map((item) => item.po.toUpperCase()));
      let duplicates = 0;
      let skipped = 0;
      const startIndex = lines[0]?.toLowerCase().includes('date') ? 1 : 0;

      for (let index = startIndex; index < lines.length; index += 1) {
        const columns = parseCsvLine(lines[index]);
        if (columns.length < 7) {
          skipped += 1;
          continue;
        }

        const po = (columns[2] ?? '').trim().toUpperCase();
        if (!po || po === 'DOCUMENT NUMBER') {
          skipped += 1;
          continue;
        }

        if (existingPOs.has(po)) {
          duplicates += 1;
          continue;
        }

        const amount = Number.parseFloat(
          (columns[6] ?? '').replace(/[^0-9.-]+/g, ''),
        );
        if (Number.isNaN(amount)) {
          skipped += 1;
          continue;
        }

        newItems.push({
          date: normalizeImportedDate(columns[0] ?? ''),
          po,
          vendor: columns[3] ?? '',
          description: columns[5] ?? '',
          amount,
          buyer: columns[7] ?? '',
          sent: false,
          acknowledged: false,
        });
        existingPOs.add(po);
      }

      if (newItems.length > 0) {
        setData((currentData) => [...currentData, ...newItems]);
        showToast(
          `Import success: ${newItems.length} records added.`,
          'success',
        );
      } else {
        showToast('Import failed: no new unique records found.', 'error');
      }

      if (duplicates > 0 || skipped > 0) {
        window.setTimeout(
          () =>
            showToast(
              `Import notice: ${duplicates} duplicates, ${skipped} skipped.`,
              'info',
            ),
          250,
        );
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileUpload}
      />
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleLogoUpload}
      />

      <header
        style={{ backgroundColor: settings.primaryColor }}
        className="px-6 py-6 text-white shadow-lg"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white/15 ring-1 ring-white/25">
              {settings.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.logo}
                  alt={`${settings.companyName} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <BuildingOffice2Icon className="h-8 w-8" aria-hidden="true" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">
                Finance Dashboard
              </p>
              <h1 className="text-3xl font-bold tracking-tight">
                {settings.companyName}
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/20 transition hover:bg-white/20"
            >
              <Cog6ToothIcon className="h-5 w-5" />
              Settings
            </button>
            <button
              type="button"
              onClick={exportCSV}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Export
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            icon={<DocumentTextIcon className="h-6 w-6" />}
            label="Total Orders"
            value={filteredData.length.toString()}
            detail="Records found"
          />
          <MetricCard
            icon={<CurrencyDollarIcon className="h-6 w-6" />}
            label="Total Volume"
            value={formatCurrency(totalSpent)}
            detail="BZD currency"
          />
          <MetricCard
            icon={<CheckCircleIcon className="h-6 w-6" />}
            label="Top Vendor"
            value={vendorBreakdown[0]?.[0] ?? 'No Data'}
            detail={
              vendorBreakdown[0]
                ? formatCurrency(vendorBreakdown[0][1])
                : 'No records yet'
            }
          />
        </div>

        <div className="mt-8 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search PO, vendor, description, or buyer..."
                  className="w-full rounded-lg border border-slate-300 py-2 pr-3 pl-10 text-sm transition outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="not_sent">Pending</option>
                  <option value="sent_waiting">Sent, no ack</option>
                  <option value="acknowledged">Acknowledged</option>
                </select>
                <select
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="all">All Months</option>
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(event.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="all">All Years</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                  Import
                </button>
                <button
                  type="button"
                  onClick={requestClearAll}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  <TrashIcon className="h-5 w-5" />
                  Clear DB
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  style={{ backgroundColor: settings.primaryColor }}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
                >
                  <PlusIcon className="h-5 w-5" />
                  New PO
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Sent</th>
                  <th className="px-4 py-3">Ack'd</th>
                  <SortableHeader
                    label="Date"
                    field="date"
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="PO Number"
                    field="po"
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Vendor"
                    field="vendor"
                    onSort={handleSort}
                  />
                  <th className="px-4 py-3">Description</th>
                  <SortableHeader
                    label="Amount"
                    field="amount"
                    onSort={handleSort}
                  />
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredData.length > 0 ? (
                  filteredData.map((row) => (
                    <tr key={row.po} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={row.sent}
                          onChange={() => toggleSent(row.po)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={row.acknowledged}
                          disabled={!row.sent}
                          onChange={() => toggleAcknowledged(row.po)}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                        {row.date}
                      </td>
                      <td className="px-4 py-3 font-semibold whitespace-nowrap text-slate-900">
                        {row.po}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{row.vendor}</td>
                      <td className="max-w-md px-4 py-3 text-slate-600">
                        {row.description}
                      </td>
                      <td className="px-4 py-3 font-semibold whitespace-nowrap text-slate-900">
                        {formatCurrency(row.amount)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => requestDelete(row.po)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${row.po}`}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-16 text-center text-slate-500"
                    >
                      <DocumentTextIcon className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                      <p className="text-base font-semibold text-slate-700">
                        No records found
                      </p>
                      <p>
                        Import a CSV file or add a purchase order manually to
                        begin tracking.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:justify-between">
            <span>System Status: Online</span>
            <span>Total Records: {data.length}</span>
          </div>
        </div>
      </section>

      {toast.show && (
        <div className="fixed top-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-xl bg-white p-4 text-sm shadow-xl ring-1 ring-slate-200">
          {toast.type === 'error' ? (
            <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-red-500" />
          ) : (
            <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-500" />
          )}
          <p className="font-medium text-slate-700">{toast.message}</p>
        </div>
      )}

      {isSettingsModalOpen && (
        <Modal
          title="App Settings"
          onClose={() => setIsSettingsModalOpen(false)}
        >
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Company Logo
              </label>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Upload Image...
              </button>
            </div>
            <label className="block text-sm font-semibold text-slate-700">
              Company Name
              <input
                value={settings.companyName}
                onChange={(event) =>
                  setSettings({ ...settings, companyName: event.target.value })
                }
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">
                Brand Color
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  '#D50032',
                  '#1e293b',
                  '#2563eb',
                  '#059669',
                  '#7c3aed',
                  '#db2777',
                  '#ea580c',
                ].map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Use ${color}`}
                    onClick={() =>
                      setSettings({ ...settings, primaryColor: color })
                    }
                    className={`h-9 w-9 rounded-full ring-2 ring-offset-2 ${settings.primaryColor === color ? 'ring-slate-800' : 'ring-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(false)}
              className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Done
            </button>
          </div>
        </Modal>
      )}

      {confirmModal.show && (
        <Modal
          title={
            confirmModal.type === 'delete'
              ? 'Delete Record'
              : confirmModal.step === 1
                ? 'System Reset Warning'
                : 'Final Authorization'
          }
          onClose={() => setConfirmModal(emptyConfirmModal)}
        >
          <p className="text-sm text-slate-600">
            {confirmModal.type === 'delete'
              ? `You are about to permanently delete PO ${confirmModal.data}.`
              : confirmModal.step === 1
                ? 'This action will completely erase the local database. All tracking history will be lost.'
                : 'Please confirm one last time. This action is irreversible.'}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setConfirmModal(emptyConfirmModal)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={executeAction}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              {confirmModal.type === 'clear' && confirmModal.step === 1
                ? 'Proceed'
                : 'Confirm'}
            </button>
          </div>
        </Modal>
      )}

      {isAddModalOpen && (
        <Modal
          title="New Purchase Order"
          onClose={() => setIsAddModalOpen(false)}
        >
          <form onSubmit={handleSubmitNewPO} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Date"
                type="date"
                value={newPO.date}
                onChange={(value) => setNewPO({ ...newPO, date: value })}
              />
              <TextInput
                label="PO Number"
                value={newPO.po}
                onChange={(value) =>
                  setNewPO({ ...newPO, po: value.toUpperCase() })
                }
              />
            </div>
            <TextInput
              label="Vendor Name"
              value={newPO.vendor}
              onChange={(value) => setNewPO({ ...newPO, vendor: value })}
            />
            <TextInput
              label="Description"
              value={newPO.description}
              onChange={(value) => setNewPO({ ...newPO, description: value })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label="Amount (BZD)"
                type="number"
                value={newPO.amount}
                onChange={(value) => setNewPO({ ...newPO, amount: value })}
              />
              <TextInput
                label="Buyer"
                value={newPO.buyer}
                onChange={(value) => setNewPO({ ...newPO, buyer: value })}
              />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-700">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newPO.sent}
                  onChange={(event) =>
                    setNewPO({
                      ...newPO,
                      sent: event.target.checked,
                      acknowledged: event.target.checked
                        ? newPO.acknowledged
                        : false,
                    })
                  }
                  className="h-4 w-4 rounded"
                />
                Mark as Sent
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newPO.acknowledged}
                  disabled={!newPO.sent}
                  onChange={(event) =>
                    setNewPO({ ...newPO, acknowledged: event.target.checked })
                  }
                  className="h-4 w-4 rounded disabled:opacity-40"
                />
                Mark as Acknowledged
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Save Record
              </button>
            </div>
          </form>
        </Modal>
      )}
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 truncate text-2xl font-bold text-slate-950">
            {value}
          </p>
          <p className="mt-1 text-sm text-slate-500">{detail}</p>
        </div>
        <div className="rounded-xl bg-slate-100 p-3 text-slate-600">{icon}</div>
      </div>
    </article>
  );
}

function SortableHeader({
  label,
  field,
  onSort,
}: {
  label: string;
  field: SortField;
  onSort: (field: SortField) => void;
}) {
  return (
    <th className="px-4 py-3">
      <button
        type="button"
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1 hover:text-slate-900"
      >
        {label}
        <ArrowsUpDownIcon className="h-4 w-4" />
      </button>
    </th>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      />
    </label>
  );
}
