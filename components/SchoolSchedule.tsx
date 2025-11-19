import React, { useState } from 'react';
import type { AllSchedules, ChildSchedule, Reminder, Theme } from '../types';

interface SchoolScheduleProps {
    schedules: AllSchedules;
    setSchedules: React.Dispatch<React.SetStateAction<AllSchedules>>;
    onAddReminder: (reminder: Omit<Reminder, 'id' | 'completed'>) => void;
    theme: Theme;
}

const initialSchedule = {
    'الأحد': Array(7).fill(''), 'الاثنين': Array(7).fill(''),
    'الثلاثاء': Array(7).fill(''), 'الأربعاء': Array(7).fill(''),
    'الخميس': Array(7).fill(''),
};

const SchoolSchedule: React.FC<SchoolScheduleProps> = ({ schedules, setSchedules, onAddReminder, theme }) => {
    const [selectedChildIndex, setSelectedChildIndex] = useState(0);
    const [newChildName, setNewChildName] = useState('');
    const [modalInfo, setModalInfo] = useState<{ subject: string; day: string } | null>(null);
    const [reminderType, setReminderType] = useState<'واجب' | 'اختبار'>('واجب');
    const [reminderDateTime, setReminderDateTime] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


    const handleAddChild = () => {
        if (newChildName.trim() === '') return;
        const newSchedule: ChildSchedule = {
            name: newChildName.trim(),
            schedule: JSON.parse(JSON.stringify(initialSchedule)), // Deep copy
        };
        const updatedSchedules = [...schedules, newSchedule];
        setSchedules(updatedSchedules);
        setSelectedChildIndex(updatedSchedules.length - 1); // Switch to the new child
        setNewChildName('');
    };

    const handleDeleteChild = () => {
        if(showDeleteConfirm) {
            const updatedSchedules = schedules.filter((_, index) => index !== selectedChildIndex);
            setSchedules(updatedSchedules);
            setSelectedChildIndex(Math.max(0, selectedChildIndex - 1));
            setShowDeleteConfirm(false);
        }
    };

    const handleSubjectChange = (day: string, periodIndex: number, value: string) => {
        const updatedSchedules = [...schedules];
        updatedSchedules[selectedChildIndex].schedule[day as keyof typeof initialSchedule][periodIndex] = value;
        setSchedules(updatedSchedules);
    };

    const handleAddReminderFromSchedule = () => {
        if (!modalInfo || !reminderDateTime) return;
        onAddReminder({
            text: `${reminderType}: ${modalInfo.subject} (${schedules[selectedChildIndex].name})`,
            dateTime: reminderDateTime,
            sound: 'افتراضي',
            vibration: 'افتراضي',
        });
        setModalInfo(null);
        setReminderDateTime('');
    };

    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
    const currentSchedule = schedules[selectedChildIndex]?.schedule;
    const focusClasses = `focus:ring-2 ${theme.ring} focus:outline-none`;
    const focusBorderClasses = `focus:border-${theme.name}-500 focus:ring-1 ${theme.ring}`;

    return (
        <div className="space-y-6">
            {/* Add Child Form */}
            <div className="bg-slate-800 p-4 rounded-lg shadow-lg flex items-center gap-4">
                <input
                    type="text"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    placeholder="أدخل اسم طفل جديد..."
                    className={`flex-grow bg-slate-700 p-3 rounded-md border border-slate-600 ${focusClasses}`}
                />
                <button
                    onClick={handleAddChild}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200"
                >
                    إضافة
                </button>
            </div>

            {schedules.length > 0 ? (
                <>
                    {/* Child Selector */}
                    <div className="bg-slate-800 p-2 rounded-lg shadow-lg">
                        <select
                            value={selectedChildIndex}
                            onChange={(e) => setSelectedChildIndex(parseInt(e.target.value, 10))}
                            className={`w-full bg-slate-700 p-3 rounded-md border border-slate-600 ${focusClasses}`}
                        >
                            {schedules.map((child, index) => (
                                <option key={index} value={index}>
                                    {child.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Schedule Table */}
                    <div className="overflow-x-auto bg-slate-800 p-4 rounded-lg shadow-lg">
                         <table className="w-full border-collapse table-fixed">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className={`p-2 text-center ${theme.primaryText} font-semibold`}>الحصة</th>
                                    {days.map(day => <th key={day} className={`p-2 text-center ${theme.primaryText} font-semibold`}>{day}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(7).keys()].map(i => (
                                    <tr key={i} className="border-b border-slate-700/50">
                                        <td className="p-2 text-center font-medium text-slate-400">{`الحصة ${i + 1}`}</td>
                                        {days.map(day => (
                                            <td key={day} className="p-1">
                                                <input
                                                    type="text"
                                                    value={currentSchedule?.[day as keyof typeof initialSchedule]?.[i] || ''}
                                                    onChange={(e) => handleSubjectChange(day, i, e.target.value)}
                                                    onClick={(e) => {
                                                        const subject = (e.target as HTMLInputElement).value;
                                                        if (subject) setModalInfo({ subject, day });
                                                    }}
                                                    className={`w-full bg-slate-700 p-2 rounded-md text-center text-sm border border-transparent ${focusBorderClasses} focus:outline-none`}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     <div className="flex justify-center mt-4">
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                        >
                            حذف جدول {schedules[selectedChildIndex]?.name}
                        </button>
                    </div>

                </>
            ) : (
                <p className="text-center text-slate-400 mt-8">
                    ابدأ بإضافة جدول دراسي لطفلك من النموذج أعلاه.
                </p>
            )}

            {/* Reminder Modal */}
            {modalInfo && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-30" onClick={() => setModalInfo(null)}>
                    <div className="bg-slate-800 p-6 rounded-lg shadow-2xl space-y-4 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h3 className={`text-xl font-bold ${theme.primaryText} text-center`}>إضافة تنبيه لمادة "{modalInfo.subject}"</h3>
                        <select
                            value={reminderType}
                            onChange={(e) => setReminderType(e.target.value as 'واجب' | 'اختبار')}
                            className={`w-full bg-slate-700 p-3 rounded-md border border-slate-600 ${focusClasses}`}
                        >
                            <option value="واجب">واجب</option>
                            <option value="اختبار">اختبار</option>
                        </select>
                        <input
                            type="datetime-local"
                            value={reminderDateTime}
                            onChange={(e) => setReminderDateTime(e.target.value)}
                            className={`w-full bg-slate-700 p-3 rounded-md border border-slate-600 ${focusClasses}`}
                        />
                        <div className="flex gap-4">
                            <button
                                onClick={() => setModalInfo(null)}
                                className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-md"
                            >
                                إلغاء
                            </button>
                             <button
                                onClick={handleAddReminderFromSchedule}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
                            >
                                حفظ التنبيه
                            </button>
                        </div>
                    </div>
                </div>
            )}
             {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                 <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-30" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="bg-slate-800 p-6 rounded-lg shadow-2xl space-y-4 w-full max-w-sm text-center" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-red-500">تأكيد الحذف</h3>
                        <p>هل أنت متأكد من رغبتك في حذف جدول الطالب "{schedules[selectedChildIndex]?.name}"؟ لا يمكن التراجع عن هذا الإجراء.</p>
                         <div className="flex gap-4 mt-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-md"
                            >
                                إلغاء
                            </button>
                             <button
                                onClick={handleDeleteChild}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md"
                            >
                                نعم, احذف
                            </button>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default SchoolSchedule;