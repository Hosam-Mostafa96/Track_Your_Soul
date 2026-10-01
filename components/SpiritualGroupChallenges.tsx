import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Trophy,
  Flame,
  Sparkles,
  Plus,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronLeft,
  Search,
  KeyRound,
  Shield,
  ThumbsUp,
  X,
  Target,
  Crown,
  Medal,
  BookOpen,
  Moon,
  Sunrise,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { User, DailyLog } from '../types';
import confetti from 'canvas-confetti';

export interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  contribution: number;
  streak: number;
  isCurrentUser?: boolean;
  joinedAt: string;
  cheersReceived: number;
}

export interface GroupChallenge {
  id: string;
  title: string;
  category: 'prayer' | 'quran' | 'athkar' | 'nawafil' | 'fasting' | 'general';
  description: string;
  iconName: string;
  targetValue: number;
  unit: string;
  currentProgress: number;
  membersCount: number;
  members: GroupMember[];
  durationDays: number;
  daysRemaining: number;
  inviteCode: string;
  isJoined: boolean;
  userContribution: number;
  createdBy: string;
  isOfficial?: boolean;
}

const STORAGE_KEY = 'worship_group_challenges_v1';

const INITIAL_CHALLENGES: GroupChallenge[] = [
  {
    id: 'fajr_knights',
    title: 'فرسان صلاة الفجر في جماعة 🕌',
    category: 'prayer',
    description: 'المحافظة على صلاة الفجر في جماعة المسجد والتنافس على نور يوم القيامة التام.',
    iconName: 'Sunrise',
    targetValue: 120,
    unit: 'صلاة فجر جماعية',
    currentProgress: 88,
    membersCount: 18,
    durationDays: 14,
    daysRemaining: 5,
    inviteCode: 'FAJR-14',
    isJoined: false,
    userContribution: 0,
    createdBy: 'إدارة المحراب',
    isOfficial: true,
    members: [
      { id: 'm1', name: 'أبو بكر الصديق (محب)', score: 980, contribution: 14, streak: 14, joinedAt: '2026-09-18', cheersReceived: 24 },
      { id: 'm2', name: 'عبد الرحمن السبيعي', score: 890, contribution: 12, streak: 12, joinedAt: '2026-09-19', cheersReceived: 18 },
      { id: 'm3', name: 'عمر الفاروق', score: 810, contribution: 11, streak: 11, joinedAt: '2026-09-18', cheersReceived: 15 },
      { id: 'm4', name: 'أحمد إبراهيم', score: 720, contribution: 10, streak: 9, joinedAt: '2026-09-20', cheersReceived: 9 },
      { id: 'm5', name: 'طارق زياد', score: 650, contribution: 9, streak: 8, joinedAt: '2026-09-20', cheersReceived: 7 }
    ]
  },
  {
    id: 'quran_khatmah',
    title: 'أهل القرآن - ختمة جماعية مباركة 📖',
    category: 'quran',
    description: 'قراءة وتدبر ٦٠٤ صفحات من كتاب الله كفريق واحد لختم القرآن معاً هذا الأسبوع.',
    iconName: 'BookOpen',
    targetValue: 604,
    unit: 'صفحة مقروءة',
    currentProgress: 432,
    membersCount: 24,
    durationDays: 7,
    daysRemaining: 2,
    inviteCode: 'QURAN-604',
    isJoined: false,
    userContribution: 0,
    createdBy: 'إدارة المحراب',
    isOfficial: true,
    members: [
      { id: 'q1', name: 'سلمان الفارسي', score: 1420, contribution: 60, streak: 7, joinedAt: '2026-09-24', cheersReceived: 32 },
      { id: 'q2', name: 'فاطمة الزهراء', score: 1150, contribution: 55, streak: 7, joinedAt: '2026-09-24', cheersReceived: 21 },
      { id: 'q3', name: 'مصعب بن عمير', score: 990, contribution: 48, streak: 6, joinedAt: '2026-09-25', cheersReceived: 14 },
      { id: 'q4', name: 'يوسف الصديق', score: 840, contribution: 40, streak: 5, joinedAt: '2026-09-25', cheersReceived: 11 }
    ]
  },
  {
    id: 'million_tasbeeh',
    title: 'سباق المليون تسبيحة واستغفار 📿',
    category: 'athkar',
    description: 'تعمير الأوقات بذكر الله، التهليل، الصلاة على النبي ﷺ، والتسبيح كركب ذاكر لله كثيراً.',
    iconName: 'Sparkles',
    targetValue: 50000,
    unit: 'تسبيحة واستغفار',
    currentProgress: 36800,
    membersCount: 35,
    durationDays: 7,
    daysRemaining: 3,
    inviteCode: 'DHIKR-50K',
    isJoined: false,
    userContribution: 0,
    createdBy: 'إدارة المحراب',
    isOfficial: true,
    members: [
      { id: 'd1', name: 'معاذ بن جبل', score: 2100, contribution: 6500, streak: 7, joinedAt: '2026-09-24', cheersReceived: 45 },
      { id: 'd2', name: 'خديجة الكبرى', score: 1840, contribution: 5200, streak: 6, joinedAt: '2026-09-24', cheersReceived: 38 },
      { id: 'd3', name: 'أبو هريرة', score: 1600, contribution: 4800, streak: 7, joinedAt: '2026-09-25', cheersReceived: 29 },
      { id: 'd4', name: 'عبد الله بن مسعود', score: 1400, contribution: 3900, streak: 5, joinedAt: '2026-09-25', cheersReceived: 19 }
    ]
  },
  {
    id: 'qiyam_nights',
    title: 'ركب المستغفرين بالأسحار وقيام الليل 🌙',
    category: 'nawafil',
    description: 'إحياء الثلث الأخير من الليل بركعات خاشعة والوتر والتنافس على شرف المؤمن.',
    iconName: 'Moon',
    targetValue: 50,
    unit: 'ليلة قيام وتهجد',
    currentProgress: 34,
    membersCount: 15,
    durationDays: 10,
    daysRemaining: 4,
    inviteCode: 'QIYAM-10',
    isJoined: false,
    userContribution: 0,
    createdBy: 'إدارة المحراب',
    isOfficial: true,
    members: [
      { id: 'l1', name: 'عثمان ذو النورين', score: 1500, contribution: 8, streak: 8, joinedAt: '2026-09-21', cheersReceived: 28 },
      { id: 'l2', name: 'عائشة أم المؤمنين', score: 1350, contribution: 7, streak: 7, joinedAt: '2026-09-21', cheersReceived: 24 },
      { id: 'l3', name: 'بلال بن رباح', score: 1100, contribution: 6, streak: 6, joinedAt: '2026-09-22', cheersReceived: 17 }
    ]
  },
  {
    id: 'sunnah_fasting',
    title: 'أهل الصيام - الإثنين والخميس 🌾',
    category: 'fasting',
    description: 'مجاهدة النفس بالصوم التطوعي لنيل أجر مباعدة الوجه عن النار سبعين خريفاً.',
    iconName: 'Flame',
    targetValue: 40,
    unit: 'يوم صيام تطوعي',
    currentProgress: 26,
    membersCount: 19,
    durationDays: 14,
    daysRemaining: 6,
    inviteCode: 'SAWM-40',
    isJoined: false,
    userContribution: 0,
    createdBy: 'إدارة المحراب',
    isOfficial: true,
    members: [
      { id: 's1', name: 'داود عليه السلام', score: 1250, contribution: 5, streak: 4, joinedAt: '2026-09-17', cheersReceived: 22 },
      { id: 's2', name: 'حمزة سيد الشهداء', score: 1100, contribution: 4, streak: 4, joinedAt: '2026-09-18', cheersReceived: 18 }
    ]
  }
];

