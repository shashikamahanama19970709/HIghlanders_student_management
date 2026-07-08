'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Users, Clock, Calendar } from 'lucide-react';
import { Class } from '@/types';
import LoadingOverlay from '@/components/LoadingOverlay';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import toast from 'react-hot-toast';

export default function AdminClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      const result = await response.json();
      if (result.success) {
        setClasses(result.data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formEl = e.currentTarget;
      const formData = new FormData(formEl);
      
      const className = formData.get('className') as string;
      const ageCategory = formData.get('ageCategory') as string;
      const description = formData.get('description') as string;
      const startTime = formData.get('startTime') as string;
      const endTime = formData.get('endTime') as string;
      const showOnWeb = formData.get('showOnWeb') === 'on';

      // Gather checked days
      const days: string[] = [];
      const checkboxes = formEl.querySelectorAll('input[type="checkbox"][name="days"]');
      checkboxes.forEach((cb: any) => {
        if (cb.checked) {
          days.push(cb.value);
        }
      });

      if (days.length === 0) {
        alert('Please select at least one schedule day');
        return;
      }

      const payload = {
        name: className,
        ageCategory,
        description,
        schedule: {
          days,
          startTime,
          endTime
        },
        showOnWeb
      };

      const method = editingClass ? 'PUT' : 'POST';
      const body = editingClass ? { ...payload, _id: editingClass._id } : payload;

      const response = await fetch('/api/classes', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        setShowForm(false);
        setEditingClass(null);
        fetchClasses();
      } else {
        alert(result.error || 'Failed to save class');
      }
    } catch (error) {
      console.error('Error saving class:', error);
      alert('Failed to save class. Please try again.');
    }
  };

  const handleDelete = (classId: string) => {
    setClassToDelete(classId);
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!classToDelete) return;
    setConfirmOpen(false);
    const toastId = toast.loading('Deleting class...');
    try {
      const response = await fetch(`/api/classes?_id=${classToDelete}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Class deleted successfully', { id: toastId });
        fetchClasses();
      } else {
        toast.error(result.error || 'Failed to delete class', { id: toastId });
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('Failed to delete class. Please try again.', { id: toastId });
    } finally {
      setClassToDelete(null);
    }
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-athletic uppercase tracking-wider">Classes Management</h1>
          <p className="text-gray-500 text-xs mt-1 font-medium">Create, edit, and organize training schedules for all age groups.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2 px-5 py-2.5"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm">Add New Class</span>
        </button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <div key={classItem._id} className="bg-white rounded-2xl border border-gray-150 p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-gray-200/20 hover:-translate-y-0.5 transition-all duration-300">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="px-2.5 py-1 bg-primary-wave/10 text-primary-wave text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {classItem.ageCategory}
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setEditingClass(classItem)}
                    className="p-1.5 text-slate-500 hover:text-primary-wave hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(classItem._id)}
                    className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2 font-athletic uppercase tracking-wide">{classItem.name}</h3>
              <div className="mb-4">
                {classItem.showOnWeb ? (
                  <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-emerald-200">
                    Visible on Web
                  </span>
                ) : (
                  <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-full border border-slate-200">
                    Hidden on Web
                  </span>
                )}
              </div>

              <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100 mb-4">
                <div className="flex items-center text-xs font-semibold text-gray-600">
                  <Calendar className="w-4 h-4 mr-2.5 text-primary-sunset" />
                  <span>{classItem.schedule.days.join(', ')}</span>
                </div>
                
                <div className="flex items-center text-xs font-semibold text-gray-600">
                  <Clock className="w-4 h-4 mr-2.5 text-primary-sunset" />
                  <span>{classItem.schedule.startTime} - {classItem.schedule.endTime}</span>
                </div>

                <div className="flex items-center text-xs font-semibold text-gray-600 border-t border-slate-100 pt-2.5 mt-2.5">
                  <Users className="w-4 h-4 mr-2.5 text-primary-wave" />
                  <span>{classItem.currentEnrollment} Enrolled Students</span>
                </div>
              </div>

              <p className="text-gray-500 text-xs leading-relaxed mb-6">{classItem.description}</p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                classItem.isVisible 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : 'bg-slate-150 text-slate-600'
              }`}>
                {classItem.isVisible ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Class Modal */}
      {(showForm || editingClass) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold font-athletic uppercase tracking-wider text-gray-900 mb-6 pb-3 border-b border-gray-100">
              {editingClass ? 'Edit Class details' : 'Create New Class'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Class Name *
                </label>
                <input
                  type="text"
                  required
                  name="className"
                  defaultValue={editingClass?.name}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-wave/20 focus:border-primary-wave transition-all"
                  placeholder="e.g. Beginners Taekwondo"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Age Category *
                </label>
                <input
                  type="text"
                  required
                  name="ageCategory"
                  defaultValue={editingClass?.ageCategory}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-wave/20 focus:border-primary-wave transition-all"
                  placeholder="e.g. Ages 7-12"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  name="description"
                  defaultValue={editingClass?.description}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-255 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-wave/20 focus:border-primary-wave transition-all"
                  placeholder="Class program details and prerequisites..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    name="startTime"
                    defaultValue={editingClass?.schedule.startTime}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-wave/20 focus:border-primary-wave transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    name="endTime"
                    defaultValue={editingClass?.schedule.endTime}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-wave/20 focus:border-primary-wave transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Schedule Days *
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <label key={day} className="flex items-center text-sm font-semibold text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        name="days"
                        value={day}
                        defaultChecked={editingClass?.schedule.days.includes(day)}
                        className="mr-2 rounded border-gray-300 text-primary-sunset focus:ring-primary-sunset"
                      />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Display on Website Toggle */}
              <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <input
                  type="checkbox"
                  id="showOnWeb"
                  name="showOnWeb"
                  defaultChecked={editingClass?.showOnWeb ?? false}
                  className="w-4 h-4 text-primary-sunset border-gray-300 rounded focus:ring-primary-sunset focus:ring-2 focus:ring-offset-2 cursor-pointer"
                />
                <label htmlFor="showOnWeb" className="text-sm font-semibold text-gray-700 select-none cursor-pointer">
                  Display in "Our Training Programs" on website
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingClass(null);
                  }}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-350 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-6 py-2.5 text-sm"
                >
                  {editingClass ? 'Update Class' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={confirmOpen}
        title="Delete Class"
        message="Are you sure you want to delete this training class? This action cannot be undone."
        onConfirm={executeDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setClassToDelete(null);
        }}
        type="danger"
        confirmText="Delete"
      />
    </div>
  );
}
