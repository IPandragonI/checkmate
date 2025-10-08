interface GameJoinFieldProps {
    code?: string;
    setCode?: (code: string) => void;
}

const GameJoinField: React.FC<GameJoinFieldProps> = ({code, setCode}) => {
    return (
        <div className="form-control w-full">
            <label className="label mb-4">
                <span className="label-text">Code d'accès</span>
            </label>
            <input type="text" placeholder="Entrez le code d'accès" className="input input-bordered w-full" required
                   value={code} onChange={(e) => setCode?.(e.target.value.toUpperCase())} maxLength={8} />
        </div>
    );
}

export default GameJoinField;