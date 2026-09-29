import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  BookOpen, 
  ChevronRight, 
  ChevronLeft, 
  Bookmark, 
  BookmarkCheck, 
  BookmarkPlus,
  Sun, 
  Moon, 
  Coffee, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  List, 
  Search, 
  Volume2, 
  Play, 
  Pause, 
  Copy, 
  Check, 
  Sparkles, 
  X, 
  CheckCircle2, 
  Circle, 
  Layers, 
  FileText, 
  Compass, 
  Info,
  Brain,
  Eye,
  EyeOff,
  Star,
  Award,
  Tag,
  Edit2,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyLog } from '../types';
import { 
  QURAN_114_SURAHS, 
  QURAN_30_JUZ, 
  getSurahAtPage, 
  getJuzAtPage 
} from '../utils/quranData';

export type BookmarkColor = 'amber' | 'emerald' | 'rose' | 'blue' | 'purple';

export interface MushafBookmark {
  id: string;
  page: number;
  title: string;
  date: string;
  surahName: string;
  color?: BookmarkColor;
}

export type PageMasteryRating = 'excellent' | 'good' | 'needs_practice';

export interface PageRatingRecord {
  rating: PageMasteryRating;
  date: string;
  timestamp: number;
  notes?: string;
}

interface MushafReaderProps {
  log: DailyLog;
  onUpdateLog: (log: DailyLog, activityLabel?: string, activityType?: string) => void;
  initialPage?: number;
  initialTestMode?: boolean;
  onNavigateToTadabbur?: (surahNumber: number, surahName: string, ayahNumber: string, ayahText?: string) => void;
  onNavigateToWardPlanner?: () => void;
  onFullScreenChange?: (isFullScreen: boolean) => void;
}

interface AyahData {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  surah: {
    number: number;
    name: string;
    englishName: string;
    numberOfAyahs: number;
    revelationType: string;
  };
}

const BOOKMARK_PRESETS = [
  'ورد الحفظ اليومي 📌',
  'ورد التلاوة والختمة 📖',
  'مراجعة وتثبيت 🔁',
  'موضع تدبر وتأمل ✨',
  'صلاة القيام والتهجد 🌙',
  'حفظ سورة الكهف 🌿'
];

const COLOR_CLASSES: Record<BookmarkColor, { bg: string; text: string; border: string; fill: string }> = {
  amber: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300', fill: 'fill-amber-500 text-amber-600' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300', fill: 'fill-emerald-500 text-emerald-600' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-300', fill: 'fill-rose-500 text-rose-600' },
  blue: { bg: 'bg-sky-100', text: 'text-sky-900', border: 'border-sky-300', fill: 'fill-sky-500 text-sky-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-900', border: 'border-purple-300', fill: 'fill-purple-500 text-purple-600' }
};

