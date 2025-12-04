import { Move } from "@/app/types/game";

export type PlayOpts = {
    isCheck?: boolean;
    isCastle?: boolean;
    startOrEnd?: "START" | "END";
};

export type AudioController = {
    playSound: (move: Move, opts?: PlayOpts) => void;
    dispose: () => void;
};

export function createAudioController(): AudioController {
    const audios = {
        start: typeof window !== 'undefined' ? new Audio('/sounds/game-start.mp3') : null,
        end: typeof window !== 'undefined' ? new Audio('/sounds/game-end.mp3') : null,
        move: typeof window !== 'undefined' ? new Audio('/sounds/move-self.mp3') : null,
        capture: typeof window !== 'undefined' ? new Audio('/sounds/capture.mp3') : null,
        castle: typeof window !== 'undefined' ? new Audio('/sounds/castle.mp3') : null,
        promotion: typeof window !== 'undefined' ? new Audio('/sounds/promotion.mp3') : null,
        check: typeof window !== 'undefined' ? new Audio('/sounds/check.mp3') : null,
    } as Record<string, HTMLAudioElement | null>;

    try {
        if (audios.start) audios.start.volume = 0.5;
        if (audios.end) audios.end.volume = 0.5;
        if (audios.move) audios.move.volume = 0.6;
        if (audios.capture) audios.capture.volume = 0.7;
        if (audios.castle) audios.castle.volume = 0.6;
        if (audios.promotion) audios.promotion.volume = 0.7;
        if (audios.check) audios.check.volume = 0.8;
    } catch (e) {
    }

    function determineAudio(move: Move, opts?: PlayOpts) {
        if (opts?.startOrEnd) return opts.startOrEnd === 'START' ? audios.start : audios.end;
        if (opts?.isCheck) return audios.check;
        if (opts?.isCastle) return audios.castle;
        if (move?.capturedPiece) return audios.capture;
        if (move?.promotion) return audios.promotion;
        return audios.move;
    }

    function playSound(move: Move, opts?: PlayOpts) {
        try {
            const audio = determineAudio(move || ({} as Move), opts);
            if (!audio) return;
            audio.currentTime = 0;
            setTimeout(() => {
                audio.play().catch(() => {
                });
            }, 50);
        } catch (e) {
        }
    }

    function dispose() {
        try {
            for (const k of Object.keys(audios)) {
                const a = audios[k];
                if (!a) continue;
                try {
                    a.pause();
                } catch {}
                try {
                    a.src = '';
                } catch {}
            }
        } catch (e) {
        }
    }

    return { playSound, dispose };
}
