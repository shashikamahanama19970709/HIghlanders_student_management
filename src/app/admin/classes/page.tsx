'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Users, Clock, Calendar } from 'lucide-react';
import { Class } from '@/types';

export default function AdminClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement class creation/update
    setShowForm(false);
    setEditingClass(null);
    fetchClasses();
  };

  const handleDelete = async (classId: string) => {
    if (confirm('Are you sure you want to delete this class?')) {
      // TODO: Implement class deletion
      fetchClasses();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading classes...</div>
      </div>
    );
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

              <h3 className="text-xl font-bold text-gray-900 mb-4 font-athletic uppercase tracking-wide">{classItem.name}</h3>

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
                        defaultChecked={editingClass?.schedule.days.includes(day)}
                        className="mr-2 rounded border-gray-300 text-primary-sunset focus:ring-primary-sunset"
                      />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>
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
    </div>
  );
}
