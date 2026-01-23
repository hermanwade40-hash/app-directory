'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpDown,
  Building2,
  CheckCircle,
  DollarSign,
  Download,
  FileText,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

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

type NewPurchaseOrder = {
  date: string;
  po: string;
  vendor: string;
  description: string;
  amount: string;
  buyer: string;
  sent: boolean;
  acknowledged: boolean;
};

type SettingsState = {
  logo: string | null;
  primaryColor: string;
  companyName: string;
};

type SortField = 'date' | 'po' | 'vendor' | 'amount' | 'sent' | 'acknowledged';

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

const DEFAULT_NEW_PO: NewPurchaseOrder = {
  date: new Date().toISOString().split('T')[0],
  po: '',
  vendor: '',
  description: '',
  amount: '',
  buyer: '',
  sent: false,
  acknowledged: false,
};

const App = () => {
  // --- STATE MANAGEMENT ---

  // 1. Data State
  const [data, setData] = useState<PurchaseOrder[]>([]);

  // 2. Settings State (Logo & Theme)
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);

  // --- EFFECTS ---
  const [hasLoaded, setHasLoaded] = useState(false);

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
      console.error('Failed to load data', error);
    }

    try {
      const savedSettings = window.localStorage.getItem(
        'vendorPoTrackerSettings_Digi',
      );
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings) as SettingsState);
      }
    } catch (error) {
      setSettings(DEFAULT_SETTINGS);
    }

    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    window.localStorage.setItem('vendorPoTrackerData_Digi', JSON.stringify(data));
  }, [data, hasLoaded]);

  useEffect(() => {
    if (!hasLoaded) return;
    window.localStorage.setItem(
      'vendorPoTrackerSettings_Digi',
      JSON.stringify(settings),
    );
  }, [settings, hasLoaded]);

  // --- UI STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    show: false,
    type: null,
    data: null,
    step: 1,
  });
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'info',
  });

  // Refs (Moved to top level to prevent null errors)
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  // New PO Form
  const [newPO, setNewPO] = useState<NewPurchaseOrder>(DEFAULT_NEW_PO);

  // --- HELPERS ---
  const showToast = (message: string, type: ToastState['type'] = 'info') => {
    setToast({ show: true, message, type });
    window.setTimeout(
      () => setToast({ show: false, message: '', type: 'info' }),
      4000,
    );
  };

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

  const years = useMemo(() => {
    const uniqueYears = new Set(data.map((item) => item.date.substring(0, 4)));
    return Array.from(uniqueYears).sort().reverse();
  }, [data]);

  // --- HANDLERS ---
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleSent = (poNumber: string) => {
    setData((prevData) =>
      prevData.map((item) => {
        if (item.po === poNumber) {
          const newSentState = !item.sent;
          // Logic Lock: If Sent is unchecked, Ack must be unchecked
          return {
            ...item,
            sent: newSentState,
            acknowledged: newSentState ? item.acknowledged : false,
          };
        }
        return item;
      }),
    );
  };

  const toggleAcknowledged = (poNumber: string) => {
    setData((prevData) =>
      prevData.map((item) => {
        if (item.po === poNumber) {
          if (!item.sent) return item; // Logic Lock: Cannot ack if not sent
          return { ...item, acknowledged: !item.acknowledged };
        }
        return item;
      }),
    );
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings((prev) => ({ ...prev, logo: reader.result as string }));
        showToast('Logo updated successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImportClick = () => {
    fileInputRef.current?.click();
  };

  // --- FILTER LOGIC ---
  const filteredData = useMemo(() => {
    return data
      .filter((item) => {
        const matchesSearch =
          (item.vendor || '').toLowerCase().includes(searchTerm) ||
          (item.po || '').toLowerCase().includes(searchTerm) ||
          (item.description || '').toLowerCase().includes(searchTerm);

        let matchesStatus = true;
        if (statusFilter === 'not_sent') matchesStatus = !item.sent;
        if (statusFilter === 'sent_waiting')
          matchesStatus = item.sent && !item.acknowledged;
        if (statusFilter === 'acknowledged') matchesStatus = item.acknowledged;

        let matchesMonth = true;
        let matchesYear = true;

        if (selectedMonth !== 'all') {
          const itemMonth = item.date.substring(5, 7);
          matchesMonth = itemMonth === selectedMonth;
        }

        if (selectedYear !== 'all') {
          const itemYear = item.date.substring(0, 4);
          matchesYear = itemYear === selectedYear;
        }

        return matchesSearch && matchesStatus && matchesMonth && matchesYear;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (sortField === 'sent') {
          valA = a.sent ? 1 : 0;
          valB = b.sent ? 1 : 0;
        }
        if (sortField === 'acknowledged') {
          valA = a.acknowledged ? 1 : 0;
          valB = b.acknowledged ? 1 : 0;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [
    data,
    searchTerm,
    statusFilter,
    selectedMonth,
    selectedYear,
    sortField,
    sortDirection,
  ]);

  const totalSpent = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [filteredData]);

  const vendorBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    filteredData.forEach((item) => {
      const cleanVendor = item.vendor
        ? item.vendor.replace(/VEN\d+\s*/, '')
        : 'Unknown';
      if (!breakdown[cleanVendor]) breakdown[cleanVendor] = 0;
      breakdown[cleanVendor] += item.amount || 0;
    });
    return Object.entries(breakdown)
      .sort(([, amountA], [, amountB]) => amountB - amountA)
      .slice(0, 5);
  }, [filteredData]);

  // --- ACTIONS ---
  const requestDelete = (po: string) => {
    setConfirmModal({ show: true, type: 'delete', data: po, step: 1 });
  };

  const requestClearAll = () => {
    setConfirmModal({ show: true, type: 'clear', data: null, step: 1 });
  };

  const executeAction = () => {
    if (confirmModal.type === 'delete' && confirmModal.data) {
      setData(data.filter((item) => item.po !== confirmModal.data));
      showToast(`PO ${confirmModal.data} deleted.`, 'success');
      setConfirmModal({ show: false, type: null, data: null, step: 1 });
    } else if (confirmModal.type === 'clear') {
      if (confirmModal.step === 1) {
        setConfirmModal({ ...confirmModal, step: 2 });
      } else {
        setData([]);
        showToast('System database cleared successfully.', 'success');
        setConfirmModal({ show: false, type: null, data: null, step: 1 });
      }
    }
  };

  const handleSubmitNewPO = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formattedAmount = Number.parseFloat(newPO.amount);
    if (!formattedAmount) return;

    if (data.some((item) => item.po === newPO.po)) {
      showToast(`Conflict: PO ${newPO.po} already exists.`, 'error');
      return;
    }

    setData((prevData) => [
      ...prevData,
      {
        ...newPO,
        amount: formattedAmount,
      },
    ]);
    setIsAddModalOpen(false);
    showToast('Purchase Order created successfully.', 'success');
    setNewPO(DEFAULT_NEW_PO);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-BZ', {
      style: 'currency',
      currency: 'BZD',
    }).format(val);

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
    const csvContent = [
      headers.join(','),
      ...filteredData.map((row) =>
        [
          row.date,
          row.po,
          `"${(row.vendor || '').replace(/"/g, '""')}"`,
          `"${(row.description || '').replace(/"/g, '""')}"`,
          row.amount,
          `"${(row.buyer || '').replace(/"/g, '""')}"`,
          row.sent ? 'Yes' : 'No',
          row.acknowledged ? 'Yes' : 'No',
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `po_export_${new Date().toISOString().split('T')[0]}.csv`,
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (fileEvent) => {
      const text = String(fileEvent.target?.result ?? '');
      const lines = text.split('\n');
      const newItems: PurchaseOrder[] = [];
      const existingPOs = new Set(data.map((item) => item.po));
      let duplicates = 0;
      let skipped = 0;

      const startIndex = lines[0].toLowerCase().includes('date') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i += 1) {
        const line = lines[i].trim();
        if (!line) continue;

        const columns: string[] = [];
        let inQuotes = false;
        let currentValue = '';
        for (const char of line) {
          if (char === '"') inQuotes = !inQuotes;
          else if (char === ',' && !inQuotes) {
            columns.push(currentValue.trim());
            currentValue = '';
          } else currentValue += char;
        }
        columns.push(currentValue.trim());
        const cleanCols = columns.map((col) =>
          col.replace(/^"|"$/g, '').replace(/""/g, '"'),
        );

        if (cleanCols.length >= 7) {
          const po = cleanCols[2]?.toUpperCase();
          if (!po || po === 'DOCUMENT NUMBER' || existingPOs.has(po)) {
            if (existingPOs.has(po)) duplicates += 1;
            else skipped += 1;
            continue;
          }

          const amount = Number.parseFloat(
            cleanCols[6].replace(/[^0-9.-]+/g, ''),
          );
          if (Number.isNaN(amount)) {
            skipped += 1;
            continue;
          }

          let date = new Date().toISOString().split('T')[0];
          if (cleanCols[0].includes('/')) {
            const parts = cleanCols[0].split('/');
            if (parts.length === 3) {
              date = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
          } else if (cleanCols[0]) {
            date = cleanCols[0];
          }

          newItems.push({
            date,
            po,
            vendor: cleanCols[3] || '',
            description: cleanCols[5] || '',
            amount,
            buyer: cleanCols[7] || '',
            sent: false,
            acknowledged: false,
          });
          existingPOs.add(po);
        } else skipped += 1;
      }

      if (newItems.length > 0) {
        setData((prev) => [...prev, ...newItems]);
        showToast(`Import Success: ${newItems.length} records added.`, 'success');
      } else {
        showToast('Import Failed: No new unique records found.', 'error');
      }

      if (duplicates > 0 || skipped > 0) {
        showToast(
          `Import Notice: ${duplicates} duplicates, ${skipped} skipped.`,
          'info',
        );
      }
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 relative flex flex-col">
      {/* Hidden Inputs (Always Rendered to prevent null ref errors) */}
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
      />
      <input
        type="file"
        accept="image/*"
        ref={logoInputRef}
        className="hidden"
        onChange={handleLogoUpload}
      />

      {/* --- BUSINESS HEADER --- */}
      <header
        className="shadow-lg z-30 text-white transition-colors duration-300"
        style={{ backgroundColor: settings.primaryColor }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* LOGO */}
            <div className="h-12 bg-white rounded-md flex items-center justify-center shadow-md overflow-hidden px-2">
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span
                  className="text-xl font-black italic tracking-tighter"
                  style={{ color: settings.primaryColor }}
                >
                  Digi
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight leading-tight">
                {settings.companyName}
              </span>
              <span className="text-xs text-white/80 font-medium tracking-wider uppercase">
                Finance Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              title="Settings"
            >
              <Settings size={20} />
            </button>
            <div className="h-6 w-px bg-white/20 mx-1 hidden sm:block"></div>
            <button
              onClick={exportCSV}
              disabled={data.length === 0}
              className={`hidden sm:flex items-center gap-2 bg-black/20 text-white px-4 py-2 rounded-md hover:bg-black/30 transition-all text-sm font-medium ${
                data.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Download size={16} /> Export
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Toast Notification */}
          {toast.show && (
            <div
              className={`fixed top-24 right-4 z-50 px-6 py-4 rounded-md shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${
                toast.type === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {toast.type === 'error' ? (
                <AlertTriangle size={20} className="text-white" />
              ) : (
                <CheckCircle size={20} className="text-white" />
              )}
              <p className="font-medium">{toast.message}</p>
            </div>
          )}

          {/* Settings Modal */}
          {isSettingsModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-600" /> App
                    Settings
                  </h2>
                  <button
                    onClick={() => setIsSettingsModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Company Logo
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-auto bg-slate-100 border border-slate-200 rounded-md flex items-center justify-center overflow-hidden px-4">
                        {settings.logo ? (
                          <img
                            src={settings.logo}
                            className="w-full h-full object-contain"
                            alt="Company logo"
                          />
                        ) : (
                          <span className="font-bold text-slate-400">
                            Digi
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        className="text-sm bg-white border border-slate-300 px-3 py-2 rounded-md hover:bg-slate-50 font-medium text-slate-700"
                      >
                        Upload Image...
                      </button>
                    </div>
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={settings.companyName}
                      onChange={(event) =>
                        setSettings({
                          ...settings,
                          companyName: event.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Brand Color */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Brand Color
                    </label>
                    <div className="flex gap-3 flex-wrap">
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
                          onClick={() =>
                            setSettings({ ...settings, primaryColor: color })
                          }
                          className={`w-8 h-8 rounded-full border-2 ${
                            settings.primaryColor === color
                              ? 'border-slate-800 scale-110'
                              : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 px-6 py-4 flex justify-end">
                  <button
                    onClick={() => setIsSettingsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-900 font-medium text-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Modal */}
          {confirmModal.show && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
                <div className="p-6">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="p-4 bg-red-50 rounded-full text-red-600">
                      <AlertTriangle size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {confirmModal.type === 'delete'
                          ? 'Delete Record'
                          : confirmModal.step === 1
                            ? 'System Reset Warning'
                            : 'Final Authorization'}
                      </h3>
                      <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                        {confirmModal.type === 'delete'
                          ? `You are about to permanently delete PO ${confirmModal.data}.`
                          : confirmModal.step === 1
                            ? 'This action will completely erase the local database. All tracking history will be lost.'
                            : 'Please confirm one last time. This action is irreversible.'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 px-6 py-4 flex gap-3">
                  <button
                    onClick={() =>
                      setConfirmModal({
                        show: false,
                        type: null,
                        data: null,
                        step: 1,
                      })
                    }
                    className="flex-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 font-medium text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeAction}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium text-sm shadow-sm transition-colors"
                  >
                    {confirmModal.type === 'clear' && confirmModal.step === 1
                      ? 'Proceed to Confirmation'
                      : 'Confirm Action'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard / Empty State */}
          {data.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-16 text-center flex flex-col items-center justify-center h-96">
              <div className="bg-slate-50 p-6 rounded-full mb-6 border border-slate-100">
                <LayoutDashboard className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                System Database Empty
              </h2>
              <p className="text-slate-500 max-w-md mx-auto mb-8">
                Initialize the tracker by importing a batch CSV file or adding
                records manually.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={triggerImportClick}
                  style={{ backgroundColor: settings.primaryColor }}
                  className="flex items-center gap-2 text-white px-6 py-3 rounded-md hover:opacity-90 transition-opacity shadow-lg font-medium"
                >
                  <Upload size={18} /> Upload Data File
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-6 py-3 rounded-md hover:bg-slate-50 transition-colors font-medium"
                >
                  <Plus size={18} /> Manual Entry
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                  className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 border-l-4"
                  style={{ borderLeftColor: settings.primaryColor }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Total Orders
                    </h3>
                    <div
                      className="p-2 bg-slate-50 rounded-md"
                      style={{ color: settings.primaryColor }}
                    >
                      <FileText size={18} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">
                    {filteredData.length}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Records found</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 border-l-4 border-l-emerald-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Total Volume
                    </h3>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md">
                      <DollarSign size={18} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">
                    {formatCurrency(totalSpent)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">BZD Currency</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 border-l-4 border-l-purple-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Top Vendor
                    </h3>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-md">
                      <Building2 size={18} />
                    </div>
                  </div>
                  <p
                    className="text-lg font-bold text-slate-900 truncate"
                    title={
                      vendorBreakdown.length > 0 ? vendorBreakdown[0][0] : ''
                    }
                  >
                    {vendorBreakdown.length > 0
                      ? vendorBreakdown[0][0]
                      : 'No Data'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {vendorBreakdown.length > 0
                      ? formatCurrency(vendorBreakdown[0][1])
                      : '-'}
                  </p>
                </div>
              </div>

              {/* Main Data Panel */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col">
                {/* Toolbar */}
                <div className="p-5 border-b border-slate-200 flex flex-col xl:flex-row gap-4 justify-between items-center bg-slate-50/30">
                  <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                    {/* Search */}
                    <div className="relative flex-grow sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search PO, Vendor..."
                        className="w-full pl-9 pr-4 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        value={searchTerm}
                        onChange={(event) =>
                          setSearchTerm(event.target.value.toLowerCase())
                        }
                      />
                    </div>

                    {/* Filters */}
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className="px-3 py-2 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer"
                    >
                      <option value="all">All Statuses</option>
                      <option value="not_sent">Pending (Not Sent)</option>
                      <option value="sent_waiting">Sent (No Ack)</option>
                      <option value="acknowledged">Acknowledged</option>
                    </select>

                    <div className="flex gap-2">
                      <select
                        value={selectedMonth}
                        onChange={(event) =>
                          setSelectedMonth(event.target.value)
                        }
                        className="px-3 py-2 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer w-32"
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
                        onChange={(event) =>
                          setSelectedYear(event.target.value)
                        }
                        className="px-3 py-2 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer w-24"
                      >
                        <option value="all">All Years</option>
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={triggerImportClick}
                      className="text-slate-600 hover:text-blue-600 text-sm font-medium px-3 py-1 flex items-center gap-2"
                    >
                      <Upload size={14} /> Import
                    </button>
                    <div className="h-4 w-px bg-slate-300 mx-1"></div>
                    <button
                      onClick={requestClearAll}
                      className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 flex items-center gap-2"
                    >
                      <Trash2 size={14} /> Clear DB
                    </button>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      style={{ backgroundColor: settings.primaryColor }}
                      className="ml-2 text-white text-sm font-medium px-4 py-2 rounded-md flex items-center gap-2 shadow-sm hover:opacity-90 transition-opacity"
                    >
                      <Plus size={16} /> New PO
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                        <th className="px-6 py-4 text-center w-20">Sent</th>
                        <th className="px-6 py-4 text-center w-20">Ack'd</th>
                        <th
                          className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                          onClick={() => handleSort('date')}
                        >
                          <div className="flex items-center gap-1">
                            Date{' '}
                            <ArrowUpDown
                              size={12}
                              className={`opacity-0 group-hover:opacity-100 ${
                                sortField === 'date'
                                  ? 'opacity-100 text-blue-600'
                                  : ''
                              }`}
                            />
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                          onClick={() => handleSort('po')}
                        >
                          <div className="flex items-center gap-1">
                            PO Number{' '}
                            <ArrowUpDown
                              size={12}
                              className={`opacity-0 group-hover:opacity-100 ${
                                sortField === 'po'
                                  ? 'opacity-100 text-blue-600'
                                  : ''
                              }`}
                            />
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                          onClick={() => handleSort('vendor')}
                        >
                          <div className="flex items-center gap-1">
                            Vendor{' '}
                            <ArrowUpDown
                              size={12}
                              className={`opacity-0 group-hover:opacity-100 ${
                                sortField === 'vendor'
                                  ? 'opacity-100 text-blue-600'
                                  : ''
                              }`}
                            />
                          </div>
                        </th>
                        <th className="px-6 py-4 hidden md:table-cell">
                          Description
                        </th>
                        <th
                          className="px-6 py-4 text-right cursor-pointer hover:bg-slate-100 transition-colors group"
                          onClick={() => handleSort('amount')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Amount{' '}
                            <ArrowUpDown
                              size={12}
                              className={`opacity-0 group-hover:opacity-100 ${
                                sortField === 'amount'
                                  ? 'opacity-100 text-blue-600'
                                  : ''
                              }`}
                            />
                          </div>
                        </th>
                        <th className="px-6 py-4 text-center w-20">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredData.length > 0 ? (
                        filteredData.map((row) => (
                          <tr
                            key={row.po}
                            className={`hover:bg-blue-50/30 transition-colors group ${
                              row.acknowledged
                                ? 'bg-emerald-50/30'
                                : row.sent
                                  ? 'bg-slate-50/50'
                                  : ''
                            }`}
                          >
                            <td className="px-6 py-4 text-center">
                              <input
                                type="checkbox"
                                checked={row.sent}
                                onChange={() => toggleSent(row.po)}
                                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer transition-all"
                              />
                            </td>
                            <td className="px-6 py-4 text-center">
                              <input
                                type="checkbox"
                                checked={row.acknowledged}
                                onChange={() => toggleAcknowledged(row.po)}
                                disabled={!row.sent}
                                className={`w-4 h-4 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer transition-all ${
                                  !row.sent
                                    ? 'opacity-30 cursor-not-allowed bg-slate-100'
                                    : 'text-emerald-600'
                                }`}
                              />
                            </td>
                            <td
                              className={`px-6 py-4 whitespace-nowrap font-medium ${
                                row.sent ? 'text-slate-500' : 'text-slate-700'
                              }`}
                            >
                              {row.date}
                            </td>
                            <td
                              className={`px-6 py-4 whitespace-nowrap font-medium ${
                                row.sent ? 'text-slate-500' : 'text-blue-700'
                              }`}
                              style={{
                                color: row.sent ? settings.primaryColor : '',
                              }}
                            >
                              {row.po}
                            </td>
                            <td
                              className={`px-6 py-4 font-medium ${
                                row.sent ? 'text-slate-500' : 'text-slate-800'
                              }`}
                            >
                              {row.vendor}
                            </td>
                            <td
                              className={`px-6 py-4 hidden md:table-cell max-w-xs truncate ${
                                row.sent ? 'text-slate-400' : 'text-slate-500'
                              }`}
                              title={row.description}
                            >
                              {row.description}
                            </td>
                            <td
                              className={`px-6 py-4 whitespace-nowrap text-right font-mono ${
                                row.sent ? 'text-slate-500' : 'text-slate-700'
                              }`}
                            >
                              {formatCurrency(row.amount)}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => requestDelete(row.po)}
                                className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                                title="Delete PO"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-6 py-12 text-center text-slate-400"
                          >
                            <div className="flex flex-col items-center gap-3">
                              <Search size={40} className="opacity-10" />
                              <p className="text-sm font-medium">
                                No records found matching your filters.
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
                  <span>System Status: Online</span>
                  <span>Total Records: {data.length}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Add PO Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> New Purchase Order
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmitNewPO} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={newPO.date}
                      onChange={(event) =>
                        setNewPO({ ...newPO, date: event.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                      PO Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="PO12345"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={newPO.po}
                      onChange={(event) =>
                        setNewPO({
                          ...newPO,
                          po: event.target.value.toUpperCase(),
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                    Vendor Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Official Vendor Name"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={newPO.vendor}
                    onChange={(event) =>
                      setNewPO({ ...newPO, vendor: event.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Brief description of items/service"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={newPO.description}
                    onChange={(event) =>
                      setNewPO({
                        ...newPO,
                        description: event.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                    Amount (BZD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-serif">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      className="w-full rounded-md border border-slate-300 pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                      value={newPO.amount}
                      onChange={(event) =>
                        setNewPO({ ...newPO, amount: event.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-md border border-slate-200 space-y-2 mt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="newPOSent"
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
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
                    />
                    <label
                      htmlFor="newPOSent"
                      className="text-sm font-medium text-slate-700 cursor-pointer select-none"
                    >
                      Mark as Sent
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="newPOAck"
                      disabled={!newPO.sent}
                      className={`w-4 h-4 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer ${
                        !newPO.sent ? 'opacity-50' : 'text-emerald-600'
                      }`}
                      checked={newPO.acknowledged}
                      onChange={(event) =>
                        setNewPO({
                          ...newPO,
                          acknowledged: event.target.checked,
                        })
                      }
                    />
                    <label
                      htmlFor="newPOAck"
                      className={`text-sm font-medium cursor-pointer select-none ${
                        !newPO.sent ? 'text-slate-400' : 'text-slate-700'
                      }`}
                    >
                      Mark as Acknowledged
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 font-medium text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ backgroundColor: settings.primaryColor }}
                    className="flex-1 px-4 py-2 text-white rounded-md hover:opacity-90 font-medium text-sm shadow-sm transition-opacity"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
