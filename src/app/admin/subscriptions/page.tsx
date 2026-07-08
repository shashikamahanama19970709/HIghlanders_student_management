'use client';

import { useEffect, useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Check, 
  X, 
  DollarSign, 
  Clock, 
  FileText, 
  Calendar,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingOverlay from '@/components/LoadingOverlay';
import { Subscription, Class } from '@/types';

export default function AdminSubscriptions() {
  const [plans, setPlans] = useState<Subscription[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // New plan form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, classesRes] = await Promise.all([
        fetch('/api/subscriptions'),
        fetch('/api/classes')
      ]);

      const plansData = await plansRes.json();
      const classesData = await classesRes.json();

      if (plansData.success) {
        setPlans(plansData.data);
      }
      if (classesData.success) {
        setClasses(classesData.data);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error('Failed to load subscriptions or classes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleClassToggle = (classId: string) => {
    if (selectedClasses.includes(classId)) {
      setSelectedClasses(selectedClasses.filter(id => id !== classId));
    } else {
      setSelectedClasses([...selectedClasses, classId]);
    }
  };

  const handleEditPlan = (plan: Subscription) => {
    setEditingPlanId(plan._id || null);
    setName(plan.name);
    setDescription(plan.description || '');
    setPrice(plan.price.toString());
    setBillingCycle(plan.billingCycle);
    setFeatures(plan.features || []);
    setSelectedClasses(plan.classes || []);
    setIsModalOpen(true);
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subscription plan?')) return;
    
    const toastId = toast.loading('Deleting subscription plan...');
    try {
      const res = await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        toast.success('Subscription plan deleted successfully', { id: toastId });
        fetchData();
      } else {
        toast.error(result.error || 'Failed to delete plan', { id: toastId });
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Network error. Failed to delete plan.', { id: toastId });
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !billingCycle) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    const isEditing = !!editingPlanId;
    const toastId = toast.loading(isEditing ? 'Updating subscription plan...' : 'Creating subscription plan in DB & Stripe...');
    try {
      const url = isEditing ? `/api/subscriptions/${editingPlanId}` : '/api/subscriptions';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          billingCycle,
          features,
          classes: selectedClasses,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(result.message || `Subscription plan successfully ${isEditing ? 'updated' : 'created'}!`, { id: toastId });
        closeModal();
        fetchData();
      } else {
        toast.error(result.error || `Failed to ${isEditing ? 'update' : 'create'} plan`, { id: toastId });
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error(`Network error. Failed to ${isEditing ? 'update' : 'create'} subscription plan.`, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlanId(null);
    setName('');
    setDescription('');
    setPrice('');
    setBillingCycle('monthly');
    setFeatures([]);
    setSelectedClasses([]);
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="space-y-8 animate-fade-in pl-1 pr-1 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-athletic uppercase tracking-wider text-gray-900">Subscription Plans</h1>
          <p className="text-gray-500 text-xs mt-1 font-medium">Create recurring membership plans and manage Stripe price objects.</p>
        </div>
        
        <button
          onClick={() => {
            setEditingPlanId(null);
            setName('');
            setDescription('');
            setPrice('');
            setBillingCycle('monthly');
            setFeatures([]);
            setSelectedClasses([]);
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 px-5 py-3 bg-[#E35E1C] hover:bg-[#101b3f] text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all duration-300 self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create Subscription Plan</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan._id} className="bg-white rounded-3xl border border-gray-150 shadow-sm hover:shadow-xl hover:shadow-slate-100/40 transition-all duration-300 flex flex-col overflow-hidden">
            {/* Header banner */}
            <div className="bg-slate-50/50 p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="w-10 h-10 bg-primary-sunset/10 border border-primary-sunset/25 text-[#E35E1C] rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleEditPlan(plan)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Plan"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => plan._id && handleDeletePlan(plan._id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                  plan.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/20' : 'bg-slate-100 text-slate-500'
                }`}>
                  {plan.isActive ? 'Active' : 'Draft'}
                </span>
              </div>
            </div>

            {/* Plan Info */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">{plan.name}</h3>
                <p className="text-xs text-slate-400 font-medium mt-1 min-h-[32px] line-clamp-2">{plan.description || 'No description provided.'}</p>
                
                {/* Price Display */}
                <div className="flex items-baseline mt-4 mb-5">
                  <span className="text-3xl font-black text-slate-800">£{plan.price}</span>
                  <span className="text-slate-400 font-bold text-xs ml-1.5">/ {plan.billingCycle}</span>
                </div>

                {/* Features Checklist */}
                {plan.features && plan.features.length > 0 && (
                  <div className="space-y-2.5 border-t border-slate-50 pt-5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Included Features</p>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start text-xs font-semibold text-slate-600">
                        <Check className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stripe reference info */}
              <div className="border-t border-slate-100 pt-4 text-[10px] font-semibold text-slate-400 bg-slate-50/50 -mx-6 -mb-6 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Stripe Price Object:</span>
                </div>
                <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono text-[9px]">
                  {plan.stripePriceId || 'No Stripe Reference'}
                </code>
              </div>
            </div>
          </div>
        ))}

        {plans.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white border border-gray-150 rounded-3xl">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">No Subscriptions Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 font-medium">Create a subscription plan using the button above to begin registering packages in Stripe and the local database.</p>
          </div>
        )}
      </div>

      {/* Create Subscription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in animate-duration-200">
          <div className="bg-white rounded-3xl border border-gray-150 shadow-2xl max-w-lg w-full overflow-hidden transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0A1128] to-[#101b3f] text-white p-6 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                  <CreditCard className="w-5 h-5 text-primary-sunset" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">{editingPlanId ? 'Edit Subscription Plan' : 'Create Subscription Plan'}</h3>
                  <p className="text-[10px] text-gray-300 mt-0.5">{editingPlanId ? 'Update pricing details' : 'Define pricing details and sync with your Stripe account'}</p>
                </div>
              </div>
              <button 
                onClick={closeModal}
                className="text-white/60 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreatePlan}>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
                {/* Plan Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-sunset/20 focus:border-primary-sunset transition-all font-semibold text-slate-700"
                    placeholder="e.g. Premium Monthly Membership"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-sunset/20 focus:border-primary-sunset transition-all font-medium text-slate-600"
                    placeholder="Provide a brief summary of what this membership covers..."
                  />
                </div>

                {/* Price & Billing Cycle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Price (£) *
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-sunset/20 focus:border-primary-sunset transition-all font-bold text-slate-700"
                        placeholder="45.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Billing Cycle *
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                      <select
                        value={billingCycle}
                        onChange={(e) => setBillingCycle(e.target.value as any)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-sunset/20 focus:border-primary-sunset transition-all font-semibold text-slate-750 bg-white cursor-pointer"
                      >
                        <option value="monthly">Monthly Recurring</option>
                        <option value="quarterly">Quarterly (3 Months)</option>
                        <option value="yearly">Yearly Recurring</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Features List Builder */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Plan Features
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-sunset/20 focus:border-primary-sunset transition-all font-medium text-slate-650"
                      placeholder="e.g. Free uniform upgrade"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                    >
                      Add
                    </button>
                  </div>
                  
                  {/* Features Display List */}
                  {features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {features.map((feat, idx) => (
                        <span key={idx} className="inline-flex items-center px-3 py-1.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold text-slate-600">
                          <span>{feat}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(idx)}
                            className="ml-2 text-slate-450 hover:text-red-500 p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Target Classes Selection */}
                {classes.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Included Training Classes
                    </label>
                    <div className="border border-gray-200 rounded-2xl p-4 max-h-[120px] overflow-y-auto space-y-2.5">
                      {classes.map((cls) => (
                        <label key={cls._id} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedClasses.includes(cls._id)}
                            onChange={() => handleClassToggle(cls._id)}
                            className="w-4 h-4 text-primary-sunset border-gray-300 rounded focus:ring-primary-sunset"
                          />
                          <div className="leading-tight">
                            <span className="text-xs font-bold text-slate-750">{cls.name}</span>
                            <span className="text-[10px] text-slate-400 ml-2 font-semibold">({cls.ageCategory})</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4.5 bg-slate-50 border-t border-gray-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !name || !price}
                  className="px-5 py-2.5 bg-primary-sunset text-white hover:bg-primary-wave rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{saving ? 'Saving...' : editingPlanId ? 'Save Changes' : 'Save & Publish Plan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
