'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, Check, Search } from 'lucide-react';

interface CityOption {
  name: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
}

const POPULAR_CITIES: CityOption[] = [
  { name: 'Cebu City', country: 'Philippines', lat: 10.3157, lon: 123.8854, timezone: 'Asia/Manila' },
  { name: 'Manila', country: 'Philippines', lat: 14.5995, lon: 120.9842, timezone: 'Asia/Manila' },
  { name: 'Kathmandu', country: 'Nepal', lat: 27.7172, lon: 85.3240, timezone: 'Asia/Kathmandu' },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, timezone: 'Asia/Tokyo' },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, timezone: 'Asia/Singapore' },
  { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060, timezone: 'America/New_York' },
  { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278, timezone: 'Europe/London' },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, timezone: 'Australia/Sydney' },
];

export default function WeatherWidgetCard() {
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [selectedCity, setSelectedCity] = useState<CityOption>(POPULAR_CITIES[0]); // Default to Cebu City
  const [isCityPickerOpen, setIsCityPickerOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  const [weather, setWeather] = useState<{
    temperature: number;
    apparentTemp: number;
    tempHigh: number;
    tempLow: number;
    humidity: number;
    weatherCode: number;
    isDay: number;
    conditionName: string;
    loading: boolean;
  }>({
    temperature: 28,
    apparentTemp: 31,
    tempHigh: 31,
    tempLow: 25,
    humidity: 70,
    weatherCode: 2,
    isDay: 1,
    conditionName: 'Partly Cloudy',
    loading: false,
  });

  const pickerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsCityPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch weather from Open-Meteo (100% Free, Keyless API)
  const fetchWeather = async (city: CityOption) => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=${encodeURIComponent(
        city.timezone
      )}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.current) {
          const code = data.current.weather_code ?? 0;
          let cond = 'Sunny';
          if (code >= 1 && code <= 3) cond = 'Partly Cloudy';
          else if (code >= 45 && code <= 48) cond = 'Foggy';
          else if (code >= 51 && code <= 67) cond = 'Rain';
          else if (code >= 80 && code <= 82) cond = 'Showers';
          else if (code >= 95) cond = 'Thunderstorm';

          const high = data.daily?.temperature_2m_max?.[0]
            ? Math.round(data.daily.temperature_2m_max[0])
            : Math.round(data.current.temperature_2m) + 3;
          const low = data.daily?.temperature_2m_min?.[0]
            ? Math.round(data.daily.temperature_2m_min[0])
            : Math.round(data.current.temperature_2m) - 5;

          setWeather({
            temperature: Math.round(data.current.temperature_2m),
            apparentTemp: Math.round(data.current.apparent_temperature ?? data.current.temperature_2m),
            tempHigh: high,
            tempLow: low,
            humidity: Math.round(data.current.relative_humidity_2m ?? 65),
            weatherCode: code,
            isDay: data.current.is_day ?? 1,
            conditionName: cond,
            loading: false,
          });
        }
      }
    } catch (err) {
      console.warn('Open-Meteo fetch fallback:', err);
    }
  };

  useEffect(() => {
    fetchWeather(selectedCity);
    const interval = setInterval(() => {
      fetchWeather(selectedCity);
    }, 10 * 60 * 1000); // Silent automatic background refresh every 10 minutes
    return () => clearInterval(interval);
  }, [selectedCity]);

  // Convert Celsius to Fahrenheit
  const toDisplayTemp = (celsius: number) => {
    if (unit === 'F') {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return celsius;
  };

  const filteredCities = POPULAR_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
      c.country.toLowerCase().includes(citySearch.toLowerCase())
  );

  // Return the matching 2D Flat Icon Image path matching user reference image
  const getWeatherImagePath = () => {
    const isNight = weather.isDay === 0;
    const code = weather.weatherCode;

    if (code >= 95) return '/weather/storm.svg';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return '/weather/rain.svg';
    if (isNight && (code === 0 || code === 1)) return '/weather/night.svg';
    if (code === 0) return '/weather/sunny.svg';
    return '/weather/partly-cloudy.svg';
  };

  return (
    <div className="relative w-full max-w-[360px] sm:max-w-[390px] rounded-3xl bg-gradient-to-br from-[#EEF7FE] via-[#E2F0FD] to-[#D5E9FA] dark:from-[#0F223D] dark:via-[#142C4F] dark:to-[#0C1A30] p-5 text-slate-800 dark:text-white shadow-xl shadow-blue-900/5 dark:shadow-black/30 border border-[#BFDBFE] dark:border-[#1E3A8A]/50 overflow-hidden font-poppins select-none transition-all">
      
      {/* Background Ambient Sky Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-blue-300/30 dark:bg-blue-600/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-sky-200/40 dark:bg-sky-500/10 blur-2xl" />
      </div>

      {/* 1. Top Bar: [📍 Location Pill] on Left, [ F | C Switch ] on Right (No extra clutter) */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-2.5">
        
        {/* Location Selector Pill */}
        <div className="relative" ref={pickerRef}>
          <button
            type="button"
            onClick={() => setIsCityPickerOpen(!isCityPickerOpen)}
            className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1E293B] hover:bg-slate-50 text-[#2F6798] dark:text-blue-200 text-xs font-bold shadow-xs border border-blue-100 dark:border-slate-700 transition-all cursor-pointer active:scale-95 font-poppins"
            title="Click to switch location"
          >
            <MapPin className="w-3.5 h-3.5 text-[#2F6798] dark:text-blue-400 stroke-[2.5]" />
            <span className="tracking-tight">{selectedCity.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-[#2F6798] dark:group-hover:text-white transition-transform" />
          </button>

          {/* City Selector Dropdown Modal */}
          {isCityPickerOpen && (
            <div className="absolute top-full left-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#1E293B] border border-blue-200 dark:border-slate-700 shadow-2xl p-2.5 z-50 text-slate-800 dark:text-white animate-in fade-in zoom-in-95 font-poppins">
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder="Search city..."
                  className="w-full pl-8 pr-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-[#24537D] font-poppins"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar">
                {filteredCities.map((c) => {
                  const isSelected = c.name === selectedCity.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setSelectedCity(c);
                        setIsCityPickerOpen(false);
                        setCitySearch('');
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer font-poppins ${
                        isSelected
                          ? 'bg-[#24537D] text-white font-bold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">
                        {c.name}, <span className="opacity-70 text-[10px]">{c.country}</span>
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Unit Toggle [ F | C ] */}
        <div className="flex items-center p-0.5 rounded-full bg-white/90 dark:bg-[#0B172B] border border-blue-200/80 dark:border-blue-900/60 shadow-xs font-poppins">
          {/* Fahrenheit Button */}
          <button
            type="button"
            onClick={() => setUnit('F')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              unit === 'F'
                ? 'bg-[#24537D] text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            F
          </button>

          {/* Celsius Button */}
          <button
            type="button"
            onClick={() => setUnit('C')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              unit === 'C'
                ? 'bg-[#24537D] text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            C
          </button>
        </div>

      </div>

      {/* 2. Main Content Grid: Left side text/temp + Right side Custom Flat Artwork */}
      <div className="relative z-10 flex items-center justify-between gap-3 mt-1">
        
        {/* Left Column: Weather Title, Now, Big Temp & Feels like */}
        <div className="space-y-0.5 font-poppins">
          <h4 className="text-sm font-bold text-[#2F6798] dark:text-blue-200 tracking-wide">
            Weather
          </h4>
          <span className="text-[11px] font-semibold text-[#2F6798] dark:text-blue-400 tracking-wide block">
            {weather.conditionName}
          </span>

          {/* Big Temperature Display in Poppins: e.g. 25°C or 77°F */}
          <div className="text-4xl sm:text-5xl font-medium tracking-tight text-slate-900 dark:text-white pt-1 flex items-baseline font-poppins">
            <span>{toDisplayTemp(weather.temperature)}</span>
            <span className="text-2xl sm:text-3xl font-light ml-0.5 text-slate-600 dark:text-slate-300">°{unit}</span>
          </div>

          {/* Feels like in Poppins */}
          <div className="text-xs text-slate-600 dark:text-slate-300 font-medium pt-1 tracking-tight">
            Feels like {toDisplayTemp(weather.apparentTemp)}°
          </div>
        </div>

        {/* Right Column: Custom 2D Flat Image (Matching Reference Artwork) */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-28 flex items-center justify-center shrink-0">
          <img
            src={getWeatherImagePath()}
            alt={weather.conditionName}
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain select-none transition-transform hover:scale-105 duration-200"
          />
        </div>

      </div>

      {/* 3. Bottom Row: High: 29° & Low: 25° in Poppins */}
      <div className="relative z-10 flex items-center justify-end gap-3.5 pt-2 text-xs font-semibold text-[#2F6798] dark:text-blue-200 tracking-tight font-poppins">
        <span>
          High: <b className="font-bold text-slate-900 dark:text-white">{toDisplayTemp(weather.tempHigh)}°</b>
        </span>
        <span>
          Low: <b className="font-bold text-slate-900 dark:text-white">{toDisplayTemp(weather.tempLow)}°</b>
        </span>
      </div>

    </div>
  );
}
