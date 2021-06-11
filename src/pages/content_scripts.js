import $ from 'jquery';
import Chrome from '@/core/chrome';
import { GLOBAL_EVENTS, PAGE_EVENTS } from '@/events';
import AreaSelection from '@/components/area-selection';

class App {
  constructor() {
    this.sandboxURL = Chrome.extension.getURL('sandbox.html');
    this.iframeClassName = `sandbox-iframe-${Date.now()}`;
    this.darkModeClassName = `dark-mode-${Date.now()}`;
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
    return `
      html.dark-1 {
        filter: invert(0.95) hue-rotate(180deg);
      }
      html.dark-1 img,
      html.dark-1 .icon-svg,
      html.dark-1 .lake-svg-icon,
      html.dark-1 .lake-icon-svgs,
      html.dark-1 .ant-badge,
      html.dark-1 .ant-btn.ant-btn-primary,
      html.dark-1 .ant-switch-checked {
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
    const { darkModeClassName } = this;
    this.injectStyleIfNeeded(darkModeClassName, this.darkModeCSSFieldContent);
    $('html').addClass('dark-1');
  }

  disableDarkMode() {
    $('html').removeClass('dark-1');
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
        default:
          sendResponse(true);
      }
    });
  }
}

window.app = window.app || new App();
