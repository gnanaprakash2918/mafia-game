export const TEAMS = {
    VILLAGE: 'VILLAGE',
    MAFIA: 'MAFIA',
    NEUTRAL: 'NEUTRAL',
};

export const ROLES = {
    // --- Top Priority Roles ---
    MAFIA: {
        id: 'mafia',
        name: 'Mafia',
        team: TEAMS.MAFIA,
        description: 'Work with other Mafia to eliminate the town.',
        wakeOrder: 1,
        color: 'var(--danger)', // Red
    },
    GODFATHER: {
        id: 'godfather',
        name: 'Godfather',
        team: TEAMS.MAFIA,
        description: 'Leader of the Mafia. Identify yourself to other Mafia.',
        wakeOrder: 1,
        color: 'var(--danger)',
    },
    DOCTOR: {
        id: 'doctor',
        name: 'Doctor',
        team: TEAMS.VILLAGE,
        description: 'Protect one person from being killed each night.',
        wakeOrder: 3, // Wake after Detective
        color: 'var(--success)', // Green
    },
    DETECTIVE: {
        id: 'detective',
        name: 'Detective',
        team: TEAMS.VILLAGE,
        description: 'Investigate one person each night to find their role.',
        wakeOrder: 2, // Wake after Mafia
        color: 'var(--success)',
    },
    JESTER: {
        id: 'jester',
        name: 'Jester',
        team: TEAMS.NEUTRAL,
        description: 'Trick the town into voting you out.',
        wakeOrder: -1,
        color: 'var(--warning)', // Yellow/Orange
    },
    VILLAGER: {
        id: 'villager',
        name: 'Villager',
        team: TEAMS.VILLAGE,
        description: 'Find the Mafia and vote them out during the day.',
        wakeOrder: -1,
        color: 'var(--success)',
    },

    // --- Crazy/Other Roles ---
    VIGILANTE: {
        id: 'vigilante',
        name: 'Vigilante',
        team: TEAMS.VILLAGE,
        description: 'You can take the law into your own hands and kill a suspect.',
        wakeOrder: 4,
        color: 'var(--success)',
    },
    MAYOR: {
        id: 'mayor',
        name: 'Mayor',
        team: TEAMS.VILLAGE,
        description: 'Your vote counts as two.',
        wakeOrder: -1,
        color: 'var(--success)',
    },
    FRAMER: {
        id: 'framer',
        name: 'Framer',
        team: TEAMS.MAFIA,
        description: 'Choose a player to appear as Mafia to the Detective.',
        wakeOrder: 0, // Wake first? Or with Mafia? Let's say with Mafia for now or specific slot.
        // Simplifying: Framer wakes with Mafia for now in basic logic, or specifically before.
        // User requested sequence: Sleep -> Mafia -> Detective -> Doctor -> Wake.
        // Framer usually acts with Mafia or separate. Let's keep wakeOrder simple for now.
        color: 'var(--danger)',
    },
    EXECUTIONER: {
        id: 'executioner',
        name: 'Executioner',
        team: TEAMS.NEUTRAL,
        description: 'Your goal is to get a specific target lynched.',
        wakeOrder: -1,
        color: 'var(--warning)',
    },

    // Premium Exclusive
    ISEKAI: {
        id: 'isekai',
        name: 'Isekai',
        team: TEAMS.NEUTRAL,
        description: 'You are from another world. You must survive until the end.',
        wakeOrder: -1,
        color: 'var(--accent)', // Cyan?
    },
};

export const GAME_PHASES = {
    WELCOME: 'WELCOME', // New phase
    SETUP: 'SETUP',
    ROLE_REVEAL: 'ROLE_REVEAL',
    NIGHT_INTRO: 'NIGHT_INTRO',
    NIGHT_ACTIVE: 'NIGHT_ACTIVE',
    DAY_INTRO: 'DAY_INTRO',
    DISCUSSION: 'DISCUSSION',
    VOTING: 'VOTING',
    GAME_OVER: 'GAME_OVER',
};
