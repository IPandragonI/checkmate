import React from "react";
import {Target, Zap, Timer, Clock} from "lucide-react";

export const timeModes = [
    {
        key: "BULLET",
        label: "Bullet",
        icon: <Target size={18} className="inline-block text-red-500"/>,
        options: [
            {value: "1", label: "1 min"},
            {value: "3", label: "3 min"}
        ]
    }, {
        key: "BLITZ",
        label: "Blitz",
        icon: <Zap size={18} className="inline-block text-yellow-500"/>,
        options: [
            {value: "3", label: "3 min"},
            {value: "5", label: "5 min"},
        ]
    },
    {
        key: "RAPID",
        label: "Rapide",
        icon: <Timer size={18} className="inline-block text-blue-500"/>,
        options: [
            {value: "10", label: "10 min"},
            {value: "15", label: "15 min"},
            {value: "30", label: "30 min"}
        ]
    }, {
        key: "CLASSICAL",
        label: "Classique",
        icon: <Clock size={18} className="inline-block text-green-500"/>,
        options: [
            {value: "60", label: "60 min"},
            {value: "120", label: "120 min"}
        ]
    }
];

const TimeModeField: React.FC<{ value: string, mode: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, setMode: (mode: string) => void }> = ({value, mode, onChange, setMode}) => {
    const currentMode = timeModes.find(m => m.key === mode) || timeModes[0];

    return (
        <div className="form-control flex flex-col gap-2">
            <label className="label">Mode de temps</label>
            <div className="flex flex-col gap-4 items-center">
                <div className="grid grid-cols-2 gap-2 w-full">
                    {timeModes.map(m => (
                        <button
                            key={m.key}
                            type="button"
                            className={`btn btn-sm flex items-center gap-1 font-semibold px-3 py-1 rounded ${mode === m.key ? "btn-primary" : "btn-outline"}`}
                            onClick={() => setMode(m.key)}
                        >
                            {m.icon}
                            {m.label}
                        </button>
                    ))}
                </div>
                <select className="select select-bordered w-full" value={value} onChange={onChange}>
                    {currentMode.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default TimeModeField;