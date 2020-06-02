import { Component, Element, Event, EventEmitter, h, Method, Prop, State, Watch } from '@stencil/core';
import { EditorUtils, allowedConfig, GetFontFaces, isOSKey, keys, isKey, isSpecialKey } from '../../utils/';
import { RichTextEditorOptions } from './rich-text.interface';
import { Icons } from '../icons/icons';

@Component({
    tag: 'hive-rich-text',
    styleUrl: 'rich-text.component.scss',
    shadow: true
})
export class HiveRichTextComponent {

    @Element() el: HTMLElement;

    @Prop() fontSmoothing = true;

    @State() currentStates: string[] = [];

    @State() colorOpen = false;
    @State() highlightOpen = false;
    @State() linkPopoverOpen = false;
    @State() focused = false;
    @Watch('focused')
    protected onFocusChange() {
        if (this.focused) {
            this.rteFocus.emit();
        }
        else {
            this.rteBlur.emit();
        }
    }

    /**
     * The text change event when the user releases a key-up event in the text area
     */
    @Event() textChange: EventEmitter;
    /**
     * The style change event when the user clicks to apply a new style
     */
    @Event() styleChange: EventEmitter;

    @Event() rteFocus: EventEmitter<void>;
    @Event() rteBlur: EventEmitter<void>;

    linkPopover: HTMLHiveLinkPopoverElement;
    linkPopoverTopOffset: number = 40;

    linkNode: Node;
    creatingLink: boolean;
    toolbarRef: HTMLElement;

    keycodeDown: number;
    addedToToolbar: string[] = [];

    allowCustomColor = true;
    colors = ['#FF4541', '#E65100', '#43A047', '#1C9BE6', '#6446EB', '#ACACC2', '#626272']; // default colors for text color selection
    highlights = ['#f3f315', '#ff0099', '#83f52c', '#ff6600', '#6e0dd0']; // default colors for highlighting selection
    toolbar = ['bold', 'italic', 'underline', 'strikethrough', '|', 'color', 'highlight', '|', 'link', '|', 'orderedList', 'unorderedList']; // what components to render in the corresponding order
    font = {
        family: 'Arial',
        size: '14px',
        color: '#626272'
    }

    // customize
    @Prop() options: RichTextEditorOptions = {
        placeholder: 'Insert text...'
    };

    // states
    anchorEvent: MouseEvent | TouchEvent;

    active: string;
    activeElement: HTMLElement;
    div: HTMLDivElement;
    iframe: HTMLIFrameElement;

    emptySpace = '&#65279';

    // methods
    @Method()
    async getContent() {
        return {
            text: this.iframe.contentDocument.body.innerText,
            html: this.iframe.contentDocument.body.innerHTML.replace(/&nbsp;/g, ' ')
        }
    }

    @Method()
    async setContent(value: string) {
        this.iframe.contentDocument.body.innerHTML = value;
        setTimeout(() => {
            this.checkForEmpty();
        }, 0);
    }

    @Method()
    async hiveFocus() {
        this.focus();
    }

    // lifecycle
    componentDidLoad() {
        this.setupIframe();
        this.customize();
        if (this.fontSmoothing) {
            // Enables webkit font smoothing
            this.iframe.contentDocument.body.style['-webkit-font-smoothing'] = 'antialiased';
        }
    }