interface SpiritualGroupChallengesProps {
  user: User | null;
  currentScore?: number;
  onNavigateTab?: (tab: string) => void;
}

export const SpiritualGroupChallenges: React.FC<SpiritualGroupChallengesProps> = ({
  user,
  currentScore = 0,
  onNavigateTab
}) => {
  const [challenges, setChallenges] = useState<GroupChallenge[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CHALLENGES;
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'my_groups' | 'prayer' | 'quran' | 'athkar' | 'nawafil'>('all');
  const [selectedChallenge, setSelectedChallenge] = useState<GroupChallenge | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinByCodeModal, setShowJoinByCodeModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [contributionInput, setContributionInput] = useState<string>('1');
  const [showAddContributionModal, setShowAddContributionModal] = useState(false);

  // New challenge form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'prayer' | 'quran' | 'athkar' | 'nawafil' | 'fasting'>('prayer');
  const [newDescription, setNewDescription] = useState('');
  const [newTarget, setNewTarget] = useState('100');
  const [newUnit, setNewUnit] = useState('عمل صالح');
  const [newDays, setNewDays] = useState('7');

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
    } catch (e) {
      console.error(e);
    }
  }, [challenges]);

  // تحديث مساهمة المستخدم الحالي إذا كان مسجلاً بالاسم
  const myJoinedChallengesCount = useMemo(() => {
    return challenges.filter(c => c.isJoined).length;
  }, [challenges]);

  // تصفية التحديات المعروضة
  const filteredChallenges = useMemo(() => {
    if (activeFilter === 'my_groups') {
      return challenges.filter(c => c.isJoined);
    }
    if (activeFilter === 'all') {
      return challenges;
    }
    return challenges.filter(c => c.category === activeFilter);
  }, [challenges, activeFilter]);

  // الانضمام لتحدٍ
  const handleJoinChallenge = (challengeId: string) => {
    const userName = user?.name || 'أنا';
    const userEmail = user?.email || 'me@local';

    setChallenges(prev => prev.map(c => {
      if (c.id === challengeId) {
        if (c.isJoined) return c;
        const newMember: GroupMember = {
          id: 'user_me_' + Date.now(),
          name: userName,
          score: currentScore || 100,
          contribution: 1,
          streak: 1,
          isCurrentUser: true,
          joinedAt: new Date().toISOString().split('T')[0],
          cheersReceived: 1
        };
        const updatedMembers = [newMember, ...c.members];
        return {
          ...c,
          isJoined: true,
          membersCount: c.membersCount + 1,
          currentProgress: c.currentProgress + 1,
          userContribution: 1,
          members: updatedMembers
        };
      }
      return c;
    }));

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  // مغادرة التحدي
  const handleLeaveChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(c => {
      if (c.id === challengeId && c.isJoined) {
        return {
          ...c,
          isJoined: false,
          membersCount: Math.max(1, c.membersCount - 1),
          currentProgress: Math.max(0, c.currentProgress - (c.userContribution || 0)),
          userContribution: 0,
          members: c.members.filter(m => !m.isCurrentUser)
        };
      }
      return c;
    }));

    if (selectedChallenge && selectedChallenge.id === challengeId) {
      setSelectedChallenge(prev => prev ? {
        ...prev,
        isJoined: false,
        membersCount: Math.max(1, prev.membersCount - 1),
        currentProgress: Math.max(0, prev.currentProgress - (prev.userContribution || 0)),
        userContribution: 0,
        members: prev.members.filter(m => !m.isCurrentUser)
      } : null);
    }
  };

  // إضافة مساهمة إلى التحدي
  const handleAddContribution = (challengeId: string, amount: number) => {
    if (amount <= 0) return;

    setChallenges(prev => prev.map(c => {
      if (c.id === challengeId) {
        const newProgress = c.currentProgress + amount;
        const newContrib = (c.userContribution || 0) + amount;
        const updatedMembers = c.members.map(m => {
          if (m.isCurrentUser) {
            return {
              ...m,
              contribution: m.contribution + amount,
              score: m.score + amount * 10
            };
          }
          return m;
        }).sort((a, b) => b.contribution - a.contribution);

        return {
          ...c,
          currentProgress: newProgress,
          userContribution: newContrib,
          members: updatedMembers
        };
      }
      return c;
    }));

    if (selectedChallenge && selectedChallenge.id === challengeId) {
      setSelectedChallenge(prev => {
        if (!prev) return null;
        const newProgress = prev.currentProgress + amount;
        const newContrib = (prev.userContribution || 0) + amount;
        const updatedMembers = prev.members.map(m => {
          if (m.isCurrentUser) {
            return {
              ...m,
              contribution: m.contribution + amount,
              score: m.score + amount * 10
            };
          }
          return m;
        }).sort((a, b) => b.contribution - a.contribution);

        return {
          ...prev,
          currentProgress: newProgress,
          userContribution: newContrib,
          members: updatedMembers
        };
      });
    }

    setShowAddContributionModal(false);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // تشجيع عضو في المجموعة
  const handleCheerMember = (challengeId: string, memberId: string) => {
    setChallenges(prev => prev.map(c => {
      if (c.id === challengeId) {
        return {
          ...c,
          members: c.members.map(m => {
            if (m.id === memberId) {
              return { ...m, cheersReceived: m.cheersReceived + 1 };
            }
            return m;
          })
        };
      }
      return c;
    }));

    if (selectedChallenge && selectedChallenge.id === challengeId) {
      setSelectedChallenge(prev => {
        if (!prev) return null;
        return {
          ...prev,
          members: prev.members.map(m => {
            if (m.id === memberId) {
              return { ...m, cheersReceived: m.cheersReceived + 1 };
            }
            return m;
          })
        };
      });
    }
  };

  // نسخ رمز الدعوة
  const handleCopyCode = (code: string, id: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // الانضمام برمز الدعوة
  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');
    const clean = joinCodeInput.trim().toUpperCase();
    if (!clean) {
      setCodeError('يرجى كتابة رمز الدعوة');
      return;
    }

    const found = challenges.find(c => c.inviteCode.toUpperCase() === clean);
    if (!found) {
      setCodeError('رمز الدعوة غير صحيح أو لم يتم العثور على التحدي');
      return;
    }

    if (found.isJoined) {
      setCodeError('أنت منضم بالفعل إلى هذا التحدي المبارك!');
      return;
    }

    handleJoinChallenge(found.id);
    setSelectedChallenge(found);
    setShowJoinByCodeModal(false);
    setJoinCodeInput('');
  };

  // إنشاء تحدٍ جديد
  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const code = `MIHRAB-${Math.floor(1000 + Math.random() * 9000)}`;
    const targetVal = Number(newTarget) || 50;
    const days = Number(newDays) || 7;

    const newGroup: GroupChallenge = {
      id: `custom_${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      description: newDescription.trim() || 'تحدٍ روحي جماعي للتنافس في مرضاة الله وبناء السنن والفرائض.',
      iconName: newCategory === 'prayer' ? 'Sunrise' : newCategory === 'quran' ? 'BookOpen' : newCategory === 'athkar' ? 'Sparkles' : newCategory === 'fasting' ? 'Flame' : 'Moon',
      targetValue: targetVal,
      unit: newUnit.trim() || 'عمل صالح',
      currentProgress: 1,
      membersCount: 1,
      durationDays: days,
      daysRemaining: days,
      inviteCode: code,
      isJoined: true,
      userContribution: 1,
      createdBy: user?.name || 'أنت',
      isOfficial: false,
      members: [
        {
          id: 'user_creator_' + Date.now(),
          name: user?.name || 'أنت (منشئ التحدي)',
          score: currentScore || 100,
          contribution: 1,
          streak: 1,
          isCurrentUser: true,
          joinedAt: new Date().toISOString().split('T')[0],
          cheersReceived: 1
        }
      ]
    };

    setChallenges(prev => [newGroup, ...prev]);
    setShowCreateModal(false);
    setSelectedChallenge(newGroup);

    // Reset fields
    setNewTitle('');
    setNewDescription('');
    setNewTarget('100');

    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const renderChallengeIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case 'Sunrise': return <Sunrise className={className} />;
      case 'BookOpen': return <BookOpen className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Moon': return <Moon className={className} />;
      case 'Flame': return <Flame className={className} />;
      default: return <Target className={className} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. الترويسة وبطاقة شحذ الهمم الجماعية */}
      <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 rounded-[2.5rem] p-6 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl -translate-y-12 translate-x-12"></div>
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-emerald-400/10 rounded-full blur-xl translate-y-10 -translate-x-10"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 bg-white/10 rounded-xl backdrop-blur-sm text-yellow-300">
                <Users className="w-5 h-5" />
              </span>
              <span className="text-xs font-black text-amber-300 header-font tracking-wide">
                «يَدُ اللَّهِ مَعَ الْجَمَاعَةِ»
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black header-font text-white leading-tight">
              التحديات الروحية الجماعية
            </h2>
            <p className="text-xs text-emerald-100/90 font-bold mt-1 max-w-lg leading-relaxed">
              انضم لمجموعات العبادة، وتنافس في الخيرات مع إخوانك وأهلك، وتتبعوا تقدمكم التراكمي خطوة بخطوة.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowJoinByCodeModal(true)}
              className="py-2 px-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black header-font flex items-center gap-1.5 transition-all active:scale-95 border border-white/15 backdrop-blur-sm"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-300" />
              <span>انضم برمز دعوة</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="py-2 px-3.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-emerald-950 rounded-xl text-xs font-black header-font flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>إنشاء تحدٍ جديد</span>
            </button>
          </div>
        </div>

        {/* إحصائيات سريعة في الشريط السفلي */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10 text-center">
          <div>
            <span className="text-[10px] text-emerald-200/80 font-bold block">مجموعاتي المنضم لها</span>
            <span className="text-base sm:text-lg font-black font-mono text-yellow-300">{myJoinedChallengesCount}</span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-200/80 font-bold block">إجمالي التحديات</span>
            <span className="text-base sm:text-lg font-black font-mono text-white">{challenges.length}</span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-200/80 font-bold block">روح المنافسة</span>
            <span className="text-base sm:text-lg font-black header-font text-emerald-200">سَابِقُوا ⚡</span>
          </div>
        </div>
      </div>

      {/* 2. شريط الفلاتر والتبويبات */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-full shrink-0 transition-all ${
            activeFilter === 'all'
              ? 'bg-emerald-600 text-white shadow-xs font-black'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
          }`}
        >
          كافة التحديات ({challenges.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('my_groups')}
          className={`px-3 py-1.5 rounded-full shrink-0 transition-all flex items-center gap-1 ${
            activeFilter === 'my_groups'
              ? 'bg-emerald-600 text-white shadow-xs font-black'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
          }`}
        >
          <Users className="w-3 h-3 text-amber-500" />
          <span>مجموعاتي النشطة</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-100 text-amber-900 font-mono">
            {myJoinedChallengesCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('prayer')}
          className={`px-3 py-1.5 rounded-full shrink-0 transition-all ${
            activeFilter === 'prayer'
              ? 'bg-emerald-600 text-white shadow-xs font-black'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
          }`}
        >
          صلوات الفجر والجماعة
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('quran')}
          className={`px-3 py-1.5 rounded-full shrink-0 transition-all ${
            activeFilter === 'quran'
              ? 'bg-emerald-600 text-white shadow-xs font-black'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
          }`}
        >
          الختمات القرآنية
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('athkar')}
          className={`px-3 py-1.5 rounded-full shrink-0 transition-all ${
            activeFilter === 'athkar'
              ? 'bg-emerald-600 text-white shadow-xs font-black'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
          }`}
        >
          الأذكار والتسبيح
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('nawafil')}
          className={`px-3 py-1.5 rounded-full shrink-0 transition-all ${
            activeFilter === 'nawafil'
              ? 'bg-emerald-600 text-white shadow-xs font-black'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
          }`}
        >
          قيام الليل والنوافل
        </button>
      </div>

      {/* 3. شبكة بطاقات التحديات الجماعية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredChallenges.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">لا توجد تحديات في هذا القسم حالياً</p>
            <p className="text-[10px] text-slate-400 mt-1">يمكنك إنشاء تحدٍ جديد أو الانضمام برمز دعوة</p>
          </div>
        ) : (
          filteredChallenges.map(c => {
            const pct = Math.min(100, Math.round((c.currentProgress / c.targetValue) * 100));
            const isCompleted = c.currentProgress >= c.targetValue;

            return (
              <div
                key={c.id}
                className={`bg-white rounded-3xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between ${
                  c.isJoined
                    ? 'border-emerald-300 shadow-md ring-1 ring-emerald-200'
                    : 'border-slate-100 hover:border-emerald-200 shadow-xs'
                }`}
              >
                <div>
                  {/* رأس بطاقة التحدي */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                        c.isJoined ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {renderChallengeIcon(c.iconName, 'w-6 h-6')}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-black text-slate-800 text-sm header-font truncate">
                            {c.title}
                          </h3>
                          {c.isOfficial && (
                            <span className="px-1.5 py-0.2 rounded-full text-[8.5px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                              رسمي
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5 truncate">
                          بإشراف: {c.createdBy} • مدة التحدي: {c.durationDays} أيام
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-left">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3 h-3" />
                        <span>متبقٍ {c.daysRemaining} أيام</span>
                      </span>
                    </div>
                  </div>

                  {/* وصف التحدي */}
                  <p className="text-xs text-slate-600 font-normal leading-relaxed mb-3.5">
                    {c.description}
                  </p>

                  {/* شريط الإنجاز الجماعي */}
                  <div className="space-y-1.5 mb-4 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        <span>تقدم الفريق الجماعي:</span>
                      </span>
                      <span className="font-mono font-black text-emerald-700 text-xs">
                        {c.currentProgress.toLocaleString()} / {c.targetValue.toLocaleString()} {c.unit} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isCompleted
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : pct >= 50
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* حالة المستخدم والأعضاء */}
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5 rtl:space-x-reverse overflow-hidden">
                        {c.members.slice(0, 3).map((m, idx) => (
                          <div
                            key={m.id}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white text-white ${
                              idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-teal-500' : 'bg-emerald-500'
                            }`}
                            title={m.name}
                          >
                            {m.name.charAt(0)}
                          </div>
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-500 font-bold">
                        {c.membersCount} عابد مشارك
                      </span>
                    </div>

                    {c.isJoined ? (
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        مساهمتك: {c.userContribution || 0} {c.unit}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold">
                        لم تنضم بعد
                      </span>
                    )}
                  </div>
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex items-center gap-2 pt-3">
                  {c.isJoined ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedChallenge(c);
                          setShowAddContributionModal(true);
                        }}
                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black header-font flex items-center justify-center gap-1.5 shadow-xs transition-all"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>سجّل إنجازك اليوم</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedChallenge(c)}
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold header-font transition-all"
                      >
                        لوحة الشرف
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleJoinChallenge(c.id)}
                        className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white rounded-xl text-xs font-black header-font flex items-center justify-center gap-1.5 shadow-xs transition-all"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>انضم للتحدي الآن</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedChallenge(c)}
                        className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold header-font transition-all"
                      >
                        التفاصيل
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => handleCopyCode(c.inviteCode, c.id)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl border border-slate-100 transition-all shrink-0"
                    title="نسخ رمز الدعوة"
                  >
                    {copiedId === c.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. نافذة تفاصيل التحدي ولوحة شرف الأعضاء (Modal) */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-6 shadow-2xl relative border border-slate-100 my-8">
            <button
              onClick={() => setSelectedChallenge(null)}
              className="absolute top-5 left-5 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* رأس النافذة */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                {renderChallengeIcon(selectedChallenge.iconName, 'w-6 h-6')}
              </div>
              <div className="min-w-0 pr-2">
                <h3 className="font-black text-slate-900 text-base header-font">
                  {selectedChallenge.title}
                </h3>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                  رمز الدعوة: <span className="font-mono text-emerald-700 font-black">{selectedChallenge.inviteCode}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-normal leading-relaxed mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              {selectedChallenge.description}
            </p>

            {/* تقدم المجموعة */}
            <div className="space-y-1.5 mb-5 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>الهدف التراكمي للفريق:</span>
                </span>
                <span className="font-mono font-black text-emerald-800 text-sm">
                  {selectedChallenge.currentProgress} / {selectedChallenge.targetValue} {selectedChallenge.unit}
                </span>
              </div>
              <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((selectedChallenge.currentProgress / selectedChallenge.targetValue) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 font-bold">
                <span>المشاركون: {selectedChallenge.membersCount} عابد</span>
                <span>المتبقي: {selectedChallenge.daysRemaining} أيام</span>
              </div>
            </div>

            {/* لوحة شرف أعضاء التحدي والمساهمات */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-slate-800 header-font flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span>لوحة شرف الفريق ({selectedChallenge.members.length} عضو)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-bold">
                  انقر على 👏 لتشجيع إخوانك
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {selectedChallenge.members.map((m, index) => {
                  const isFirst = index === 0;
                  const isSecond = index === 1;
                  const isThird = index === 2;

                  return (
                    <div
                      key={m.id}
                      className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2 transition-all ${
                        m.isCurrentUser
                          ? 'bg-emerald-600 text-white border-transparent shadow-sm'
                          : isFirst
                          ? 'bg-amber-50/70 border-amber-200'
                          : 'bg-slate-50/70 border-slate-100 hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          m.isCurrentUser
                            ? 'bg-white/20 text-white'
                            : isFirst
                            ? 'bg-amber-500 text-white'
                            : isSecond
                            ? 'bg-slate-300 text-slate-800'
                            : isThird
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {index + 1}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className={`text-xs font-black truncate ${m.isCurrentUser ? 'text-white' : 'text-slate-800'}`}>
                              {m.name}
                            </span>
                            {m.isCurrentUser && (
                              <span className="px-1 py-0.2 rounded text-[8px] bg-white/20 text-white font-bold">
                                أنت
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] font-bold block ${m.isCurrentUser ? 'text-emerald-100' : 'text-slate-400'}`}>
                            المساهمة: {m.contribution} {selectedChallenge.unit}
                          </span>
                        </div>
                      </div>

                      {/* زر التشجيع والهمة */}
                      <button
                        type="button"
                        onClick={() => handleCheerMember(selectedChallenge.id, m.id)}
                        className={`px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all active:scale-90 ${
                          m.isCurrentUser
                            ? 'bg-white/15 text-white hover:bg-white/25'
                            : 'bg-white hover:bg-amber-100/70 text-amber-800 border border-slate-200/80 shadow-2xs'
                        }`}
                        title="شجع هذا العضو"
                      >
                        <ThumbsUp className="w-3 h-3 text-amber-500" />
                        <span className="font-mono font-bold">{m.cheersReceived}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* أزرار الإجراء السريع أسفل المودال */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              {selectedChallenge.isJoined ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowAddContributionModal(true)}
                    className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black header-font flex items-center justify-center gap-1.5 shadow-xs transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>أضف إنجاز اليوم</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyCode(selectedChallenge.inviteCode, selectedChallenge.id)}
                    className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold header-font flex items-center gap-1.5 transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>دعوة صديق</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLeaveChallenge(selectedChallenge.id)}
                    className="py-2.5 px-3 text-rose-500 hover:bg-rose-50 rounded-xl text-xs font-bold header-font transition-all"
                    title="مغادرة التحدي"
                  >
                    مغادرة
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => handleJoinChallenge(selectedChallenge.id)}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black header-font flex items-center justify-center gap-1.5 shadow-xs transition-all"
                >
                  <Users className="w-4 h-4" />
                  <span>انضم لهذا التحدي الآن</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. نافذة تسجيل المساهمة اليومية (Modal) */}
      {showAddContributionModal && selectedChallenge && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] max-w-sm w-full p-6 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setShowAddContributionModal(false)}
              className="absolute top-4 left-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-2xs">
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-black text-slate-800 text-sm header-font">
                تسجيل إنجازك في التحدي
              </h3>
              <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                {selectedChallenge.title}
              </p>
            </div>

            <div className="space-y-3 mb-5">
              <label className="text-xs font-black text-slate-700 block">
                كم أنجزت اليوم؟ ({selectedChallenge.unit})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={contributionInput}
                  onChange={(e) => setContributionInput(e.target.value)}
                  className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono font-black text-lg text-emerald-800 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              {/* أزرار سريعة */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[1, 2, 5, 10].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setContributionInput(val.toString())}
                    className="py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg text-xs font-mono font-bold transition-colors"
                  >
                    +{val}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddContribution(selectedChallenge.id, Number(contributionInput) || 1)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black header-font shadow-xs transition-all"
              >
                تأكيد الإنجاز ⚡
              </button>
              <button
                type="button"
                onClick={() => setShowAddContributionModal(false)}
                className="py-2.5 px-4 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold header-font"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. نافذة إنشاء تحدٍ جديد (Modal) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-6 shadow-2xl relative border border-slate-100 my-8">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 left-5 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base header-font">
                  إنشاء مجموعة تحدٍ روحي
                </h3>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                  أنشئ تحدياً وشارك رمزه مع رفقائك وأهلك للتنافس معاً
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateChallenge} className="space-y-3.5">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  اسم التحدي أو المجموعة *
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: صيام الأيام البيض، ورد سورة البقرة..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  تصنيف العبادة
                </label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="prayer">الصلوات المكتوبة والسنن</option>
                  <option value="quran">القرآن الكريم وتلاوته</option>
                  <option value="athkar">الأذكار والتسبيح</option>
                  <option value="nawafil">قيام الليل وصلاة الضحى</option>
                  <option value="fasting">الصيام التطوعي</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    المستهدف الجماعي
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100000"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1">
                    وحدة القياس
                  </label>
                  <input
                    type="text"
                    placeholder="صفحة، صلاة، تسبيحة..."
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  مدة التحدي
                </label>
                <select
                  value={newDays}
                  onChange={(e) => setNewDays(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  <option value="7">أسبوع واحد (٧ أيام)</option>
                  <option value="14">أسبوعان (١٤ يوماً)</option>
                  <option value="30">شهر كامل (٣٠ يوماً)</option>
                  <option value="40">تحدي الأربعين يوماً (٤٠ يوماً)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  وصف موجز أو وصية تحفيزية
                </label>
                <textarea
                  rows={2}
                  placeholder="كلمة تشجيعية لأعضاء المجموعة..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black header-font shadow-xs transition-all"
                >
                  إطلاق التحدي وإنشاء المجموعة 🚀
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="py-2.5 px-4 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold header-font"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. نافذة الانضمام برمز دعوة (Modal) */}
      {showJoinByCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] max-w-sm w-full p-6 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => {
                setShowJoinByCodeModal(false);
                setCodeError('');
              }}
              className="absolute top-4 left-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 shadow-2xs">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="font-black text-slate-800 text-sm header-font">
                الانضمام لمجموعة بتحدٍ خاص
              </h3>
              <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                أدخل رمز الدعوة الذي استلمته من صديقك
              </p>
            </div>

            <form onSubmit={handleJoinByCode} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="مثلاً: FAJR-14 أو QURAN-604"
                  value={joinCodeInput}
                  onChange={(e) => {
                    setJoinCodeInput(e.target.value);
                    setCodeError('');
                  }}
                  className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono font-black text-sm uppercase tracking-wider text-slate-800 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
                {codeError && (
                  <p className="text-[10px] text-rose-500 font-bold text-center mt-1.5 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{codeError}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black header-font shadow-xs transition-all"
                >
                  انضم للتحدي
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinByCodeModal(false);
                    setCodeError('');
                  }}
                  className="py-2.5 px-4 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold header-font"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
