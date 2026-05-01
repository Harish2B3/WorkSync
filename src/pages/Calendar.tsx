import { Layout } from '../components/Layout';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { tasksApi } from '../services/api';

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    // get tasks
    tasksApi.getTasks().then(setTasks);
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // dates array
  const days = [];
  
  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, isCurrentMonth: false, date: new Date(currentYear, currentMonth - 1, prevMonthDays - i) });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true, date: new Date(currentYear, currentMonth, i) });
  }

  // Next month leading days to fill grid to 42
  const remainingDays = 42 - days.length; // usually 6 rows
  if (remainingDays < 7) { 
     // just fill the last row
     for (let i = 1; i <= remainingDays; i++) {
       days.push({ day: i, isCurrentMonth: false, date: new Date(currentYear, currentMonth + 1, i) });
     }
  } else if (days.length <= 35) {
     for (let i = 1; i <= remainingDays; i++) {
       days.push({ day: i, isCurrentMonth: false, date: new Date(currentYear, currentMonth + 1, i) });
     }
  } else {
     // sometimes we only need 35, let's just make it exact 35 or 42 based on content
     const toAdd = days.length > 35 ? (42 - days.length) : (35 - days.length);
     for (let i = 1; i <= toAdd; i++) {
       days.push({ day: i, isCurrentMonth: false, date: new Date(currentYear, currentMonth + 1, i) });
     }
  }

  const formatYMD = (date: Date) => {
     return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const isSameDate = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  };

  // get tasks for selected date
  const selectedTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    const taskDate = new Date(t.dueDate);
    return isSameDate(taskDate, selectedDate);
  });
  
  // track which dates have tasks to show an indicator
  const datesWithTasks = new Set(tasks.filter(t => t.dueDate).map(t => {
    const d = new Date(t.dueDate);
    return formatYMD(d);
  }));

  const isToday = (d: Date) => isSameDate(d, new Date());

  return (
    <Layout>
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 flex flex-col w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Calendar</h2>
        
        <div className="flex flex-col lg:flex-row gap-8 items-stretch w-full">
           {/* Date Picker */}
           <div className="w-full lg:w-[50%] lg:pr-8 lg:border-r border-gray-100 flex flex-col">
               <div className="flex justify-between items-center mb-6 px-2">
                 <button onClick={handlePrevMonth} className="border border-gray-200 rounded-full w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                   <ChevronLeft size={20}/>
                 </button>
                 <span className="font-bold text-gray-900 text-[17px]">{monthNames[currentMonth]} {currentYear}</span>
                 <button onClick={handleNextMonth} className="border border-gray-200 rounded-full w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                   <ChevronRight size={20}/>
                 </button>
               </div>
               
               <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-400 mb-4 tracking-wider">
                 <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
               </div>
               
               <div className="grid grid-cols-7 text-center text-[15px] text-gray-700 gap-y-4 gap-x-0 font-medium relative">
                  {days.map((d, i) => {
                    const isSelected = isSameDate(d.date, selectedDate);
                    const isNow = isToday(d.date);
                    const hasTasks = datesWithTasks.has(formatYMD(d.date));
                    
                    return (
                       <div key={i} className="flex justify-center relative">
                          <button
                            onClick={() => setSelectedDate(d.date)}
                            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all relative z-10 ${
                              !d.isCurrentMonth ? 'text-gray-300' :
                              isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 font-bold scale-105' :
                              isNow ? 'text-blue-600 font-bold hover:bg-blue-50' :
                              'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                             {d.day}
                             
                             {hasTasks && !isSelected && (
                                <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isNow ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                             )}
                          </button>
                       </div>
                    );
                  })}
               </div>
           </div>
           
           {/* Right column */}
           <div className="w-full lg:w-[50%] lg:pl-6 flex flex-col pt-8 lg:pt-0 border-t lg:border-t-0 border-gray-100 mt-6 lg:mt-0">
              <div className="mb-6 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-lg">
                  {isToday(selectedDate) ? 'Today' : selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md">
                   {selectedTasks.length} {selectedTasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-3">
                  {selectedTasks.map(t => (
                    <div key={t.id} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col justify-between items-start hover:border-gray-200 transition-colors">
                      <div className="flex justify-between items-start w-full mb-2">
                        <h4 className="font-bold text-sm text-gray-900">{t.title}</h4>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md ml-2 flex-shrink-0 ${
                            t.status === 'pending' ? 'bg-gray-100 text-gray-600' : 
                            t.status === 'in_progress' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                        }`}>
                          {t.status === 'pending' ? 'Pending' : t.status === 'in_progress' ? 'In Progress' : 'Completed'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{t.description || 'No description'}</p>
                    </div>
                  ))}
                  
                  {selectedTasks.length === 0 && (
                     <div className="py-12 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                        <p className="text-sm font-medium">No tasks assigned for this date</p>
                     </div>
                  )}
                </div>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  )
}
