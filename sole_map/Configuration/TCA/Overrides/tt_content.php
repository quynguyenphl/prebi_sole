<?php

defined('TYPO3') or die();

use TYPO3\CMS\Extbase\Utility\ExtensionUtility;

ExtensionUtility::registerPlugin(
    'SoleMap',
    'Map',
    'SoLE Kooperationspartner-Karte'
);