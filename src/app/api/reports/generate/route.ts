import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { startDate, endDate, reserve } = body;

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the whole end day

    // Build the "where" clause for patrols
    const patrolWhere: any = {
      date: {
        gte: start,
        lte: end
      }
    };
    
    // For simplicity, if a reserve is provided and not 'ALL', we can try to filter by zone
    // In our schema, Patrol has `zone` which might match the reserve name.
    if (reserve && reserve !== 'ALL') {
      // In a real app, you'd map reserve IDs to zones. We will use a basic "contains" search.
      patrolWhere.OR = [
        { zone: { contains: reserve } },
        { zoneAr: { contains: reserve } }
      ];
    }

    // Fetch Patrols
    const patrols = await prisma.patrol.findMany({
      where: patrolWhere,
      include: {
        leader: true,
        patrolViolations: true,
        patrolObservations: true,
      }
    });

    // Fetch Violations directly 
    const violationWhere: any = {
      date: {
        gte: start,
        lte: end
      }
    };
    if (reserve && reserve !== 'ALL') {
      violationWhere.OR = [
        { location: { contains: reserve } },
        { locationAr: { contains: reserve } }
      ];
    }
    const violations = await prisma.violation.findMany({
      where: violationWhere,
      include: {
        officer: true
      }
    });

    // Fetch Surveys
    const surveyWhere: any = {
      date: {
        gte: start,
        lte: end
      }
    };
    const surveys = await prisma.survey.findMany({
      where: surveyWhere,
      include: {
        observer: true
      }
    });

    // Aggregations
    const totalPatrols = patrols.length;
    const totalViolations = violations.length;
    const totalSurveys = surveys.length;
    
    let totalObservationsCount = 0;
    patrols.forEach(p => {
      p.patrolObservations.forEach(obs => {
        totalObservationsCount += obs.count;
      });
    });

    // Heuristic Insights Generation (Alternative to external AI)
    const insights = [];
    
    if (totalPatrols === 0) {
      insights.push({
        type: 'CRITICAL',
        title: 'انعدام الدوريات',
        message: 'لم يتم تسجيل أي دوريات بحرية أو برية خلال هذه الفترة في النطاق المحدد. يمثل هذا ثغرة أمنية وبيئية خطيرة تتطلب تدخلاً عاجلاً وتوجيه الإمكانيات فوراً.'
      });
    } else {
      const violationsPerPatrol = totalViolations / totalPatrols;
      
      if (violationsPerPatrol > 1.5) {
        insights.push({
          type: 'HIGH',
          title: 'معدل مخالفات مرتفع',
          message: `تم رصد معدل مخالفات يتجاوز المعدل الطبيعي (${violationsPerPatrol.toFixed(1)} مخالفة لكل دورية). يوصى بتكثيف الدوريات ونشر وحدات التدخل السريع في النقاط الساخنة وتطبيق الغرامات بصرامة أكبر.`
        });
      } else if (violationsPerPatrol < 0.2) {
        insights.push({
          type: 'LOW',
          title: 'الامتثال البيئي ممتاز',
          message: 'معدل المخالفات منخفض جداً، مما يعكس فعالية استراتيجيات الردع والتوعية المتبعة، وكذلك الالتزام العالي بقواعد المحميات من قبل الزوار والمنشآت.'
        });
      } else {
        insights.push({
          type: 'MEDIUM',
          title: 'معدل نشاط طبيعي',
          message: 'النشاط الميداني وحجم المخالفات المرصودة ضمن النطاقات الاعتيادية والمدروسة. يستمر العمل حسب الخطة الاستراتيجية المعتمدة مع الحفاظ على وتيرة المراقبة المستمرة.'
        });
      }
    }

    if (totalSurveys > 0) {
      const avgHealth = surveys.reduce((acc, s) => acc + (s.healthScore || 0), 0) / totalSurveys;
      if (avgHealth > 85) {
        insights.push({
          type: 'LOW',
          title: 'صحة الأنظمة البيئية',
          message: `مؤشرات الصحة العامة للأنظمة البيئية ممتازة (متوسط التقييم ${avgHealth.toFixed(1)}%). الشعاب المرجانية والكائنات البحرية في حالة استقرار وازدهار بفضل تقليل الإجهاد البشري المباشر.`
        });
      } else if (avgHealth < 60) {
        insights.push({
          type: 'HIGH',
          title: 'تدهور بيئي ملحوظ',
          message: `المسوحات تشير إلى تراجع في مؤشر الصحة البيئية (${avgHealth.toFixed(1)}%). يجب تشكيل لجنة فحص لتحديد أسباب التدهور (تبييض مرجان، تلوث، الصيد الجائر) واتخاذ إجراءات حماية عاجلة.`
        });
      }
    } else {
      insights.push({
        type: 'MEDIUM',
        title: 'نقص في البيانات البيئية',
        message: 'لا توجد מסوحات بيئية (Surveys) مسجلة خلال هذه الفترة. يُنصح بتوجيه فرق الرصد العلمي لإجراء مسوحات دورية لضمان تحديث قاعدة البيانات البيئية بدقة وتتبع التغيرات.'
      });
    }
    
    // Group violations by severity for charts
    const violationsBySeverity = {
      LOW: violations.filter(v => v.severity === 'LOW').length,
      MEDIUM: violations.filter(v => v.severity === 'MEDIUM').length,
      HIGH: violations.filter(v => v.severity === 'HIGH').length,
      CRIMINAL: violations.filter(v => v.severity === 'CRIMINAL').length,
    };

    // Prepare chart data (Group by date)
    const timelineMap = new Map<string, { patrols: number, violations: number }>();
    
    // Initialize map for each day in range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      timelineMap.set(dateStr, { patrols: 0, violations: 0 });
    }

    patrols.forEach(p => {
      const dateStr = p.date.toISOString().split('T')[0];
      if (timelineMap.has(dateStr)) {
        timelineMap.get(dateStr)!.patrols += 1;
      }
    });

    violations.forEach(v => {
      const dateStr = v.date.toISOString().split('T')[0];
      if (timelineMap.has(dateStr)) {
        timelineMap.get(dateStr)!.violations += 1;
      }
    });

    const timelineChart = Array.from(timelineMap.entries()).map(([date, counts]) => ({
      date,
      patrols: counts.patrols,
      violations: counts.violations
    }));

    return NextResponse.json({
      startDate,
      endDate,
      reserve,
      summary: {
        totalPatrols,
        totalViolations,
        totalSurveys,
        totalObservationsCount,
      },
      insights,
      charts: {
        violationsBySeverity,
        timeline: timelineChart
      },
      // Send raw data just in case the report view needs tables
      rawData: {
        patrols: patrols.map(p => ({
          code: p.code || 'N/A',
          date: p.date,
          type: p.type,
          zone: p.zoneAr || p.zone,
          leader: p.leader?.name || p.customLeaderName || 'Unknown'
        })).slice(0, 15), // Limiting to top 15 for tables
        violations: violations.map(v => ({
          code: v.code || 'N/A',
          date: v.date,
          type: v.typeAr || v.types,
          severity: v.severity,
          location: v.locationAr || v.location,
          action: v.actionTaken
        })).slice(0, 15) // Limiting to top 15 for tables
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
