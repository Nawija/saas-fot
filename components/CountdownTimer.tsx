"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
    minutes: number; // ile minut odliczać
    onExpire?: () => void; // co zrobić po zakończeniu
}

export default function CountdownTimer({
    minutes,
    onExpire,
}: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState(minutes * 60);

    useEffect(() => {
        if (timeLeft <= 0) {
            if (onExpire) onExpire();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((t) => t - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onExpire]);

    const formatTime = (t: number) => {
        const m = Math.floor(t / 60)
            .toString()
            .padStart(2, "0");
        const s = (t % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    return (
        <span className="font-semibold text-gray-700">
            {formatTime(timeLeft)}
        </span>
    );
}
