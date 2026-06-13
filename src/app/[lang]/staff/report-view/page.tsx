'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PrintableA4Report from '@/components/reports/PrintableA4Report';
import { Button } from '@/components/ui/Button';
import { Printer, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function ReportViewContent({ lang }: { lang: string }) {
  const isArabic = lang === 'ar';
  const searchParams = useSearchParams();
  
  const startDate = searchParams.get('start');
  const endDate = searchParams.get('end');
  const reserve = searchParams.get('reserve');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!startDate || !endDate) {
      setError(isArabic ? 'معلمات التقرير غير مكتملة' : 'Incomplete report parameters');
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      try {
        const res = await fetch('/api/reports/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startDate, endDate, reserve })
        });

        if (!res.ok) {
          throw new Error('Failed to fetch report data');
        }

        const reportData = await res.json();
        setData(reportData);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [startDate, endDate, reserve, isArabic]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4" dir={isArabic ? 'rtl' : 'ltr'}>
        <Loader2 size={48} className="animate-spin text-indigo-600" />
        <p className="text-lg font-bold text-slate-700">
          {isArabic ? 'جاري تجميع وتحليل البيانات من قواعد بيانات المحميات...' : 'Aggregating and analyzing data from reserves databases...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center max-w-md">
          <p className="text-rose-600 font-bold mb-4">{error}</p>
          <Link href={`/${lang}/staff`}>
            <Button>{isArabic ? 'العودة للوحة القيادة' : 'Return to Dashboard'}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Print Controls (Hidden when printing) */}
      <div className="max-w-[210mm] mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link href={`/${lang}/staff`}>
          <Button variant="outline" className="gap-2 bg-white hover:bg-slate-50 border-slate-300">
            <ArrowRight size={16} className={isArabic ? 'rotate-180' : ''} />
            {isArabic ? 'رجوع' : 'Back'}
          </Button>
        </Link>
        <Button onClick={handlePrint} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg">
          <Printer size={16} />
          {isArabic ? 'طباعة التقرير (A4)' : 'Print Report (A4)'}
        </Button>
      </div>

      {/* The Printable A4 Page */}
      <div className="print:shadow-none">
        {data && <PrintableA4Report data={data} lang={lang} />}
      </div>


    </div>
  );
}

export default function ReportViewPage({ params }: { params: { lang: string } }) {
  const isArabic = params.lang === 'ar';
  
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4" dir={isArabic ? 'rtl' : 'ltr'}>
        <Loader2 size={48} className="animate-spin text-indigo-600" />
      </div>
    }>
      <ReportViewContent lang={params.lang} />
    </Suspense>
  );
}
