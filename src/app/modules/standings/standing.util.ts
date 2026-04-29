type StandingRow = {
    team_id: number;
    team?: string;
    type?: 'home' | 'away' | 'total' | string;
    played?: number;
    wins?: number;
    draws?: number;
    losses?: number;
    points?: number;
    goals_for?: number;
    goals_against?: number;
    goal_difference?: number;
    position?: number;
    [key: string]: any;
};

const priority: Record<string, number> = {
    total: 3,
    home: 2,
    away: 1,
};

export default function dedupeStandings(rows: StandingRow[] = []) {
    const map = new Map<number, StandingRow>();

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        const key = row.team_id;
        const type = (row.type ?? 'total').toLowerCase();
        const rowPriority = priority[type] ?? 0;

        const existing = map.get(key);

        if (!existing) {
            map.set(key, row);
            continue;
        }

        const existingType = (existing.type ?? 'total').toLowerCase();
        const existingPriority = priority[existingType] ?? 0;

        if (rowPriority > existingPriority) {
            map.set(key, row);
        }
    }

    return Array.from(map.values()).sort(
        (a, b) => (a.position ?? 9999) - (b.position ?? 9999)
    );
}