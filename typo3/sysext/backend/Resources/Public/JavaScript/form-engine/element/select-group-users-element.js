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
var __decorate=function(e,t,a,n){var i,r=arguments.length,s=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,a):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,a,n);else for(var o=e.length-1;o>=0;o--)(i=e[o])&&(s=(r<3?i(s):r>3?i(t,a,s):i(t,a))||s);return r>3&&s&&Object.defineProperty(t,a,s),s};import{LitElement,html,nothing}from"lit";import{customElement,property}from"lit/decorators.js";import AjaxRequest from"@typo3/core/ajax/ajax-request.js";import"@typo3/backend/element/icon-element.js";import"@typo3/backend/element/pagination.js";let SelectGroupUsersElement=class extends LitElement{constructor(){super(...arguments),this.currentGroup=0,this.itemsPerPage=50,this.pagination={currentPage:1,itemCount:0,pageCount:0},this.items=[]}createRenderRoot(){return this}render(){const e=this.items.map((e=>this.renderItem(e)));let t=(this.pagination.currentPage-1)*this.itemsPerPage+1,a=this.pagination.currentPage<this.pagination.pageCount?this.pagination.currentPage*this.itemsPerPage:this.pagination.itemCount;return 0==this.pagination.itemCount&&(t=a=0),html`
      <div class="formengine-field-item t3js-formengine-field-item">
        <div class="recordlist">
          <div class="recordlist-heading">
            <div class="recordlist-heading-row">
              <span class="recordlist-heading-title">${TYPO3.lang.be_users} (${this.pagination.itemCount})</span>
              <div class="recordlist-heading-actions">
                <button class="btn btn-sm btn-default">
                  <typo3-backend-icon identifier="actions-plus" size="small"></typo3-backend-icon>
                  ${TYPO3.lang["backendUserGroup.addUser"]}
                </button>
              </div>
            </div>
          </div>
            <div class="table-fit">
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th class="nowrap"></th>
                    <th class="col-title col-responsive nowrap">${TYPO3.lang["be_users.username"]}</th>
                    <th class="col-control nowrap"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colspan="3">
                      <nav class="mb-2 mt-2" aria-labelledby="group-users-pagination">
                        <span id="group-users-pagination" class="page-item ps-2 pe-2 pagination-label">
                          ${TYPO3.lang["pagination.records"]} ${t}&nbsp;-&nbsp;${a}
                          <span class="visually-hidden">, ${TYPO3.lang["pagination.page"]} ${this.pagination.currentPage} ${TYPO3.lang["pagination.of"]} ${this.pagination.pageCount}</span>
                        </span>
                        <ul class="pagination">
                          ${this.renderPaginationButton("actions-view-paging-first",TYPO3.lang.first,this.pagination.currentPage>1,(()=>this.changePage(1)))}
                          ${this.renderPaginationButton("actions-view-paging-previous",TYPO3.lang.previous,this.pagination.currentPage>1,(()=>this.changePage(this.pagination.currentPage-1)))}
                          <li class="page-item ps-2">
                            <label>
                              ${TYPO3.lang["pagination.page"]}
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
                          ${this.renderPaginationButton("actions-view-paging-next",TYPO3.lang.next,this.pagination.currentPage<this.pagination.pageCount,(()=>this.changePage(this.pagination.currentPage+1)))}
                          ${this.renderPaginationButton("actions-view-paging-last",TYPO3.lang.last,this.pagination.currentPage<this.pagination.pageCount,(()=>this.changePage(this.pagination.pageCount)))}
                        </ul>
                      </nav>
                    </td>
                  </tr>
                  ${e}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `}renderPaginationButton(e,t,a,n){const i=html`
      <li class="page-item ps-2" aria-hidden="${!a||nothing}">
        <typo3-backend-icon identifier="${e}" size="small"></typo3-backend-icon>
      </li>
    `;return 0==a?i:html`<a href="#" aria-label="${t}" title="${t}" @click="${n}">${i}</a>`}renderItem(e){const t=e.hidden?"overlay-hidden":"";return html`
      <tr title="id=${e.value}">
        <td class="col-icon nowrap">
          <typo3-backend-icon identifier="status-user-backend" size="small" overlay="${t}"></typo3-backend-icon>
        </td>
        <td class="col-title col-responsive nowrap">${e.label}</td>
        <td class="col-control nowrap">
          <a href="#" class="btn btn-default" @click="${()=>this.deleteUser(e.value)}" title="${TYPO3.lang["backendUserGroup.removeUser"]}" aria-label="${TYPO3.lang["backendUserGroup.removeUser"]}">
            <typo3-backend-icon identifier="actions-edit-delete" size="small"></typo3-backend-icon>
          </a>
        </td>
      </tr>
    `}changePage(e){new AjaxRequest(TYPO3.settings.ajaxUrls.select_group_users_data).withQueryArguments({uid:this.currentGroup,page:e}).get().then((async e=>{const t=await e.resolve();this.pagination=t.pagination,this.items=t.items}))}onPageInputKeyUp(e){e.preventDefault();const t=e.currentTarget;let a=Number(t.value);const n=Number(t.min),i=Number(t.max);n&&a<n&&(a=n),i&&a>i&&(a=i),t.value=a.toString(10),"Enter"==e.key&&a!=this.pagination.currentPage&&this.changePage(a)}deleteUser(e){new AjaxRequest(TYPO3.settings.ajaxUrls.select_group_users_remove_user).withQueryArguments({userUid:e,groupUid:this.currentGroup}).delete().then((async()=>this.changePage(this.pagination.currentPage)))}};__decorate([property()],SelectGroupUsersElement.prototype,"currentGroup",void 0),__decorate([property()],SelectGroupUsersElement.prototype,"itemsPerPage",void 0),__decorate([property({type:Object})],SelectGroupUsersElement.prototype,"pagination",void 0),__decorate([property({type:Array})],SelectGroupUsersElement.prototype,"items",void 0),SelectGroupUsersElement=__decorate([customElement("typo3-backend-form-selectgroupusers")],SelectGroupUsersElement);export{SelectGroupUsersElement};