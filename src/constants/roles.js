export const TEAMS = {
    VILLAGE: 'VILLAGE',
    MAFIA: 'MAFIA',
    NEUTRAL: 'NEUTRAL',
};

export const CATEGORIES = {
    CLASSIC: 'Classic',
    CRAZY: 'Crazy',
    CHAOS: 'Chaos',
    CORONA: 'Corona',
    CRIMSON: 'Crimson',
    PREMIUM: 'Premium',
};

// High Priority: Blockers > Killers > Investigators > Special
// Wake Order:
// 0: Initial/Passive (non-waking)
// 1: Mafia/Godfather (Kill)
// 2: Blockers/Redirectors (Roleblocker, Distractor, Goose)
// 3: Killers (Vigilante, Serial Killer)
// 4: Investigators (Detective, PI, Watcher, Spy, Hacker)
// 5: Protectors (Doctor, Bodyguard)
// 6: Special/Misc (Framer, etc - often with Mafia)

export const ROLES = {
    // --- CLASSIC ---
    GODFATHER: {
        id: 'godfather',
        name: 'Godfather',
        team: TEAMS.MAFIA,
        category: CATEGORIES.CLASSIC,
        description: 'Leader of the Mafia. Appear as innocent to Detective.',
        wakeOrder: 1,
        color: 'var(--danger)',
    },
    MAFIA: {
        id: 'mafia',
        name: 'Mafia',
        team: TEAMS.MAFIA,
        category: CATEGORIES.CLASSIC,
        description: 'Kill a villager each night.',
        wakeOrder: 1,
        color: 'var(--danger)',
    },
    DOCTOR: {
        id: 'doctor',
        name: 'Doctor',
        team: TEAMS.VILLAGE,
        category: CATEGORIES.CLASSIC,
        description: 'Heal one person each night.',
        wakeOrder: 5,
        color: 'var(--success)',
    },
    DETECTIVE: {
        id: 'detective',
        name: 'Detective',
        team: TEAMS.VILLAGE,
        category: CATEGORIES.CLASSIC,
        description: 'Check a player\'s alignment.',
        wakeOrder: 4,
        color: 'var(--success)',
    },
    VILLAGER: {
        id: 'villager',
        name: 'Villager',
        team: TEAMS.VILLAGE,
        category: CATEGORIES.CLASSIC,
        description: 'Find the Mafia and vote them out.',
        wakeOrder: 0,
        color: 'var(--success)',
    },

    // --- CRAZY ---
    VIGILANTE: {
        id: 'vigilante',
        name: 'Vigilante',
        team: TEAMS.VILLAGE,
        category: CATEGORIES.CRAZY,
        description: 'Shoot a player at night. Suicide if you kill a villager.',
        wakeOrder: 3,
        color: 'var(--success)',
    },
    MAYOR: {
        id: 'mayor',
        name: 'Mayor',
        team: TEAMS.VILLAGE,
        category: CATEGORIES.CRAZY,
        description: 'Your vote counts as two.',
        wakeOrder: 0,
        color: 'var(--success)',
    },
    FRAMER: {
        id: 'framer',
        name: 'Framer',
        team: TEAMS.MAFIA,
        category: CATEGORIES.CRAZY,
        description: 'Make a player appear as Mafia to investigations.',
        wakeOrder: 1, // With Mafia usually
        color: 'var(--danger)',
    },
    EXECUTIONER: {
        id: 'executioner',
        name: 'Executioner',
        team: TEAMS.NEUTRAL,
        category: CATEGORIES.CRAZY,
        description: 'Get your target lynched to win.',
        wakeOrder: 0,
        color: 'var(--warning)',
    },
    JESTER: {
        id: 'jester',
        name: 'Jester',
        team: TEAMS.NEUTRAL,
        category: CATEGORIES.CRAZY,
        description: 'Get yourself lynched to win.',
        wakeOrder: 0,
        color: 'var(--warning)',
    },

    // --- CHAOS ---
    PI: {
        id: 'pi',
        name: 'Private Investigator',
        team: TEAMS.VILLAGE,
        category: CATEGORIES.CHAOS,
        description: 'Check two players to see if they are on the same team.',
        wakeOrder: 4,
        color: 'var(--success)',
    },
    SPY: {
        id: 'spy',
        name: 'Spy',
        team: TEAMS.VILLAGE,
        category: CATEGORIES.CHAOS,
        description: 'See who a player visits.',
        wakeOrder: 4,
        color: 'var(--success)',
    },
    DISTRACTOR: {
        id: 'distractor',
        name: 'Distractor',
        team: TEAMS.VILLAGE,
        category: CATEGORIES.CHAOS,
        description: 'Block a player from performing their action.',
        wakeOrder: 2,
        color: 'var(--success)',
    },
    BAITER: {
        id: 'baiter',
        name: 'Baiter',
        team: TEAMS.NEUTRAL,
        category: CATEGORIES.CHAOS,
        description: 'Anyone who visits you dies.',
        wakeOrder: 0, // Passive
        color: 'var(--warning)',
    },
    BOMBER: {
        id: 'bomber',
        name: 'Bomber',
        team: TEAMS.NEUTRAL,
        category: CATEGORIES.CHAOS,
        description: 'Plant bombs. Detonate to kill everyone.',
        wakeOrder: 3,
        color: 'var(--warning)',
    },

    // --- CORONA ---
    WATCHER: {
        id: 'watcher',
        name: 'Watcher',
        team: TEAMS.VILLAGE,
        category: CATEGORIES.CORONA,
        description: 'See who visits your target.',
        wakeOrder: 4,
        color: 'var(--success)',
    },
    PLAGUE_DOCTOR: {
        id: 'plague_doctor',
        name: 'Plague Doctor',
        team: TEAMS.NEUTRAL,
        category: CATEGORIES.CORONA,
        description: 'Infect players. Infection spreads on visit.',
        wakeOrder: 3,
        color: 'var(--warning)',
    },
    HOARDER: {
        id: 'hoarder',
        name: 'Hoarder',
        team: TEAMS.NEUTRAL,
        category: CATEGORIES.CORONA,
        description: 'Win by hoarding items (survive).',
        wakeOrder: 0,
        color: 'var(--warning)',
    },
    HACKER: {
        id: 'hacker',
        name: 'Hacker',
        team: TEAMS.MAFIA,
        category: CATEGORIES.CORONA,
        description: 'Hack a player to see precise role info.',
        wakeOrder: 4,
        color: 'var(--danger)',
    },
    GOOSE: {
        id: 'goose',
        name: 'Goose',
        team: TEAMS.MAFIA,
        category: CATEGORIES.CORONA,
        description: 'Redirect a player\'s action to a random target.',
        wakeOrder: 2,
        color: 'var(--danger)',
    },

    // --- CRIMSON ---
    LINK: {
        id: 'link',
        name: 'Link',
        team: TEAMS.VILLAGE,
        category: CATEGORIES.CRIMSON,
        description: 'Link two players so they know each other.',
        wakeOrder: 4,
        color: 'var(--success)',
    },
    MIMIC: {
        id: 'mimic',
        name: 'Mimic',
        team: TEAMS.MAFIA,
        category: CATEGORIES.CRIMSON,
        description: 'Copy a role or disguise as one.',
        wakeOrder: 2,
        color: 'var(--danger)',
    },
    ALCHEMIST: { // Variable team, simplified here
        id: 'alchemist',
        name: 'Alchemist',
        team: TEAMS.NEUTRAL,
        category: CATEGORIES.CRIMSON,
        description: 'Brew potions with random effects.',
        wakeOrder: 3,
        color: 'var(--accent)',
    },

    // --- PREMIUM ---
    ISEKAI: {
        id: 'isekai',
        name: 'Isekai',
        team: TEAMS.NEUTRAL,
        category: CATEGORIES.PREMIUM,
        description: 'Reincarnate as a new role upon death.',
        wakeOrder: 0,
        color: 'var(--accent)',
    },
    SANTA: {
        id: 'santa',
        name: 'Santa',
        team: TEAMS.NEUTRAL,
        category: CATEGORIES.PREMIUM,
        description: 'Deliver gifts. Protect the good child.',
        wakeOrder: 5,
        color: 'var(--accent)',
    },
    SILENCER: {
        id: 'silencer',
        name: 'Silencer',
        team: TEAMS.MAFIA,
        category: CATEGORIES.PREMIUM,
        description: 'Silence a player during the day.',
        wakeOrder: 2,
        color: 'var(--danger)',
    },
    GAMBLER: {
        id: 'gambler',
        name: 'Gambler',
        team: TEAMS.NEUTRAL,
        category: CATEGORIES.PREMIUM,
        description: 'Gamble on outcomes for power.',
        wakeOrder: 3,
        color: 'var(--accent)',
    },
    SHAMAN: {
        id: 'shaman',
        name: 'Shaman',
        team: TEAMS.NEUTRAL,
        category: CATEGORIES.PREMIUM,
        description: 'Redirect attacks using a totem.',
        wakeOrder: 2,
        color: 'var(--accent)',
    },
};

export const GAME_PHASES = {
    WELCOME: 'WELCOME',
    SETUP: 'SETUP',
    ROLE_REVEAL: 'ROLE_REVEAL',
    NIGHT_INTRO: 'NIGHT_INTRO',
    NIGHT_ACTIVE: 'NIGHT_ACTIVE',
    DAY_INTRO: 'DAY_INTRO',
    DISCUSSION: 'DISCUSSION',
    VOTING: 'VOTING',
    GAME_OVER: 'GAME_OVER',
};
