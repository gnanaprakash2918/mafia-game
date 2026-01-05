export const ROLES = {
    // Classic Roles
    GODFATHER: {
        id: 'godfather',
        name: 'Godfather',
        team: 'MAFIA',
        description: 'Leader of the Mafia. Identify yourself to other Mafia members.',
        wakeOrder: 1,
    },
    MAFIA: {
        id: 'mafia',
        name: 'Mafia',
        team: 'MAFIA',
        description: 'Work with the Godfather to eliminate the town.',
        wakeOrder: 1,
    },
    DOCTOR: {
        id: 'doctor',
        name: 'Doctor',
        team: 'VILLAGE',
        description: 'Protect one person from being killed each night.',
        wakeOrder: 2,
    },
    DETECTIVE: {
        id: 'detective',
        name: 'Detective',
        team: 'VILLAGE',
        description: 'Investigate one person each night to find their role.',
        wakeOrder: 3,
    },
    VILLAGER: {
        id: 'villager',
        name: 'Villager',
        team: 'VILLAGE',
        description: 'Find the Mafia and vote them out during the day.',
        wakeOrder: -1,
    },

    // Crazy Roles
    VIGILANTE: {
        id: 'vigilante',
        name: 'Vigilante',
        team: 'VILLAGE',
        description: 'You can take the law into your own hands and kill a suspect.',
        wakeOrder: 4,
    },
    MAYOR: {
        id: 'mayor',
        name: 'Mayor',
        team: 'VILLAGE',
        description: 'Your vote counts as two.',
        wakeOrder: -1,
    },
    FRAMER: {
        id: 'framer',
        name: 'Framer',
        team: 'MAFIA',
        description: 'Choose a player to appear as Mafia to the Detective.',
        wakeOrder: 0,
    },
    EXECUTIONER: {
        id: 'executioner',
        name: 'Executioner',
        team: 'NEUTRAL',
        description: 'Your goal is to get a specific target lynched.',
        wakeOrder: -1,
    },
    JESTER: {
        id: 'jester',
        name: 'Jester',
        team: 'NEUTRAL',
        description: 'Trick the town into voting you out.',
        wakeOrder: -1,
    },

    // Premium Exclusive
    ISEKAI: {
        id: 'isekai',
        name: 'Isekai',
        team: 'NEUTRAL',
        description: 'You are from another world. You must survive until the end.',
        wakeOrder: -1,
    },
};

export const TEAMS = {
    VILLAGE: 'VILLAGE',
    MAFIA: 'MAFIA',
    NEUTRAL: 'NEUTRAL',
};

export const GAME_PHASES = {
    SETUP: 'SETUP',
    ROLE_REVEAL: 'ROLE_REVEAL',
    NIGHT_INTRO: 'NIGHT_INTRO',
    NIGHT_ACTIVE: 'NIGHT_ACTIVE',
    DAY_INTRO: 'DAY_INTRO',
    DISCUSSION: 'DISCUSSION',
    VOTING: 'VOTING',
    GAME_OVER: 'GAME_OVER',
};
