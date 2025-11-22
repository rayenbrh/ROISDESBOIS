import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="gold-gradient bg-clip-text text-transparent">
              Les Rois des Bois
            </span>
          </h1>
          <p className="text-gray-400">لوحة التحكم الإدارية</p>
        </div>

        {/* Login Card */}
        <div className="card bg-white/10 backdrop-blur-lg border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">تسجيل الدخول</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="label text-white">البريد الإلكتروني</label>
              <div className="relative">
                <FiMail className="absolute top-3 right-3 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pr-10 bg-white/5 border-white/20 text-white placeholder-gray-400"
                  placeholder="example@domain.com"
                  required
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label text-white">كلمة المرور</label>
              <div className="relative">
                <FiLock className="absolute top-3 right-3 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10 bg-white/5 border-white/20 text-white placeholder-gray-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-gray-400 mb-2">بيانات تجريبية:</p>
            <p className="text-xs text-gray-300">Admin: admin@lesroisdesbois.com / admin123</p>
            <p className="text-xs text-gray-300">Cashier: cashier@lesroisdesbois.com / cashier123</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 mt-6 text-sm">
          © 2025 Les Rois des Bois. جميع الحقوق محفوظة.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
