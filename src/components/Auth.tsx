import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
    onLoginSuccess: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('الرجاء إدخال اسم المستخدم وكلمة المرور.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '{}');

        if (isLoginView) {
            // Login logic
            if (users[username] && users[username] === password) {
                onLoginSuccess({ username });
            } else {
                setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
            }
        } else {
            // Registration logic
            if (users[username]) {
                setError('اسم المستخدم هذا مسجل بالفعل.');
            } else {
                const newUsers = { ...users, [username]: password };
                localStorage.setItem('users', JSON.stringify(newUsers));
                onLoginSuccess({ username });
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4">
            <div className="w-full max-w-md bg-slate-800 p-8 rounded-lg shadow-2xl">
                <h1 className="text-3xl font-bold text-center text-sky-400 mb-2">{isLoginView ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h1>
                <p className="text-center text-slate-400 mb-6">{isLoginView ? 'مرحباً بعودتك!' : 'لنبدأ رحلتك'}</p>
                <form onSubmit={handleSubmit}>
                    {error && <p className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg text-center mb-4">{error}</p>}
                    <div className="mb-4">
                        <label className="block text-slate-300 text-sm font-bold mb-2" htmlFor="username">
                            اسم المستخدم
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="مثال: abdullah"
                            className="w-full bg-slate-700 p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                            autoComplete="username"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-slate-300 text-sm font-bold mb-2" htmlFor="password">
                            كلمة المرور
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="******************"
                            className="w-full bg-slate-700 p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                            autoComplete={isLoginView ? "current-password" : "new-password"}
                        />
                    </div>
                    <div className="flex flex-col gap-4">
                        <button
                            type="submit"
                            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg"
                        >
                            {isLoginView ? 'دخول' : 'تسجيل'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsLoginView(!isLoginView);
                                setError('');
                            }}
                            className="w-full text-slate-400 hover:text-sky-300"
                        >
                            {isLoginView ? 'ليس لديك حساب؟ إنشاء حساب' : 'لديك حساب بالفعل؟ تسجيل الدخول'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Auth;