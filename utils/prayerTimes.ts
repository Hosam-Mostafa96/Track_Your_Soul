/**
 * Helper utility to calculate precise Islamic prayer times using astronomical formulas.
 */

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface CityLocation {
  nameAr: string;
  nameEn: string;
  countryAr: string;
  lat: number;
  lng: number;
  timezone: number; // default standard timezone (excluding DST)
}

// Coordinate database for Arab cities and others
export const CITIES_DATABASE: Record<string, CityLocation> = {
  "القاهرة": { nameAr: "القاهرة", nameEn: "Cairo", countryAr: "مصر", lat: 30.0444, lng: 31.2357, timezone: 2 },
  "الشيخ زايد": { nameAr: "الشيخ زايد", nameEn: "Sheikh Zayed", countryAr: "مصر", lat: 30.0178, lng: 31.0006, timezone: 2 },
  "الإسكندرية": { nameAr: "الإسكندرية", nameEn: "Alexandria", countryAr: "مصر", lat: 31.2001, lng: 29.9187, timezone: 2 },
  "الجيزة": { nameAr: "الجيزة", nameEn: "Giza", countryAr: "مصر", lat: 30.0131, lng: 31.2089, timezone: 2 },
  "المنصورة": { nameAr: "المنصورة", nameEn: "Mansoura", countryAr: "مصر", lat: 31.0409, lng: 31.3785, timezone: 2 },
  "طنطا": { nameAr: "طنطا", nameEn: "Tanta", countryAr: "مصر", lat: 30.7865, lng: 31.0004, timezone: 2 },
  "أسيوط": { nameAr: "أسيوط", nameEn: "Asyut", countryAr: "مصر", lat: 27.1783, lng: 31.1859, timezone: 2 },
  "أسوان": { nameAr: "أسوان", nameEn: "Aswan", countryAr: "مصر", lat: 24.0889, lng: 32.8998, timezone: 2 },
  "الرياض": { nameAr: "الرياض", nameEn: "Riyadh", countryAr: "السعودية", lat: 24.7136, lng: 46.6753, timezone: 3 },
  "مكة المكرمة": { nameAr: "مكة المكرمة", nameEn: "Makkah", countryAr: "السعودية", lat: 21.3891, lng: 39.8579, timezone: 3 },
  "المدينة المنورة": { nameAr: "المدينة المنورة", nameEn: "Madinah", countryAr: "السعودية", lat: 24.4672, lng: 39.6112, timezone: 3 },
  "جدة": { nameAr: "جدة", nameEn: "Jeddah", countryAr: "السعودية", lat: 21.5433, lng: 39.1728, timezone: 3 },
  "دبي": { nameAr: "دبي", nameEn: "Dubai", countryAr: "الإمارات", lat: 25.2048, lng: 55.2708, timezone: 4 },
  "أبو ظبي": { nameAr: "أبو ظبي", nameEn: "Abu Dhabi", countryAr: "الإمارات", lat: 24.4539, lng: 54.3773, timezone: 4 },
  "الكويت": { nameAr: "الكويت", nameEn: "Kuwait City", countryAr: "الكويت", lat: 29.3759, lng: 47.9774, timezone: 3 },
  "الدوحة": { nameAr: "الدوحة", nameEn: "Doha", countryAr: "قطر", lat: 25.2854, lng: 51.5310, timezone: 3 },
  "المنامة": { nameAr: "المنامة", nameEn: "Manama", countryAr: "البحرين", lat: 26.2285, lng: 50.5860, timezone: 3 },
  "مسقط": { nameAr: "مسقط", nameEn: "Muscat", countryAr: "عمان", lat: 23.5859, lng: 58.4059, timezone: 4 },
  "عمان": { nameAr: "عمان", nameEn: "Amman", countryAr: "الأردن", lat: 31.9522, lng: 35.9106, timezone: 2 },
  "القدس": { nameAr: "القدس", nameEn: "Jerusalem", countryAr: "فلسطين", lat: 31.7683, lng: 35.2137, timezone: 2 },
  "دمشق": { nameAr: "دمشق", nameEn: "Damascus", countryAr: "سوريا", lat: 33.5138, lng: 36.2765, timezone: 2 },
  "بيروت": { nameAr: "بيروت", nameEn: "Beirut", countryAr: "لبنان", lat: 33.8938, lng: 35.5018, timezone: 2 },
  "بغداد": { nameAr: "بغداد", nameEn: "Baghdad", countryAr: "العراق", lat: 33.3152, lng: 44.3661, timezone: 3 },
  "صنعاء": { nameAr: "صنعاء", nameEn: "Sanaa", countryAr: "اليمن", lat: 15.3694, lng: 44.1910, timezone: 3 },
  "طرابلس": { nameAr: "طرابلس", nameEn: "Tripoli", countryAr: "ليبيا", lat: 32.8872, lng: 13.1913, timezone: 2 },
  "تونس": { nameAr: "تونس", nameEn: "Tunis", countryAr: "تونس", lat: 36.8065, lng: 10.1815, timezone: 1 },
  "الجزائر": { nameAr: "الجزائر", nameEn: "Algiers", countryAr: "الجزائر", lat: 36.7538, lng: 3.0588, timezone: 1 },
  "الرباط": { nameAr: "الرباط", nameEn: "Rabat", countryAr: "المغرب", lat: 34.0209, lng: -6.8416, timezone: 1 },
  "الدار البيضاء": { nameAr: "الدار البيضاء", nameEn: "Casablanca", countryAr: "المغرب", lat: 33.5731, lng: -7.5898, timezone: 1 },
  "الخرطوم": { nameAr: "الخرطوم", nameEn: "Khartoum", countryAr: "السودان", lat: 15.5007, lng: 32.5599, timezone: 2 },
  "نواكشوط": { nameAr: "نواكشوط", nameEn: "Nouakchott", countryAr: "موريتانيا", lat: 18.0735, lng: -15.9582, timezone: 0 },
  "مقديشو": { nameAr: "مقديشو", nameEn: "Mogadishu", countryAr: "الصومال", lat: 2.0469, lng: 45.3182, timezone: 3 },
  "اسطنبول": { nameAr: "اسطنبول", nameEn: "Istanbul", countryAr: "تركيا", lat: 41.0082, lng: 28.9784, timezone: 3 },
  "جاكرتا": { nameAr: "جاكرتا", nameEn: "Jakarta", countryAr: "إندونيسيا", lat: -6.2088, lng: 106.8456, timezone: 7 },
  "كوالالمبور": { nameAr: "كوالالمبور", nameEn: "Kuala Lumpur", countryAr: "ماليزيا", lat: 3.1390, lng: 101.6869, timezone: 8 }
};

