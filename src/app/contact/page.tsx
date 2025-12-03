"use client";

import React, { useState } from 'react';
import Footer from '@/app/components/ui/Footer';

export default function ContactPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!email || !email.includes('@')) {
            setError('Adresse email invalide.');
            return;
        }
        if (!message || message.length < 10) {
            setError('Le message doit contenir au minimum 10 caractères.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/test-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: email })
            });
            const data = await res.json();
            if (!res.ok) throw new Error((data && data.error) || 'Erreur serveur');
            setSuccess(true);
            setEmail('');
            setMessage('');
        } catch (err) {
            const msg = err && typeof err === 'object' && 'message' in err ? String((err as any).message) : String(err);
            setError(msg || 'Erreur lors de l\'envoi');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="p-6 space-y-6 text-base-content">
            <h1 className="text-2xl font-bold">Contact</h1>

            <div className="rounded-xl bg-base-200 shadow p-6 space-y-4 w-full">
                <p>Si tu as une question ou veux nous signaler un problème, utilise ce formulaire.</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                    <label className="flex flex-col">
                        <span className="text-sm font-medium text-slate-500">Email</span>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="input input-bordered" placeholder="ton@email.com" />
                    </label>

                    <label className="flex flex-col">
                        <span className="text-sm font-medium text-slate-500">Message</span>
                        <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                                  className="textarea textarea-bordered" rows={6} />
                    </label>

                    {error && <p className="text-red-500">{error}</p>}
                    {success && <p className="text-success">Message envoyé avec succès !</p>}

                    <div className="flex items-center gap-4">
                        <button className="btn btn-primary" disabled={loading}>
                            {loading ? 'Envoi...' : 'Envoyer'}
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => { setEmail(''); setMessage(''); setError(null); }}>
                            Réinitialiser
                        </button>
                    </div>
                </form>
            </div>

            <Footer />
        </main>
    );
}