export const MushafReader: React.FC<MushafReaderProps> = ({
  log,
  onUpdateLog,
  initialPage,
  initialTestMode = false,
  onNavigateToTadabbur,
  onNavigateToWardPlanner,
  onFullScreenChange
}) => {
  // استرجاع آخر صفحة تمت قراءتها من الذاكرة المحلية
  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (initialPage && initialPage >= 1 && initialPage <= 604) return initialPage;
    try {
      const saved = localStorage.getItem('worship_quran_last_read_page');
      if (saved) {
        const p = parseInt(saved, 10);
        if (p >= 1 && p <= 604) return p;
      }
    } catch (e) {}
    if (log.quran?.wardPlan?.startPage) {
      return log.quran.wardPlan.startPage;
    }
    return 1;
  });

  // ثيم العرض: ورق عاجي أصيل (sepia) أو ليلي (dark) أو أبيض (white)
  const [theme, setTheme] = useState<'sepia' | 'dark' | 'white'>(() => {
    try {
      const saved = localStorage.getItem('worship_mushaf_theme') as any;
      if (['sepia', 'dark', 'white'].includes(saved)) return saved;
    } catch (e) {}
    return 'sepia';
  });

  // نمط العرض: صفحات مصحف المدينة (page) أو وضع الآيات والتفسير (ayahs)
  const [viewMode, setViewMode] = useState<'page' | 'ayahs'>(() => {
    try {
      const saved = localStorage.getItem('worship_mushaf_view_mode') as any;
      if (['page', 'ayahs'].includes(saved)) return saved;
    } catch (e) {}
    return 'page';
  });

  // وضع اختبار الحفظ والتسميع الغيبي مع إخفاء الآيات
  const [testModeActive, setTestModeActive] = useState<boolean>(initialTestMode);
  const [isContentHidden, setIsContentHidden] = useState<boolean>(initialTestMode);
  const [revealedAyahs, setRevealedAyahs] = useState<Set<number>>(new Set());

  // سجل تقييمات درجة حفظ الصفحات
  const [pageRatings, setPageRatings] = useState<Record<number, PageRatingRecord>>(() => {
    try {
      const saved = localStorage.getItem('worship_quran_page_ratings');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  // تكبير الصفحة
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showIndexModal, setShowIndexModal] = useState(false);
  const [indexTab, setIndexTab] = useState<'surahs' | 'juzs' | 'bookmarks'>('surahs');
  const [indexSearchQuery, setIndexSearchQuery] = useState('');

  // إدارة الفواصل المتعددة والمخصصة
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('');
  const [newBookmarkColor, setNewBookmarkColor] = useState<BookmarkColor>('amber');
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null);
  const [editBookmarkTitle, setEditBookmarkTitle] = useState('');

  // حالة صورة الصفحة
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // حالة الآيات والنصوص والتفسير
  const [pageAyahs, setPageAyahs] = useState<AyahData[]>([]);
  const [loadingAyahs, setLoadingAyahs] = useState(false);
  const [selectedAyah, setSelectedAyah] = useState<AyahData | null>(null);
  const [ayahTafsir, setAyahTafsir] = useState<string | null>(null);
  const [loadingTafsir, setLoadingTafsir] = useState(false);
  const [copiedAyahNumber, setCopiedAyahNumber] = useState<number | null>(null);

  // التلاوة الصوتية
  const [playingAyah, setPlayingAyah] = useState<AyahData | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // الفواصل المحفوظة
  const [bookmarks, setBookmarks] = useState<MushafBookmark[]>(() => {
    try {
      const saved = localStorage.getItem('worship_mushaf_bookmarks');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = window.setTimeout(() => setToastMessage(null), 3000);
  };

  // معلومات السورة والجزء الحالي
  const currentSurah = useMemo(() => getSurahAtPage(currentPage), [currentPage]);
  const currentJuz = useMemo(() => getJuzAtPage(currentPage), [currentPage]);

  // حساب الحزب التقريبي
  const currentHizb = useMemo(() => {
    const juzBase = (currentJuz.id - 1) * 2;
    const isSecondHalf = (currentPage - currentJuz.startPage) >= (currentJuz.totalPages / 2);
    return juzBase + (isSecondHalf ? 2 : 1);
  }, [currentJuz, currentPage]);

  // فواصل الصفحة الحالية
  const currentPageBookmarks = useMemo(() => {
    return bookmarks.filter(b => b.page === currentPage);
  }, [bookmarks, currentPage]);

  // تقييم الصفحة الحالية إن وجد
  const currentPageRating = useMemo(() => {
    return pageRatings[currentPage] || null;
  }, [pageRatings, currentPage]);

  // حفظ آخر صفحة تمت قراءتها في الذاكرة
  useEffect(() => {
    try {
      localStorage.setItem('worship_quran_last_read_page', currentPage.toString());
    } catch (e) {}
  }, [currentPage]);

  // إعادة ضبط وضع الاختبار عند تغيير الصفحة إذا كان مفعلاً
  useEffect(() => {
    if (testModeActive) {
      setIsContentHidden(true);
      setRevealedAyahs(new Set());
    }
  }, [currentPage, testModeActive]);

  // حفظ الثيم
  const changeTheme = (newTheme: 'sepia' | 'dark' | 'white') => {
    setTheme(newTheme);
    try {
      localStorage.setItem('worship_mushaf_theme', newTheme);
    } catch (e) {}
  };

  // حفظ نمط العرض
  const changeViewMode = (newMode: 'page' | 'ayahs') => {
    setViewMode(newMode);
    try {
      localStorage.setItem('worship_mushaf_view_mode', newMode);
    } catch (e) {}
  };

  // رابط صورة صفحة المصحف عالية الدقة من خادم مصحف المدينة
  const pageImageSrc = useMemo(() => {
    const padded = String(currentPage).padStart(3, '0');
    return `https://files.quran.app/hafs/madani/width_1024/page${padded}.png`;
  }, [currentPage]);

  const fallbackPageImageSrc = useMemo(() => {
    return `https://quran.ksu.edu.sa/ayat/safahat/${currentPage}.png`;
  }, [currentPage]);

  // التحميل المسبق للصفحات المجاورة (Preloading) لتقليب فوري بدون تأخير
  useEffect(() => {
    const preload = (page: number) => {
      if (page >= 1 && page <= 604) {
        const padded = String(page).padStart(3, '0');
        const img = new Image();
        img.src = `https://files.quran.app/hafs/madani/width_1024/page${padded}.png`;
      }
    };
    preload(currentPage + 1);
    preload(currentPage - 1);
  }, [currentPage]);

  // إعادة تعيين حالة الصورة عند تغيير الصفحة
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [currentPage]);

  // جلب آيات الصفحة في وضع الآيات والتفسير أو وضع الاختبار
  useEffect(() => {
    let isMounted = true;
    if (viewMode === 'ayahs' || testModeActive) {
      setLoadingAyahs(true);
      fetch(`https://api.alquran.cloud/v1/page/${currentPage}/quran-uthmani`)
        .then(res => res.json())
        .then(data => {
          if (isMounted && data.code === 200 && data.data?.ayahs) {
            setPageAyahs(data.data.ayahs);
            setLoadingAyahs(false);
          }
        })
        .catch(() => {
          if (isMounted) setLoadingAyahs(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [currentPage, viewMode, testModeActive]);

  // جلب تفسير الآية عند اختيارها
  const handleSelectAyahForTafsir = useCallback((ayah: AyahData) => {
    setSelectedAyah(ayah);
    setLoadingTafsir(true);
    setAyahTafsir(null);

    fetch(`https://api.alquran.cloud/v1/ayah/${ayah.surah.number}:${ayah.numberInSurah}/ar.muyassar`)
      .then(res => res.json())
      .then(data => {
        if (data.code === 200 && data.data?.text) {
          setAyahTafsir(data.data.text);
        } else {
          setAyahTafsir('عذراً، تعذر جلب التفسير حالياً. يرجى التأكد من اتصال الإنترنت.');
        }
        setLoadingTafsir(false);
      })
      .catch(() => {
        setAyahTafsir('عذراً، حدث خطأ أثناء الاتصال بخدمة التفسير.');
        setLoadingTafsir(false);
      });
  }, []);

  // تشغيل التلاوة الصوتية للآية
  const handlePlayAyahAudio = (ayah: AyahData) => {
    if (playingAyah?.number === ayah.number && isPlayingAudio) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      }
      return;
    }

    setPlayingAyah(ayah);
    setIsPlayingAudio(true);

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.src = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`;
    audioRef.current.play().catch(e => {
      console.warn("Audio play error", e);
      setIsPlayingAudio(false);
    });

    audioRef.current.onended = () => {
      setIsPlayingAudio(false);
      const currentIndex = pageAyahs.findIndex(a => a.number === ayah.number);
      if (currentIndex !== -1 && currentIndex + 1 < pageAyahs.length) {
        handlePlayAyahAudio(pageAyahs[currentIndex + 1]);
      }
    };
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlayingAudio(false);
    setPlayingAyah(null);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const goToNextPage = () => {
    if (currentPage < 604) {
      setCurrentPage(prev => prev + 1);
      stopAudio();
    } else {
      showToast('بلغت نهاية المصحف الشريف! هنيئاً لك الختم');
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      stopAudio();
    }
  };

  const goToPage = (page: number) => {
    const valid = Math.max(1, Math.min(604, page));
    setCurrentPage(valid);
    stopAudio();
    setShowIndexModal(false);
  };

  // دعم التقليب والتحريك يميناً ويساراً بالسحب (Touch & Mouse Swipe Drag)
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const mouseStartXRef = useRef<number | null>(null);
  const isMouseDownRef = useRef<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartXRef.current;
    const diffY = touchStartYRef.current !== null ? Math.abs(touchEndY - touchStartYRef.current) : 0;

    // حركة سحب أفقية صريحة: اتجاه التقليب من اليسار إلى اليمين للتقدم للصفحة التالية
    if (Math.abs(diffX) > 30 && Math.abs(diffX) > diffY) {
      if (diffX > 0) {
        // سحب من اليسار إلى اليمين = الصفحة التالية (التقدم للأمام)
        goToNextPage();
      } else {
        // سحب من اليمين إلى اليسار = الصفحة السابقة (الرجوع للخلف)
        goToPrevPage();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartXRef.current = e.clientX;
    isMouseDownRef.current = true;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || mouseStartXRef.current === null) return;
    const diffX = e.clientX - mouseStartXRef.current;
    if (Math.abs(diffX) > 35) {
      if (diffX > 0) {
        // سحب من اليسار إلى اليمين = الصفحة التالية
        goToNextPage();
      } else {
        // سحب من اليمين إلى اليسار = الصفحة السابقة
        goToPrevPage();
      }
    }
    mouseStartXRef.current = null;
    isMouseDownRef.current = false;
  };

  const handleMouseLeave = () => {
    isMouseDownRef.current = false;
    mouseStartXRef.current = null;
  };

  // إدارة وضع ملء الشاشة للتطبيق بشاشة نقية بدون إشعار المتصفح السفلي المزعج
  const toggleFullScreen = () => {
    setIsFullScreen(prev => {
      const next = !prev;
      if (!next) {
        try {
          if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
            if (document.exitFullscreen) {
              document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
              (document as any).webkitExitFullscreen();
            }
          }
        } catch (e) {}
      }
      return next;
    });
  };

  // متابعة تغييرات ملء الشاشة المتصفحية (مثل زر الرجوع أو Escape)
  useEffect(() => {
    const handleFsChange = () => {
      const isNativeFs = Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (!isNativeFs && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, [isFullScreen]);

  // قفل تمرير الصفحة الخلفية وتطبيق صنف الإخفاء وإشعار التطبيق بملء الشاشة
  useEffect(() => {
    onFullScreenChange?.(isFullScreen);
    if (isFullScreen) {
      document.body.classList.add('mushaf-fullscreen-active');
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.classList.remove('mushaf-fullscreen-active');
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isFullScreen, onFullScreenChange]);

  // دعم التقليب بمفاتيح الأسهم (السهم الأيمن للتقدم للأمام كما هو معتاد)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showIndexModal || showBookmarkModal) return;
      if (e.key === 'ArrowRight') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft') {
        goToPrevPage();
      } else if (e.key === 'Escape' && isFullScreen) {
        toggleFullScreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, showIndexModal, showBookmarkModal, isFullScreen]);

  // إدارة الفواصل المتعددة والمخصصة
  const handleOpenAddBookmark = () => {
    setNewBookmarkTitle(`فاصل سورة ${currentSurah.name} (ص ${currentPage})`);
    setNewBookmarkColor('amber');
    setShowBookmarkModal(true);
  };

  const handleSaveNewBookmark = () => {
    if (!newBookmarkTitle.trim()) {
      showToast('يرجى كتابة اسم الفاصل أو اختيار اسم جاهز');
      return;
    }

    const newBm: MushafBookmark = {
      id: `bm_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      page: currentPage,
      title: newBookmarkTitle.trim(),
      date: new Date().toLocaleDateString('ar-SA'),
      surahName: currentSurah.name,
      color: newBookmarkColor
    };

    const updated = [newBm, ...bookmarks];
    setBookmarks(updated);
    try {
      localStorage.setItem('worship_mushaf_bookmarks', JSON.stringify(updated));
    } catch (e) {}

    setShowBookmarkModal(false);
    showToast(`تم حفظ الفاصل «${newBookmarkTitle.trim()}» عند صفحة ${currentPage} 🔖`);
  };

  const handleRemoveBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    try {
      localStorage.setItem('worship_mushaf_bookmarks', JSON.stringify(updated));
    } catch (e) {}
    showToast('تم حذف الفاصل بنجاح');
  };

  const handleStartEditBookmark = (bm: MushafBookmark, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBookmarkId(bm.id);
    setEditBookmarkTitle(bm.title);
  };

  const handleSaveEditBookmark = (id: string) => {
    if (!editBookmarkTitle.trim()) return;
    const updated = bookmarks.map(b => b.id === id ? { ...b, title: editBookmarkTitle.trim() } : b);
    setBookmarks(updated);
    try {
      localStorage.setItem('worship_mushaf_bookmarks', JSON.stringify(updated));
    } catch (e) {}
    setEditingBookmarkId(null);
    showToast('تم تعديل اسم الفاصل بنجاح ✏️');
  };

  // آلية اختبار واسترجاع الحفظ الغيبي والتقييم
  const toggleTestMode = () => {
    const nextState = !testModeActive;
    setTestModeActive(nextState);
    setIsContentHidden(nextState);
    setRevealedAyahs(new Set());
    if (nextState) {
      showToast('تم تفعيل وضع اختبار الحفظ والتسميع 🧠. تم إخفاء النص لتقرأ من حفظك!');
    } else {
      showToast('تم إيقاف وضع الاختبار وعودة العرض الطبيعي');
    }
  };

  const toggleRevealAll = () => {
    if (isContentHidden) {
      setIsContentHidden(false);
      // كشف كل الآيات
      setRevealedAyahs(new Set(pageAyahs.map(a => a.number)));
      showToast('تم إظهار الصفحة كاملة لمقارنة حفظك وتصحيحه 👁️');
    } else {
      setIsContentHidden(true);
      setRevealedAyahs(new Set());
      showToast('تم إعادة إخفاء الآيات للمحاولة من جديد 🙈');
    }
  };

  const toggleRevealSingleAyah = (ayahNumber: number) => {
    setRevealedAyahs(prev => {
      const next = new Set(prev);
      if (next.has(ayahNumber)) {
        next.delete(ayahNumber);
      } else {
        next.add(ayahNumber);
      }
      return next;
    });
  };

  // تقييم درجة الحفظ للصفحة
  const handleRatePageMemorization = (rating: PageMasteryRating) => {
    const record: PageRatingRecord = {
      rating,
      date: new Date().toLocaleDateString('ar-SA'),
      timestamp: Date.now()
    };

    const updated = {
      ...pageRatings,
      [currentPage]: record
    };
    setPageRatings(updated);
    try {
      localStorage.setItem('worship_quran_page_ratings', JSON.stringify(updated));
    } catch (e) {}

    // منح نقاط بالرصيد الإيماني بحسب درجة الإتقان
    const pointsAwarded = rating === 'excellent' ? 20 : rating === 'good' ? 15 : 10;
    const ratingLabel = rating === 'excellent' ? 'ممتاز (إتقان تام 100%) ⭐' : rating === 'good' ? 'جيد جداً (تردد يسير) 🌿' : 'يحتاج تثبيت ومراجعة 🔄';

    // تسجيل المهمة في السجل اليومي
    const currentTasks = log.quran?.tasksCompleted || [];
    const taskKey = `hifz_test_page_${currentPage}`;
    const newTasks = currentTasks.includes(taskKey) ? currentTasks : [...currentTasks, taskKey];

    const updatedLog: DailyLog = {
      ...log,
      quran: {
        ...log.quran,
        tasksCompleted: newTasks
      }
    };

    onUpdateLog(
      updatedLog,
      `اختبر حفظ صفحة ${currentPage} وقيمها: ${ratingLabel}`,
      'quran'
    );

    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.8 },
      colors: rating === 'excellent' ? ['#fbbf24', '#f59e0b', '#10b981'] : ['#10b981', '#059669', '#3b82f6']
    });

    showToast(`تقبل الله! تم تقييم صفحة ${currentPage}: ${ratingLabel} (+${pointsAwarded} نقطة بالرصيد)`);
  };

  // التحقق هل الصفحة الحالية مقروءة في ورد اليوم
  const isReadToday = useMemo(() => {
    const pages = log.quran?.readPages || [];
    return pages.includes(currentPage);
  }, [log.quran?.readPages, currentPage]);

  const togglePageReadInDailyWard = () => {
    const currentRead = log.quran?.readPages || [];
    let updatedPages: number[];
    let isNowRead = false;

    if (currentRead.includes(currentPage)) {
      updatedPages = currentRead.filter(p => p !== currentPage);
      isNowRead = false;
    } else {
      updatedPages = [...currentRead, currentPage].sort((a, b) => a - b);
      isNowRead = true;
    }

    const updatedLog: DailyLog = {
      ...log,
      quran: {
        ...log.quran,
        readPages: updatedPages
      }
    };

    onUpdateLog(
      updatedLog,
      isNowRead ? `قرأ صفحة ${currentPage} من المصحف الشريف` : `إلغاء قراءة صفحة ${currentPage}`,
      'quran'
    );

    if (isNowRead) {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#059669', '#10b981', '#fbbf24']
      });
      showToast(`تقبل الله! أتممت قراءة صفحة ${currentPage} (+15 نقطة بالرصيد) 🌿`);
    } else {
      showToast(`تم إلغاء تحديد صفحة ${currentPage}`);
    }
  };

  const handleCopyAyah = (ayah: AyahData) => {
    const textToCopy = `﴿${ayah.text}﴾ [سورة ${ayah.surah.name}: الآية ${ayah.numberInSurah}]`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedAyahNumber(ayah.number);
      setTimeout(() => setCopiedAyahNumber(null), 2500);
      showToast('تم نسخ الآية الكريمة إلى الحافظة 📋');
    });
  };

  const handleCopyAyahWithTafsir = (ayah: AyahData, tafsir: string) => {
    const textToCopy = `﴿${ayah.text}﴾ [سورة ${ayah.surah.name}: ${ayah.numberInSurah}]\n\n📖 التفسير الميسر:\n${tafsir}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('تم نسخ الآية مع التفسير الميسر بنجاح 📋');
    });
  };

  const wardTotalPages = log.quran?.wardPlan?.targetPagesCount || 20;
  const todayReadCount = (log.quran?.readPages || []).length;
  const wardStartPage = log.quran?.wardPlan?.startPage || 1;

  const filteredSurahs = useMemo(() => {
    if (!indexSearchQuery.trim()) return QURAN_114_SURAHS;
    const q = indexSearchQuery.trim().toLowerCase();
    return QURAN_114_SURAHS.filter(s => 
      s.name.includes(q) || 
      s.arabicName.includes(q) || 
      s.id.toString() === q ||
      s.page.toString() === q
    );
  }, [indexSearchQuery]);

  const filteredJuzs = useMemo(() => {
    if (!indexSearchQuery.trim()) return QURAN_30_JUZ;
    const q = indexSearchQuery.trim().toLowerCase();
    return QURAN_30_JUZ.filter(j => 
      j.name.includes(q) || 
      j.popularName.includes(q) || 
      j.id.toString() === q
    );
  }, [indexSearchQuery]);

  // وضع ملء الشاشة الحصري: يظهر المصحف فقط في كامل شاشة الهاتف مع خلفية وثيم أصيل وإمكانية تسجيل القراءة مباشرة
  if (isFullScreen) {
    return createPortal(
      <div 
        className={`fixed inset-0 z-[99999] w-screen h-screen h-[100dvh] flex flex-col justify-between items-center select-none overflow-hidden ${
          theme === 'sepia' 
            ? 'bg-[#fcf7ec]' 
            : theme === 'dark' 
              ? 'bg-[#121314]' 
              : 'bg-white'
        }`}
        dir="rtl"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ touchAction: 'pan-y' }}
      >
        {/* رسالة التنبيه السريعة (Toast) في ملء الشاشة */}
        {toastMessage && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-emerald-950 text-white px-5 py-2.5 rounded-full shadow-2xl border border-emerald-500/40 text-xs font-bold header-font flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* الشريط العلوي الخفيف والأنيق المتوافق مع ثيم المصحف تماماً */}
        <div className={`w-full z-40 px-3 py-2 flex items-center justify-between flex-wrap gap-2 border-b shadow-xs pointer-events-auto backdrop-blur-md ${
          theme === 'dark'
            ? 'bg-slate-900/95 text-slate-100 border-slate-800'
            : theme === 'sepia'
              ? 'bg-[#f7eed8]/95 text-[#7d5e2d] border-[#eedfc5]'
              : 'bg-white/95 text-slate-800 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 flex-wrap">
            {/* زر الخروج من ملء الشاشة */}
            <button
              onClick={toggleFullScreen}
              className={`py-1.5 px-3 rounded-full text-xs font-black header-font transition-all flex items-center gap-1.5 shadow-xs active:scale-95 border ${
                theme === 'dark'
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
              }`}
              title="إنهاء ملء الشاشة والعودة للواجهة الرئيسية"
            >
              <Minimize2 className="w-4 h-4 text-emerald-600" />
              <span>خروج</span>
            </button>

            {/* زر تسجيل قراءة الصفحة مباشرة في وضع ملء الشاشة (دون الحاجة للخروج إطلاقاً) */}
            <button
              onClick={togglePageReadInDailyWard}
              className={`py-1.5 px-3.5 rounded-full text-xs font-black header-font transition-all flex items-center gap-1.5 shadow-sm active:scale-95 border ${
                isReadToday
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-200'
                  : theme === 'dark'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              }`}
              title="تسجيل قراءة هذه الصفحة في الورد اليومي واحتساب 15 نقطة بالرصيد"
            >
              {isReadToday ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>مقروءة اليوم ✓</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4 text-emerald-600" />
                  <span>تحديد كـ مقروءة (+15 ن)</span>
                </>
              )}
            </button>

            {onNavigateToWardPlanner && (
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border hidden sm:inline-flex items-center ${
                theme === 'dark' 
                  ? 'bg-slate-800/80 text-slate-300 border-slate-700' 
                  : 'bg-white/80 text-slate-600 border-slate-200'
              }`}>
                الورد: {todayReadCount}/{wardTotalPages}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* التكبير والتصغير أثناء ملء الشاشة */}
            <div className={`flex items-center p-0.5 rounded-full border ${
              theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white/90 border-slate-200'
            }`}>
              <button
                onClick={() => setZoomLevel(prev => Math.min(1.6, prev + 0.15))}
                className="p-1.5 text-slate-600 hover:text-slate-900 rounded-full transition-all"
                title="تكبير حجم الصفحة"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.85, prev - 0.15))}
                className="p-1.5 text-slate-600 hover:text-slate-900 rounded-full transition-all"
                title="تصغير"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              {zoomLevel !== 1 && (
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-1.5 text-emerald-600 hover:text-emerald-800 rounded-full transition-all"
                  title="إعادة ضبط الحجم الأصلي"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* أزرار ثيم القراءة */}
            <div className={`flex items-center p-0.5 rounded-full border ${
              theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white/90 border-slate-200'
            }`}>
              <button
                onClick={() => changeTheme('sepia')}
                className={`p-1.5 rounded-full transition-all ${theme === 'sepia' ? 'bg-amber-100 text-amber-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'}`}
                title="ورق عاجي دافئ"
              >
                <Coffee className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => changeTheme('white')}
                className={`p-1.5 rounded-full transition-all ${theme === 'white' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'}`}
                title="أبيض ناصع"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => changeTheme('dark')}
                className={`p-1.5 rounded-full transition-all ${theme === 'dark' ? 'bg-slate-700 text-yellow-300 shadow-xs' : 'text-slate-400 hover:text-slate-700'}`}
                title="الوضع الليلي"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className={`text-xs font-black px-3 py-1 rounded-full border header-font ${
              theme === 'dark' 
                ? 'bg-slate-800 text-amber-300 border-slate-700' 
                : 'bg-white/90 text-emerald-900 border-slate-200'
            }`}>
              سورة {currentSurah.name}
            </span>
          </div>
        </div>

        {/* فواصل الصفحة المرجعية إن وجدت */}
        {currentPageBookmarks.length > 0 && (
          <div className="absolute top-14 right-6 z-30 flex items-start gap-1 pointer-events-none">
            {currentPageBookmarks.map(bm => {
              const colorInfo = COLOR_CLASSES[bm.color || 'amber'];
              return (
                <div 
                  key={bm.id} 
                  className={`w-7 h-12 shadow-md rounded-b-md flex items-end justify-center pb-1 font-black ${colorInfo.bg} ${colorInfo.text} border-b border-x ${colorInfo.border}`}
                  title={bm.title}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${colorInfo.fill}`} />
                </div>
              );
            })}
          </div>
        )}

        {/* جسم المصحف في كامل شاشة الهاتف - شاشة نقية مضيئة بدون سواد باهت */}
        <div className="flex-1 w-full h-full flex items-center justify-center p-1 sm:p-2 overflow-auto relative">
          {/* كشف الحفظ الغيبي في وضع الاختبار إن كان مفعلاً */}
          {testModeActive && isContentHidden && (
            <div className="absolute inset-0 z-30 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center shadow-xl">
                <Brain className="w-8 h-8 animate-bounce" />
              </div>
              <h3 className="text-lg font-black header-font text-white">
                صفحة {currentPage} (سورة {currentSurah.name})
              </h3>
              <p className="text-xs text-purple-200/90 max-w-sm font-bold">
                اقرأ من حفظك وذاكرتك، ثم انقر الزر لكشف صفحة المصحف للمقارنة والتصحيح.
              </p>
              <button
                onClick={toggleRevealAll}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-emerald-950 font-black header-font text-xs flex items-center gap-2 shadow-xl active:scale-95 transition-all"
              >
                <Eye className="w-4 h-4 text-emerald-950" />
                <span>كشف صفحة المصحف لمقارنة الحفظ 👁️</span>
              </button>
            </div>
          )}

          {/* صورة مصحف المدينة بدقة فائقة تملأ الشاشة بنقاء ووضوح */}
          {viewMode === 'page' ? (
            <div 
              className="w-full h-full flex items-center justify-center relative transition-transform duration-150 ease-out"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
            >
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
                  <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold text-slate-500 header-font">جاري استحضار الصفحة المباركة {currentPage}...</span>
                </div>
              )}
              <img
                src={imageError ? fallbackPageImageSrc : pageImageSrc}
                alt={`مصحف المدينة - صفحة ${currentPage}`}
                loading="eager"
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  if (!imageError) setImageError(true);
                }}
                className={`max-w-full max-h-[calc(100dvh-88px)] w-auto h-auto object-contain select-none drop-shadow-md transition-all duration-150 ${
                  theme === 'dark'
                    ? 'invert-[0.90] hue-rotate-180 brightness-95 contrast-125'
                    : theme === 'sepia'
                      ? 'contrast-[1.02] sepia-[0.08]'
                      : ''
                }`}
              />
            </div>
          ) : (
            /* وضع الآيات في ملء الشاشة */
            <div className={`w-full max-w-2xl max-h-[85dvh] overflow-y-auto p-4 sm:p-6 rounded-3xl border space-y-4 shadow-sm ${
              theme === 'dark' 
                ? 'bg-slate-900 text-white border-slate-800' 
                : theme === 'sepia' 
                  ? 'bg-[#f7eed8] text-[#3c2f1b] border-[#eedfc5]' 
                  : 'bg-white text-slate-900 border-slate-200'
            }`}>
              <div className="text-center py-2 border-b border-black/10">
                <h3 className="text-lg font-black header-font text-emerald-800">سورة {currentSurah.arabicName}</h3>
                <p className="text-xs text-slate-500 font-mono">الجزء {currentJuz.id} • صفحة {currentPage}</p>
              </div>
              <div className="text-justify leading-[2.6] text-xl sm:text-2xl quran-font">
                {pageAyahs.map((ayah) => (
                  <span key={ayah.number} className="inline">
                    <span>{ayah.text}</span>
                    <span className="inline-flex items-center justify-center mx-1.5 text-emerald-700 font-bold font-sans text-xs">
                      ﴿{ayah.numberInSurah}﴾
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* شريط الإطار السفلي البسيط والأنيق المتوافق مع ثيم المصحف */}
        <div className={`w-full z-40 px-4 py-2 flex items-center justify-between text-xs font-bold border-t pointer-events-auto backdrop-blur-md ${
          theme === 'dark' 
            ? 'bg-slate-900/95 text-slate-300 border-slate-800' 
            : theme === 'sepia' 
              ? 'bg-[#f7eed8]/95 text-[#7d5e2d] border-[#eedfc5]' 
              : 'bg-white/95 text-slate-700 border-slate-200'
        }`}>
          <span className="font-mono text-xs opacity-75">الحزب {currentHizb}</span>
          
          <div className="flex items-center gap-2 font-mono">
            <span>الجزء {currentJuz.id}</span>
            <span>•</span>
            <span className="font-black text-sm px-2.5 py-0.5 rounded-md bg-black/5">صفحة {currentPage}</span>
          </div>

          <span className="text-[11px] font-bold opacity-75 font-sans hidden sm:inline">
            اسحب من اليسار إلى اليمين للتقدم
          </span>
        </div>
      </div>,
      document.body
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      
      {/* رسالة التنبيه السريعة (Toast) */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-950 text-white px-5 py-2.5 rounded-full shadow-2xl border border-emerald-500/40 text-xs font-bold header-font flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* الشريط العلوي الذكي للتحكم والإحصاءات */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* معلومات السورة والجزء */}
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              onClick={() => setShowIndexModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all font-bold text-xs header-font shadow-sm active:scale-95"
              title="فتح فهرس السور والأجزاء"
            >
              <List className="w-4 h-4 text-emerald-600" />
              <span>فهرس المصحف</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 header-font">
              <span className="text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-lg border border-emerald-100">
                سورة {currentSurah.name}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 text-[11px] font-bold">
                الجزء {currentJuz.id} (الحزب {currentHizb})
              </span>
            </div>

            {/* شارة تقييم الحفظ السابقة إن وُجدت */}
            {currentPageRating && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                currentPageRating.rating === 'excellent' 
                  ? 'bg-amber-50 text-amber-800 border-amber-300' 
                  : currentPageRating.rating === 'good'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}>
                <Star className="w-3 h-3 fill-current" />
                <span>حفظ: {currentPageRating.rating === 'excellent' ? 'ممتاز' : currentPageRating.rating === 'good' ? 'جيد جداً' : 'يحتاج تكرار'}</span>
              </span>
            )}
          </div>

          {/* أدوات القراءة والمظهر والتسميع والفواصل */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* زر تفعيل وضع اختبار الحفظ واسترجاع الآيات غيباً */}
            <button
              onClick={toggleTestMode}
              className={`px-3 py-1.5 rounded-2xl text-xs font-black header-font transition-all flex items-center gap-1.5 shadow-sm active:scale-95 border ${
                testModeActive 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white border-purple-500 ring-2 ring-purple-400/30' 
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border-purple-200'
              }`}
              title="تفعيل وضع إخفاء الآيات واختبار التسميع من الذاكرة"
            >
              <Brain className="w-4 h-4 text-purple-300" />
              <span>{testModeActive ? 'وضع التسميع نشط' : 'اختبار الحفظ 🧠'}</span>
            </button>

            {/* زر إدارة وإضافة الفواصل المسمّاة */}
            <button
              onClick={handleOpenAddBookmark}
              className={`p-2 rounded-xl transition-all border flex items-center gap-1 text-xs font-black ${
                currentPageBookmarks.length > 0
                  ? 'bg-amber-400 text-emerald-950 border-amber-500 shadow-sm' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200'
              }`}
              title="إضافة وتسمية فاصل على هذه الصفحة"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span className="text-[10px] hidden sm:inline">
                {currentPageBookmarks.length > 0 ? `فاصل (${currentPageBookmarks.length})` : 'فاصل'}
              </span>
            </button>

            {/* نمط العرض: صفحات مصورة ↔ آيات وتفسير */}
            <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200 flex items-center">
              <button
                onClick={() => changeViewMode('page')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold header-font transition-all flex items-center gap-1 ${
                  viewMode === 'page' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
                }`}
                title="عرض صفحة مصحف المدينة"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">المصحف</span>
              </button>
              <button
                onClick={() => changeViewMode('ayahs')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold header-font transition-all flex items-center gap-1 ${
                  viewMode === 'ayahs' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
                }`}
                title="عرض الآيات مع التفسير الميسر"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">الآيات</span>
              </button>
            </div>

            {/* ثيم القراءة */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => changeTheme('sepia')}
                className={`p-1.5 rounded-lg transition-all ${
                  theme === 'sepia' ? 'bg-amber-100 text-amber-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="ورق عاجي دافئ"
              >
                <Coffee className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => changeTheme('white')}
                className={`p-1.5 rounded-lg transition-all ${
                  theme === 'white' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="صفحة بيضاء نقية"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => changeTheme('dark')}
                className={`p-1.5 rounded-lg transition-all ${
                  theme === 'dark' ? 'bg-slate-800 text-yellow-300 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="الوضع الليلي للتهجد"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* التكبير */}
            {viewMode === 'page' && (
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.15))}
                  className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg"
                  title="تكبير"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(0.85, prev - 0.15))}
                  className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg"
                  title="تصغير"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                {zoomLevel !== 1 && (
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="p-1.5 text-emerald-600 hover:text-emerald-800 rounded-lg"
                    title="إعادة ضبط الحجم"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* ملء الشاشة */}
            <button
              onClick={toggleFullScreen}
              className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-all flex items-center gap-1.5 active:scale-95"
              title="ملء الشاشة على كامل الهاتف"
            >
              <Maximize2 className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-black header-font hidden sm:inline">ملء الشاشة</span>
            </button>
          </div>
        </div>

        {/* شريط فواصل الصفحة الحالية المسمّاة إن وُجدت */}
        {currentPageBookmarks.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <Tag className="w-3 h-3 text-amber-500" />
              <span>فواصل هذه الصفحة:</span>
            </span>
            {currentPageBookmarks.map(bm => {
              const colorInfo = COLOR_CLASSES[bm.color || 'amber'];
              return (
                <div 
                  key={bm.id} 
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black header-font border ${colorInfo.bg} ${colorInfo.text} ${colorInfo.border} shadow-2xs`}
                >
                  <Bookmark className={`w-3 h-3 ${colorInfo.fill}`} />
                  <span>{bm.title}</span>
                  <button
                    onClick={(e) => handleRemoveBookmark(bm.id, e)}
                    className="hover:opacity-75 p-0.5"
                    title="حذف هذا الفاصل"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* لوحة تحكم وضع اختبار واسترجاع الحفظ الغيبي (تظهر فقط عند تفعيل وضع الاختبار) */}
        {testModeActive && (
          <div className="bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 border border-purple-500/30 space-y-3 animate-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-black header-font text-purple-200">
                      محراب اختبار وتسميع المحفوظ غيباً
                    </h4>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-400/20 text-purple-300 font-bold border border-purple-400/30">
                      صفحة {currentPage}
                    </span>
                  </div>
                  <p className="text-[10px] text-purple-200/80 font-bold mt-0.5">
                    {isContentHidden
                      ? 'النص مخفي حالياً لتتلو الآيات من ذاكرتك. اقرأ واسترجع، ثم اضغط كشف للمقارنة والتصحيح.'
                      : 'تم إظهار الآيات. طابق ما قرأته غيباً مع النص، ثم قيّم درجة إتقانك أسفله.'}
                  </p>
                </div>
              </div>

              {/* زر الإظهار والإخفاء السريع */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleRevealAll}
                  className={`py-2 px-3.5 rounded-xl text-xs font-black header-font transition-all flex items-center gap-1.5 shadow-md active:scale-95 ${
                    isContentHidden
                      ? 'bg-amber-400 hover:bg-amber-300 text-emerald-950'
                      : 'bg-purple-600 hover:bg-purple-500 text-white border border-purple-400/40'
                  }`}
                >
                  {isContentHidden ? <Eye className="w-4 h-4 text-emerald-950" /> : <EyeOff className="w-4 h-4 text-white" />}
                  <span>{isContentHidden ? 'كشف الآيات لمقارنة الحفظ 👁️' : 'إعادة إخفاء النص 🙈'}</span>
                </button>

                <button
                  onClick={toggleTestMode}
                  className="p-2 hover:bg-white/10 rounded-xl text-purple-300 hover:text-white transition-all"
                  title="إنهاء وضع الاختبار"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* خيارات تقييم درجة الحفظ لهذه الصفحة */}
            <div className="pt-3 border-t border-purple-500/20 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="text-[11px] font-black text-amber-300 header-font flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>قيّم درجة إتقانك لحفظ هذه الصفحة:</span>
                </span>
                {currentPageRating && (
                  <span className="text-[10px] text-purple-200 font-bold">
                    آخر تقييم مسجل: {currentPageRating.date}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handleRatePageMemorization('excellent')}
                  className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between group active:scale-95 ${
                    currentPageRating?.rating === 'excellent'
                      ? 'bg-amber-400 text-emerald-950 border-amber-300 shadow-md font-black'
                      : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">⭐</span>
                    <div>
                      <h5 className="text-xs font-black header-font">ممتاز (إتقان تام)</h5>
                      <p className={`text-[9px] ${currentPageRating?.rating === 'excellent' ? 'text-emerald-950 font-bold' : 'text-purple-200'}`}>
                        سرد بلا تردد ولا خطأ (+20ن)
                      </p>
                    </div>
                  </div>
                  {currentPageRating?.rating === 'excellent' && <Check className="w-4 h-4 text-emerald-950" />}
                </button>

                <button
                  onClick={() => handleRatePageMemorization('good')}
                  className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between group active:scale-95 ${
                    currentPageRating?.rating === 'good'
                      ? 'bg-emerald-500 text-white border-emerald-400 shadow-md font-black'
                      : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌿</span>
                    <div>
                      <h5 className="text-xs font-black header-font">جيد جداً (تردد يسير)</h5>
                      <p className={`text-[9px] ${currentPageRating?.rating === 'good' ? 'text-emerald-100 font-bold' : 'text-purple-200'}`}>
                        تردد خفيف أو خطأ صُوّب (+15ن)
                      </p>
                    </div>
                  </div>
                  {currentPageRating?.rating === 'good' && <Check className="w-4 h-4 text-white" />}
                </button>

                <button
                  onClick={() => handleRatePageMemorization('needs_practice')}
                  className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between group active:scale-95 ${
                    currentPageRating?.rating === 'needs_practice'
                      ? 'bg-rose-500 text-white border-rose-400 shadow-md font-black'
                      : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🔄</span>
                    <div>
                      <h5 className="text-xs font-black header-font">يحتاج تثبيت وتكرار</h5>
                      <p className={`text-[9px] ${currentPageRating?.rating === 'needs_practice' ? 'text-rose-100 font-bold' : 'text-purple-200'}`}>
                        توقف أو نسيان يتطلب مراجعة (+10ن)
                      </p>
                    </div>
                  </div>
                  {currentPageRating?.rating === 'needs_practice' && <Check className="w-4 h-4 text-white" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* شريط الانتقال المباشر والتقدم */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-700 header-font">صفحة:</span>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="604"
                value={currentPage}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1 && val <= 604) {
                    goToPage(val);
                  }
                }}
                className="w-16 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-center text-xs font-black font-mono text-emerald-800 outline-none focus:border-emerald-500"
              />
            </div>
            <span className="text-xs font-bold text-slate-400 font-mono">/ 604</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={togglePageReadInDailyWard}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black header-font transition-all shadow-sm active:scale-95 ${
                isReadToday
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              {isReadToday ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>مقروءة اليوم ✓</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4 text-emerald-600" />
                  <span>تحديد كـ مقروءة (+15 ن)</span>
                </>
              )}
            </button>

            {onNavigateToWardPlanner && (
              <button
                onClick={onNavigateToWardPlanner}
                className="px-2.5 py-1.5 rounded-2xl text-[11px] font-bold text-slate-500 hover:text-emerald-700 hover:bg-slate-100 transition-all flex items-center gap-1"
                title="الانتقال إلى مخطط الورد اليومي"
              >
                <span>الورد: {todayReadCount}/{wardTotalPages}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* منطقة عرض المصحف الرئيسية */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ touchAction: 'pan-y' }}
        className={`relative rounded-3xl overflow-hidden transition-all shadow-md border cursor-grab active:cursor-grabbing select-none ${
          theme === 'sepia' 
            ? 'bg-[#fcf7ec] border-[#e8ddc7]' 
            : theme === 'dark' 
              ? 'bg-[#181a1b] border-slate-800' 
              : 'bg-white border-slate-200'
        }`}
      >
        {/* شريط الإطار الزخرفي العلوي للمصحف الشريف */}
        <div className={`px-4 py-2 flex items-center justify-between text-[11px] font-bold border-b ${
          theme === 'dark' ? 'border-slate-800 text-amber-200/70 bg-slate-900/60' : 'border-[#eedfc5] text-[#7d5e2d] bg-[#f7eed8]'
        }`}>
          <div className="flex items-center gap-2">
            <span className="font-bold">سورة {currentSurah.arabicName || currentSurah.name}</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-500/10 border border-amber-500/20">
              {currentSurah.type}
            </span>
            {testModeActive && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-600 text-white font-black animate-pulse">
                وضع التسميع الغيبي
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 font-mono">
              <span>الجزء {currentJuz.id}</span>
              <span>•</span>
              <span>صفحة {currentPage}</span>
            </div>
            <button
              onClick={toggleFullScreen}
              className="p-1 rounded-lg hover:bg-black/10 transition-all text-current"
              title="ملء الشاشة على كامل الهاتف"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* عرض الصفحة المصورة (Madani Quran Page) */}
        {viewMode === 'page' ? (
          <div className="relative min-h-[500px] flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none">
            {/* أشرطة الفواصل المرجعية الملونة في أعلى يمين الصفحة */}
            {currentPageBookmarks.length > 0 && (
              <div className="absolute top-0 right-6 z-20 flex items-start gap-1">
                {currentPageBookmarks.map(bm => {
                  const colorInfo = COLOR_CLASSES[bm.color || 'amber'];
                  return (
                    <div 
                      key={bm.id} 
                      className={`w-7 h-12 shadow-md rounded-b-md flex items-end justify-center pb-1 font-black cursor-pointer hover:h-14 transition-all ${colorInfo.bg} ${colorInfo.text} border-b border-x ${colorInfo.border}`}
                      title={bm.title}
                      onClick={handleOpenAddBookmark}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${colorInfo.fill}`} />
                    </div>
                  );
                })}
              </div>
            )}

            {/* مؤشر تحميل الصفحة */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
                <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-slate-500 header-font">جاري استحضار الصفحة المباركة {currentPage}...</span>
              </div>
            )}

            {/* حجاب إخفاء الصفحة في وضع اختبار الحفظ الغيبي */}
            {testModeActive && isContentHidden && (
              <div className="absolute inset-0 z-30 bg-slate-900/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white space-y-4 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-3xl bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center shadow-xl">
                  <Brain className="w-8 h-8 animate-bounce" />
                </div>
                
                <div className="space-y-1.5 max-w-sm">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-300 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-500/30">
                    وضع استرجاع وتسميع المحفوظ
                  </span>
                  <h3 className="text-base sm:text-lg font-black header-font text-white">
                    صفحة {currentPage} (سورة {currentSurah.name})
                  </h3>
                  <p className="text-xs text-purple-200/90 leading-relaxed font-bold">
                    اقرأ الآيات الآن غيباً من صدرك وذاكرتك، وعند الانتهاء انقر على الزر بالأسفل لكشف صفحة المصحف ومقارنة قراءتك.
                  </p>
                </div>

                <button
                  onClick={toggleRevealAll}
                  className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black header-font text-xs flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  <Eye className="w-4 h-4 text-emerald-950" />
                  <span>كشف صفحة المصحف لمقارنة الحفظ 👁️</span>
                </button>
              </div>
            )}

            {/* صورة المصحف الشريف بدقة عالية */}
            <div 
              className="transition-transform duration-200 ease-out max-w-full flex justify-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img
                src={imageError ? fallbackPageImageSrc : pageImageSrc}
                alt={`مصحف المدينة المنورة - صفحة ${currentPage}`}
                loading="eager"
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  if (!imageError) {
                    setImageError(true);
                  }
                }}
                className={`max-w-full max-h-[78vh] w-auto h-auto object-contain transition-all duration-200 drop-shadow-sm opacity-100 scale-100 ${
                  theme === 'dark' 
                    ? 'invert-[0.90] hue-rotate-180 brightness-95 contrast-125' 
                    : theme === 'sepia' 
                      ? 'contrast-[1.03] sepia-[0.10]' 
                      : ''
                }`}
              />
            </div>
          </div>
        ) : (
          /* وضع الآيات والتفسير التفاعلي واختبار الآيات تدريجياً */
          <div className="p-4 sm:p-6 space-y-6 min-h-[500px]">
            {loadingAyahs ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-slate-500 header-font">جاري تحميل آيات الصفحة المباركة...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {pageAyahs.some(a => a.numberInSurah === 1) && (
                  <div className="text-center py-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 space-y-2">
                    <h3 className="text-lg font-black header-font text-emerald-900">
                      {currentSurah.arabicName}
                    </h3>
                    <p className="quran-font text-xl text-emerald-950 font-bold">
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </p>
                  </div>
                )}

                {/* نص الآيات مع دعم الإخفاء والكشف الفردي في وضع الاختبار */}
                <div className="text-justify leading-[2.6] sm:leading-[2.8] text-xl sm:text-2xl quran-font p-2 select-text">
                  {pageAyahs.map((ayah) => {
                    const isSelected = selectedAyah?.number === ayah.number;
                    const isPlaying = playingAyah?.number === ayah.number && isPlayingAudio;
                    const isAyahConcealed = testModeActive && isContentHidden && !revealedAyahs.has(ayah.number);

                    return (
                      <span
                        key={ayah.number}
                        onClick={() => {
                          if (testModeActive && isContentHidden) {
                            toggleRevealSingleAyah(ayah.number);
                          } else {
                            handleSelectAyahForTafsir(ayah);
                          }
                        }}
                        className={`inline cursor-pointer transition-all rounded px-1.5 py-0.5 relative group ${
                          isAyahConcealed
                            ? 'bg-purple-100/70 text-transparent blur-xs select-none hover:bg-purple-200/80'
                            : isPlaying 
                              ? 'bg-amber-200 text-amber-950 shadow-xs' 
                              : isSelected 
                                ? 'bg-emerald-100 text-emerald-950' 
                                : 'hover:bg-amber-100/60'
                        }`}
                        title={isAyahConcealed ? 'انقر لكشف هذه الآية والتأكد من حفظها' : 'انقر لعرض التفسير والتلاوة'}
                      >
                        <span>{ayah.text}</span>
                        <span className="inline-flex items-center justify-center mx-1.5 text-emerald-700 text-base font-sans font-bold select-none">
                          <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] ${
                            isAyahConcealed ? 'bg-purple-200 border-purple-300 text-purple-900' : 'border-emerald-500/40 bg-emerald-50/50 text-emerald-800'
                          }`}>
                            {ayah.numberInSurah}
                          </span>
                        </span>
                      </span>
                    );
                  })}
                </div>

                {testModeActive && isContentHidden && (
                  <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-900 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>النص مموه غيباً. اضغط على أي آية بمفردها لكشفها تدريجياً، أو اضغط زر الكشف الكامل أعلاه.</span>
                    </div>
                    <button
                      onClick={toggleRevealAll}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold font-sans"
                    >
                      كشف كامل الصفحة
                    </button>
                  </div>
                )}

                {!testModeActive && (
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>انقر على أي آية لعرض تفسيرها الميسر، أو الاستماع لتلاوتها، أو تدوين تأمل في دفتر التدبر.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* شريط الإطار السفلي للمصحف الشريف (نظيف ومجرد تماماً من أزرار ومؤشرات التنقل - التقليب عبر السحب يميناً ويساراً) */}
        <div className={`px-4 py-2 flex items-center justify-between text-xs font-bold border-t ${
          theme === 'dark' ? 'border-slate-800 text-slate-400 bg-slate-900/60' : 'border-[#eedfc5] text-[#7d5e2d] bg-[#f7eed8]'
        }`}>
          <span className="text-[10px] opacity-75 font-mono">الحزب {currentHizb}</span>
          <span className="font-mono font-black text-sm tracking-wide">
            صفحة {currentPage}
          </span>
          <span className="text-[10px] opacity-75 font-mono">الجزء {currentJuz.id}</span>
        </div>
      </div>

      {/* شريط التحكم السفلي والتقليب عبر السلايدر والإجراءات السريعة */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 header-font">
            <span>سورة الفاتحة (صفحة ١)</span>
            <span className="font-mono font-black text-emerald-700">
              صفحة {currentPage} ({Math.round((currentPage / 604) * 100)}%)
            </span>
            <span>سورة الناس (صفحة ٦٠٤)</span>
          </div>
          <input
            type="range"
            min="1"
            max="604"
            value={currentPage}
            onChange={(e) => goToPage(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <button
            onClick={() => goToPage(wardStartPage)}
            className="py-2.5 px-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 transition-all text-xs font-black header-font flex items-center justify-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>ورد اليوم (ص {wardStartPage})</span>
          </button>

          <button
            onClick={handleOpenAddBookmark}
            className="py-2.5 px-3 rounded-2xl bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300 transition-all text-xs font-black header-font flex items-center justify-center gap-1.5"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-amber-500" />
            <span>إضافة وتسمية فاصل 🔖</span>
          </button>

          <button
            onClick={() => {
              setIndexTab('bookmarks');
              setShowIndexModal(true);
            }}
            className="py-2.5 px-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all text-xs font-black header-font flex items-center justify-center gap-1.5"
          >
            <Bookmark className="w-3.5 h-3.5 text-slate-500" />
            <span>قائمة الفواصل ({bookmarks.length})</span>
          </button>

          <button
            onClick={toggleTestMode}
            className={`py-2.5 px-3 rounded-2xl transition-all text-xs font-black header-font flex items-center justify-center gap-1.5 ${
              testModeActive 
                ? 'bg-purple-100 text-purple-900 border border-purple-300' 
                : 'bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-800 border border-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-purple-600" />
            <span>{testModeActive ? 'إنهاء التسميع' : 'تسميع غيبي 🧠'}</span>
          </button>
        </div>
      </div>

      {/* مشغل التلاوة الصوتي العائم */}
      {playingAyah && (
        <div className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 bg-emerald-950 text-white rounded-3xl p-4 shadow-2xl border border-emerald-500/40 animate-in slide-in-from-bottom-5 duration-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <button
              onClick={() => handlePlayAyahAudio(playingAyah)}
              className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-all shadow-md font-bold"
            >
              {isPlayingAudio ? <Pause className="w-5 h-5 fill-emerald-950" /> : <Play className="w-5 h-5 fill-emerald-950" />}
            </button>
            <div className="truncate">
              <p className="text-xs font-black header-font text-amber-300 truncate">
                سورة {playingAyah.surah.name} - الآية {playingAyah.numberInSurah}
              </p>
              <p className="text-[10px] text-emerald-200/80 truncate">
                بصوت الشيخ مشاري راشد العفاسي
              </p>
            </div>
          </div>

          <button
            onClick={stopAudio}
            className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all shrink-0"
            title="إيقاف التلاوة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* نافذة التفسير الميسر */}
      {selectedAyah && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-6 duration-300">
            <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-black text-sm header-font">
                    سورة {selectedAyah.surah.name} - الآية {selectedAyah.numberInSurah}
                  </h3>
                  <span className="text-[10px] text-emerald-200 font-mono">
                    الجزء {selectedAyah.juz} • صفحة {selectedAyah.page}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAyah(null)}
                className="p-2 hover:bg-white/10 rounded-full text-emerald-100 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/70 text-center">
                <p className="quran-font text-xl sm:text-2xl text-emerald-950 font-bold leading-loose">
                  ﴿{selectedAyah.text}﴾
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handlePlayAyahAudio(selectedAyah)}
                  className="py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all text-xs font-black header-font flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>تلاوة</span>
                </button>

                <button
                  onClick={() => handleCopyAyah(selectedAyah)}
                  className="py-2.5 px-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all text-xs font-black header-font flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {copiedAyahNumber === selectedAyah.number ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                  <span>{copiedAyahNumber === selectedAyah.number ? 'تم النسخ' : 'نسخ الآية'}</span>
                </button>

                {onNavigateToTadabbur && (
                  <button
                    onClick={() => {
                      onNavigateToTadabbur(
                        selectedAyah.surah.number,
                        selectedAyah.surah.name,
                        selectedAyah.numberInSurah.toString(),
                        selectedAyah.text
                      );
                      setSelectedAyah(null);
                    }}
                    className="py-2.5 px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-all text-xs font-black header-font flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>تدوين تدبر</span>
                  </button>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-700 header-font flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>التفسير الميسر (مجمع الملك فهد)</span>
                  </h4>
                  {ayahTafsir && (
                    <button
                      onClick={() => handleCopyAyahWithTafsir(selectedAyah, ayahTafsir)}
                      className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>نسخ مع التفسير</span>
                    </button>
                  )}
                </div>

                {loadingTafsir ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[11px] text-slate-400">جاري استحضار التفسير الميسر...</span>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 text-sm leading-relaxed text-justify header-font">
                    {ayahTafsir}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة إضافة وتسمية فاصل جديد مخصص (Multiple Named Bookmarks Modal) */}
      {showBookmarkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <BookmarkPlus className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-black text-sm header-font text-slate-800">
                    إضافة فاصل مسمّى على صفحة {currentPage}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold">
                    سورة {currentSurah.name} • الجزء {currentJuz.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowBookmarkModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* حقل اسم الفاصل */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 header-font block">
                اسم الفاصل:
              </label>
              <input
                type="text"
                value={newBookmarkTitle}
                onChange={(e) => setNewBookmarkTitle(e.target.value)}
                placeholder="اكتب اسم الفاصل (مثلاً: ورد الفجر، مراجعة، تدبر...)"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all header-font"
                autoFocus
              />
            </div>

            {/* اختيارات جاهزة للأسماء */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 block header-font">
                أو اختر اسماً مقترحاً بلمسة:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {BOOKMARK_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNewBookmarkTitle(preset)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all border ${
                      newBookmarkTitle === preset
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* اختيار لون الفاصل */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 block header-font">
                لون شارة الفاصل:
              </span>
              <div className="flex items-center gap-2">
                {(['amber', 'emerald', 'rose', 'blue', 'purple'] as BookmarkColor[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewBookmarkColor(c)}
                    className={`w-8 h-8 rounded-full transition-all flex items-center justify-center border-2 ${
                      newBookmarkColor === c ? 'scale-110 shadow-md ring-2 ring-slate-300' : 'opacity-70 hover:opacity-100'
                    } ${
                      c === 'amber' ? 'bg-amber-400 border-amber-500' :
                      c === 'emerald' ? 'bg-emerald-500 border-emerald-600' :
                      c === 'rose' ? 'bg-rose-500 border-rose-600' :
                      c === 'blue' ? 'bg-sky-500 border-sky-600' :
                      'bg-purple-500 border-purple-600'
                    }`}
                  >
                    {newBookmarkColor === c && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* الفواصل الموجودة مسبقاً على هذه الصفحة */}
            {currentPageBookmarks.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <span className="text-[10px] font-black text-slate-500 block header-font">
                  الفواصل المحفوظة مسبقاً على صفحة {currentPage}:
                </span>
                <div className="space-y-1">
                  {currentPageBookmarks.map(bm => (
                    <div key={bm.id} className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-100 text-xs">
                      <span className="font-bold text-slate-700">{bm.title}</span>
                      <button
                        onClick={() => handleRemoveBookmark(bm.id)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                        title="حذف هذا الفاصل"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* أزرار الحفظ والإلغاء */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleSaveNewBookmark}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black header-font text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Bookmark className="w-4 h-4 fill-white" />
                <span>حفظ الفاصل 🔖</span>
              </button>
              <button
                type="button"
                onClick={() => setShowBookmarkModal(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold header-font text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة فهرس المصحف الشريف (السور والأجزاء والفواصل المسمّاة) */}
      {showIndexModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[88vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-emerald-800 text-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-300" />
                  <h3 className="font-black text-sm header-font">فهرس المصحف الشريف</h3>
                </div>
                <button
                  onClick={() => setShowIndexModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full text-emerald-100 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={indexSearchQuery}
                  onChange={(e) => setIndexSearchQuery(e.target.value)}
                  placeholder="ابحث عن اسم السورة، الجزء، أو رقم الصفحة..."
                  className="w-full bg-white/15 border border-white/20 rounded-2xl p-2.5 pr-9 text-xs text-white placeholder:text-white/60 outline-none focus:bg-white/25 transition-all header-font"
                />
                <Search className="w-4 h-4 text-white/70 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                {indexSearchQuery && (
                  <button
                    onClick={() => setIndexSearchQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1 bg-black/20 p-1 rounded-2xl">
                <button
                  onClick={() => setIndexTab('surahs')}
                  className={`py-2 rounded-xl text-xs font-black header-font transition-all ${
                    indexTab === 'surahs' ? 'bg-white text-emerald-900 shadow-sm' : 'text-white/80 hover:text-white'
                  }`}
                >
                  السور (١١٤)
                </button>
                <button
                  onClick={() => setIndexTab('juzs')}
                  className={`py-2 rounded-xl text-xs font-black header-font transition-all ${
                    indexTab === 'juzs' ? 'bg-white text-emerald-900 shadow-sm' : 'text-white/80 hover:text-white'
                  }`}
                >
                  الأجزاء (٣٠)
                </button>
                <button
                  onClick={() => setIndexTab('bookmarks')}
                  className={`py-2 rounded-xl text-xs font-black header-font transition-all flex items-center justify-center gap-1 ${
                    indexTab === 'bookmarks' ? 'bg-white text-emerald-900 shadow-sm' : 'text-white/80 hover:text-white'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>الفواصل ({bookmarks.length})</span>
                </button>
              </div>
            </div>

            <div className="p-3 overflow-y-auto flex-1 divide-y divide-slate-100">
              {indexTab === 'surahs' && (
                <div className="space-y-1">
                  {filteredSurahs.map((surah) => (
                    <button
                      key={surah.id}
                      onClick={() => goToPage(surah.page)}
                      className={`w-full p-3 rounded-2xl hover:bg-emerald-50/70 transition-all flex items-center justify-between text-right ${
                        currentSurah.id === surah.id ? 'bg-emerald-50 border border-emerald-200' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-mono font-black shrink-0">
                          {surah.id}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-xs header-font text-slate-800">سورة {surah.name}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-500">
                              {surah.type}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {surah.totalAyahs} آية
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                          ص {surah.page}
                        </span>
                        <ChevronLeft className="w-4 h-4 text-slate-300" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {indexTab === 'juzs' && (
                <div className="space-y-1">
                  {filteredJuzs.map((juz) => (
                    <button
                      key={juz.id}
                      onClick={() => goToPage(juz.startPage)}
                      className={`w-full p-3 rounded-2xl hover:bg-emerald-50/70 transition-all flex items-center justify-between text-right ${
                        currentJuz.id === juz.id ? 'bg-emerald-50 border border-emerald-200' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-mono font-black shrink-0">
                          {juz.id}
                        </div>
                        <div>
                          <h4 className="font-black text-xs header-font text-slate-800">{juz.name}</h4>
                          <p className="text-[10px] text-slate-500 font-bold truncate max-w-[200px] sm:max-w-xs">
                            {juz.popularName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                          ص {juz.startPage} - {juz.endPage}
                        </span>
                        <ChevronLeft className="w-4 h-4 text-slate-300" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {indexTab === 'bookmarks' && (
                <div className="space-y-2 py-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-700 header-font">
                      جميع الفواصل المحفوظة ({bookmarks.length})
                    </span>
                    <button
                      onClick={handleOpenAddBookmark}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl text-xs font-black header-font flex items-center gap-1 shadow-2xs"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>إضافة فاصل جديد</span>
                    </button>
                  </div>

                  {bookmarks.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                      <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-black text-slate-600 header-font">لا توجد فواصل قراءة محفوظة بعد</p>
                      <p className="text-[10px] text-slate-400">انقر على زر «إضافة فاصل» لتسمية فاصل خاص لورد الحفظ، التلاوة، أو التدبر والرجوع إليه دائماً.</p>
                    </div>
                  ) : (
                    bookmarks.map((bm) => {
                      const colorInfo = COLOR_CLASSES[bm.color || 'amber'];
                      const isEditing = editingBookmarkId === bm.id;

                      return (
                        <div
                          key={bm.id}
                          onClick={() => {
                            if (!isEditing) goToPage(bm.page);
                          }}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer group ${
                            bm.page === currentPage ? 'bg-amber-50/80 border-amber-200' : 'bg-slate-50 hover:bg-emerald-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${colorInfo.bg} ${colorInfo.border}`}>
                              <Bookmark className={`w-4 h-4 ${colorInfo.fill}`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              {isEditing ? (
                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="text"
                                    value={editBookmarkTitle}
                                    onChange={(e) => setEditBookmarkTitle(e.target.value)}
                                    className="px-2 py-1 bg-white border border-emerald-400 rounded-lg text-xs font-bold w-full outline-none"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleSaveEditBookmark(bm.id)}
                                    className="p-1.5 bg-emerald-600 text-white rounded-lg"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingBookmarkId(null)}
                                    className="p-1.5 bg-slate-200 text-slate-600 rounded-lg"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <h4 className="font-black text-xs header-font text-slate-800 truncate group-hover:text-emerald-800">
                                    {bm.title}
                                  </h4>
                                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                                    صفحة {bm.page} • سورة {bm.surahName} • {bm.date}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 mr-2">
                            <button
                              onClick={(e) => handleStartEditBookmark(bm, e)}
                              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                              title="تعديل اسم الفاصل"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleRemoveBookmark(bm.id, e)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              title="حذف هذا الفاصل"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:-translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
