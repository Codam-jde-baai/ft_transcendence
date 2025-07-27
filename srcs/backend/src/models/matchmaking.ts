import { InferSelectModel } from 'drizzle-orm';
import { usersTable, matchesTable, snekTable, userStatus } from '../db/schema.ts';
import { User, PublicUser, toPublicUser } from './users.ts';

// Extended user type for matchmaking with game statistics
export type MatchmakingUser = PublicUser & {
    friends: boolean;
    status: number;
    win: number;
    loss: number;
    total_games: number;
    winrate: number;
    last_score: {
        self: number;
        opponent: number;
    };
};

export type MatchmakingTable = {
    snake: {
        recentLoss: MatchmakingUser[];
        equalSkill: MatchmakingUser[];
        equalGameAmount: MatchmakingUser[];
    };
    pong: {
        recentLoss: MatchmakingUser[];
        equalSkill: MatchmakingUser[];
        equalGameAmount: MatchmakingUser[];
    };
};

export type GamePoke = {
    fromAlias: string;
    toAlias: string;
    gameType: 'pong' | 'snake';
    timestamp: Date;
};

export function createMatchmakingUser(
    user: User, 
    isFriend: boolean, 
    gameStats: {
        wins: number;
        losses: number;
        totalGames: number;
        lastScore: { self: number; opponent: number };
    }
): MatchmakingUser {
    const winrate = gameStats.totalGames > 0 ? gameStats.wins / gameStats.totalGames : 0;
    
    return {
        ...toPublicUser(user),
        friends: isFriend,
        status: user.status || userStatus.OFFLINE,
        win: gameStats.wins,
        loss: gameStats.losses,
        total_games: gameStats.totalGames,
        winrate: Math.round(winrate * 100) / 100, // Round to 2 decimal places
        last_score: gameStats.lastScore
    };
}

export function createGamePoke(fromAlias: string, toAlias: string, gameType: 'pong' | 'snake'): GamePoke {
    return {
        fromAlias,
        toAlias,
        gameType,
        timestamp: new Date()
    };
}