<?php

defined('TYPO3') or die();

use PhLudwigsburg\SoleMap\Controller\MapController;
use TYPO3\CMS\Extbase\Utility\ExtensionUtility;

ExtensionUtility::configurePlugin(
    'SoleMap',
    'Map',
    [MapController::class => 'show'],
    [],
    ExtensionUtility::PLUGIN_TYPE_CONTENT_ELEMENT
);