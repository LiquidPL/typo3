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

namespace TYPO3\CMS\Backend\Form\FormDataProvider;

use Doctrine\DBAL\Exception;
use TYPO3\CMS\Backend\Form\FormDataProviderInterface;
use TYPO3\CMS\Backend\Utility\BackendUtility;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Database\Query\QueryBuilder;
use TYPO3\CMS\Core\Database\Query\Restriction\DeletedRestriction;
use TYPO3\CMS\Core\Database\Query\Restriction\WorkspaceRestriction;
use TYPO3\CMS\Core\Messaging\FlashMessage;
use TYPO3\CMS\Core\Messaging\FlashMessageService;
use TYPO3\CMS\Core\Type\ContextualFeedbackSeverity;
use TYPO3\CMS\Core\Utility\GeneralUtility;

class TcaSelectGroupUsers extends AbstractItemProvider implements FormDataProviderInterface
{
    /**
     * Retrieve all users for a given group.
     * Used exclusively for the `users` field on the `be_groups` table.
     *
     * @param array $result
     * @return array
     */
    public function addData(array $result): array
    {
        $table = $result['tableName'];

        if ($table !== 'be_groups') {
            return $result;
        }

        foreach ($result['processedTca']['columns'] as $fieldName => $fieldConfig) {
            if (empty($fieldConfig['config']['type']) || $fieldConfig['config']['type'] !== 'selectGroupUsers') {
                continue;
            }

            $databaseError = null;

            try {
                $fieldConfig['config']['items'] = $this->sanitizeItemArray($fieldConfig['config']['items'] ?? [], $table, $fieldName);
                $totalItemCount = $this->getUserCount($result);
                $fieldConfig['config']['pagination']['currentPage'] = $fieldConfig['config']['pagination']['currentPage'] ?? 1;
                $fieldConfig['config']['pagination']['itemCount'] = $totalItemCount;
                $fieldConfig['config']['pagination']['pageCount'] = (int)ceil($totalItemCount / $fieldConfig['config']['itemsPerPage']);

                if ($totalItemCount === 0) {
                    $fieldConfig['config']['pagination']['pageCount'] = 1;
                }

                $fieldConfig['config']['items'] = $this->getUsers($result, $fieldName, $fieldConfig['config']['pagination']['currentPage']);
            } catch (Exception $e) {
                $databaseError = $e->getPrevious()->getMessage();
            }

            if ($databaseError !== null) {
                $msg = $databaseError . '. ' . $this->getLanguageService()->sL('LLL:EXT:core/Resources/Private/Language/locallang_core.xlf:error.database_schema_mismatch');
                $msgTitle = $this->getLanguageService()->sL('LLL:EXT:core/Resources/Private/Language/locallang_core.xlf:error.database_schema_mismatch_title');

                $flashMessage = GeneralUtility::makeInstance(FlashMessage::class, $msg, $msgTitle, ContextualFeedbackSeverity::ERROR, true);
                $flashMessageService = GeneralUtility::makeInstance(FlashMessageService::class);
                $defaultFlashMessageQueue = $flashMessageService->getMessageQueueByIdentifier();
                $defaultFlashMessageQueue->enqueue($flashMessage);
                continue;
            }

            $fieldConfig['config']['items'] = $this->removeItemsByUserLanguageFieldRestriction($result, $fieldName, $fieldConfig['config']['items']);
            $fieldConfig['config']['items'] = $this->removeItemsByUserAuthMode($result, $fieldName, $fieldConfig['config']['items']);
            $fieldConfig['config']['items'] = $this->removeItemsByDoktypeUserRestriction($result, $fieldName, $fieldConfig['config']['items']);

            $result['processedTca']['columns'][$fieldName] = $fieldConfig;
        }

        return $result;
    }

    /**
     * @throws Exception
     */
    private function getUserCount(array $result): int
    {
        return $this->buildQueryBuilder($result['databaseRow']['uid'])->count('uid')
            ->executeQuery()
            ->fetchOne();
    }

    /**
     * @throws Exception
     */
    private function getUsers(array $result, string $fieldName, int $currentPage): array
    {
        $fieldList = BackendUtility::getCommonSelectFields('be_users', 'be_users.');
        $fieldList = GeneralUtility::trimExplode(',', $fieldList, true);

        $maxResults = $result['processedTca']['columns'][$fieldName]['config']['itemsPerPage'] ?? 50;
        $firstResult = ($currentPage - 1) * $maxResults;

        $result = $this->buildQueryBuilder($result['databaseRow']['uid'])->select(...$fieldList)
            ->setMaxResults($maxResults)
            ->setFirstResult($firstResult)
            ->executeQuery()
            ->fetchAllAssociative();

        $items = [];

        foreach ($result as $row) {
            $items[] = [
                'label' => BackendUtility::getRecordTitle('be_users', $row),
                'value' => $row['uid'],
                'hidden' => (bool)$row['disable'],
            ];
        }

        return $items;
    }

    private function buildQueryBuilder(?int $groupId = null): QueryBuilder
    {
        $queryBuilder = GeneralUtility::makeInstance(ConnectionPool::class)
            ->getQueryBuilderForTable('be_users');

        $queryBuilder->getRestrictions()
            ->removeAll()
            ->add(GeneralUtility::makeInstance(DeletedRestriction::class))
            ->add(GeneralUtility::makeInstance(WorkspaceRestriction::class, $this->getBackendUser()->workspace));

        $queryBuilder
            ->from('be_users');

        if ($groupId !== null) {
            $queryBuilder
                ->where($queryBuilder->expr()->inSet('usergroup', ':groupId'))
                ->setParameter('groupId', $groupId);
        }

        return $queryBuilder;
    }
}
