/**
 * AuthGuard — Sovereign OAuth Protection Layer
 * Protects all internal pages via Supabase Google OAuth.
 * Unauthorized → redirect to /auth/login
 * Authorized → render children
 */
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

const ALLOWED_EMAILS = [
    'yacine@yace19ai.com',
    'yacine@prime-ai.fr',
    'info.primeai@gmail.com',
];

interface AuthGuardProps {
    children: React.ReactNode;
    pageName?: string;
}

export default function AuthGuard({ children, pageName = 'Internal' }: AuthGuardProps) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setLoading(false);
        });
        const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
            setSession(s);
        });
        return () => listener.subscription.unsubscribe();
    }, []);

    const handleGoogleLogin = async () => {
        setError('');
        const { error: err } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.href,
                queryParams: { hd: 'yace19ai.com' },
            },
        });
        if (err) setError(err.message);
    };

    const handleLogout = () => supabase.auth.signOut();

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#050508', color: '#fff', fontFamily: 'monospace'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 40, height: 40, border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                    <p style={{ color: '#6b7280', fontSize: 12 }}>AUTHENTICATING...</p>
                </div>
            </div>
        );
    }

    // Authorized
    if (session) {
        const email = session.user?.email || '';
        if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.some(e => email === e || email.endsWith('@yace19ai.com') || email.endsWith('@prime-ai.fr'))) {
            return (
                <div style={{
                    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#050508', color: '#fff', fontFamily: 'monospace'
                }}>
                    <div style={{ textAlign: 'center', maxWidth: 400 }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🔴</div>
                        <h2 style={{ color: '#ef4444', marginBottom: 8 }}>ACCESS DENIED</h2>
                        <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 24 }}>{email} is not authorized.</p>
                        <button onClick={handleLogout} style={{ padding: '8px 24px', background: '#1f1f2e', border: '1px solid #374151', borderRadius: 8, color: '#9ca3af', cursor: 'pointer', fontSize: 12 }}>
                            Sign out
                        </button>
                    </div>
                </div>
            );
        }
        return <>{children}</>;
    }

    // Not authenticated → Login wall
    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #050508 0%, #0a0a18 50%, #050508 100%)',
            fontFamily: 'monospace'
        }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{
                maxWidth: 400, width: '100%', padding: 40,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 16,
                boxShadow: '0 25px 80px rgba(99,102,241,0.1)',
                textAlign: 'center'
            }}>
                {/* Logo/Brand */}
                <div style={{
                    width: 56, height: 56, borderRadius: 14,
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))',
                    border: '1px solid rgba(99,102,241,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', fontSize: 24
                }}>🛡️</div>

                <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                    {pageName}
                </h2>
                <p style={{ color: '#6b7280', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
                    SOVEREIGN ACCESS REQUIRED
                </p>
                <p style={{ color: '#4b5563', fontSize: 11, marginBottom: 32 }}>
                    This is an internal page. Authenticate with your authorized Google account.
                </p>

                {/* Google OAuth Button */}
                <button
                    onClick={handleGoogleLogin}
                    style={{
                        width: '100%', padding: '14px 24px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        border: 'none', borderRadius: 10,
                        color: '#fff', fontSize: 13, fontWeight: 700,
                        cursor: 'pointer', letterSpacing: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        transition: 'all 0.2s'
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" />
                    </svg>
                    Sign in with Google
                </button>

                {error && (
                    <p style={{ color: '#ef4444', fontSize: 11, marginTop: 12 }}>{error}</p>
                )}

                <p style={{ color: '#1f2937', fontSize: 10, marginTop: 24, letterSpacing: 1 }}>
                    AIA-LAB SOVEREIGN OS · ZERO-ILLUSION PROTOCOL
                </p>
            </div>
        </div>
    );
}
