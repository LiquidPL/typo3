.. include:: /Includes.rst.txt

.. _deprecation-99615-1674056024:

=================================================
Deprecation: #99615 - GeneralUtility::_GPmerged()
=================================================

See :issue:`99615`

Description
===========

Method :php:`\TYPO3\CMS\Backend\Utility\GeneralUtility::_GPmerged()` has
been marked as deprecated and should not be used any longer.

Modern code should access GET and POST data from the PSR-7 :php:`ServerRequestInterface`,
and should avoid accessing superglobals :php:`$_GET` and :php:`$_POST`
directly. This helps creating controller classes with a clean architecture. Some
:php:`GeneralUtility` related helper methods like :php:`_GPmerged()` violate this,
using them is considered a technical debt. They are being phased out.


Impact
======

Calling the method will raise a deprecation level log error and will
stop working with TYPO3 v13.


Affected installations
======================

Instances with extensions using :php:`GeneralUtility::_GPmerged()` are affected.
The extension scanner will find usages with a strong match.


Migration
=========

:php:`GeneralUtility::_GPmerged()` is a helper method that retrieves
request parameters and returns the value, while POST parameters take
precedence over GET parameters, if both exist.

The same result can be achieved by retrieving arguments from the request object.
An instance of the PSR-7 :php:`ServerRequestInterface` is hand over to
controllers by TYPO3 core PSR-15 :php:`RequestHandlerInterface` and Middleware
implementations, and is available in various related scopes like the Frontend
:php:`ContentObjectRenderer`.

Typical code:

..  code-block:: php

    // Before
    $getMergedWithPost = GeneralUtility::_GPmerged('tx_scheduler');

    // After
    $getMergedWithPost = $request->getQueryString()['tx_scheduler'];
    ArrayUtility::mergeRecursiveWithOverrule($getMergedWithPost, $request->getParsedBody()['tx_scheduler']);

.. index:: Backend, PHP-API, FullyScanned, ext:backend