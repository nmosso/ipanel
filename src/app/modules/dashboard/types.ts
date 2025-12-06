// types.ts
export interface ReaderStats {
    count: number;
    n_nonzero?: number;
    min_ms?: number | null;
    max_ms?: number | null;
    avg_ms?: number | null;
    stddev_ms?: number | null;
    p95_ms?: number | null;
    p99_ms?: number | null;
}
export interface Point {
    dateend: number;           // unix ts
    ecm_total: number;
    readers: { [reader: string]: ReaderStats };
}
export type Last5Response = { [cardserverid: string]: Point[] };

export interface ReaderStats {
    count: number;
    n_nonzero?: number;
    min_ms?: number | null;
    max_ms?: number | null;
    avg_ms?: number | null;
    stddev_ms?: number | null;
    p95_ms?: number | null;
    p99_ms?: number | null;
}
