import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { snekTable } from '../db/schema.ts';


export type readSnek = InferSelectModel<typeof snekTable>;

export type snekMatchPublic = Omit<readSnek, 'p1_uuid' | 'p2_uuid'> & {
    p2_isGuest: boolean;
}

export function toPublicSnek(snek: readSnek): snekMatchPublic {
    return {
        ...snek,
        p2_isGuest: snek.p2_uuid === null ? true : false
    };
}


export type createSnek = InferInsertModel<typeof snekTable>;

/**
 * Everything for returning snek stats
*/

export interface PlayerStats {
    uuid: string;
    matches: number;
    wins: number;
    losses: number;
    winrate: number;
    avg_score: number;
    highest_score: number;
}
export interface MatchData {
    p1_uuid: string;
    p2_uuid?: string;
    winner_id: number;
    p1_score: number;
    p2_score: number;
}

/**
 * Calculate player statistics from match data
 * @param matches Array of match data from database
 * @returns Array of player statistics sorted by wins (descending)
*/
export const calculatePlayerStats = (matches: MatchData[]): PlayerStats[] => {
    interface InternalPlayerStats extends PlayerStats {
        totalScore: number;
    }

    const playerStats = new Map<string, InternalPlayerStats>();
    for (const match of matches) {
        const initializePlayer = (uuid: string) => {
            if (!playerStats.has(uuid)) {
                playerStats.set(uuid, {
                    uuid,
                    matches: 0,
                    wins: 0,
                    losses: 0,
                    winrate: 0,
                    avg_score: 0,
                    highest_score: 0,
                    totalScore: 0
                });
            }
            return playerStats.get(uuid)!;
        };
        const p1 = initializePlayer(match.p1_uuid);
        var p2 = null;
        if (match.p2_uuid)
            p2 = initializePlayer(match.p2_uuid);

        p1.matches++;
        if (p2)
            p2.matches++;

        if (match.winner_id === 1) {
            p1.wins++;
            if (p2)
                p2.losses++;
        } else if (match.winner_id === 2) {
            p1.losses++;
            if (p2)
                p2.wins++;
        }
        p1.totalScore += match.p1_score;
        if (p2)
            p2.totalScore += match.p2_score;

        p1.highest_score = Math.max(p1.highest_score, match.p1_score);
        if (p2)
            p2.highest_score = Math.max(p2.highest_score, match.p2_score);
    }

    const result = Array.from(playerStats.values()).map(player => {
        const winrate = player.matches > 0 ? (player.wins / player.matches) * 100 : 0;
        const avg_score = player.matches > 0 ? player.totalScore / player.matches : 0;

        return {
            uuid: player.uuid,
            matches: player.matches,
            wins: player.wins,
            losses: player.losses,
            winrate: parseFloat(winrate.toFixed(2)),
            avg_score: parseFloat(avg_score.toFixed(2)),
            highest_score: player.highest_score
        };
    });
    if (result.length > 1) {
        result.sort((a, b) => b.wins - a.wins);
        return result.slice(0, 3);
    }
    return result;
};