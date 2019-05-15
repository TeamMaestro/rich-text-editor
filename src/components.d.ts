/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */


import '@stencil/core';


import {
  RichTextEditorOptions,
} from './utils/options.interface';


export namespace Components {

  interface HiveColorPopover {
    'colors': string[];
    'isOpen': boolean;
    'position': 'top' | 'bottom';
  }
  interface HiveColorPopoverAttributes extends StencilHTMLAttributes {
    'colors'?: string[];
    'isOpen'?: boolean;
    'onColorSelected'?: (event: CustomEvent) => void;
    'position'?: 'top' | 'bottom';
  }

  interface HiveLinkPopover {
    'creating': boolean;
    'text': string;
    'url': string;
  }
  interface HiveLinkPopoverAttributes extends StencilHTMLAttributes {
    'creating'?: boolean;
    'onAction'?: (event: CustomEvent) => void;
    'text'?: string;
    'url'?: string;
  }

  interface HiveRichText {
    'getContent': () => Promise<{ text: string; html: string; }>;
    'options': Partial<RichTextEditorOptions>;
    'setContent': (value: string) => void;
  }
  interface HiveRichTextAttributes extends StencilHTMLAttributes {
    'options'?: Partial<RichTextEditorOptions>;
  }
}

declare global {
  interface StencilElementInterfaces {
    'HiveColorPopover': Components.HiveColorPopover;
    'HiveLinkPopover': Components.HiveLinkPopover;
    'HiveRichText': Components.HiveRichText;
  }

  interface StencilIntrinsicElements {
    'hive-color-popover': Components.HiveColorPopoverAttributes;
    'hive-link-popover': Components.HiveLinkPopoverAttributes;
    'hive-rich-text': Components.HiveRichTextAttributes;
  }


  interface HTMLHiveColorPopoverElement extends Components.HiveColorPopover, HTMLStencilElement {}
  var HTMLHiveColorPopoverElement: {
    prototype: HTMLHiveColorPopoverElement;
    new (): HTMLHiveColorPopoverElement;
  };

  interface HTMLHiveLinkPopoverElement extends Components.HiveLinkPopover, HTMLStencilElement {}
  var HTMLHiveLinkPopoverElement: {
    prototype: HTMLHiveLinkPopoverElement;
    new (): HTMLHiveLinkPopoverElement;
  };

  interface HTMLHiveRichTextElement extends Components.HiveRichText, HTMLStencilElement {}
  var HTMLHiveRichTextElement: {
    prototype: HTMLHiveRichTextElement;
    new (): HTMLHiveRichTextElement;
  };

  interface HTMLElementTagNameMap {
    'hive-color-popover': HTMLHiveColorPopoverElement
    'hive-link-popover': HTMLHiveLinkPopoverElement
    'hive-rich-text': HTMLHiveRichTextElement
  }

  interface ElementTagNameMap {
    'hive-color-popover': HTMLHiveColorPopoverElement;
    'hive-link-popover': HTMLHiveLinkPopoverElement;
    'hive-rich-text': HTMLHiveRichTextElement;
  }


  export namespace JSX {
    export interface Element {}
    export interface IntrinsicElements extends StencilIntrinsicElements {
      [tagName: string]: any;
    }
  }
  export interface HTMLAttributes extends StencilHTMLAttributes {}

}
