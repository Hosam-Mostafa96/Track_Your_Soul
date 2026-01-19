
import React, { useState, useMemo } from 'react';
import { 
  Library, 
  Plus, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  TrendingUp,
  Search,
  Book as BookIcon,
  ChevronRight,
  Sparkles,
  Calendar
} from 'lucide-react';
import { Book } from '../types';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface BookLibraryProps {
  books: Book[];
  onAddBook: (title: string, totalPages: number) => void;
  onDeleteBook: (id: string) => void;
  onUpdateProgress: (id: string, pages: number) => void;
}

const BookLibrary: React.FC<BookLibraryProps> = ({ books, onAddBook, onDeleteBook, onUpdateProgress }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTotal, setNewTotal] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const ongoingBooks = useMemo(() => books.filter(b => !b.isFinished), [books]);
  const finishedBooks = useMemo(() => books.filter(b => b.isFinished), [books]);

  const filteredFinished = useMemo(() => {
    return finishedBooks.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [finishedBooks, searchTerm]);

  const handleAdd = () => {
    const total = parseInt(newTotal);
    if (!newTitle.trim() || isNaN(total) || total <= 0) return;
    onAddBook(newTitle, total);
    setNewTitle('');
    setNewTotal('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* هيدر المكتبة */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <Library className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 header-font">مكتبة المحراب</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase header-font">تتبع رحلة العلم والمعرفة</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* نموذج إضافة كتاب جديد */}
      {isAdding && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-emerald-100 animate-in zoom-in duration-200">
          <h3 className="text-sm font-black text-slate-800 header-font mb-4">كتاب جديد في الرحلة</h3>
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="عنوان الكتاب.." 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:border-emerald-500 outline-none transition-all"
            />
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="إجمالي عدد الصفحات" 
                value={newTotal}
                onChange={(e) => setNewTotal(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:border-emerald-500 outline-none transition-all"
              />
              <button 
                onClick={handleAdd}
                className="px-6 bg-emerald-600 text-white rounded-xl font-bold text-xs"
              >
                إضافة
              </button>
              <button 
                onClick={() => setIsAdding(false)}
                className="px-4 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* الكتب الحالية */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <h3 className="font-bold text-slate-700 header-font text-xs uppercase tracking-widest">قيد القراءة حالياً</h3>
        </div>
        
        {ongoingBooks.length > 0 ? ongoingBooks.map(book => (
          <div key={book.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-50 rounded-xl shrink-0"><BookOpen className="w-5 h-5 text-emerald-600" /></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 leading-tight">{book.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-slate-300" />
                    <span className="text-[9px] text-slate-400 font-bold">بدأت في: {format(new Date(book.startDate), 'dd MMM yyyy', { locale: ar })}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => onDeleteBook(book.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold header-font">
                <span className="text-emerald-700">الإنجاز: {Math.round((book.currentPages / book.totalPages) * 100)}%</span>
                <span className="text-slate-400">{book.currentPages} / {book.totalPages} صفحة</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000" 
                  style={{ width: `${(book.currentPages / book.totalPages) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )) : (
          <div className="py-10 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-xs text-slate-400 font-bold header-font">لا يوجد مشاريع قراءة جارية</p>
          </div>
        )}
      </div>

      {/* سجل الكتب المقروءة */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-700 header-font text-xs uppercase tracking-widest">منتهى القراءة ({finishedBooks.length})</h3>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />
            <input 
              type="text" 
              placeholder="بحث.." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border-none rounded-lg py-1 pl-2 pr-7 text-[10px] font-bold outline-none focus:ring-1 focus:ring-emerald-200 w-24"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filteredFinished.length > 0 ? filteredFinished.map(book => (
            <div key={book.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between group hover:border-emerald-200 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-emerald-50 transition-colors"><BookIcon className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" /></div>
                <div>
                  <h5 className="text-xs font-bold text-slate-700">{book.title}</h5>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[8px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> {format(new Date(book.finishDate!), 'MMMM yyyy', { locale: ar })}</span>
                    <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{book.totalPages} صفحة</span>
                  </div>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-amber-400 opacity-40" />
            </div>
          )) : (
            <div className="py-8 text-center text-slate-300 font-bold header-font text-[10px]">لم يتم العثور على كتب منتهية</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookLibrary;
