'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, User, Calendar, MessageSquare, CheckCircle, Clock, X, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingOverlay from '@/components/LoadingOverlay';
import ConfirmationDialog from '@/components/ConfirmationDialog';

interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  preferredClass?: string;
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in-progress' | 'resolved'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const filteredInquiries = inquiries.filter(i => {
    if (statusFilter !== 'all' && i.status !== statusFilter) {
      return false;
    }
    const query = searchQuery.toLowerCase();
    if (!query) return true;
    const nameMatch = i.name?.toLowerCase().includes(query);
    const emailMatch = i.email?.toLowerCase().includes(query);
    const phoneMatch = i.phone?.toLowerCase().includes(query);
    const subjectMatch = i.subject?.toLowerCase().includes(query);
    const messageMatch = i.message?.toLowerCase().includes(query);
    const classMatch = i.preferredClass?.toLowerCase().includes(query);
    const statusMatch = i.status?.toLowerCase().includes(query);
    return nameMatch || emailMatch || phoneMatch || subjectMatch || messageMatch || classMatch || statusMatch;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);
  const paginatedInquiries = filteredInquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'info' | 'success' | 'warning';
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleConvertToStudent = (inquiryId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Add as Student",
      message: "Are you sure you want to add this inquirer as a student? This will register a student login account, sync member request history, and mark this inquiry as resolved.",
      type: "success",
      confirmText: "Add Student",
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        const toastId = toast.loading('Converting to student...');
        try {
          const response = await fetch('/api/inquiries/convert', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inquiryId }),
          });

          const result = await response.json();
          if (result.success) {
            toast.success(result.message || 'Student account created successfully!', { id: toastId });
            setShowDetailsModal(false);
            fetchInquiries();
          } else {
            toast.error(result.error || 'Failed to convert to student', { id: toastId });
          }
        } catch (error) {
          console.error('Error converting to student:', error);
          toast.error('An error occurred. Please check network connection.', { id: toastId });
        }
      }
    });
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const response = await fetch('/api/inquiries');
      const result = await response.json();
      if (result.success) {
        setInquiries(result.data);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast.error('Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (inquiryId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/inquiries', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: inquiryId, status: newStatus }),
      });

      const result = await response.json();
      
      if (result.success) {
        setInquiries(inquiries.map(inquiry => 
          inquiry._id === inquiryId 
            ? { ...inquiry, status: newStatus as Inquiry['status'] }
            : inquiry
        ));
        toast.success('Inquiry status updated successfully');
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = (inquiryId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete Inquiry",
      message: "Are you sure you want to delete this inquiry? This action cannot be undone.",
      type: "danger",
      confirmText: "Delete",
      onConfirm: async () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        const toastId = toast.loading('Deleting inquiry...');
        try {
          const response = await fetch(`/api/inquiries?_id=${inquiryId}`, {
            method: 'DELETE',
          });
          
          const result = await response.json();
          
          if (result.success) {
            setInquiries(inquiries.filter(inquiry => inquiry._id !== inquiryId));
            toast.success('Inquiry deleted successfully', { id: toastId });
          } else {
            toast.error(result.error || 'Failed to delete inquiry', { id: toastId });
          }
        } catch (error) {
          console.error('Error deleting inquiry:', error);
          toast.error('Failed to delete inquiry', { id: toastId });
        }
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in-progress':
        return <MessageSquare className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inquiries Management</h1>
        <p className="text-gray-600 mt-2">Manage and respond to customer inquiries</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setStatusFilter('all')}
          className={`text-left p-6 rounded-xl border transition-all duration-200 focus:outline-none ${
            statusFilter === 'all'
              ? 'bg-blue-50/30 border-blue-500 shadow-md ring-2 ring-blue-500/10'
              : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-lg transition-colors ${statusFilter === 'all' ? 'bg-blue-200/80 text-blue-700' : 'bg-blue-100 text-blue-600'}`}>
              <Mail className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-500">Total Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">{inquiries.length}</p>
            </div>
          </div>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setStatusFilter('pending')}
          className={`text-left p-6 rounded-xl border transition-all duration-200 focus:outline-none ${
            statusFilter === 'pending'
              ? 'bg-yellow-50/40 border-yellow-500 shadow-md ring-2 ring-yellow-500/10'
              : 'bg-white border-gray-200 hover:border-yellow-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-lg transition-colors ${statusFilter === 'pending' ? 'bg-yellow-200/80 text-yellow-700' : 'bg-yellow-100 text-yellow-600'}`}>
              <Clock className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {inquiries.filter(i => i.status === 'pending').length}
              </p>
            </div>
          </div>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setStatusFilter('in-progress')}
          className={`text-left p-6 rounded-xl border transition-all duration-200 focus:outline-none ${
            statusFilter === 'in-progress'
              ? 'bg-blue-50/30 border-blue-500 shadow-md ring-2 ring-blue-500/10'
              : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-lg transition-colors ${statusFilter === 'in-progress' ? 'bg-blue-200/80 text-blue-700' : 'bg-blue-100 text-blue-600'}`}>
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {inquiries.filter(i => i.status === 'in-progress').length}
              </p>
            </div>
          </div>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setStatusFilter('resolved')}
          className={`text-left p-6 rounded-xl border transition-all duration-200 focus:outline-none ${
            statusFilter === 'resolved'
              ? 'bg-green-50/30 border-green-500 shadow-md ring-2 ring-green-500/10'
              : 'bg-white border-gray-200 hover:border-green-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-lg transition-colors ${statusFilter === 'resolved' ? 'bg-green-200/80 text-green-700' : 'bg-green-100 text-green-600'}`}>
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-500">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">
                {inquiries.filter(i => i.status === 'resolved').length}
              </p>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative max-w-md">
        <input
          type="text"
          placeholder="Search inquiries by name, email, class, status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 pl-10 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-wave/20 focus:border-primary-wave transition-all font-medium text-slate-700 bg-white"
        />
        <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Inquiries List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 capitalize">
            {statusFilter === 'all' ? 'All Inquiries' : `${statusFilter.replace('-', ' ')} Inquiries`}
          </h2>
          <span className="text-xs text-gray-400 font-bold">{filteredInquiries.length} total</span>
        </div>
        
        {filteredInquiries.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No inquiries found</p>
          </div>
        ) : (
          <div className="divide-y">
            {paginatedInquiries.map((inquiry) => (
              <motion.div
                key={inquiry._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{inquiry.name}</h3>
                      <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(inquiry.status)}`}>
                        {getStatusIcon(inquiry.status)}
                        <span>{inquiry.status.replace('-', ' ')}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {inquiry.email}
                      </div>
                      {inquiry.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {inquiry.phone}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(inquiry.createdAt)}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700">Subject: {inquiry.subject}</p>
                      {inquiry.preferredClass && (
                        <div className="mt-2 mb-2 flex items-center space-x-1.5 bg-sky-50 text-sky-700 text-[10px] font-extrabold uppercase tracking-wider rounded-md border border-sky-150/60 px-2.5 py-1 max-w-max">
                          Preferred Class: {inquiry.preferredClass}
                        </div>
                      )}
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{inquiry.message}</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <select
                          value={inquiry.status}
                          onChange={(e) => handleStatusUpdate(inquiry._id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:ring-2 focus:ring-primary-sunset focus:border-transparent font-bold text-slate-700 bg-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        
                        <button
                          onClick={() => {
                            setSelectedInquiry(inquiry);
                            setShowDetailsModal(true);
                          }}
                          className="text-xs text-primary-sunset hover:text-primary-wave flex items-center space-x-1.5 font-bold px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                      </div>

                      {inquiry.status !== 'resolved' && (
                        <button
                          onClick={() => handleConvertToStudent(inquiry._id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm shadow-emerald-600/5 hover:-translate-y-0.5"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Add as Student</span>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(inquiry._id)}
                    className="ml-4 text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-150 pt-6 mt-6 mb-8">
          <p className="text-xs font-semibold text-slate-500">
            Showing <span className="text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-slate-700">{Math.min(currentPage * itemsPerPage, filteredInquiries.length)}</span> of <span className="text-slate-700">{filteredInquiries.length}</span> inquiries
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-xl text-xs font-black transition-colors ${
                    currentPage === page
                      ? 'bg-primary-wave text-white'
                      : 'border border-gray-200 text-slate-600 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedInquiry && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowDetailsModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-navy to-[#121c3f] border-b-2 border-primary-sunset text-white p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Inquiry Details</h2>
                  <p className="text-white/90 mt-1">{selectedInquiry.subject}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary-sunset" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{selectedInquiry.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedInquiry.email}</p>
                  </div>
                  {selectedInquiry.phone && (
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{selectedInquiry.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedInquiry.status)}`}>
                      {getStatusIcon(selectedInquiry.status)}
                      <span>{selectedInquiry.status.replace('-', ' ')}</span>
                    </span>
                  </div>
                </div>
              </div>

              {selectedInquiry.preferredClass && (
                <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center uppercase tracking-wide mb-1">
                    <Calendar className="w-4 h-4 mr-2 text-primary-sunset" />
                    Preferred Class Details
                  </h3>
                  <p className="text-xs font-semibold text-slate-600">Interested Program: <span className="text-primary-wave font-bold">{selectedInquiry.preferredClass}</span></p>
                  <p className="text-[10px] text-gray-500 mt-1">This visitor expressed immediate interest in joining this specific training program when submitting their inquiry form.</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-primary-sunset" />
                  Message
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t text-left">
                <div className="text-sm text-gray-600">
                  <p>Received: {formatDate(selectedInquiry.createdAt)}</p>
                  <p>Last Updated: {formatDate(selectedInquiry.updatedAt)}</p>
                </div>
                <div className="flex w-full sm:w-auto justify-end gap-2">
                  {selectedInquiry.status !== 'resolved' && (
                    <button
                      onClick={() => handleConvertToStudent(selectedInquiry._id)}
                      className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-semibold text-sm flex items-center justify-center space-x-1.5 animate-none"
                    >
                      <User className="w-4 h-4" />
                      <span>Add as Student</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="flex-1 sm:flex-initial px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm text-gray-750 text-center"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <ConfirmationDialog
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        type={confirmConfig.type}
        confirmText={confirmConfig.confirmText}
      />
    </div>
  );
}
