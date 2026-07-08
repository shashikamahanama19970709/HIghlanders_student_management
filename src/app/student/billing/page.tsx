'use client';

import { useEffect, useState } from 'react';
import { Download, FileText, CreditCard, Calendar, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import LoadingOverlay from '@/components/LoadingOverlay';
import toast from 'react-hot-toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';

interface BillingRecord {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  invoiceUrl?: string;
  receiptUrl?: string;
}

export default function StudentBilling() {
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [settings, setSettings] = useState({
    autoPay: true,
    reminders: true,
    confirmations: true
  });
  const [defaultCard, setDefaultCard] = useState({ brand: 'Visa', last4: '4242', expiry: '12/25', cardholderName: 'Card Holder' });

  useEffect(() => {
    // Load settings
    const savedSettings = localStorage.getItem('billing_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Load default card from payment methods
    const savedCards = localStorage.getItem('payment_methods');
    if (savedCards) {
      const cards = JSON.parse(savedCards);
      const def = cards.find((c: any) => c.isDefault);
      if (def) {
        setDefaultCard(def);
      }
    }
  }, []);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingToggleKey, setPendingToggleKey] = useState<null | 'autoPay' | 'reminders' | 'confirmations'>(null);

  const toggleSetting = (key: 'autoPay' | 'reminders' | 'confirmations') => {
    // If disabling autoPay, show confirmation dialog
    if (key === 'autoPay' && settings.autoPay) {
      setPendingToggleKey(key);
      setConfirmOpen(true);
      return;
    }
    const updated = {
      ...settings,
      [key]: !settings[key]
    };
    setSettings(updated);
    localStorage.setItem('billing_settings', JSON.stringify(updated));
    toast.success("Billing setting updated");
  };

  const confirmToggle = () => {
    if (pendingToggleKey) {
      const updated = {
        ...settings,
        [pendingToggleKey]: false
      };
      setSettings(updated);
      localStorage.setItem('billing_settings', JSON.stringify(updated));
      toast.success("Billing setting updated");
    }
    setConfirmOpen(false);
    setPendingToggleKey(null);
  };

  const handleChangePayment = () => {
    window.location.href = '/student/subscription';
  };

  useEffect(() => {
    fetchBillingRecords();
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/student/profile', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      const data = await res.json();
      if (data.success && data.data?.subscription) {
        setSubscription(data.data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const fetchBillingRecords = async () => {
    try {
      const response = await fetch('/api/student/billing', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        window.location.href = '/login';
        return;
      }

      const result = await response.json();
      if (result.success) {
        setBillingRecords(result.data);
      }
    } catch (error) {
      console.error('Error fetching billing records:', error);
    } finally {
      setLoading(false);
    }
  };

  // Compute widget values
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthTotal = billingRecords
    .filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && r.status === 'paid';
    })
    .reduce((sum, r) => sum + r.amount, 0);

  const thisMonthDescription = billingRecords.find(r => {
    const d = new Date(r.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && r.status === 'paid';
  })?.description || (subscription?.planName ? `${subscription.planName} membership` : 'No payments this month');

  const nextPaymentDate = subscription?.nextPaymentDate ? new Date(subscription.nextPaymentDate) : null;
  const daysRemaining = nextPaymentDate ? Math.max(0, Math.ceil((nextPaymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : null;
  const nextPaymentLabel = nextPaymentDate
    ? nextPaymentDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : 'N/A';
  const daysRemainingText = daysRemaining !== null
    ? (daysRemaining === 0 ? 'Due today' : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`)
    : 'No active subscription';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="pb-10 animate-fade-in">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black font-athletic uppercase tracking-wider text-gray-900">Billing & Payments</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your payments, invoices, and billing preferences</p>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmOpen}
        title="Disable Automatic Payments"
        message="Are you sure you want to disable automatic payments? You will need to manually process future payments."
        type="warning"
        onConfirm={confirmToggle}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* This Month */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
          <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">This Month</span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">£{thisMonthTotal.toFixed(2)}</h3>
            <p className="text-xs text-gray-500 mt-1 truncate font-medium">{thisMonthDescription}</p>
          </div>
        </div>

        {/* Next Payment */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
          <div className="h-1 bg-gradient-to-r from-primary-wave to-blue-500" />
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-wave" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Next Payment</span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{nextPaymentLabel}</h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">{daysRemainingText}</p>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
          <div className="h-1 bg-gradient-to-r from-primary-sunset to-orange-400" />
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary-sunset" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Default Card</span>
            </div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">•••• {defaultCard.last4}</h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">{defaultCard.brand} · {defaultCard.cardholderName || 'Card Holder'}</p>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-700">Billing History</h2>
          <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
            {billingRecords.length} record{billingRecords.length !== 1 ? 's' : ''}
          </span>
        </div>

        {billingRecords.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-400">No billing records yet</p>
            <p className="text-xs text-gray-400 mt-1">Your payment history will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Description</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {billingRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-600">
                      {new Date(record.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-800">
                      {record.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-900">
                      £{record.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {record.invoiceUrl && record.invoiceUrl !== '#' && (
                          <a
                            href={record.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Invoice
                          </a>
                        )}
                        {record.receiptUrl && record.receiptUrl !== '#' && (
                          <a
                            href={record.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Receipt
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Settings */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-700">Payment Settings</h2>
        </div>

        <div className="p-6 space-y-0">
          {/* Auto-pay */}
          <div className="flex items-center justify-between py-5 border-b border-gray-100">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Automatic Payments</p>
                <p className="text-xs text-gray-500 mt-0.5">Charged 3 days before due date automatically</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('autoPay')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                settings.autoPay ? 'bg-emerald-500' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                settings.autoPay ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Default Payment Method */}
          <div className="py-5 border-b border-gray-100">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <CreditCard className="w-4 h-4 text-primary-sunset" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Default Payment Method</p>
                <p className="text-xs text-gray-500 mt-0.5">Used for all automatic and manual payments</p>
              </div>
            </div>
            <div className="ml-12 flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">{defaultCard.brand} •••• {defaultCard.last4}</p>
                  <p className="text-[11px] text-gray-400 font-medium">{defaultCard.cardholderName || 'Card Holder'} · Exp {defaultCard.expiry}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100 uppercase tracking-wider">
                Default
              </span>
            </div>
          </div>

          {/* Payment Reminders */}
          <div className="flex items-center justify-between py-5 border-b border-gray-100">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-primary-wave" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Payment Reminders</p>
                <p className="text-xs text-gray-500 mt-0.5">Email reminders before payment due date</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('reminders')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                settings.reminders ? 'bg-emerald-500' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                settings.reminders ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Payment Confirmations */}
          <div className="flex items-center justify-between py-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Payment Confirmations</p>
                <p className="text-xs text-gray-500 mt-0.5">Email confirmation when payment is processed</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('confirmations')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                settings.confirmations ? 'bg-emerald-500' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                settings.confirmations ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
