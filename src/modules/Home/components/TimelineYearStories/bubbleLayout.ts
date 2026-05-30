export interface BubblePosition {
    /** Горизонтальна позиція у % від ширини контейнера */
    x: number;
    /** Вертикальна позиція у % від висоти контейнера */
    y: number;
    /** Діаметр бульбашки в rem */
    size: number;
}

/** Золотий кут у радіанах — дає найрівномірніший розподіл (Vogel spiral) */
const GOLDEN_ANGLE_RAD = (137.508 * Math.PI) / 180;

const LAYOUT = {
    maxRadius: 40, // % від розміру контейнера
    maxSize: 6.5, // rem — центральна бульбашка
    minSize: 3.1, // rem — крайня бульбашка
    cx: 50, // % — центр X
    cy: 48, // % — центр Y (трохи вище, як у оригінальному дизайні)
    edgeMargin: 9, // % — відступ від країв щоб бульбашки не вилазили
} as const;

/**
 * Генерує координати для N бульбашок через Vogel (соняшник) спіраль.
 * Перший елемент завжди в центрі, решта рівномірно розходяться по спіралі.
 * Не залежить від nth-child — працює для будь-якої кількості.
 */
export function generateBubblePositions(count: number): BubblePosition[] {
    if (count === 0) return [];

    const { maxRadius, maxSize, minSize, cx, cy, edgeMargin } = LAYOUT;

    return Array.from({ length: count }, (_, i) => {
        // t = 0 → центр, t = 1 → найдальша орбіта
        const t = count === 1 ? 0 : i / (count - 1);
        const r = maxRadius * Math.sqrt(t); // sqrt дає рівномірну щільність
        const theta = i * GOLDEN_ANGLE_RAD;

        const x = clamp(cx + r * Math.cos(theta), edgeMargin, 100 - edgeMargin);
        const y = clamp(cy + r * Math.sin(theta), edgeMargin, 100 - edgeMargin);
        const size = maxSize - (maxSize - minSize) * t;

        return { x, y, size };
    });
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}
