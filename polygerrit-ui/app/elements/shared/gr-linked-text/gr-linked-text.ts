/**
 * @license
 * Copyright (C) 2015 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import '../../../styles/shared-styles';
import {GrLinkTextParser, LinkTextParserConfig} from './link-text-parser';
import {GerritNav} from '../../core/gr-navigation/gr-navigation';
import {LitElement, css, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators';

declare global {
  interface HTMLElementTagNameMap {
    'gr-linked-text': GrLinkedText;
  }
}

@customElement('gr-linked-text')
export class GrLinkedText extends LitElement {
  private outputElement?: HTMLSpanElement;

  @property({type: Boolean})
  removeZeroWidthSpace?: boolean;

  @property({type: String})
  content = '';

  @property({type: Boolean, attribute: true})
  pre = false;

  @property({type: Boolean, attribute: true})
  disabled = false;

  @property({type: Boolean, attribute: true})
  inline = false;

  @property({type: Object})
  config?: LinkTextParserConfig;

  static override get styles() {
    return css`
      :host {
        display: block;
      }
      :host([inline]) {
        display: inline;
      }
      :host([pre]) ::slotted(span) {
        white-space: var(--linked-text-white-space, pre-wrap);
        word-wrap: var(--linked-text-word-wrap, break-word);
      }
      :host([disabled]) ::slotted(a) {
        color: inherit;
        text-decoration: none;
        pointer-events: none;
      }
      ::slotted(a) {
        color: var(--link-color);
      }
    `;
  }

  override render() {
    return html`<slot name="insert"></slot>`;
  }

  // NOTE: LinkTextParser dynamically creates HTML fragments based on backend
  // configuration commentLinks. These commentLinks can contain arbitrary HTML
  // fragments. This means that arbitrary HTML needs to be injected into the
  // DOM-tree, where this HTML is is controlled on the server-side in the
  // server-configuration rather than by arbitrary users.
  // To enable this injection of 'unsafe' HTML, LinkTextParser generates
  // HTML fragments. Lit does not support inserting html fragments directly
  // into its DOM-tree as it controls the DOM-tree that it generates.
  // Therefore, to get around this we create a single element that we slot into
  // the Lit-owned DOM.  This element will not be part of this LitElement as
  // it's slotted in and thus can be modified on the fly by _handleParseResult.
  override firstUpdated(_changedProperties: PropertyValues): void {
    this.outputElement = document.createElement('span');
    this.outputElement.id = 'output';
    this.outputElement.slot = 'insert';
    this.append(this.outputElement);
  }

  override updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('content') || changedProperties.has('config')) {
      this._contentOrConfigChanged();
    }
  }

  /**
   * Because either the source text or the linkification config has changed,
   * the content should be re-parsed.
   * Private but used in tests.
   *
   * @param content The raw, un-linkified source string to parse.
   * @param config The server config specifying commentLink patterns
   */
  _contentOrConfigChanged() {
    if (!this.config) {
      this.outputElement!.textContent = this.content;
      return;
    }

    const config = GerritNav.mapCommentlinks(this.config);
    this.outputElement!.textContent = '';
    const parser = new GrLinkTextParser(
      config,
      (text: string | null, href: string | null, fragment?: DocumentFragment) =>
        this._handleParseResult(text, href, fragment),
      this.removeZeroWidthSpace
    );
    parser.parse(this.content);

    // Ensure that external links originating from HTML commentlink configs
    // open in a new tab. @see Issue 5567
    // Ensure links to the same host originating from commentlink configs
    // open in the same tab. When target is not set - default is _self
    // @see Issue 4616
    this.outputElement!.querySelectorAll('a').forEach(anchor => {
      if (anchor.hostname === window.location.hostname) {
        anchor.removeAttribute('target');
      } else {
        anchor.setAttribute('target', '_blank');
      }
      anchor.setAttribute('rel', 'noopener');
    });
  }

  /**
   * This method is called when the GrLikTextParser emits a partial result
   * (used as the "callback" parameter). It will be called in either of two
   * ways:
   * - To create a link: when called with `text` and `href` arguments, a link
   *   element should be created and attached to the resulting DOM.
   * - To attach an arbitrary fragment: when called with only the `fragment`
   *   argument, the fragment should be attached to the resulting DOM as is.
   */
  private _handleParseResult(
    text: string | null,
    href: string | null,
    fragment?: DocumentFragment
  ) {
    const output = this.outputElement!;
    if (href) {
      const a = document.createElement('a');
      a.setAttribute('href', href);
      // GrLinkTextParser either pass text and href together or
      // only DocumentFragment - see LinkTextParserCallback
      a.textContent = text!;
      a.target = '_blank';
      a.setAttribute('rel', 'noopener');
      output.appendChild(a);
    } else if (fragment) {
      output.appendChild(fragment);
    }
  }
}
