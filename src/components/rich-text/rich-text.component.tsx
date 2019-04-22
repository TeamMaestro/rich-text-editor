import { Component, Element, Listen, Prop, State, Method } from '@stencil/core';
import { allowedConfig } from '../../utils/allowed-config';
import { EditorUtils } from '../../utils/editor-utils';
import { Icons } from '../icons/icons';
import { RichTextEditorOptions } from '../../utils/options.interface';

@Component({
    tag: 'hive-rich-text',
    styleUrl: 'rich-text.component.scss',
    shadow: true
})
export class HiveRichTextComponent {

    @Element() el: HTMLElement;

    @State() currentStates: string[] = [];

    @State() colorOpen = false;
    @State() highlightOpen = false;
    @State() linkPopoverOpen = false;

    linkPopover: HTMLHiveLinkPopoverElement;
    linkNode: Node;
    creatingLink: boolean;

    keycodeDown: number;
    addedToToolbar: string[] = [];

    colors = ['#FF4541', '#E65100', '#43A047', '#1C9BE6', '#6446EB', '#ACACC2', '#626272']; // default colors for text color selection
    highlights = ['#f3f315', '#ff0099', '#83f52c', '#ff6600', '#6e0dd0']; // default colors for highlighting selection
    toolbar = ['bold', 'italic', 'underline', 'strikethrough', '|', 'link', '|', 'color', 'highlight']; // what components to render in the corresponding order
    height = '100%';
    width = '100%';

    // customize
    @Prop() options: Partial<RichTextEditorOptions> = {
        dynamicSizing: true,
        placeholder: 'Insert text...'
    };

    // states
    selection: Selection = null;
    selectionRange: Range = null;
    anchorEvent: MouseEvent | TouchEvent;

    active: string;
    activeElement: HTMLElement;
    div: HTMLDivElement;
    textContent: HTMLDivElement;

    // methods
    @Method()
    async getContent() {
        return {
            text: this.div.innerText,
            html: this.div.innerHTML
        }
    }

    @Method()
    setContent(value: string) {
        this.div.innerHTML = value;
    }

    // listeners
    @Listen('document:mousedown', { passive: true })
    async mousedown(event: MouseEvent) {
        this.anchorEvent = event;
    }

    @Listen('document:keydown', { passive: true })
    async keydown(event: KeyboardEvent) {
        if (event.keyCode === 91 || event.keyCode === 93) { // keycode control button
            this.keycodeDown = event.keyCode;
        } else if (this.keycodeDown === 91 || this.keycodeDown === 93) {
            switch (event.keyCode) {
                case 66:
                    this.setActiveState('bold', !this.currentStates.includes('bold'));
                    break;
                case 73:
                    this.setActiveState('italic', !this.currentStates.includes('italic'));
                    break;
            }
        }
    }

    @Listen('document:keyup', { passive: true })
    async keyup(event: KeyboardEvent) {
        if (event.keyCode === 91 || this.keycodeDown === 93) {
            this.keycodeDown = null;
        }
    }

    @Listen('document:touchstart', { passive: true })
    async touchstart(event: MouseEvent) {
        this.anchorEvent = event;
    }

    @Listen('document:selectionchange', { passive: true })
    async selectionchange() {
        await this.setSelection();
    }

