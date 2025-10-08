import React from "react";

interface ColorCardProps {
    selected: boolean;
    onClick: () => void;
    label: string;
    icon: React.ReactNode;
    ariaLabel?: string;
    className?: string;
}

const ColorCard: React.FC<ColorCardProps> = ({
    selected,
    onClick,
    label,
    icon,
    ariaLabel,
    className = ""
}) => {
    return (
        <div
            className={`card w-12 shadow-sm p-2 items-center cursor-pointer transition hover:border-secondary ${selected ? "bg-secondary border-2 border-secondary" : "border"} ${className}`}
            onClick={onClick}
            tabIndex={0}
            role="button"
            aria-label={ariaLabel || label}
        >
            <figure>{icon}</figure>
        </div>
    );
};

export default ColorCard;