    setupIframe() {
        // Needed for firefox to work
        this.iframe.contentDocument.open();
        this.iframe.contentDocument.close();

        // to allow the iframe to make styling and documentexec changes
        this.iframe.contentDocument.designMode = 'on';
        this.iframe.contentDocument.body.contentEditable = 'true';
        this.iframe.contentDocument.body.style.margin = '0';

        this.iframe.contentDocument['oninput'] = () => this.checkForEmpty();
        this.iframe.contentDocument['onchange'] = () => this.checkForEmpty();
        this.iframe.contentDocument['onclick'] = () => this.resetPopovers();
        this.iframe.contentDocument['onselectionchange'] = () => this.checkStyles();
        this.iframe.contentDocument['onkeyup'] = (event: KeyboardEvent) => this.keyup(event);
        this.iframe.contentDocument['onkeydown'] = (event: KeyboardEvent) => this.keydown(event);
        this.iframe.contentDocument['onmousedown'] = (event: MouseEvent) => this.mousedown(event);
        this.iframe.contentDocument['touchstart'] = (event: MouseEvent) => this.touchstart(event);
        this.iframe.contentDocument['onpaste'] = (event: ClipboardEvent) => this.paste(event);

        this.iframe.contentDocument.body['onfocus'] = () => {
            this.focused = true;
            if (this.options.showToolbar === 'onSelect' && this.iframe) {
                if (!this.toolbarRef.className.includes('show')) {
                    this.toolbarRef.className += ' show';
                }
            }
        }

        this.iframe.contentDocument.execCommand('defaultParagraphSeparator', false, 'h1');

        this.iframe.contentDocument.body['onblur'] = () => {
            this.focused = false;
            if (this.options.showToolbar === 'onSelect' && this.iframe) {
                setTimeout(() => { // set timeout to make sure that there isn't any popovers or focus still happening
                    if (!this.colorOpen && !this.highlightOpen && !this.linkPopoverOpen && this.iframe && this.iframe.contentDocument && !this.iframe.contentDocument.hasFocus()) {
                        this.toolbarRef.classList.remove('show');
                    }
                }, 500);
            }
        }
    }

    mousedown(event: MouseEvent) {
        this.anchorEvent = event;
    }

    keydown(event: KeyboardEvent) {
        if (isOSKey(event.keyCode)) { // keycode control button
            this.keycodeDown = event.keyCode;
        } else if (isOSKey(this.keycodeDown)) {
            switch (event.keyCode) {
                case keys['KeyB']:
                    this.toggleActiveState('bold');
                    break;
                case keys['KeyI']:
                    this.toggleActiveState('italic');
                    break;
                case keys['KeyU']:
                    this.style('underline');
                    this.toggleActiveState('underline');
                    break;
            }
        } else if (isKey(event.keyCode, 'Enter')) {
            const thisListItem = this.iframe.contentDocument.getSelection().focusNode.parentElement.closest('li') || this.iframe.contentDocument.getSelection().focusNode;

            const list = thisListItem.parentElement;

                if (list != null && list.children[list.childElementCount - 1] !== thisListItem && list.nextSibling == null) {
                    // Handle the enter key if caret is not within a list
                    if (thisListItem == null || thisListItem.nodeName !== 'LI') {
                        event.preventDefault();
                        this.iframe.contentDocument.execCommand('insertHTML', false, `<br><br>`);
                    }
                }
        }
        else if (isKey(event.keyCode, ['ArrowUp', 'ArrowDown'])) {

            // Handle the cursor position if the list is at the beginning or the end of the document
            const thisListItem = this.iframe.contentDocument.getSelection().focusNode.parentElement.closest('li');
            if (thisListItem != null) {
                const list = thisListItem.parentElement;

                if (list != null) {
                    if (isKey(event.keyCode, 'ArrowUp') && list.children[0] === thisListItem && list.previousSibling == null) {
                        const startBreak = this.iframe.contentDocument.createElement('br');
                        this.iframe.contentDocument.body.insertBefore(startBreak, list);
                    }
                    else if (isKey(event.keyCode, 'ArrowDown') && list.children[list.childElementCount - 1] === thisListItem && list.nextSibling == null) {
                        const endBreak = this.iframe.contentDocument.createElement('br');
                        this.iframe.contentDocument.body.appendChild(endBreak);
                    }
                }
            }
        }

        // prevent entering past the maxLength
        else if (
            !isSpecialKey(event.keyCode)            // allow non-typing keys
            && !isKey(event.keyCode, 'Backspace')   // allow backspacing
            && this.iframe.contentDocument.getSelection().getRangeAt(0).toString().length === 0 // allow typing over (replacing) selected text
            && (this.options.maxLength && this.options.maxLength <= (event.target as HTMLElement).innerText.length)
        ) {
            event.preventDefault();
        }
    }

    keyup(event: KeyboardEvent) {
        if (this.iframe) {
            const cursor = this.iframe.contentDocument.querySelector('.hive-cursor') as HTMLSpanElement;
            if (cursor) {
                const parentNode = cursor.parentNode as HTMLElement;
                parentNode.innerHTML = cursor.innerHTML.replace(/\uFEFF/g, '');
                cursor.remove();

                const range = this.iframe.contentDocument.createRange();
                range.setStart(parentNode, 1 || 0);

                this.iframe.contentDocument.getSelection().empty();
                this.iframe.contentDocument.getSelection().addRange(range);
            }
        }

        if (isKey(event.keyCode, 'OSLeft') || isKey(this.keycodeDown, 'OSRight')) {
            this.keycodeDown = null;
        }

        this.cleanText();
        this.textChange.emit(event);
    }

