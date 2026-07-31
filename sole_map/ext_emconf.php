<?php

$EM_CONF[$_EXTKEY] = [
    'title' => 'SoLE Kooperationspartner-Karte',
    'description' => 'Interactive map of SoLE cooperation partners.',
    'category' => 'plugin',
    'author' => 'Pädagogische Hochschule Ludwigsburg',
    'state' => 'stable',
    'clearCacheOnLoad' => true,
    'version' => '1.0.0',
    'constraints' => [
        'depends' => [
            'typo3' => '12.4.0-13.4.99',
        ],
        'conflicts' => [],
        'suggests' => [],
    ],
];