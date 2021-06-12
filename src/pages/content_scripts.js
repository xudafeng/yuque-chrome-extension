import $ from 'jquery';
import Chrome from '@/core/chrome';
import { GLOBAL_EVENTS, PAGE_EVENTS } from '@/events';
import AreaSelection from '@/components/area-selection';

class App {
  constructor() {
    this.sandboxURL = Chrome.extension.getURL('sandbox.html');
    this.iframeClassName = `sandbox-iframe-${Date.now()}`;
    this.darkModeClassName = `dark-mode-${Date.now()}`;
    this.darkModeHTMLClassName = 'dark-1';
    this.areaSelection = null;
    this.bindEvent();
  }

  injectStyleIfNeeded(className, css) {
    if ($(`#${className}`)[0]) return;
    const style = document.createElement('style');
    style.id = className;
    style.innerHTML = css;
    document.head.appendChild(style);
  }

  get iframeCSSFieldContent() {
    const { iframeClassName } = this;
    return `
      .${iframeClassName} {
        display: none;
        border: none;
        margin: 0;
        padding: 0;
        min-height: 0;
        min-width: 0;
        overflow: hidden;
        position: fixed;
        transition: initial;
        width: 100%;
        height: 100%;
        right: 0;
        top: 0;
        z-index: 999999;
        background: rgba(0, 0, 0, 0.2);
      }
      .${iframeClassName}.show {
        display: block;
      }
    `;
  }

  get darkModeCSSFieldContent() {
    const { darkModeHTMLClassName } = this;
    return `
      html.${darkModeHTMLClassName} {
        filter: invert(0.95) hue-rotate(180deg);
      }
      html.${darkModeHTMLClassName} img,
      html.${darkModeHTMLClassName} .icon-svg,
      html.${darkModeHTMLClassName} .lake-svg-icon,
      html.${darkModeHTMLClassName} .lake-icon-svgs,
      html.${darkModeHTMLClassName} .ant-badge,
      html.${darkModeHTMLClassName} .ant-btn.ant-btn-primary,
      html.${darkModeHTMLClassName} .ant-switch-checked {
        filter: invert(0.95) hue-rotate(180deg);
      }
    `;
  }

  showBoard() {
    const { sandboxURL, iframeClassName } = this;
    this.injectStyleIfNeeded(iframeClassName, this.iframeCSSFieldContent);
    const iframe = $(`iframe[src="${sandboxURL}"]`);
    if (!iframe[0]) {
      $('body').append(`<iframe src="${sandboxURL}" class="${iframeClassName} show" />`);
    }
  }

  removeIframe() {
    const { sandboxURL } = this;
    $(`iframe[src="${sandboxURL}"]`).remove();
  }

  getPageHTML() {
    const body = $('html').clone();
    body.find('script').remove();
    body.find('style').remove();
    body.removeClass();
    return body.html();
  }

  startSelect() {
    const { sandboxURL } = this;
    const iframe = $(`iframe[src="${sandboxURL}"]`);
    if (!iframe[0]) return;
    iframe.removeClass('show');
    this.areaSelection = this.areaSelection || new AreaSelection();
    this.areaSelection.on(PAGE_EVENTS.AREA_SELECTED, (node) => {
      const html = $(node).html();
      Chrome.runtime.sendMessage({
        action: GLOBAL_EVENTS.GET_SELECTED_HTML,
        html,
      }, () => {
        iframe.addClass('show');
      });
    });
    this.areaSelection.init();
  }

  enableDarkMode() {
    const { darkModeClassName, darkModeHTMLClassName } = this;
    this.injectStyleIfNeeded(darkModeClassName, this.darkModeCSSFieldContent);
    $('html').addClass(darkModeHTMLClassName);
  }

  disableDarkMode() {
    const { darkModeHTMLClassName } = this;
    $('html').removeClass(darkModeHTMLClassName);
  }

  saveToNote(data) {
    this.showBoard(data);
  }

  bindEvent() {
    Chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
      switch (request.action) {
        case GLOBAL_EVENTS.SHOW_BOARD: {
          this.showBoard();
          sendResponse(true);
          return;
        }
        case GLOBAL_EVENTS.START_SELECT: {
          this.startSelect();
          sendResponse(true);
          return;
        }
        case GLOBAL_EVENTS.CLOSE_BOARD: {
          this.removeIframe();
          sendResponse(true);
          return;
        }
        case GLOBAL_EVENTS.GET_PAGE_HTML: {
          const html = this.getPageHTML();
          sendResponse(html);
          return;
        }
        case GLOBAL_EVENTS.ENABLE_DARK_MODE: {
          this.enableDarkMode();
          sendResponse(true);
          return;
        }
        case GLOBAL_EVENTS.DISABLE_DARK_MODE: {
          this.disableDarkMode();
          sendResponse(true);
          return;
        }
        case GLOBAL_EVENTS.SAVE_TO_NOTE: {
          this.saveToNote(request);
          sendResponse(true);
          return;
        }
        default:
          sendResponse(true);
      }
    });
  }
}

window.app = window.app || new App();