    touchstart(event: MouseEvent) {
        this.anchorEvent = event;
    }

    paste(event: ClipboardEvent) {
        if (this.iframe) {
           const length = (event.target as HTMLElement).innerText.length;
           const text = event.clipboardData.getData('text/plain');
            
           console.log('the content', event.clipboardData.getData('text/html'))


           // if text will not fit into available space,
           // trim it down to fit and perform custom paste
            if (this.options.maxLength && (this.options.maxLength < (length + text.length))) {

                const range = this.iframe.contentDocument.getSelection().getRangeAt(0);

                // max length + length of section being replaced - current length
                const availableLength = this.options.maxLength + range.toString().length - length;

                // delete current range contents
                range.deleteContents();

                // add as much of clipboard data as can fit
                const textNode = this.iframe.contentDocument.createTextNode(
                    text.slice(0, availableLength > 0 ? availableLength : 0)
                );
                range.insertNode(textNode);
                
                // set cursor to end of new text
                range.setStart(textNode, textNode.length);
                range.setEnd(textNode, textNode.length);
                this.iframe.contentDocument.getSelection().removeAllRanges();
                this.iframe.contentDocument.getSelection().addRange(range);

                // stop default paste
                event.preventDefault();
           }
        }
    }

    // sanitizeHtml()

    checkForEmpty() {
        const html = this.iframe.contentDocument.body.innerHTML;
        if (html.length < 1) {
            this.div.classList.add('empty');
        } else {
            this.div.classList.remove('empty');
        }
    }

    determineComponent(component: string) {
        let element;
        if (!this.addedToToolbar.includes(component)) {
            switch (component) {
                case '|':
                    element = <div class='vertical-divider'></div>
                    break;
                case '-':
                    element = <div class='horizontal-divider'></div>
                    break;
                case 'color':
                    element =
                        <div title={this.determineTitle(component)} class='button-container'>
                            <div id={component} class={component + ' button'} onClick={() => this.onColorClick(!this.colorOpen, 'color')}>
                                {Icons.color}
                            </div>
                            <hive-color-popover hidden={!this.colorOpen} position={this.options.position} isOpen={this.colorOpen} colors={this.colors} allowCustomColor={this.allowCustomColor} onColorSelected={($event: CustomEvent<string>) => this.submitInput('color', $event.detail)}></hive-color-popover>
                        </div>
                    this.addedToToolbar.push(component);
                    break;
                case 'highlight':
                    element =
                        <div title={this.determineTitle(component)} class='button-container'>
                            <div id={component} class={component + ' button'} onClick={() => this.onColorClick(!this.highlightOpen, 'highlight')}>
                                {Icons.highlight}
                            </div>
                            <hive-color-popover hidden={!this.highlightOpen} position={this.options.position} isOpen={this.highlightOpen} colors={this.highlights} onColorSelected={($event: CustomEvent<string>) => this.submitInput('highlight', $event.detail)}></hive-color-popover>
                        </div>
                    this.addedToToolbar.push(component);
                    break;
                case 'link':
                    element =
                        <div title={this.determineTitle(component)} class='button-container'>
                            <div class={component + ' button'} onClick={() => this.onLinkClick(!this.linkPopoverOpen)}>
                                {Icons.link}
                            </div>
                        </div>
                    this.addedToToolbar.push(component);
                    break;
                case 'undo':
                    element =
                        <div title={this.determineTitle(component)} class='button-container'>
                            <div class={component + ' button'} onClick={() => this.onActionClick(component)}>
                                {Icons[component]}
                            </div>
                        </div>
                    this.addedToToolbar.push(component);
                    break;
                case 'redo':
                    element =
                        <div title={this.determineTitle(component)} class='button-container'>
                            <div class={component + ' button'} onClick={() => this.onActionClick(component)}>
                                {Icons[component]}
                            </div>
                        </div>
                    this.addedToToolbar.push(component);
                    break;
                case 'orderedList':
                    element =
                        <div title={this.determineTitle(component)} class='button-container'>
                            <div class={component + ' button'} onClick={() => this.onActionClick('insertOrderedList', { focus: true })}>
                                {Icons[component]}
                            </div>
                        </div>
                    this.addedToToolbar.push(component);
                    break;
                case 'unorderedList':
                    element =
                        <div title={this.determineTitle(component)} class='button-container'>
                            <div class={component + ' button'} onClick={() => this.onActionClick('insertUnorderedList', { focus: true })}>
                                {Icons[component]}
                            </div>
                        </div>
                    this.addedToToolbar.push(component);
                    break;
                case 'justifyFull':
                    element =
                        <div title={this.determineTitle(component)} class='button-container'>
                            <div class={component + ' button'} onClick={() => this.onActionClick(component, { alignment: true })}>
                                {Icons[component]}
                            </div>
                        </div>
                    this.addedToToolbar.push(component);
                    break;
                case 'justifyCenter':
                    element =
                        <div title={this.determineTitle(component)} class='button-container'>
                            <div class={component + ' button'} onClick={() => this.onActionClick(component, { alignment: true })}>
                                {Icons[component]}
                            </div>
                        </div>
                    this.addedToToolbar.push(component);
                    break;
                case 'justifyLeft':
                    element =
                        <div title={this.determineTitle(component)} class='button-container'>
                            <div class={component + ' button'} onClick={() => this.onActionClick(component, { alignment: true })}>
                                {Icons[component]}
                            </div>
                        </div>
                    this.addedToToolbar.push(component);
                    break;
                case 'justifyRight':
                    element =
                        <div title="Justify Right" class='button-container'>
                            <div class={component + ' button'} onClick={() => this.onActionClick(component, { alignment: true })}>
                                {Icons[component]}
                            </div>
                        </div>
                    this.addedToToolbar.push(component);
                    break;
                default:
                    if (allowedConfig.includes(component)) {
                        element = <div title={this.determineTitle(component)} class={component + ' button'} onClick={($event: UIEvent) => this.style(component, $event)}>{Icons[component]}</div>
                        this.addedToToolbar.push(component);
                    }
                    break;
            }
            return element;
        }
    }

