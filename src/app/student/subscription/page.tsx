'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Check, X, AlertCircle, Crown, Star, Trash2, Shield } from 'lucide-react';
import LoadingOverlay from '@/components/LoadingOverlay';
import toast from 'react-hot-toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  features: string[];
  isPopular?: boolean;
  current?: boolean;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
  cardholderName: string;
  cardNumber: string;
}

export default function StudentSubscription() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentSub, setCurrentSub] = useState<any>(null);

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState({ cardNumber: '', cardholderName: '', expiry: '', cvv: '' });
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [cardToRemove, setCardToRemove] = useState<string | null>(null);

  // Load payment methods from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('payment_methods');
    if (saved) {
      setPaymentMethods(JSON.parse(saved));
    } else {
      // Initialize with a default card
      const defaultCards: PaymentMethod[] = [
        { id: 'card_1', brand: 'Visa', last4: '4242', expiry: '12/25', isDefault: true, cardholderName: 'Card Holder', cardNumber: '•••• •••• •••• 4242' }
      ];
      setPaymentMethods(defaultCards);
      localStorage.setItem('payment_methods', JSON.stringify(defaultCards));
    }
  }, []);

  // Persist payment methods to localStorage whenever they change
  const persistPaymentMethods = (methods: PaymentMethod[]) => {
    setPaymentMethods(methods);
    localStorage.setItem('payment_methods', JSON.stringify(methods));
  };

  // Auto-detect card brand from number
  const detectCardBrand = (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'Amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
    return 'Card';
  };

  // Format card number with spaces
  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const handleAddPaymentMethod = () => {
    const cleanedNumber = newCard.cardNumber.replace(/\s/g, '');

    if (!cleanedNumber || cleanedNumber.length < 15 || cleanedNumber.length > 19) {
      toast.error('Please enter a valid card number (15-19 digits)');
      return;
    }
    if (!newCard.cardholderName.trim()) {
      toast.error('Please enter the cardholder name');
      return;
    }
    if (!newCard.expiry || !/^\d{2}\/\d{2}$/.test(newCard.expiry)) {
      toast.error('Please enter a valid expiry date (MM/YY)');
      return;
    }
    const [month] = newCard.expiry.split('/');
    if (parseInt(month) < 1 || parseInt(month) > 12) {
      toast.error('Invalid expiry month');
      return;
    }
    const expectedCvvLen = detectCardBrand(cleanedNumber) === 'Amex' ? 4 : 3;
    if (!newCard.cvv || newCard.cvv.length !== expectedCvvLen) {
      toast.error(`Please enter a valid ${expectedCvvLen}-digit CVV`);
      return;
    }

    const isFirstCard = paymentMethods.length === 0;
    const brand = detectCardBrand(cleanedNumber);
    const last4 = cleanedNumber.slice(-4);
    const card: PaymentMethod = {
      id: `card_${Date.now()}`,
      brand,
      last4,
      expiry: newCard.expiry,
      isDefault: isFirstCard,
      cardholderName: newCard.cardholderName.trim(),
      cardNumber: `•••• •••• •••• ${last4}`,
    };

    const updated = [...paymentMethods, card];
    persistPaymentMethods(updated);
    setNewCard({ cardNumber: '', cardholderName: '', expiry: '', cvv: '' });
    setShowAddForm(false);
    toast.success('Payment method added successfully');
  };

  const handleRemoveCard = (cardId: string) => {
    const card = paymentMethods.find(c => c.id === cardId);
    if (card?.isDefault && paymentMethods.length > 1) {
      toast.error('Cannot remove the default payment method. Set another card as default first.');
      return;
    }
    setCardToRemove(cardId);
    setConfirmRemoveOpen(true);
  };

  const confirmRemoveCard = () => {
    if (!cardToRemove) return;
    const updated = paymentMethods.filter(c => c.id !== cardToRemove);
    // If removed card was default and there are remaining cards, make the first one default
    if (updated.length > 0 && !updated.some(c => c.isDefault)) {
      updated[0].isDefault = true;
    }
    persistPaymentMethods(updated);
    setConfirmRemoveOpen(false);
    setCardToRemove(null);
    toast.success('Payment method removed');
  };

  const handleSetDefault = (cardId: string) => {
    const updated = paymentMethods.map(c => ({
      ...c,
      isDefault: c.id === cardId,
    }));
    persistPaymentMethods(updated);
    toast.success('Default payment method updated');
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const sessionId = query.get('session_id');
    if (sessionId) {
      confirmCheckout(sessionId);
    } else {
      fetchPlans();
    }
  }, []);

  const confirmCheckout = async (sessionId: string) => {
    setLoading(true);
    const toastId = toast.loading('Confirming transaction and activating subscription...');
    try {
      const res = await fetch(`/api/subscriptions/checkout?session_id=${sessionId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Subscription activated successfully!', { id: toastId });
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        toast.error(data.error || 'Failed to activate subscription', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error confirming payment', { id: toastId });
    } finally {
      fetchPlans();
    }
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      // Fetch profile for subscription details
      const profileRes = await fetch('/api/student/profile', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });

      if (profileRes.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        window.location.href = '/login';
        return;
      }

      const profileData = await profileRes.json();
      let activeSub = null;
      if (profileData.success && profileData.data?.subscription) {
        activeSub = profileData.data.subscription;
        setCurrentSub(activeSub);
      } else {
        setCurrentSub(null);
      }

      // Fetch plans
      const plansRes = await fetch('/api/subscriptions');
      const plansData = await plansRes.json();

      if (plansData.success) {
        const mappedPlans = plansData.data.map((plan: any) => ({
          id: plan._id,
          name: plan.name,
          price: plan.price,
          billingCycle: plan.billingCycle,
          features: plan.features,
          isPopular: plan.name.toLowerCase().includes('quarterly') || plan.name.toLowerCase().includes('popular') || plan.billingCycle === 'quarterly',
          current: activeSub && activeSub.planId === plan._id && activeSub.status === 'active',
        }));
        setPlans(mappedPlans);
      } else {
        toast.error('Failed to load subscription plans');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Network error loading subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setSelectedPlan(planId);
    const toastId = toast.loading('Initiating checkout...');
    try {
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ subscriptionId: planId }),
      });
      
      const result = await response.json();
      if (result.success && result.data?.checkoutUrl) {
        toast.success('Redirecting to checkout...', { id: toastId });
        window.location.href = result.data.checkoutUrl;
      } else {
        toast.error(result.error || 'Failed to initiate checkout', { id: toastId });
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Failed to process subscription. Please try again.', { id: toastId });
    } finally {
      setSelectedPlan(null);
    }
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="pb-10 animate-fade-in">
      <h1 className="text-2xl font-black font-athletic uppercase tracking-wider text-gray-900 mb-8">Subscription Plans</h1>
      
      {/* Current Subscription Info */}
      <div className={`bg-gradient-to-r ${currentSub && currentSub.status === 'active' ? 'from-green-500 to-green-600' : 'from-slate-550 to-slate-700 bg-slate-600'} rounded-3xl p-6 text-white mb-8 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-white/5`}>
        <div>
          <h2 className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1.5">Current Subscription Status</h2>
          <p className="text-white text-lg font-black tracking-tight">{currentSub ? `${currentSub.planName} - £${currentSub.price}/${currentSub.billingCycle}` : 'No Active Subscription Package'}</p>
          {currentSub && (
            <p className="text-white/80 text-xs mt-1.5 font-semibold">Next payment date: {new Date(currentSub.nextPaymentDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          )}
        </div>
        <div className="text-right self-start sm:self-auto">
          <span className="px-4 py-2 bg-white/15 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest">
            {currentSub ? currentSub.status : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Available Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-lg shadow-lg overflow-hidden ${
              plan.isPopular ? 'ring-2 ring-primary-sunset transform scale-105' : ''
            } ${plan.current ? 'ring-2 ring-green-500' : ''}`}
          >
            {plan.isPopular && (
              <div className="bg-gradient-to-r from-primary-sunset to-primary-wave text-white text-center py-2">
                <span className="text-sm font-semibold flex items-center justify-center">
                  <Star className="w-4 h-4 mr-1" />
                  Most Popular
                </span>
              </div>
            )}
            
            {plan.current && (
              <div className="bg-green-500 text-white text-center py-2">
                <span className="text-sm font-semibold flex items-center justify-center">
                  <Check className="w-4 h-4 mr-1" />
                  Current Plan
                </span>
              </div>
            )}

            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">£{plan.price}</span>
                  <span className="text-gray-600 ml-1">/{plan.billingCycle}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={plan.current || selectedPlan === plan.id}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  plan.current
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : plan.isPopular
                    ? 'bg-gradient-to-r from-primary-sunset to-primary-wave text-white hover:shadow-lg'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                } ${selectedPlan === plan.id ? 'opacity-50 cursor-wait' : ''}`}
              >
                {plan.current ? 'Current Plan' : selectedPlan === plan.id ? 'Processing...' : 'Subscribe'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cancellation Info */}
      <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Subscription Management</h3>
            <p className="text-yellow-700">
              You can cancel your subscription at any time. Cancellations will take effect at the end of your current billing period.
              No refunds are provided for partial months. You can also change your plan at any time, with prorated billing.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-primary-sunset" />
          Payment Methods
        </h2>
        <div className="space-y-4">
          {paymentMethods.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">No payment methods added yet. Add one below.</p>
          )}

          {paymentMethods.map((card) => (
            <div key={card.id} className={`flex items-center justify-between p-4 border rounded-lg transition-all ${card.isDefault ? 'border-green-300 bg-green-50/50' : 'border-gray-200'}`}>
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${card.isDefault ? 'bg-green-100' : 'bg-blue-100'}`}>
                  <CreditCard className={`w-5 h-5 ${card.isDefault ? 'text-green-600' : 'text-blue-600'}`} />
                </div>
                <div>
                  <p className="font-medium">{card.brand} •••• {card.last4}</p>
                  <p className="text-xs text-gray-500">{card.cardholderName || 'Card Holder'}</p>
                  <p className="text-xs text-gray-400">Expires {card.expiry}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {card.isDefault ? (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center">
                    <Shield className="w-3 h-3 mr-1" />
                    Default
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetDefault(card.id)}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full hover:bg-blue-100 transition-colors"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleRemoveCard(card.id)}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove card"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add Payment Method Form */}
          {showAddForm ? (
            <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50/30">
              <h3 className="text-sm font-bold text-gray-800 mb-5 flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-blue-600" />
                Add New Payment Method
              </h3>

              <div className="space-y-4">
                {/* Card Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={19}
                      placeholder="4111 1111 1111 1111"
                      value={newCard.cardNumber}
                      onChange={(e) => {
                        const formatted = formatCardNumber(e.target.value);
                        if (formatted.replace(/\s/g, '').length <= 19) {
                          setNewCard({ ...newCard, cardNumber: formatted });
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono tracking-wider focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-20"
                    />
                    {newCard.cardNumber.replace(/\s/g, '').length >= 2 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        {detectCardBrand(newCard.cardNumber)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="SHASHIKA MAHANAMA"
                    value={newCard.cardholderName}
                    onChange={(e) => setNewCard({ ...newCard, cardholderName: e.target.value.toUpperCase() })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm uppercase tracking-wide focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Expiry & CVV row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Expiry Date</label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="MM/YY"
                      value={newCard.expiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^\d/]/g, '');
                        if (val.length === 2 && !val.includes('/') && newCard.expiry.length < val.length) {
                          val = val + '/';
                        }
                        setNewCard({ ...newCard, expiry: val });
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      CVV / CVC
                      <span className="text-gray-400 font-normal ml-1">({detectCardBrand(newCard.cardNumber) === 'Amex' ? '4 digits' : '3 digits'})</span>
                    </label>
                    <input
                      type="password"
                      maxLength={detectCardBrand(newCard.cardNumber) === 'Amex' ? 4 : 3}
                      placeholder="•••"
                      value={newCard.cvv}
                      onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value.replace(/\D/g, '') })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-5 pt-4 border-t border-blue-100">
                <button
                  onClick={() => { setShowAddForm(false); setNewCard({ cardNumber: '', cardholderName: '', expiry: '', cvv: '' }); }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPaymentMethod}
                  className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Add Card
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
            >
              + Add Payment Method
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for removing a card */}
      <ConfirmationDialog
        isOpen={confirmRemoveOpen}
        title="Remove Payment Method"
        message="Are you sure you want to remove this payment method? This action cannot be undone."
        type="danger"
        onConfirm={confirmRemoveCard}
        onCancel={() => { setConfirmRemoveOpen(false); setCardToRemove(null); }}
      />
    </div>
  );
}
