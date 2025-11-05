import React from "react";
import {Target, Zap, Timer, Clock} from "lucide-react";
import {timeModes} from "@/app/types/game";

const getTimeModeIcon = (key: string) => {
    switch (key) {
        case "BULLET":
            return <Target size={14} className="inline-block text-red-500"/>;
        case "BLITZ":
            return <Zap size={14} className="inline-block text-yellow-500"/>;
        case "RAPID":
            return <Timer size={14} className="inline-block"/>;
        case "CLASSICAL":
            return <Clock size={14} className="inline-block text-green-500"/>;
        default:
            return null;
    }
}

const TimeModeField: React.FC<{ value: string, mode: string, timeMode: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, setTimeMode: (timeMode: string) => void }> = ({value, mode, timeMode, onChange, setTimeMode}) => {
    const currentMode = timeModes.find(m => m.key === timeMode) || timeModes[0];

    return (
        <div className="form-control flex flex-col gap-2">
            <div className="label">Mode de temps</div>
            <div className="flex flex-col gap-4 items-center">
                <div className="grid grid-cols-2 gap-2 w-full">
                    {timeModes.map(m => (
                        <button
                            key={m.key}
                            type="button"
                            className={`btn btn-sm flex items-center gap-1 font-semibold px-3 py-1 rounded ${timeMode === m.key ? mode === 'bot' ? "btn-secondary" : "btn-primary" : "btn-outline"}`}
                            onClick={() => setTimeMode(m.key)}
                        >
                            {getTimeModeIcon(m.key)}
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