    determineTitle(title: string) {
        const array = title.split(/(?=[A-Z])/);
        let value: string = '';
        array.forEach(s => {
            value += s.substring(0, 1).toUpperCase() + s.substring(1, s.length) + ' ';
        })
        return value.trim();
    }

    resetPopovers(exclude: string[] = []) {
        if ((this.linkPopoverOpen || this.linkPopover) && !this.currentStates.includes('link')) {
            this.removeLinkPopover();
        }
        if (!exclude.includes('color')) {
            this.colorOpen = false;
        }
        if (!exclude.includes('highlight')) {
            this.highlightOpen = false;
        }
    }

    // styling
    style(component: string, event?: UIEvent, showUI?: boolean, value?: string) {
        return new Promise<void>(async (resolve) => {
            if (!!event) {
                event.stopPropagation();
            }

            if (this.iframe.contentDocument.getSelection().type === 'Caret') {
                if (!this.currentStates.includes(component)) {
                    const componentType = this.createComponent(component);
                    if (componentType) {
                        const newComponent = this.iframe.contentDocument.createElement(componentType);
                        newComponent.innerHTML = `<span class="hive-cursor">${this.emptySpace}</span>`;
                        this.iframe.contentDocument.getSelection().getRangeAt(0).insertNode(newComponent);

                        const cursor = this.iframe.contentDocument.querySelector('.hive-cursor');

                        const range = this.iframe.contentDocument.createRange();
                        range.setStart(cursor, 1);

                        this.iframe.contentDocument.getSelection().empty();
                        this.iframe.contentDocument.getSelection().addRange(range);
                        this.focus();
                    }
                } else {
                    let cursor = this.iframe.contentDocument.querySelector('.hive-cursor');
                    if (cursor) {
                        const parentNode = cursor.parentNode as HTMLElement;
                        parentNode.remove();

                        this.checkStyles();
                        this.focus();
                    } else {
                        this.iframe.contentDocument.execCommand(component, showUI, value);
                        this.toggleActiveState(component);
                        this.focus();
                    }
                }
            } else {
                await this.applyStyle(component, showUI, value);
                await this.initStyle();
                this.focus();
            }

            resolve();

            this.cleanText();
            this.styleChange.emit({
                name: 'Style Event',
                component,
                event,
                showUI,
                value
            });
        });
    }

