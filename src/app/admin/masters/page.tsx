'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Upload, User, Award, X } from 'lucide-react';
import { Master } from '@/types';
import LoadingOverlay from '@/components/LoadingOverlay';
import toast from 'react-hot-toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';

export default function AdminMasters() {
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMaster, setEditingMaster] = useState<Master | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [masterToDelete, setMasterToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Master>>({
    name: '',
    title: '',
    bio: '',
    rank: '',
    certifications: [],
    image: undefined,
    showOnWeb: false,
  });

  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      const response = await fetch('/api/masters');
      const result = await response.json();
      if (result.success) {
        setMasters(result.data);
      }
    } catch (error) {
      console.error('Error fetching masters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingMaster ? 'PUT' : 'POST';
      const url = editingMaster ? '/api/masters' : '/api/masters';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        if (editingMaster) {
          // Update existing master in state
          setMasters(masters.map(m => 
            m._id === editingMaster._id 
              ? { ...m, ...formData } as Master
              : m
          ));
        } else {
          // Add new master to state
          setMasters([...masters, result.data]);
        }
        
        setShowForm(false);
        setEditingMaster(null);
        resetForm();
      } else {
        alert(result.error || 'Failed to save master');
      }
    } catch (error) {
      console.error('Error saving master:', error);
      alert('Failed to save master. Please try again.');
    }
  };

  const handleDelete = (masterId: string) => {
    setMasterToDelete(masterId);
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!masterToDelete) return;
    setConfirmOpen(false);
    const toastId = toast.loading('Deleting master...');
    try {
      const response = await fetch(`/api/masters?_id=${masterToDelete}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Master deleted successfully', { id: toastId });
        setMasters(masters.filter(m => m._id !== masterToDelete));
      } else {
        toast.error(result.error || 'Failed to delete master', { id: toastId });
      }
    } catch (error) {
      console.error('Error deleting master:', error);
      toast.error('Failed to delete master. Please try again.', { id: toastId });
    } finally {
      setMasterToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      bio: '',
      rank: '',
      certifications: [],
      image: undefined,
      showOnWeb: false,
    });
  };

  const handleEdit = (master: Master) => {
    setEditingMaster(master);
    setFormData(master);
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const toastId = toast.loading('Uploading Photo.');

    try {
      const data = new FormData();
      data.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: data,
      });

      const result = await response.json();

      if (result.success) {
        setFormData(prev => ({
          ...prev,
          image: {
            fileKey: result.data.fileKey,
            url: result.data.url,
          }
        }));
        toast.success('Photo uploaded to Backblaze successfully!', { id: toastId });
      } else {
        toast.error(result.error || 'Failed to upload photo', { id: toastId });
      }
    } catch (error) {
      console.error('Error uploading master photo:', error);
      toast.error('Failed to upload photo. Please try again.', { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCertificationChange = (index: number, value: string) => {
    const newCertifications = [...(formData.certifications || [])];
    newCertifications[index] = value;
    setFormData({ ...formData, certifications: newCertifications });
  };

  const addCertification = () => {
    setFormData({
      ...formData,
      certifications: [...(formData.certifications || []), ''],
    });
  };

  const removeCertification = (index: number) => {
    const newCertifications = (formData.certifications || []).filter((_, i) => i !== index);
    setFormData({ ...formData, certifications: newCertifications });
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Masters Management</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingMaster(null);
            resetForm();
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Master</span>
        </button>
      </div>

      {/* Masters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {masters.map((master) => (
          <div key={master._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Master Image */}
            <div className="h-48 bg-gradient-to-br from-primary-navy to-[#121c3f] flex items-center justify-center">
              {master.image?.url ? (
                <img
                  src={master.image.url}
                  alt={master.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-white/50" />
              )}
            </div>

            {/* Master Info */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{master.name}</h3>
                  <p className="text-sm text-primary-sunset font-medium mb-2">{master.title}</p>
                  <p className="text-sm text-gray-600 mb-2">{master.rank}</p>
                  <div className="mb-2">
                    {master.showOnWeb ? (
                      <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-emerald-200">
                        Visible on Web
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-full border border-slate-200">
                        Hidden on Web
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(master)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(master._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-700 text-sm mb-4 line-clamp-3">{master.bio}</p>

              {master.certifications && master.certifications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {master.certifications.slice(0, 3).map((cert, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {cert}
                    </span>
                  ))}
                  {master.certifications.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      +{master.certifications.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Master Modal */}
      {(showForm || editingMaster) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingMaster ? 'Edit Master' : 'Add New Master'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {formData.image?.url ? (
                      <img
                        src={formData.image.url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="master-image-upload"
                    />
                    <label
                      htmlFor={uploadingImage ? undefined : "master-image-upload"}
                      className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg transition-colors ${
                        uploadingImage ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      <Upload className={`w-4 h-4 ${uploadingImage ? 'animate-bounce' : ''}`} />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload Photo'}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Name and Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                  />
                </div>
              </div>

              {/* Rank */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rank
                </label>
                <input
                  type="text"
                  value={formData.rank || ''}
                  onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                  placeholder="e.g., 5th Dan Black Belt"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                />
              </div>

              {/* Certifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certifications
                </label>
                <div className="space-y-2">
                  {(formData.certifications || []).map((cert, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={cert}
                        onChange={(e) => handleCertificationChange(index, e.target.value)}
                        placeholder="e.g., Kukkiwon Certified Instructor"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-sunset focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => removeCertification(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addCertification}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Certification</span>
                  </button>
                </div>
              </div>

              {/* Display on Website Toggle */}
              <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <input
                  type="checkbox"
                  id="showOnWeb"
                  checked={formData.showOnWeb || false}
                  onChange={(e) => setFormData({ ...formData, showOnWeb: e.target.checked })}
                  className="w-4 h-4 text-primary-sunset border-gray-300 rounded focus:ring-primary-sunset focus:ring-2 focus:ring-offset-2 cursor-pointer"
                />
                <label htmlFor="showOnWeb" className="text-sm font-semibold text-gray-700 select-none cursor-pointer">
                  Display this master in "Meet Our Masters" on the website
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex w-full sm:w-auto justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingMaster(null);
                    resetForm();
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="flex-1 sm:flex-initial btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-center justify-center"
                >
                  {editingMaster ? 'Update Master' : 'Create Master'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={confirmOpen}
        title="Delete Master"
        message="Are you sure you want to delete this master? This action cannot be undone."
        onConfirm={executeDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setMasterToDelete(null);
        }}
        type="danger"
        confirmText="Delete"
      />
    </div>
  );
}
