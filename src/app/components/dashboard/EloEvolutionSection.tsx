"use client"

import React, {useMemo} from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function formatDate(ts: number) {
    const d = new Date(ts);
    return d.toLocaleDateString();
}

function EloEvolutionSection({ratingHistory}: { ratingHistory?: any[] }) {
    const data = useMemo(() => {
        if (!ratingHistory || ratingHistory.length === 0) {
            return [{ time: Date.now(), elo: 400 }];
        }

        const sorted = [...ratingHistory].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        const pts: { time: number; elo: number; label?: string }[] = [];

        const first = sorted[0];
        const firstTime = new Date(first.createdAt).getTime();

        pts.push({ time: firstTime - 1, elo: first.oldElo ?? 400, label: formatDate(firstTime - 1) });

        for (const r of sorted) {
            const t = new Date(r.createdAt).getTime();
            pts.push({ time: t, elo: typeof r.newElo === 'number' ? r.newElo : (r.newElo ? Number(r.newElo) : 400), label: formatDate(t) });
        }

        return pts.map(p => ({ ...p, timeLabel: formatDate(p.time) }));
    }, [ratingHistory]);

    return (
        <section className="elo-evolution-section p-4 bg-base-200 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Évolution du classement</h2>
            <div style={{ width: '100%', height: 220, backgroundColor: 'white' }}>
                <ResponsiveContainer>
                    <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timeLabel" tick={{ fontSize: 12 }} />
                        <YAxis domain={["dataMin - 10", "dataMax + 10"]} />
                        <Tooltip formatter={(value:any) => [`${value} Elo`, 'Rating']} labelFormatter={(label:any) => label} />
                        <Line type="monotone" dataKey="elo" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-3 text-sm text-muted">
                <span className="inline-block mr-4"><span className="inline-block w-3 h-3 bg-amber-500 mr-2 align-middle"></span>Base: 400</span>
                <span className="inline-block"><span className="inline-block w-3 h-3 bg-cyan-500 mr-2 align-middle"></span>Points: {data.length}</span>
            </div>
        </section>
    )
}

export default EloEvolutionSection;
