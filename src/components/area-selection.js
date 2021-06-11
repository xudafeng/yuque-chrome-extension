import $ from 'jquery';
import Eventemitter from 'eventemitter3';
import { PAGE_EVENTS } from '@/events';

class AreaSelection extends Eventemitter {
  constructor(options = {}) {
    super();
    this.container = options.container || $('html');
    this.highlightClassName = `hightlight-area-${Date.now()}`;
    this.prevElem = null;
  }

  init() {
    this.injectStyle();
    this.bindEvent();
  }

  clean() {
    const { highlightClassName } = this;
    this.container.find(`.${highlightClassName}`).removeClass(highlightClassName);
    this.unbindEvent();
    this.prevElem = null;
  }

  bindEvent() {
    this.container.one('click', this.onSelectedArea);
    this.container.on('mousemove', this.onMouseMove);
    this.container.on('keydown', this.onKeyDown);
  }

  unbindEvent() {
    this.container.off('click', this.onSelectedArea);
    this.container.off('mousemove', this.onMouseMove);
    this.container.off('keydown', this.onKeyDown);
  }

  get cssFieldContent() {
    const { highlightClassName } = this;
    return `
      .${highlightClassName} {
        cursor: pointer !important;
        background-color: #fafafa !important;
        outline: 2px dashed #1669bb !important;
        opacity: 0.9 !important;
        transition: opacity 0.3s ease !important;
      };
    `;
  }

  injectStyle() {
    const { highlightClassName } = this;
    if ($(`#${highlightClassName}`)[0]) return;
    const style = document.createElement('style');
    style.id = highlightClassName;
    style.innerHTML = this.cssFieldContent;
    document.head.appendChild(style);
  }

  onMouseMove = (e) => {
    if (!e.target) return;
    const { highlightClassName } = this;
    if (this.prevElem) {
      $(this.prevElem).removeClass(highlightClassName);
    }
    $(e.target).addClass(highlightClassName);
    this.prevElem = e.target;
  }

  onKeyDown = e => {
    if (e.keyCode === 27) {
      this.clean();
      e.preventDefault();
    }
  }

  onSelectedArea = (e) => {
    if (!this.prevElem) return;
    this.clean();
    this.emit(PAGE_EVENTS.AREA_SELECTED, e.target);
    return false;
  }
}

export default AreaSelection;
