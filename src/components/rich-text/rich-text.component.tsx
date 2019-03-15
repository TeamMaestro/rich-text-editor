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

    @State() bold = false;
    @State() italic = false;
    @State() underline = false;
    @State() strikethrough = false;
    @State() highlight = false;

    @State() colorOpen = false;
    @State() highlightOpen = false;

    @State() link = false;
    @State() linkPopoverOpen = false;
    linkPopover: HTMLHiveLinkPopoverElement;

    keycodeDown: number;
    addedToToolbar: string[] = [];

    colors = ['#FF4541', '#E65100', '#43A047', '#1C9BE6', '#6446EB', '#ACACC2', '#626272']; // default colors for text color selection
    highlights = ['#f3f315', '#ff0099', '#83f52c', '#ff6600', '#6e0dd0']; // default colors for highlighting selection
    toolbar = ['bold', 'italic', 'underline', 'strikethrough', '|', 'link', '|', 'color', 'highlight']; // what components to render in the corresponding order
    height = '100%';
    width = '100%';

    // customize
    @Prop() options: Partial<RichTextEditorOptions> = {
        resize: true
    };

    // states
    selection: Selection = null;
    selectionRange: Range = null;
    anchorEvent: MouseEvent | TouchEvent;

    active: string;
    activeElement: HTMLElement;
    div: HTMLDivElement;

    // methods
    @Method()
    async getContent() {
        return {
            text: this.div.innerText,
            html: this.div.innerHTML
        }
    }

    // listeners
    @Listen('document:mousedown', { passive: true })
    async mousedown(event: MouseEvent) {
        this.anchorEvent = event;
    }

    @Listen('document:resize', { passive: true })
    async resize() {
        console.log('RESIZE');
    }

    @Listen('document:keydown', { passive: true })
    async keydown(event: KeyboardEvent) {
        if (event.keyCode === 91 || event.keyCode === 93) { // keycode control button
            this.keycodeDown = event.keyCode;
        } else if (this.keycodeDown === 91 || this.keycodeDown === 93) {
            switch (event.keyCode) {
                case 66:
                    this.setActiveState('bold', !this.bold);
                    break;
                case 73:
                    this.setActiveState('italic', !this.italic);
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
                            <hive-color-popover hidden={!this.colorOpen} isOpen={this.colorOpen} colors={this.colors} onColorSelected={($event: CustomEvent<string>) => this.submitInput('color', $event.detail)}></hive-color-popover>
                        </div>
                    this.addedToToolbar.push(component);
                    break;
                case 'highlight':
                    element =
                        <div class='button-container'>
                            <div id={component} class={component + ' button'} onClick={() => this.onColorClick(!this.highlightOpen, 'highlight')}>
                                {Icons.highlight}
                            </div>
                            <hive-color-popover hidden={!this.highlightOpen} isOpen={this.highlightOpen} colors={this.highlights} onColorSelected={($event: CustomEvent<string>) => this.submitInput('highlight', $event.detail)}></hive-color-popover>
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
        if ((this.linkPopoverOpen || this.linkPopover) && !this.link) {
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
                this.bold = false;
                this.italic = false;
                this.underline = false;
                this.strikethrough = false;
                this.link = false;
                this.highlight = false;

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
            if (this.highlight) {
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
        if (this.link) {
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

            if (this.selection.type === 'Caret') {
                const anchor = document.createElement('a');
                anchor.href = window.location.href;

                this.selection.getRangeAt(0).insertNode(anchor);
                this.createLinkPopover(anchor);
            } else {
                await this.style('createLink', this.selection, null, true, window.location.href);
            }
        }
    }

    createLinkPopover(node: Node) {
        this.linkPopover = document.createElement('hive-link-popover') as HTMLHiveLinkPopoverElement;

        if (!(node as HTMLAnchorElement).href) {
            this.createLinkPopover(node.parentElement);
        } else {
            this.linkPopover.addEventListener('action', (event: CustomEvent) => {
                this.linkActionHandler(event.detail, node as HTMLAnchorElement);
            });

            let top = (node as HTMLAnchorElement).offsetTop + 30;
            let left = (node as HTMLAnchorElement).offsetLeft;

            this.linkPopover.style.top = (top) + 'px';
            this.linkPopover.style.left = (left) + 'px';

            this.linkPopover.url = (node as HTMLAnchorElement).href;
            this.linkPopover.text = (node as HTMLAnchorElement).innerText;
            this.el.shadowRoot.appendChild(this.linkPopover);
        }
    }

    removeLinkPopover() {
        this.linkPopoverOpen = false;
        this.linkPopover.remove();
        this.linkPopover = null;
    }

    async linkActionHandler({ action, url, text }, node: HTMLAnchorElement) {
        this.linkPopoverOpen = false;
        this.linkPopover.remove();

        if (!text || !url) {
            node.remove();
        }

        switch (action) {
            case 'destroy':
                node.remove();
                break;
            case 'edit':
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

    async checkStyles(selection: Selection) {
        if (selection && selection.anchorNode && selection.anchorNode.parentNode) {
            const node = selection.anchorNode.parentNode as HTMLElement;

            if (this.addedToToolbar.includes('bold')) {
                this.bold = await EditorUtils.isStyle(node, ['b', 'strong'], ['fontWeight']);
                this.setActiveState('bold', this.bold);
            }

            if (this.addedToToolbar.includes('italic')) {
                this.italic = await EditorUtils.isStyle(node, ['i', 'em'], ['fontStyle']);
                this.setActiveState('italic', this.italic);
            }

            if (this.addedToToolbar.includes('underline')) {
                this.underline = await EditorUtils.isStyle(node, ['u'], ['textDecoration']);
                this.setActiveState('underline', this.underline);
            }

            if (this.addedToToolbar.includes('strikethrough')) {
                this.strikethrough = await EditorUtils.isStyle(node, ['strike'], ['textDecoration']);
                this.setActiveState('strikethrough', this.strikethrough);
            }

            if (this.addedToToolbar.includes('link')) {
                this.link = await EditorUtils.isStyle(node, ['a']);
                this.setActiveState('link', this.link, node);
            }

            if (this.addedToToolbar.includes('highlight')) {
                this.highlight = await EditorUtils.isStyle(node, [], ['backgroundColor']);
                const highlightButton = this.el.shadowRoot.getElementById('highlight');
                if (node.style.backgroundColor && highlightButton) {
                    highlightButton.style.fill = node.style.backgroundColor;
                } else {
                    highlightButton.style.fill = null;
                }
            }

            if (this.addedToToolbar.includes('color')) {
                const colorButton = this.el.shadowRoot.getElementById('color');
                if ((node as HTMLFontElement).color && colorButton) {
                    colorButton.style.fill = (node as HTMLFontElement).color;
                } else {
                    colorButton.style.fill = null;
                }
            }
        }
    }

    setActiveState(component: string, value: boolean, node?: Node) {
        const button = this.el.shadowRoot.querySelector('.' + component);

        if (value && button) {
            button.className = component + ' button active';

            if (component === 'link' && node && !this.linkPopoverOpen) {
                this.linkPopoverOpen = true;
                this.createLinkPopover(node);
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

            this.selectionRange = this.selection.getRangeAt(0);
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

            if (this.options.phantom) {
                toolbar.className += ' phantom';
            }

            if (this.options.autoFocus) {
                this.div.focus();
            }

            if (this.options.resize) {
                // checks for dynamic resizing
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