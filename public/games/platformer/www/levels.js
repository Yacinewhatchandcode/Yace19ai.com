// ═══════════════════════════════════════════════════════════════
// PRIME.AI — Level Data
// Tile Legend:
//   ' ' = air, 'G' = ground, 'B' = brick, '?' = question block,
//   'P' = pipe bottom, 'p' = pipe top, 'C' = coin (floating),
//   'E' = enemy (goomba), 'K' = koopa, 'M' = mushroom block,
//   'S' = stair block, 'F' = flagpole, 'f' = flag top,
//   'H' = hidden coin block, 'X' = solid invisible wall
// ═══════════════════════════════════════════════════════════════

const TILE_SIZE = 40;

const LEVELS = [
    // ─── WORLD 1-1: NEURAL PLAINS ───
    {
        name: "1-1",
        title: "NEURAL PLAINS",
        skyColor: '#5c94fc',
        groundColor: '#00a800',
        dirtColor: '#c84c0c',
        musicFn: 'startOverworldMusic',
        width: 220,
        height: 15,
        playerStart: { x: 3, y: 12 },
        tiles: [
            '                                                                                                                                                                                                                                ',
            '                                                                                                                                                                                                                                ',
            '                                                                                                                                                                                                                                ',
            '                                                                                                                                     f                                                                                          ',
            '                                                                                                                                     F                                                                                          ',
            '                                                                                                                                     F                                                                                          ',
            '                                                                                                                                     F                                                                                          ',
            '                                                                                                                                     F                                                                                          ',
            '                         ?                     ?B?B?                                                                                 F                                                                                          ',
            '                                                                                              ?  ?                                   F                                                                                          ',
            '                                    B  B  B           E                SS                                                            F                                                                                          ',
            '               E      E                                    E        SSSS        E    E                                              SF                                                                                          ',
            '             E   E               pp      pp              SSSSSS                      C  C  C                                       SSF                                                                                          ',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGGG  GGGGGGGGGGGGGGGGGGGGG                                                                                         ',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGGG  GGGGGGGGGGGGGGGGGGGGG                                                                                         ',
        ],
        clouds: [
            { x: 8, y: 2, size: 1 },
            { x: 20, y: 1, size: 2 },
            { x: 36, y: 2, size: 1 },
            { x: 55, y: 1, size: 2 },
            { x: 72, y: 2, size: 1 },
            { x: 90, y: 1, size: 1 },
        ],
        bushes: [
            { x: 12, y: 12, size: 2 },
            { x: 42, y: 12, size: 1 },
            { x: 65, y: 12, size: 2 },
        ],
        hills: [
            { x: 0, y: 11, size: 3 },
            { x: 25, y: 11, size: 2 },
            { x: 50, y: 11, size: 3 },
            { x: 80, y: 11, size: 2 },
        ]
    },

    // ─── WORLD 2-1: CYBER CAVERNS ───
    {
        name: "2-1",
        title: "CYBER CAVERNS",
        skyColor: '#0a0a2e',
        groundColor: '#555',
        dirtColor: '#333',
        musicFn: 'startUndergroundMusic',
        width: 180,
        height: 15,
        playerStart: { x: 3, y: 12 },
        tiles: [
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGGGGGGGGG                                                                                    ',
            'G                                                                                                                                                                                                                               ',
            'G                                                                                                                                                                                                                               ',
            'G                                                                                                                                        f                                                                                     ',
            'G                                                                                                                                        F                                                                                     ',
            'G                                                                                                                                        F                                                                                     ',
            'G                      C  C  C                                    ?                                                                      F                                                                                     ',
            'G                                      BBBBB                                                                                             F                                                                                     ',
            'G                                                    ?B?                      BBBB                                                       F                                                                                     ',
            'G                                                                                         ?   ?                                          F                                                                                     ',
            'G               BBBB          E     E                                   E                               SS                               F                                                                                     ',
            'G         E                                    E              E                     E               SSSS                                 SF                                                                                     ',
            'G                  pp                    pp              pp                                    SSSSSSSS                                 SSF                                                                                     ',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGG  GGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGGGGGGGGGGGGGGGGGG                                                                                    ',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGG  GGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGGGGGGGGGGGGGGGGGG                                                                                    ',
        ],
        clouds: [],
        bushes: [],
        hills: []
    },

    // ─── WORLD 3-1: SOVEREIGN SKY ───
    {
        name: "3-1",
        title: "SOVEREIGN SKY",
        skyColor: '#ff9f1c',
        groundColor: '#fff',
        dirtColor: '#ddd',
        musicFn: 'startSkyMusic',
        width: 200,
        height: 15,
        playerStart: { x: 3, y: 12 },
        tiles: [
            '                                                                                                                                                                                                                                ',
            '                                                                                                                                                                                                                                ',
            '                                                                                                                                                                                                                                ',
            '                                                                                                                                                     f                                                                          ',
            '                                                                                                                                                     F                                                                          ',
            '                                                                                                                                                     F                                                                          ',
            '                       C  C  C  C                                                 C  C  C                                                            F                                                                          ',
            '                                                                                                                                                     F                                                                          ',
            '                   ?       BBBB      ?             ?B?B?                BBB                    ?   ?   ?                                              F                                                                          ',
            '                                                                                                                                                     F                                                                          ',
            '            E       BBB          E        BBB             E       BBB          E       BBB             SS                                             F                                                                          ',
            '                                                                                                   SSSS                E                            SF                                                                          ',
            '                                                                                                SSSSSSS                                            SSF                                                                          ',
            'GGGGGGGGGGG    GGGGGGGGGG    GGGGGGGGGGG    GGGGGGGGGG    GGGGGGGGGGG    GGGGGGGGGG    GGGGGGGGGGGGGGGGGGGGGGG    GGGGGGGGGGGGG    GGGGGGGGGGGGGGGGGGGGGGG                                                                        ',
            'GGGGGGGGGGG    GGGGGGGGGG    GGGGGGGGGGG    GGGGGGGGGG    GGGGGGGGGGG    GGGGGGGGGG    GGGGGGGGGGGGGGGGGGGGGGG    GGGGGGGGGGGGG    GGGGGGGGGGGGGGGGGGGGGGG                                                                        ',
        ],
        clouds: [
            { x: 5, y: 1, size: 2 },
            { x: 22, y: 0, size: 1 },
            { x: 40, y: 1, size: 2 },
            { x: 58, y: 0, size: 1 },
            { x: 75, y: 1, size: 2 },
        ],
        bushes: [],
        hills: []
    }
];
