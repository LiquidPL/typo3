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

namespace TYPO3\CMS\Backend\Controller;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\Attribute\AsController;
use TYPO3\CMS\Backend\Form\FormDataCompiler;
use TYPO3\CMS\Backend\Form\FormDataGroup\TcaSelectGroupUsersAjaxFieldData;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\DataHandling\DataHandler;
use TYPO3\CMS\Core\Http\JsonResponse;
use TYPO3\CMS\Core\Utility\GeneralUtility;

#[AsController]
class FormSelectGroupUsersAjaxController
{
    public function __construct(
        private readonly FormDataCompiler $formDataCompiler,
    ) {
    }

    public function fetchUsersAction(ServerRequestInterface $request): ResponseInterface
    {
        $recordTypeValue = '0';
        $fieldName = 'users';

        $processedTca = $GLOBALS['TCA']['be_groups'];

        // Remove unnecessary column definitions, leaving only the users column.
        $processedTca['types'][$recordTypeValue]['showitem'] = $fieldName;
        $processedTca['columns'] = [
            $fieldName => $processedTca['columns'][$fieldName],
        ];

        $processedTca['columns']['users']['config']['pagination']['currentPage'] = (int)($request->getQueryParams()['page'] ?? 1);

        $formDataCompilerInput = [
            'request' => $request,
            'tableName' => 'be_groups',
            'vanillaUid' => (int)$request->getQueryParams()['uid'],
            'command' => 'edit',
            'processedTca' => $processedTca,
            'recordTypeValue' => $recordTypeValue,
        ];

        $formData = $this->formDataCompiler->compile($formDataCompilerInput, GeneralUtility::makeInstance(TcaSelectGroupUsersAjaxFieldData::class));

        return new JsonResponse([
            'pagination' => $formData['processedTca']['columns'][$fieldName]['config']['pagination'],
            'items' => $formData['processedTca']['columns'][$fieldName]['config']['items'],
        ]);
    }

    public function removeUserAction(ServerRequestInterface $request): ResponseInterface
    {
        $userUid = (int)$request->getQueryParams()['userUid'];
        $groupUid = (int)$request->getQueryParams()['groupUid'];

        $queryBuilder = GeneralUtility::makeInstance(ConnectionPool::class)
            ->getQueryBuilderForTable('be_users');

        $groups = $queryBuilder->select('usergroup')
            ->from('be_users')
            ->where($queryBuilder->expr()->eq('uid', ':uid'))
            ->setParameter('uid', $userUid)
            ->executeQuery()
            ->fetchOne();

        $groups = GeneralUtility::intExplode(',', $groups);

        if (($key = array_search($groupUid, $groups, true)) !== false) {
            unset($groups[$key]);
        }

        $dataHandler = GeneralUtility::makeInstance(DataHandler::class);

        $data = [];
        $data['be_users'][$userUid]['usergroup'] = implode(',', $groups);

        $dataHandler->start($data, []);
        $dataHandler->process_datamap();

        return new JsonResponse([]);
    }
}