    // lifecycle
    componentDidLoad() {
        this.div = this.el.shadowRoot.getElementById('text-content') as HTMLDivElement;
        this.textContent = this.el.shadowRoot.getElementById('text-content') as HTMLDivElement;

        this.customize();
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
                        <div class='button-container'>
                            <div id={component} class={component + ' button'} onClick={() => this.onColorClick(!this.colorOpen, 'color')}>
                                {Icons.color}
                            </div>
                            <hive-color-popover hidden={!this.colorOpen} position={this.options.position} isOpen={this.colorOpen} colors={this.colors} onColorSelected={($event: CustomEvent<string>) => this.submitInput('color', $event.detail)}></hive-color-popover>
                        </div>
                    this.addedToToolbar.push(component);
                    break;
                case 'highlight':
                    element =
                        <div class='button-container'>
                            <div id={component} class={component + ' button'} onClick={() => this.onColorClick(!this.highlightOpen, 'highlight')}>
                                {Icons.highlight}
                            </div>
                            <hive-color-popover hidden={!this.highlightOpen} position={this.options.position} isOpen={this.highlightOpen} colors={this.highlights} onColorSelected={($event: CustomEvent<string>) => this.submitInput('highlight', $event.detail)}></hive-color-popover>
                        </div>
                    this.addedToToolbar.push(component);
                    break;
                case 'link':
                    element =
                        <div class='button-container'>
                            <div class={component + ' button'} onClick={() => this.onLinkClick(!this.linkPopoverOpen)}>
                                {Icons.link}
                            </div>
                        </div>
                    this.addedToToolbar.push(component);
                    break;
                case 'undo':
                    element =
                        <div class='button-container'>
                            <div class={component + ' button'} onClick={() => this.onActionClick(component)}>
                                {Icons[component]}
                            </div>
                        </div>
                    this.addedToToolbar.push(component);
                    break;
                case 'redo':
                    element =
                        <div class='button-container'>
                            <div class={component + ' button'} onClick={() => this.onActionClick(component)}>
                                {Icons[component]}
                            </div>
                        </div>
                    this.addedToToolbar.push(component);
                    break;
                case 'orderedList':
                    element =
                        <div class='button-container'>
                            <div class={component + ' button'} onClick={() => this.onActionClick('insertOrderedList')}>
                                {Icons[component]}
                            </div>
                        </div>
                    this.addedToToolbar.push(component);
                    break;
                case 'unorderedList':
                    element =
                        <div class='button-container'>
                            <div class={component + ' button'} onClick={() => this.onActionClick('insertUnorderedList')}>
                                {Icons[component]}
                            </div>
                        </div>
                    this.addedToToolbar.push(component);
                    break;
                case 'justifyFull':
                    element =
                        <div class='button-container'>
                            <div class={component + ' button'} onClick={() => this.onActionClick(component, this.selection, true)}>
                                {Icons[component]}
                            </div>
                        </div>
                    this.addedToToolbar.push(component);
                    break;
                case 'justifyCenter':
                    element =
                        <div class='button-container'>
                            <div class={component + ' button'} onClick={() => this.onActionClick(component, this.selection, true)}>
                                {Icons[component]}
                            </div>
                        </div>
                    this.addedToToolbar.push(component);
                    break;
                case 'justifyLeft':
                    element =
                        <div class='button-container'>
                            <div class={component + ' button'} onClick={() => this.onActionClick(component, this.selection, true)}>
                                {Icons[component]}
                            </div>
                        </div>
                    this.addedToToolbar.push(component);
                    break;
                case 'justifyRight':
                    element =
                        <div class='button-container'>
                            <div class={component + ' button'} onClick={() => this.onActionClick(component, this.selection, true)}>
                                {Icons[component]}
                            </div>
                        </div>
                    this.addedToToolbar.push(component);
                    break;
                default:
                    if (allowedConfig.includes(component)) {
                        element = <div class={component + ' button'} onClick={($event: UIEvent) => this.style(component, this.selection, $event)}>{Icons[component]}</div>
                        this.addedToToolbar.push(component);
                    }
                    break;
            }
            return element;
        }
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
    style(component: string, selection: Selection, event?: UIEvent, showUI?: boolean, value?: string) {
        return new Promise<void>(async (resolve) => {
            if (event) {
                event.stopPropagation();
            }

            this.resetPopovers();

            if (!selection) {
                selection = this.el.shadowRoot.getSelection();
            }

            if (selection.type === 'Caret') {
                this.focus();
            } else {
                await this.applyStyle(selection, component, showUI, value);
                await this.initStyle(selection);
            }

            resolve();
        });
    }

    private applyStyle(selection: Selection, style: string, showUI?: boolean, value?: string): Promise<void> {
        return new Promise<void>(async (resolve) => {
            if (!selection || selection.rangeCount <= 0 || !document) {
                resolve();
                return;
            }

            const text: string = selection.toString();

            if (!text || text.length <= 0) {
                resolve();
                return;
            }

            document.execCommand(style, showUI, value);

            resolve();
        });
    }

    private initStyle(selection: Selection): Promise<void> {
        return new Promise<void>(async (resolve) => {
            if (!selection || selection.rangeCount <= 0) {
                resolve();
                return;
            }

            const content: Node = selection.anchorNode;

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

        if (this.selection.type === 'Caret') {
            this.focus();
            return;
        }

        if (type === 'color') {
            this.colorOpen = value;
        } else if (type === 'highlight') {
            if (this.currentStates.includes('highlight')) {
                this.style('removeFormat', this.selection);
            } else {
                this.highlightOpen = value;
            }
        }
    }

    // submissions
    submitInput(type: string, data?: string) {
        this.resetPopovers();
        this.focus();

        if (type === 'color') {
            this.style('foreColor', this.selection, null, true, data);
        } else if (type === 'highlight') {
            this.style('hiliteColor', this.selection, null, true, data);
        } else if (type === 'link') {
            this.style('createLink', this.selection, null, true, data);
        }
    }

    focus() {
        if (this.selectionRange) {
            this.el.shadowRoot.getSelection().empty();
            this.el.shadowRoot.getSelection().addRange(this.selectionRange);
        }

        this.div.focus();
    }

    // links
    async onLinkClick(value: boolean) {
        if (this.currentStates.includes('link')) {
            // if link is active then unlink
            this.style('unlink', this.selection);
        } else if (value) {
            if (this.linkPopover) {
                this.removeLinkPopover();
                this.focus();
            }

            if (!this.selection) {
                this.selection = this.el.shadowRoot.getSelection();
            }


            if (this.selection && this.selection.type === 'Caret') {
                const anchor = document.createElement('a');
                anchor.href = window.location.href;

                this.selection.getRangeAt(0).insertNode(anchor);

                this.createLinkPopover(anchor, true);
            } else {
                this.creatingLink = true;
                await this.style('createLink', this.selection, null, true, window.location.href);
            }
        }
    }

    createLinkPopover(node: Node, creating: boolean) {
        this.linkPopover = document.createElement('hive-link-popover') as HTMLHiveLinkPopoverElement;

        if (!(node as HTMLAnchorElement).href) {
            this.createLinkPopover(node.parentElement, creating);
        } else {
            this.linkPopover.addEventListener('action', (event: CustomEvent) => {
                this.linkActionHandler(event.detail, node as HTMLAnchorElement);
            });

            let top = (node as HTMLAnchorElement).offsetTop + 30;
            let left = (node as HTMLAnchorElement).offsetLeft;

            this.linkPopover.style.top = (top) + 'px';
            this.linkPopover.style.left = (left) + 'px';

            this.linkPopover.creating = creating;
            this.linkPopover.url = (node as HTMLAnchorElement).href;
            this.linkPopover.text = (node as HTMLAnchorElement).innerText;

            this.el.shadowRoot.appendChild(this.linkPopover);

            this.creatingLink = false;
        }
    }

    removeLinkPopover() {
        if (this.linkPopover) {
            this.linkPopoverOpen = false;
            this.linkPopover.remove();
            this.linkPopover = null;
            this.linkNode = null;
        }
    }

    async linkActionHandler({ action, url, text }, node: HTMLAnchorElement) {
        this.linkPopoverOpen = false;
        this.linkPopover.remove();

        if (!text) {
            node.remove();
        } else if (!url) {
            node.replaceWith(node.text);
            this.checkStyles(this.selection);
            this.selectionRange = null;
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
                    this.selectionRange = null;
                    this.focus();
                    break;
                case 'unlink':
                    node.replaceWith(node.text);
                    this.checkStyles(this.selection);
                    this.selectionRange = null;
                    this.focus();
                    break;
                case 'open':
                    window.open(node.href, '_blank');
                    break;
            }
        }
    }

    // other actions
    onActionClick(component: string, selection?: Selection, alignment?: boolean) {

        if (alignment && selection) {
            const node = selection.anchorNode.parentNode as HTMLElement;
            node.style.removeProperty('text-align');

            document.execCommand(component);
        } else {
            document.execCommand(component);
        }

        this.checkStyles(selection);
    }

    // styling
    async checkStyles(selection: Selection) {
        if (selection && selection.anchorNode && selection.anchorNode.parentNode) {
            const node = selection.anchorNode.parentNode as HTMLElement;

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

                const highlightButton = this.el.shadowRoot.getElementById('highlight');
                if (node.style.backgroundColor && highlightButton) {
                    highlightButton.style.fill = node.style.backgroundColor;
                } else {
                    highlightButton.style.fill = null;
                }
            }

            if (this.addedToToolbar.includes('color')) {
                const colorButton = this.el.shadowRoot.getElementById('color');
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

    // helpers
    setSelection(): Promise<void> {
        return new Promise<void>(async (resolve) => {
            const selection: Selection = await this.el.shadowRoot.getSelection();
            await this.checkStyles(selection);

            if (!this.anchorEvent) {
                resolve();
                return;
            }

            this.selection = selection;

            // if just clicked without highlighting anything
            if (!selection || selection.toString().length <= 0) {
                resolve();
                return;
            }

            if (this.selection && this.selection.rangeCount > 0) {
                this.selectionRange = this.selection.getRangeAt(0);
            } else {
                this.selection = null;
            }

            resolve();
        });
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

    // visuals
    customize() {
        const toolbar = this.el.shadowRoot.getElementById('toolbar');

        if (this.options) {
            if (this.options.content) {
                this.div.innerHTML = this.options.content;
            }

            if (this.options.height) {
                this.height = this.options.height;
            }

            if (this.options.width) {
                this.width = this.options.width;
            }

            if (this.options.border) {
                this.el.style.border = this.options.border;
            }

            if (this.options.borderRadius) {
                this.el.style.borderRadius = this.options.borderRadius;
            }

            if (this.options.showToolbar === 'onHover') {
                toolbar.className += ' phantom';
            } else if (this.options.showToolbar === 'onSelect') {
                if (!toolbar.className.includes('selection')) {
                    toolbar.className += ' selection';
                }

                this.div.onfocus = () => {
                    if (!toolbar.className.includes('show')) {
                        toolbar.className += ' show';
                    }
                }

                this.div.onblur = () => {
                    toolbar.classList.remove('show');
                }
            }

            if (this.options.autoFocus) {
                this.div.focus();
            }

            if (this.options.placeholder) {
                this.textContent.setAttribute('placeholder', this.options.placeholder);
            }

            if (this.options.dynamicSizing) {
                window.addEventListener('resize', () => {
                    this.div.parentElement.style.height = 'calc(' + this.height + ' - ' + toolbar.clientHeight + 'px)';
                    this.el.style.height = this.height;
                    this.el.style.width = this.width;
                });
            }
        }

        // takes the inputed height and adds the toolbar height in order to get the correct height of the host
        this.div.parentElement.style.height = 'calc(' + this.height + ' - ' + toolbar.clientHeight + 'px)';
        this.el.style.height = this.height;
        this.el.style.width = this.width;

    }

    render() {
        this.addedToToolbar = [];

        if (this.options) {
            if (this.options.colors) {
                this.colors = this.options.colors;
            }

            if (this.options.highlights) {
                this.highlights = this.options.highlights;
            }

            if (this.options.toolbar) {
                this.toolbar = this.options.toolbar;
            }
        }

        return (
            <div class="container">
                {this.options && this.options.position === 'bottom' ?
                    <div class='container'>
                        <div class='text-container'>
                            <div id='text-content' contentEditable='true' onClick={() => this.resetPopovers()}></div>
                        </div>
                        <div id='toolbar' class='toolbar bottom'>
                            {this.toolbar.map((bar) =>
                                this.determineComponent(bar)
                            )}
                        </div>
                    </div>
                    :
                    <div class='container'>
                        <div id='toolbar' class='toolbar top'>
                            {this.toolbar.map((bar) =>
                                this.determineComponent(bar)
                            )}
                        </div>
                        <div class='text-container'>
                            <div id='text-content' contentEditable='true' onClick={() => this.resetPopovers()}></div>
                        </div>
                    </div>
                }
            </div>
        )
    }
}