    createComponent(component: string) {
        let value = '';
        switch (component) {
            case 'bold':
                value = 'b';
                break;
            case 'italic':
                value = 'i';
                break;
            case 'underline':
                value = 'u';
                break;
            case 'strikethrough':
                value = 'strike';
                break
        }

        return value;
    }

    private applyStyle(style: string, showUI?: boolean, value?: string): Promise<void> {
        return new Promise<void>(async (resolve) => {
            if (!this.iframe.contentDocument.getSelection() || this.iframe.contentDocument.getSelection().rangeCount <= 0 || !document) {
                resolve();
                return;
            }

            const text: string = this.iframe.contentDocument.getSelection().toString();

            if (!text || text.length <= 0) {
                resolve();
                return;
            }

            this.iframe.contentDocument.execCommand(style, showUI, value);

            resolve();
        });
    }

    private initStyle(): Promise<void> {
        return new Promise<void>(async (resolve) => {
            if (!this.iframe.contentDocument.getSelection() || this.iframe.contentDocument.getSelection().rangeCount <= 0) {
                resolve();
                return;
            }

            const content: Node = this.iframe.contentDocument.getSelection().anchorNode;

            if (!content) {
                resolve();
                return;
            }

            // It happens on mobile devices
            const parentDiv: boolean = content.parentElement && content.parentElement.nodeName && content.parentElement.nodeName.toLowerCase() === 'div';

            if (parentDiv || content.parentElement) {
                this.currentStates = [];

                (parentDiv) ?
                    await this.findStyle(content) :
                    await this.findStyle(content.parentElement);
            }

            resolve();
        });
    }

    private findStyle(node: Node): Promise<void> {
        return new Promise<void>(async (resolve) => {
            if (!node) {
                resolve();
                return;
            }

            // Just in case
            if (node.nodeName.toUpperCase() === 'HTML' || node.nodeName.toUpperCase() === 'BODY' || node.nodeName.toUpperCase() === 'DIV') {
                resolve();
                return;
            }

            if (node) {
                await this.findStyle(node.parentNode);
            }

            resolve();
        });
    }

    // colors
    onColorClick(value: boolean, type: string) {
        this.resetPopovers([type]);

        if (this.iframe.contentDocument.getSelection().type === 'Caret') {
            this.focus();
            return;
        }

        if (type === 'color') {
            this.colorOpen = value;
        } else if (type === 'highlight') {
            if (this.currentStates.includes('highlight')) {
                this.style('removeFormat');
            } else {
                this.highlightOpen = value;
            }
        }

        this.cleanText();
        this.styleChange.emit({
            name: 'Color Change Event',
            value,
            type
        });
    }

    // submissions
    submitInput(type: string, data?: string) {
        this.resetPopovers();
        this.focus();

        if (type === 'color') {
            this.style('foreColor', null, true, data);
        } else if (type === 'highlight') {
            this.style('hiliteColor', null, true, data);
        } else if (type === 'link') {
            this.style('createLink', null, true, data);
        }
    }

    focus() {
        this.iframe.contentDocument.body.focus();
    }

    // links
    async onLinkClick(value: boolean) {
        if (this.currentStates.includes('link')) {
            // if link is active then unlink
            this.style('unlink');
        } else if (value) {
            if (this.linkPopover) {
                this.removeLinkPopover();
                this.focus();
            }

            if (this.iframe.contentDocument.getSelection().type === 'Caret') {
                const anchor = this.iframe.contentDocument.createElement('a');
                anchor.href = window.location.href;
                anchor.target = '_blank';

                this.iframe.contentDocument.getSelection().getRangeAt(0).insertNode(anchor);

                this.createLinkPopover(anchor, true);
            } else {
                this.creatingLink = true;
                await this.style('createLink', null, true, window.location.href);
            }
        }

        this.cleanText();
        this.styleChange.emit({
            name: 'Link Click Event',
            value
        });
    }

