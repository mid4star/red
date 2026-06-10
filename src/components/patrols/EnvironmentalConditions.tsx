'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Wind, Thermometer, Droplets, Navigation, Waves, Sun, CloudRain } from 'lucide-react';
import { motion } from 'framer-motion';

interface WeatherData {
  location: string;
  locationAr: string;
  temp: number;
  windSpeed: number;
  windDir: string;
  seaState: string;
  tideDir: string;
  waveHeight: string;
  bgGradient: string;
  icon: any;
}

const defaultConditions: WeatherData[] = [
  { location: 'Hurghada', locationAr: 'الغردقة', temp: 32, windSpeed: 14, windDir: 'NW', seaState: 'Moderate', tideDir: 'Ebb', waveHeight: '1.2m', bgGradient: 'from-amber-500/20 via-orange-500/10 to-transparent', icon: Sun },
  { location: 'El Gouna', locationAr: 'الجونة', temp: 31, windSpeed: 16, windDir: 'NW', seaState: 'Moderate', tideDir: 'Ebb', waveHeight: '1.4m', bgGradient: 'from-sky-500/20 via-blue-500/10 to-transparent', icon: Waves },
  { location: 'Safaga', locationAr: 'سفاجا', temp: 33, windSpeed: 12, windDir: 'N', seaState: 'Calm', tideDir: 'Flood', waveHeight: '0.8m', bgGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent', icon: Navigation },
  { location: 'Marsa Alam', locationAr: 'مرسى علم', temp: 34, windSpeed: 10, windDir: 'NNE', seaState: 'Calm', tideDir: 'Flood', waveHeight: '0.6m', bgGradient: 'from-rose-500/20 via-pink-500/10 to-transparent', icon: Sun }
];

function getWindDirection(degree: number) {
  const sectors = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'];
  return sectors[Math.round((degree % 360) / 22.5)];
}

export default function EnvironmentalConditions({ isArabic = false }: { isArabic?: boolean }) {
  const [conditions, setConditions] = useState<WeatherData[]>(defaultConditions);
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    async function fetchRealWeather() {
      try {
        // Open-Meteo API using array coordinates for Hurghada, El Gouna, Safaga, Marsa Alam
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=27.2579,27.3942,26.7292,25.0676&longitude=33.8116,33.6782,33.9365,34.8931&current=temperature_2m,wind_speed_10m,wind_direction_10m&wind_speed_unit=kn');
        const data = await res.json();
        
        if (Array.isArray(data) && data.length === 4) {
          setConditions(prev => prev.map((item, index) => {
            const current = data[index]?.current;
            if (!current) return item;
            return {
              ...item,
              temp: Math.round(current.temperature_2m),
              windSpeed: Math.round(current.wind_speed_10m),
              windDir: getWindDirection(current.wind_direction_10m)
            };
          }));
        }
      } catch (err) {
        console.error('Failed to fetch real weather data:', err);
      } finally {
        setLoadingWeather(false);
      }
    }
    
    fetchRealWeather();
  }, []);
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show" 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
    >
      {conditions.map((cond, idx) => {
        const WeatherIcon = cond.icon;
        return (
          <motion.div key={idx} variants={itemVariants} whileHover={{ y: -5 }} className="relative h-full">
            <Card className="h-full bg-th-surface/80 dark:bg-[#0a1628]/80 backdrop-blur-2xl border-th-border dark:border-white/5 hover:border-th-border/80 dark:hover:border-white/20 transition-all p-5 md:p-6 relative overflow-hidden group shadow-xl dark:shadow-2xl">
              
              {/* Dynamic Animated Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cond.bgGradient} opacity-40 group-hover:opacity-80 transition-opacity duration-700`}></div>
              
              {/* Floating Animated Background Icon */}
              <motion.div 
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} 
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-6 -top-6 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
              >
                <WeatherIcon size={120} />
              </motion.div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className="font-black text-xl text-th-text dark:text-white tracking-tight">
                    {isArabic ? cond.locationAr : cond.location}
                  </h3>
                  <p className="text-[10px] text-th-muted dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {isArabic ? 'محطة الرصد الحي' : 'Live Station'}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-black/5 dark:bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-th-border dark:border-white/10 shadow-inner">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)] dark:shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
                  <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 tracking-wider">LIVE</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-5 gap-x-2 relative z-10">
                {/* Temperature */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center border border-rose-200 dark:border-rose-500/20 shrink-0">
                    <Thermometer className="text-rose-500 dark:text-rose-400" size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-th-muted dark:text-slate-400 font-bold uppercase tracking-wider">{isArabic ? 'الحرارة' : 'Temp'}</span>
                    <span className="text-sm font-black text-th-text dark:text-white">
                      {loadingWeather ? <span className="animate-pulse bg-th-border w-4 h-4 inline-block rounded"></span> : cond.temp}°
                      <span className="text-th-muted dark:text-slate-500 text-xs">C</span>
                    </span>
                  </div>
                </div>

                {/* Wind */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-500/10 flex items-center justify-center border border-sky-200 dark:border-sky-500/20 shrink-0">
                    <Wind className="text-sky-500 dark:text-sky-400" size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-th-muted dark:text-slate-400 font-bold uppercase tracking-wider">{isArabic ? 'الرياح' : 'Wind'}</span>
                    <div className="flex items-baseline gap-1">
                      {loadingWeather ? (
                        <span className="animate-pulse bg-th-border w-6 h-4 inline-block rounded"></span>
                      ) : (
                        <>
                          <span className="text-sm font-black text-th-text dark:text-white">{cond.windSpeed}<span className="text-[10px] text-th-muted dark:text-slate-500 font-medium ml-0.5">kt</span></span>
                          <span className="text-[11px] font-bold text-th-text dark:text-white">{cond.windDir}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sea State */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center border border-blue-200 dark:border-blue-500/20 shrink-0">
                    <Waves className="text-blue-500 dark:text-blue-400" size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-th-muted dark:text-slate-400 font-bold uppercase tracking-wider">{isArabic ? 'حالة البحر' : 'Sea'}</span>
                    <span className="text-[11px] font-black text-th-text dark:text-white mt-0.5 leading-tight">{cond.seaState}</span>
                  </div>
                </div>

                {/* Tide */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/20 shrink-0">
                    <Droplets className="text-emerald-500 dark:text-emerald-400" size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-th-muted dark:text-slate-400 font-bold uppercase tracking-wider">{isArabic ? 'المد والجزر' : 'Tide'}</span>
                    <span className="text-[11px] font-black text-th-text dark:text-white mt-0.5 leading-tight">{cond.tideDir}</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
