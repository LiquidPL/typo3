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

import { LitElement, TemplateResult, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators';
import AjaxRequest from '@typo3/core/ajax/ajax-request';
import { AjaxResponse } from '@typo3/core/ajax/ajax-response';
import '@typo3/backend/element/icon-element';
import '@typo3/backend/element/pagination';

interface Pagination {
  currentPage: number;
  itemCount: number;
  pageCount: number;
}

interface Item {
  label: string;
  value: number;
  hidden: boolean;
}

interface PageResponse {
  pagination: Pagination;
  items: Item[];
}

@customElement('typo3-backend-form-selectgroupusers')
export class SelectGroupUsersElement extends LitElement {
  @property() currentGroup: number = 0;
  @property() itemsPerPage: number = 50;
  @property({ type: Object }) pagination: Pagination = { currentPage: 1, itemCount: 0, pageCount: 0 };
  @property({ type: Array }) items: Array<Item> = [];

  protected createRenderRoot(): HTMLElement | ShadowRoot {
    // @todo Switch to Shadow DOM once Bootstrap CSS style can be applied correctly
    // const renderRoot = this.attachShadow({mode: 'open'});
    return this;
  }
  protected render(): TemplateResult {
    const items = this.items.map((item: Item) => this.renderItem(item)) ;

    let firstRecord = (this.pagination.currentPage - 1) * this.itemsPerPage + 1;
    let lastRecord = this.pagination.currentPage < this.pagination.pageCount ? this.pagination.currentPage * this.itemsPerPage : this.pagination.itemCount;

    if (this.pagination.itemCount == 0) {
      firstRecord = lastRecord = 0;
    }

    return html`
      <div class="formengine-field-item t3js-formengine-field-item">
        <div class="recordlist">
          <div class="recordlist-heading">
            <div class="recordlist-heading-row">
              <span class="recordlist-heading-title">${TYPO3.lang.be_users} (${this.pagination.itemCount})</span>
              <div class="recordlist-heading-actions">
                <button class="btn btn-sm btn-default">
                  <typo3-backend-icon identifier="actions-plus" size="small"></typo3-backend-icon>
                  ${TYPO3.lang['backendUserGroup.addUser']}
                </button>
              </div>
            </div>
          </div>
            <div class="table-fit">
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th class="nowrap"></th>
                    <th class="col-title col-responsive nowrap">${TYPO3.lang['be_users.username']}</th>
                    <th class="col-control nowrap"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colspan="3">
                      <nav class="mb-2 mt-2" aria-labelledby="group-users-pagination">
                        <span id="group-users-pagination" class="page-item ps-2 pe-2 pagination-label">
                          ${TYPO3.lang['pagination.records']} ${firstRecord}&nbsp;-&nbsp;${lastRecord}
                          <span class="visually-hidden">, ${TYPO3.lang['pagination.page']} ${this.pagination.currentPage} ${TYPO3.lang['pagination.of']} ${this.pagination.pageCount}</span>
                        </span>
                        <ul class="pagination">
                          ${this.renderPaginationButton('actions-view-paging-first', TYPO3.lang.first, this.pagination.currentPage > 1, () => this.changePage(1))}
                          ${this.renderPaginationButton('actions-view-paging-previous', TYPO3.lang.previous, this.pagination.currentPage > 1, () => this.changePage(this.pagination.currentPage - 1))}
                          <li class="page-item ps-2">
                            <label>
                              ${TYPO3.lang['pagination.page']}
                              <input
                                class="t3js-recordlist-paging form-control form-control-sm paginator-input"
                                type="number"
                                autocomplete="off"
                                min="1"
                                max="${this.pagination.pageCount}"
                                value="${this.pagination.currentPage}"
                                size="3"
                                @keyup="${this.onPageInputKeyUp}">
                            </label>
                            <span aria-hidden="true">of ${this.pagination.pageCount}</span>
                          </li>
                          ${this.renderPaginationButton('actions-view-paging-next', TYPO3.lang.next, this.pagination.currentPage < this.pagination.pageCount, () => this.changePage(this.pagination.currentPage + 1))}
                          ${this.renderPaginationButton('actions-view-paging-last', TYPO3.lang.last, this.pagination.currentPage < this.pagination.pageCount, () => this.changePage(this.pagination.pageCount))}
                        </ul>
                      </nav>
                    </td>
                  </tr>
                  ${items}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderPaginationButton(identifier: string, title: string, enabled: boolean, onClick: ((e: Event) => void)): TemplateResult {
    const inner = html`
      <li class="page-item ps-2" aria-hidden="${!enabled || nothing}">
        <typo3-backend-icon identifier="${identifier}" size="small"></typo3-backend-icon>
      </li>
    `;

    if (enabled == false) {
      return inner;
    }

    return html`<a href="#" aria-label="${title}" title="${title}" @click="${onClick}">${inner}</a>`;
  }

  private renderItem(item: Item): TemplateResult {
    const overlay = item.hidden ? 'overlay-hidden' : '';

    return html`
      <tr title="id=${item.value}">
        <td class="col-icon nowrap">
          <typo3-backend-icon identifier="status-user-backend" size="small" overlay="${overlay}"></typo3-backend-icon>
        </td>
        <td class="col-title col-responsive nowrap">${item.label}</td>
        <td class="col-control nowrap">
          <a href="#" class="btn btn-default" @click="${() => this.deleteUser(item.value)}" title="${TYPO3.lang['backendUserGroup.removeUser']}" aria-label="${TYPO3.lang['backendUserGroup.removeUser']}">
            <typo3-backend-icon identifier="actions-edit-delete" size="small"></typo3-backend-icon>
          </a>
        </td>
      </tr>
    `;
  }

  private changePage(page: number) {
    new AjaxRequest(TYPO3.settings.ajaxUrls.select_group_users_data)
      .withQueryArguments({ uid: this.currentGroup, page })
      .get()
      .then(async (response: AjaxResponse): Promise<void> => {
        const data: PageResponse = await response.resolve();

        this.pagination = data.pagination;
        this.items = data.items;
      })
  }

  private onPageInputKeyUp(e: KeyboardEvent) {
    e.preventDefault();

    const target = e.currentTarget as HTMLInputElement;

    let value = Number(target.value);
    const min = Number(target.min);
    const max = Number(target.max);

    if (min && value < min) {
      value = min;
    }

    if (max && value > max) {
      value = max;
    }

    target.value = value.toString(10);

    if (e.key != 'Enter' || value == this.pagination.currentPage) {
      return;
    }

    this.changePage(value);
  }

  private deleteUser(id: number) {
    new AjaxRequest(TYPO3.settings.ajaxUrls.select_group_users_remove_user)
      .withQueryArguments({ userUid: id, groupUid: this.currentGroup })
      .delete()
      .then(async () => this.changePage(this.pagination.currentPage));
  }
}