    createLinkPopover(node: Node, creating: boolean) {
        this.linkPopover = this.iframe.contentDocument.createElement('hive-link-popover') as HTMLHiveLinkPopoverElement;

        if (!(node as HTMLAnchorElement).href) {
            this.createLinkPopover(node.parentElement, creating);
        } else {
            (this.linkPopover as unknown as HTMLElement).addEventListener('action', (event: CustomEvent) => {
                this.linkActionHandler(event.detail, node as HTMLAnchorElement);
            });

            let top = (node as HTMLAnchorElement).offsetTop + this.linkPopoverTopOffset;
            let left = (node as HTMLAnchorElement).offsetLeft + 5;

            (this.linkPopover as unknown as HTMLElement).style.top = (top) + 'px';
            (this.linkPopover as unknown as HTMLElement).style.left = (left) + 'px';

            this.linkPopover.creating = creating;
            this.linkPopover.url = (node as HTMLAnchorElement).href;
            this.linkPopover.text = (node as HTMLAnchorElement).innerText;

            this.el.shadowRoot.appendChild((this.linkPopover as unknown as HTMLElement));

            this.creatingLink = false;
        }
    }

    removeLinkPopover() {
        if (this.linkPopover) {
            this.linkPopoverOpen = false;
            (this.linkPopover as unknown as HTMLElement).remove();
            this.linkPopover = null;
            this.linkNode = null;
        }
    }

    async linkActionHandler({ action, url, text }, node: HTMLAnchorElement) {
        this.removeLinkPopover();

        if (!text) {
            node.remove();
        } else if (!url) {
            this.div.className = this.div.className.replace(' empty', '');
            node.replaceWith(node.text);
            this.checkStyles();
            this.focus();
        } else {
            switch (action) {
                case 'destroy':
                    node.remove();
                    break;
                case 'edit':
                    if (!url.startsWith('https://') && !url.startsWith('http://')) {
                        url = 'http://' + url;
                    }

                    node.innerText = text;
                    node.href = url;
                    node.target = '_blank';
                    const range = this.iframe.contentDocument.createRange();
                    range.setStart(node, 1 || 0);

                    this.iframe.contentDocument.getSelection().empty();
                    this.iframe.contentDocument.getSelection().addRange(range);
                    this.focus();
                    break;
                case 'unlink':
                    node.replaceWith(node.text);
                    this.focus();
                    break;
                case 'open':
                    window.open(node.href, '_blank');
                    break;
            }
        }
        this.styleChange.emit({
            name: 'Style Event',
            event
        });
    }

    // other actions
    onActionClick(component: string, options: {
        alignment?: boolean;
        focus?: boolean } = {}
    ) {
        if (options.alignment && this.iframe.contentDocument.getSelection()) {
            const node = this.iframe.contentDocument.getSelection().anchorNode.parentNode as HTMLElement;
            node.style.removeProperty('text-align');

            this.iframe.contentDocument.execCommand(component);
        } else {
            this.iframe.contentDocument.execCommand(component);
        }

        if (options.focus === true) {
            this.focus();
        }

        this.checkStyles();
        this.cleanText();
        this.styleChange.emit({
            name: 'Action Click Event',
            component,
            alignment: options.alignment
        })
    }

