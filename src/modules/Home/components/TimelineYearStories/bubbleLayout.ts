/**
 * bubbleLayout.ts
 *
 * Collapsed: Vogel spiral — до 16 слотів (15 сторіс + overflow button),
 *            фіксована висота 29rem.
 *
 * Expanded:  Hex packing з subtle jitter — будь-яка кількість,
 *            висота розраховується автоматично.
 *            Vogel spiral для expanded неможливий: 150 бульбашок
 *            по 2.8rem не вміщуються в ~20rem ширину без перекриття.
 */

export const BUBBLE_VISIBLE_COUNT = 15;

const GOLDEN_ANGLE_RAD = (137.508 * Math.PI) / 180;

// ── Collapsed ────────────────────────────────────────────────
const C_HEIGHT_REM = 29;
const C_MAX_BUBBLE_REM = 6.8;
const C_MIN_BUBBLE_REM = 3.1;
const C_MAX_RADIUS_PCT = 40;
const C_EDGE_MARGIN_PCT = 9;

// ── Expanded ─────────────────────────────────────────────────
const E_BUBBLE_REM = 3.5;
const E_GAP_REM = 0.25;
const E_COL_PITCH = E_BUBBLE_REM + E_GAP_REM; // 3.3rem
const E_ROW_PITCH = E_COL_PITCH * (Math.sqrt(3) / 2); // ~2.858rem (hex)
const E_MARGIN_REM = 1.5;
const E_MAX_JITTER = E_GAP_REM * 0.35; // subtle shift

// Reference width for % calculations (approx. grid column width)
const CONTAINER_W_REF = 30; // rem

export interface BubblePosition {
    x: number; // % of container width
    y: number; // % of container height
    size: number; // rem
}

export interface BubbleLayout {
    /** Positions for all slots. Last slot = overflow button if hasOverflow. */
    positions: BubblePosition[];
    /** Container height in rem — applied via JS */
    containerHeightRem: number;
}

/**
 * Collapsed layout via Vogel spiral.
 * count = min(storyUsers, BUBBLE_VISIBLE_COUNT) + (hasOverflow ? 1 : 0)
 */
export function generateCollapsedLayout(count: number): BubbleLayout {
    const positions = Array.from({ length: count }, (_, i) => {
        const t = count <= 1 ? 0 : i / (count - 1);
        const r = C_MAX_RADIUS_PCT * Math.sqrt(t);
        const theta = i * GOLDEN_ANGLE_RAD;
        const size = C_MAX_BUBBLE_REM - (C_MAX_BUBBLE_REM - C_MIN_BUBBLE_REM) * t;

        return {
            x: clamp(50 + r * Math.cos(theta), C_EDGE_MARGIN_PCT, 100 - C_EDGE_MARGIN_PCT),
            y: clamp(48 + r * Math.sin(theta), C_EDGE_MARGIN_PCT, 100 - C_EDGE_MARGIN_PCT),
            size,
        };
    });

    return { positions, containerHeightRem: C_HEIGHT_REM };
}

/**
 * Expanded layout via hex packing + jitter.
 * count = storyUsers.length + (hasOverflow ? 1 : 0)
 */
export function generateExpandedLayout(count: number): BubbleLayout {
    if (count === 0) return { positions: [], containerHeightRem: C_HEIGHT_REM };

    const availableWidth = CONTAINER_W_REF - 2 * E_MARGIN_REM;
    const perRow = Math.max(1, Math.floor((availableWidth + E_GAP_REM) / E_COL_PITCH));
    const rowCount = Math.ceil(count / perRow);

    const containerHeightRem = Math.max(
        E_MARGIN_REM + rowCount * E_ROW_PITCH + E_BUBBLE_REM + E_MARGIN_REM,
        C_HEIGHT_REM
    );

    const positions = Array.from({ length: count }, (_, i) => {
        const row = Math.floor(i / perRow);
        const col = i % perRow;
        const isOddRow = row % 2 === 1;

        // Center each row (last row may be incomplete)
        const rowItemCount = row === rowCount - 1 ? count % perRow || perRow : perRow;
        const rowTotalWidth = rowItemCount * E_BUBBLE_REM + (rowItemCount - 1) * E_GAP_REM;
        const rowStartX = (CONTAINER_W_REF - rowTotalWidth) / 2;

        const baseX = rowStartX + col * E_COL_PITCH + E_BUBBLE_REM / 2 + (isOddRow ? E_COL_PITCH / 2 : 0);
        const baseY = E_MARGIN_REM + E_BUBBLE_REM / 2 + row * E_ROW_PITCH;

        // Deterministic jitter: sine hash seeded by index
        const jx = sineHash(i * 2) * E_MAX_JITTER;
        const jy = sineHash(i * 2 + 1) * E_MAX_JITTER;

        return {
            x: clamp(((baseX + jx) / CONTAINER_W_REF) * 100, 4, 96),
            y: clamp(((baseY + jy) / containerHeightRem) * 100, 0.5, 99.5),
            size: E_BUBBLE_REM,
        };
    });

    return { positions, containerHeightRem };
}

// ── Helpers ──────────────────────────────────────────────────

function clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v));
}

/** Sine-based hash → deterministic float in range [-1, 1] */
function sineHash(seed: number): number {
    const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return (s - Math.floor(s)) * 2 - 1;
}
