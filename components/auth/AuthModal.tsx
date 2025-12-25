'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const result = await signIn(email, password);
        if (result.success) {
          onClose();
        } else {
          setError(result.error || 'Giriş başarısız');
        }
      } else {
        if (!username.trim()) {
          setError('Kullanıcı adı gerekli');
          setIsSubmitting(false);
          return;
        }
        const result = await signUp(email, password, username);
        if (result.success) {
          setSuccess('Kayıt başarılı! Email adresinizi doğrulayın.');
        } else {
          setError(result.error || 'Kayıt başarısız');
        }
      }
    } catch (err) {
      setError('Bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md p-6 rounded-lg shadow-xl"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded hover:opacity-80 transition-opacity"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Title */}
        <h2
          className="text-2xl font-bold mb-6 text-center"
          style={{ color: 'var(--color-accent)' }}
        >
          {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label
                className="block text-sm mb-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Kullanıcı Adı
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 rounded-lg outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--color-bg-dark)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-bg-hover)',
                }}
                placeholder="username"
                required
              />
            </div>
          )}

          <div>
            <label
              className="block text-sm mb-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg outline-none transition-colors"
              style={{
                backgroundColor: 'var(--color-bg-dark)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-bg-hover)',
              }}
              placeholder="email@example.com"
              required
            />
          </div>

          <div>
            <label
              className="block text-sm mb-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg outline-none transition-colors"
              style={{
                backgroundColor: 'var(--color-bg-dark)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-bg-hover)',
              }}
              placeholder="********"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {success && (
            <p className="text-sm text-green-500">{success}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-lg font-semibold transition-colors hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-bg-dark)',
            }}
          >
            {isSubmitting ? '...' : mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </form>

        {/* Toggle mode */}
        <p
          className="mt-4 text-center text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {mode === 'login' ? (
            <>
              Hesabın yok mu?{' '}
              <button
                onClick={() => {
                  setMode('signup');
                  setError('');
                  setSuccess('');
                }}
                className="underline hover:opacity-80"
                style={{ color: 'var(--color-accent)' }}
              >
                Kayıt Ol
              </button>
            </>
          ) : (
            <>
              Zaten hesabın var mı?{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccess('');
                }}
                className="underline hover:opacity-80"
                style={{ color: 'var(--color-accent)' }}
              >
                Giriş Yap
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