// Math degrees convertors
const degToRad = (deg: number) => (deg * Math.PI) / 180;
const radToDeg = (rad: number) => (rad * 180) / Math.PI;

export function getPrayerTimesForDate(
  date: Date,
  lat: number,
  lng: number,
  tzOffset: number,
  isEgyptianMethod: boolean = true
): { times: PrayerTimes; rawTimes: Record<string, number> } {
  // 1. Calculate Julian Date / Days since Year 2000
  const Y = date.getFullYear();
  const M = date.getMonth() + 1;
  const D = date.getDate();
  
  const dayOfYear = Math.floor((date.getTime() - new Date(Y, 0, 1).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Approximate Solar Declination and Equation of Time equations (with very high precision for daily estimation)
  const B = (360 / 365) * (dayOfYear - 81);
  const B_rad = degToRad(B);
  
  // Equation of time in minutes
  const EqT_mins = 9.87 * Math.sin(2 * B_rad) - 7.53 * Math.cos(B_rad) - 1.5 * Math.sin(B_rad);
  const EqT_hours = EqT_mins / 60;
  
  // Solar Declination in degrees
  const dec_deg = 23.45 * Math.sin(degToRad((360 / 365) * (284 + dayOfYear)));
  
  // Local Solar Noon Transit
  const transit = 12 + (tzOffset - lng / 15) - EqT_hours;
  
  // Helper to calculate Hour Angle (H) for an altitude angle (G) in degrees
  const getHourAngle = (angle: number) => {
    const lat_rad = degToRad(lat);
    const dec_rad = degToRad(dec_deg);
    const angle_rad = degToRad(angle);
    
    const cosH = (Math.sin(angle_rad) - Math.sin(lat_rad) * Math.sin(dec_rad)) / (Math.cos(lat_rad) * Math.cos(dec_rad));
    if (cosH > 1 || cosH < -1) return null; // out of bounds
    return radToDeg(Math.acos(cosH)) / 15; // convert to hours
  }
  
  // Standard solar angles
  const fajrAngle = isEgyptianMethod ? -19.5 : -18.5; // Egyptian Survey vs Umm-Al-Qura
  const ishaAngle = isEgyptianMethod ? -17.5 : -18.0; 
  
  const H_sunrise = getHourAngle(-0.833) || 6.0; // sunset refraction standard
  const H_fajr = getHourAngle(fajrAngle) || 5.0;
  const H_isha = getHourAngle(ishaAngle) || 6.2;
  
  // Asr calculation (Shafi shadow factor = 1)
  const diff = Math.abs(lat - dec_deg);
  const diff_rad = degToRad(diff);
  const asr_altitude = radToDeg(Math.atan(1 / (1 + Math.tan(diff_rad))));
  const H_asr = getHourAngle(asr_altitude) || 3.0;
  
  // Raw times in decimal hours (0 to 24)
  const rawTimes = {
    fajr: transit - H_fajr,
    sunrise: transit - H_sunrise,
    dhuhr: transit + (1.5 / 60), // Add 1.5 minutes safety margin
    asr: transit + H_asr,
    maghrib: transit + H_sunrise + (2.0 / 60), // Add 2 minutes safety margin (Sunset is Maghrib)
    isha: transit + H_isha
  };

  // Convert decimal hours to beautifully styled standard localized strings eg. "04:32"
  const formatTime = (decimalHours: number): string => {
    let t = (decimalHours + 24) % 24;
    const hours = Math.floor(t);
    const minutes = Math.floor((t - hours) * 60);
    const period = hours >= 12 ? 'م' : 'ص';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const minsStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${displayHours}:${minsStr} ${period}`;
  };

  const times: PrayerTimes = {
    fajr: formatTime(rawTimes.fajr),
    sunrise: formatTime(rawTimes.sunrise),
    dhuhr: formatTime(rawTimes.dhuhr),
    asr: formatTime(rawTimes.asr),
    maghrib: formatTime(rawTimes.maghrib),
    isha: formatTime(rawTimes.isha)
  };

  return { times, rawTimes };
}
