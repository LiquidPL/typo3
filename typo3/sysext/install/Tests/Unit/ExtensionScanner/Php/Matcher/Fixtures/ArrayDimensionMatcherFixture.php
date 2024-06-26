<?php

declare(strict_types=1);

/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

namespace TYPO3\CMS\Install\Tests\Unit\ExtensionScanner\Php\Matcher\Fixtures;

/**
 * Fixture file
 */
class ArrayDimensionMatcherFixture
{
    public function aMethod(): void
    {
        // Match
        $foo['maxSessionDataSize'];
        $foo['bar']['maxSessionDataSize'];

        // No match
        $foo['foo'];
        $foo[$maxSessionDataSize];
        $foo->maxSessionDataSize;
        $foo::maxSessionDataSize;
        // @extensionScannerIgnoreLine
        $foo['maxSessionDataSize'];

        // Match (again). No longer ignored.
        $foo['bar']['maxSessionDataSize'];
        // Ignore match (again). Done only once here for all fixtures.
        // @extensionScannerIgnoreLine
        $foo['bar']['maxSessionDataSize'];
    }
}
