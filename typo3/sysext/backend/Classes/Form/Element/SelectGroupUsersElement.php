<?php

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

namespace TYPO3\CMS\Backend\Form\Element;

use TYPO3\CMS\Core\Page\JavaScriptModuleInstruction;
use TYPO3\CMS\Core\Utility\StringUtility;

class SelectGroupUsersElement extends AbstractFormElement
{
    public function render(): array
    {
        $resultArray = $this->initializeResultArray();

        $parameterArray = $this->data['parameterArray'];

        $selectId = StringUtility::getUniqueId('tceforms-select-groupusers-');

        $html = [];
        $html[] = $this->renderLabel($selectId);
        $html[] =   '<div class="form-wizards-wrap">';
        $html[] =       '<div class="form-wizards-element">';
        $html[] =           '<typo3-backend-form-selectgroupusers';
        $html[] =               'currentGroup="' . $this->data['vanillaUid'] . '"';
        $html[] =               'itemsPerPage="' . $parameterArray['fieldConf']['config']['itemsPerPage'] . '"';
        $html[] =               'pagination=\'' . json_encode($parameterArray['fieldConf']['config']['pagination']) . '\'';
        $html[] =               'items=\'' . json_encode($parameterArray['fieldConf']['config']['items']) . '\'';
        $html[] =           '/>';
        $html[] =       '</div>';
        $html[] =   '</div>';

        $resultArray['javaScriptModules']['selectGroupUsersElement'] = JavaScriptModuleInstruction::create(
            '@typo3/backend/form-engine/element/select-group-users-element.js',
        );
        $resultArray['additionalInlineLanguageLabelFiles'][] = 'EXT:core/Resources/Private/Language/locallang_tca.xlf';
        $resultArray['additionalInlineLanguageLabelFiles'][] = 'EXT:core/Resources/Private/Language/locallang_common.xlf';
        $resultArray['additionalInlineLanguageLabelFiles'][] = 'EXT:beuser/Resources/Private/Language/locallang.xlf';


        $resultArray['html'] = implode(LF, $html);

        return $resultArray;
    }
}
