<?php

declare(strict_types=1);

namespace PhLudwigsburg\SoleMap\Controller;

use Psr\Http\Message\ResponseInterface;
use TYPO3\CMS\Extbase\Mvc\Controller\ActionController;

final class MapController extends ActionController
{
    public function showAction(): ResponseInterface
    {
        return $this->htmlResponse();
    }
}