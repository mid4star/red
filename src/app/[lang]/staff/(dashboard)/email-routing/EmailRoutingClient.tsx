'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  Mail, Loader2, Plus, Trash2, CheckCircle2, XCircle, RefreshCw, Server, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmailRoutingClient({ lang }: { lang: string }) {
  const isAr = lang === 'ar';
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alias, setAlias] = useState('');
  const [destinationEmail, setDestinationEmail] = useState('');
  const [description, setDescription] = useState('');

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/staff/email-routing');
      const data = await res.json();
      if (data.success) {
        setRoutes(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/staff/email-routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alias, destinationEmail, description }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create alias');
      }

      setAlias('');
      setDestinationEmail('');
      setDescription('');
      setIsModalOpen(false);
      fetchRoutes();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'DISABLE' : 'ENABLE';
      const res = await fetch(`/api/staff/email-routing/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: newStatus }),
      });
      if (res.ok) fetchRoutes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا البريد؟' : 'Are you sure you want to delete this alias?')) return;
    try {
      const res = await fetch(`/api/staff/email-routing/${id}`, { method: 'DELETE' });
      if (res.ok) fetchRoutes();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-700" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between bg-th-surface2 p-4 md:p-6 rounded-2xl border border-th-border shadow-sm gap-4">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
              <Mail size={24} />
           </div>
           <div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 block mb-1">
               {isAr ? 'توجيه البريد الإلكتروني' : 'Email Routing'}
             </span>
             <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-th-text uppercase m-0 leading-none">
               {isAr ? 'البريد الإلكتروني' : 'Email Routing'}
             </h1>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto justify-between md:justify-start shrink-0">
          <Button onClick={() => setIsModalOpen(true)} className="bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-500/20 px-4 sm:px-6 rounded-xl h-11 transition-all w-full sm:w-auto flex items-center justify-center gap-2">
            <Plus size={18} />
            <span className="font-bold tracking-wide">{isAr ? 'إنشاء بريد جديد' : 'Create New Alias'}</span>
          </Button>
        </div>
      </div>

      {/* Stats/Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-th-surface2 border-th-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <Mail size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{isAr ? 'إجمالي العناوين' : 'Total Aliases'}</p>
            <p className="text-2xl font-black">{routes.length}</p>
          </div>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="bg-th-surface border border-th-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-th-surface2 text-slate-500 text-[11px] uppercase tracking-widest">
                <th className="p-4 font-bold">{isAr ? 'البريد الوهمي' : 'Alias'}</th>
                <th className="p-4 font-bold">{isAr ? 'إلى البريد الشخصي' : 'Forwards To'}</th>
                <th className="p-4 font-bold">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="p-4 font-bold">{isAr ? 'تاريخ الإنشاء' : 'Created'}</th>
                <th className="p-4 font-bold text-right">{isAr ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
                  </td>
                </tr>
              ) : routes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-500 italic">
                    {isAr ? 'لا توجد أي عناوين مسجلة حتى الآن.' : 'No email aliases found.'}
                  </td>
                </tr>
              ) : (
                routes.map((route) => (
                  <tr key={route.id} className="hover:bg-th-surface2/50 transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-th-text flex items-center gap-2">
                        {route.alias}@rsmp-eg.com
                      </div>
                      <div className="text-xs text-slate-500">{route.description || '--'}</div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium text-sm">
                      {route.destinationEmail}
                    </td>
                    <td className="p-4">
                      {route.status === 'ACTIVE' ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          <CheckCircle2 size={12} className="mr-1 inline-block" /> {isAr ? 'نشط' : 'Active'}
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                          <XCircle size={12} className="mr-1 inline-block" /> {isAr ? 'معطل' : 'Disabled'}
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 text-sm font-mono">
                      {formatDate(route.createdAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleStatus(route.id, route.status)}
                          className={route.status === 'ACTIVE' ? 'text-amber-500' : 'text-emerald-500'}
                          title={route.status === 'ACTIVE' ? (isAr ? 'تعطيل' : 'Disable') : (isAr ? 'تفعيل' : 'Enable')}
                        >
                          <RefreshCw size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(route.id)}
                          className="text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20"
                          title={isAr ? 'حذف' : 'Delete'}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-th-surface rounded-3xl shadow-2xl overflow-hidden border border-th-border"
            >
              <div className="p-6 sm:p-8">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-6 text-th-text">
                  {isAr ? 'إنشاء بريد جديد' : 'Create New Alias'}
                </h2>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-start gap-3">
                    <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-sm font-medium text-rose-700 dark:text-rose-400">{error}</p>
                  </div>
                )}

                <form onSubmit={handleCreate} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                      {isAr ? 'البريد الوهمي (الاسم)' : 'Alias Name'}
                    </label>
                    <div className="relative flex items-center">
                      <Input 
                        required
                        value={alias}
                        onChange={(e) => setAlias(e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, ''))}
                        placeholder="john.doe"
                        className={`pr-32 ${isAr ? 'text-left font-mono pl-4' : 'font-mono'}`}
                        dir="ltr"
                      />
                      <span className="absolute right-4 text-slate-400 font-mono text-sm pointer-events-none">
                        @rsmp-eg.com
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                      {isAr ? 'البريد الشخصي (المستقبل)' : 'Destination Email'}
                    </label>
                    <Input 
                      required
                      type="email"
                      value={destinationEmail}
                      onChange={(e) => setDestinationEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className="font-mono text-left"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                      {isAr ? 'وصف إضافي (اختياري)' : 'Description (Optional)'}
                    </label>
                    <Input 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={isAr ? 'بريد خاص بفريق الرصد' : 'For monitoring team...'}
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <Button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      variant="outline"
                      className="flex-1"
                      disabled={submitting}
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                      disabled={submitting}
                    >
                      {submitting ? <Loader2 className="animate-spin" size={18} /> : (isAr ? 'إنشاء العنوان' : 'Create Alias')}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