    // styling
    async checkStyles() {
        if (this.iframe.contentDocument.getSelection() && this.iframe.contentDocument.getSelection().anchorNode && this.iframe.contentDocument.getSelection().anchorNode.parentNode) {
            const node = this.iframe.contentDocument.getSelection().anchorNode.parentNode as HTMLElement;

            const states = [];

            if (this.addedToToolbar.includes('bold')) {
                (await EditorUtils.isStyle(node, ['b', 'strong'], ['fontWeight'])) ? states.push('bold') : null;
                this.setActiveState('bold', states.includes('bold'));
            }

            if (this.addedToToolbar.includes('italic')) {
                (await EditorUtils.isStyle(node, ['i', 'em'], ['fontStyle'])) ? states.push('italic') : null;
                this.setActiveState('italic', states.includes('italic'));
            }

            if (this.addedToToolbar.includes('underline')) {
                (await EditorUtils.isStyle(node, ['u'], ['textDecoration'])) ? states.push('underline') : null;
                this.setActiveState('underline', states.includes('underline'));
            }

            if (this.addedToToolbar.includes('strikethrough')) {
                (await EditorUtils.isStyle(node, ['strike'], ['textDecoration'])) ? states.push('strikethrough') : null;
                this.setActiveState('strikethrough', states.includes('strikethrough'));
            }

            if (this.addedToToolbar.includes('subscript')) {
                (await EditorUtils.isStyle(node, ['sub'])) ? states.push('subscript') : null;
                this.setActiveState('subscript', states.includes('subscript'));
            }

            if (this.addedToToolbar.includes('superscript')) {
                (await EditorUtils.isStyle(node, ['sup'])) ? states.push('superscript') : null;
                this.setActiveState('superscript', states.includes('superscript'));
            }

            if (this.addedToToolbar.includes('orderedList')) {
                (await EditorUtils.isStyle(node, ['ol'])) ? states.push('orderedList') : null;
                this.setActiveState('orderedList', states.includes('orderedList'));
            }

            if (this.addedToToolbar.includes('unorderedList')) {
                (await EditorUtils.isStyle(node, ['ul'])) ? states.push('unorderedList') : null;
                this.setActiveState('unorderedList', states.includes('unorderedList'));
            }

            if (this.addedToToolbar.includes('justifyFull')) {
                (await EditorUtils.isStyle(node, [], ['textAlign'], ['justify'])) ? states.push('justifyFull') : null;
                this.setActiveState('justifyFull', states.includes('justifyFull'));
            }

            if (this.addedToToolbar.includes('justifyCenter')) {
                (await EditorUtils.isStyle(node, [], ['textAlign'], ['center'])) ? states.push('justifyCenter') : null;
                this.setActiveState('justifyCenter', states.includes('justifyCenter'));
            }

            if (this.addedToToolbar.includes('justifyRight')) {
                (await EditorUtils.isStyle(node, [], ['textAlign'], ['right'])) ? states.push('justifyRight') : null;
                this.setActiveState('justifyRight', states.includes('justifyRight'));
            }

            if (this.addedToToolbar.includes('justifyLeft')) {
                (await EditorUtils.isStyle(node, [], ['textAlign'], ['left'])) ? states.push('justifyLeft') : null;
                this.setActiveState('justifyLeft', states.includes('justifyLeft'));
            }

            if (this.addedToToolbar.includes('link')) {
                (await EditorUtils.isStyle(node, ['a'])) ? states.push('link') : null;

                if (this.linkNode !== node) {
                    if (this.linkNode) {
                        this.removeLinkPopover();
                    }

                    this.linkNode = node;
                }

                this.setActiveState('link', states.includes('link'), node);
            }

            if (this.addedToToolbar.includes('highlight')) {
                (await EditorUtils.isStyle(node, [], ['background-color'])) ? states.push('highlight') : null;

                const highlightButton = this.el.shadowRoot.querySelector('#highlight') as HTMLElement;
                if (node.style.backgroundColor && highlightButton) {
                    highlightButton.style.fill = node.style.backgroundColor;
                } else {
                    highlightButton.style.fill = null;
                }
            }

            if (this.addedToToolbar.includes('color')) {
                const colorButton = this.el.shadowRoot.querySelector('#color') as HTMLElement;
                (await EditorUtils.isStyle(node, [], ['color'])) ? states.push('color') : null;

                if ((node as HTMLFontElement).color && colorButton) {
                    colorButton.style.fill = (node as HTMLFontElement).color;
                } else {
                    colorButton.style.fill = null;
                }
            }

            this.currentStates = states;
        }
    }

    setActiveState(component: string, value: boolean, node?: Node) {
        const button = this.el.shadowRoot.querySelector('.' + component);

        if (value && button) {
            button.className = component + ' button active';

            if (component === 'link' && node && !this.linkPopoverOpen) {
                this.linkPopoverOpen = true;
                this.createLinkPopover(node, this.creatingLink);
            }
        } else if (!value && button) {
            button.className = component + ' button';

            if (component === 'link' && this.linkPopoverOpen) {
                this.removeLinkPopover();
            }
        }
    }

    toggleActiveState(component: string) {
        const button = this.el.shadowRoot.querySelector('.' + component);

        if (button.className.includes('active')) {
            button.className = component + ' button';
        } else {
            button.className = component + ' button active';
        }
    }

    private getContainer(topLevel: Node): Promise<HTMLElement> {
        return new Promise<HTMLElement>(async (resolve) => {
            if (!topLevel) {
                resolve(null);
                return;
            }

            const parent: HTMLElement = await this.getContainer(topLevel.parentNode);

            resolve(parent);
        });
    }

    cleanText() {
        const nodes = this.iframe.contentDocument.body.childNodes;
        nodes.forEach(n => {
            if (n.nodeName.toLowerCase() === 'div') {
                const br = this.iframe.contentDocument.createElement('br');
                const text = (n as HTMLDivElement).innerHTML;

                n.replaceWith(br);

                if (text !== '<br>') {
                    br.insertAdjacentHTML('afterend', text);
                    this.iframe.contentDocument.getSelection().getRangeAt(0).setStartAfter(br);
                }
            } else if (n.nodeName.toLowerCase() === 'a') {
                if (!(n as HTMLAnchorElement).innerText && !this.linkPopover) {
                    n.remove();
                }
            }
        });
    }

    // visuals
    async customize() {
        if (this.options && this.toolbarRef) {
            if (this.options.content) {
                this.iframe.contentDocument.body.innerHTML = this.options.content;
            } else {
                this.div.className += ' empty';
            }

            if (this.options.showToolbar === 'onHover') {
                this.toolbarRef.className += ' phantom';
            } else if (this.options.showToolbar === 'onSelect') {
                if (!this.toolbarRef.className.includes('selection')) {
                    this.toolbarRef.className += ' selection';
                }
            }

            if (this.options.autoFocus) {
                this.focus();
            }

            if (this.options.placeholder) {
                this.div.setAttribute('placeholder', this.options.placeholder);
            }

            // set the styles on the html tag in the iframe so styling won't be removed from body
            const html = this.iframe.contentDocument.getRootNode().firstChild as HTMLElement;
            html.style.fontSize = (this.options.font) ? this.options.font.size : this.font.size;
            html.style.color = (this.options.font) ? this.options.font.color : this.font.color;

            if (this.options.font && this.options.font.family && this.options.font.faces) {
                const meta: HTMLMetaElement = this.iframe.contentDocument.createElement('meta');
                meta.setAttribute('charset', 'utf-8');
                this.iframe.contentDocument.head.appendChild(meta);

                const base: HTMLBaseElement = this.iframe.contentDocument.createElement('base');
                base.href = '/';
                this.iframe.contentDocument.head.appendChild(base);

                const style: HTMLStyleElement = this.iframe.contentDocument.createElement('style');
                style.innerHTML = GetFontFaces(this.options.font.family, this.options.font.faces);
                this.iframe.contentDocument.head.appendChild(style);

                html.style.fontFamily = this.options.font.family;
            } else if (this.options.font && this.options.font.family) {
                html.style.fontFamily = this.options.font.family;
            } else {
                html.style.fontFamily = this.font.family;
            }
        }

        if (this.options.position !== 'bottom') {
            this.linkPopoverTopOffset = this.linkPopoverTopOffset + this.toolbarRef.clientHeight;
        }
    }

    hostData() {
        const style = {};

        if (this.options) {
            style['--hive-rte-position'] = this.options.position || 'top';
            style['--hive-rte-font-family'] = (this.options.font) ? this.options.font.family : this.font.family;
            style['--hive-rte-font-size'] = (this.options.font) ? this.options.font.size : this.font.size;
            style['--hive-rte-font-color'] = (this.options.font) ? this.options.font.color : this.font.color;
        }
        return {
            style,
            class: {
                'focused': this.focused,
                'position-top': (this.options) ? this.options.position !== 'bottom' : true,
                'position-bottom': (this.options) ? this.options.position === 'bottom' : false
            }
        }
    }

    render() {
        this.addedToToolbar = [];

        if (this.options) {
            if (this.options.colors) {
                this.colors = this.options.colors;
            }

            if (this.options.allowCustomColor != null) {
                this.allowCustomColor = this.options.allowCustomColor;
            }

            if (this.options.highlights) {
                this.highlights = this.options.highlights;
            }

            if (this.options.toolbar) {
                this.toolbar = this.options.toolbar;
            }
        }

        return [
            <div id='toolbar' class='toolbar bottom' ref={(el: HTMLDivElement) => this.toolbarRef = el}>
                {this.toolbar.map((bar) =>
                    this.determineComponent(bar)
                )}
            </div>,
            <div class='text-container' ref={(el: HTMLDivElement) => this.div = el}>
                <iframe id='text-container' ref={(el: HTMLIFrameElement) => this.iframe = el}></iframe>
            </div>
        ];
    }
}
