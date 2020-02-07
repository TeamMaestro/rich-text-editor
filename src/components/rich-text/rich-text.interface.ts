export interface RichTextEditorOptions {
    toolbar?: string[]; // what components to render in the corresponding order
    colors?: string[]; // default colors for text color selection
    highlights?: string[]; // default colors for highlighting selection

    position?: 'top' | 'bottom'; // position of the bar. ('top' || 'bottom')
    content?: string; // content to be initialized inside the editor

    placeholder?: string; // what to display when the text box is empty

    showToolbar?:
    'always' | // always show the toolbar. Default behavior
    'onHover' | // only have the toolbar appear when you are hovering over the text container
    'onSelect'; // only have the toolbar appear when you are focused on the textarea

    autoFocus?: boolean;

    font?: {
        family?: string;
        size?: string;
        color?: string;
        faces?: FontFace[];
    }
}

export interface FontFace {
    weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 'normal' | 'bold';
    style: 'normal' | 'italic' | 'oblique';
    src: string[] | string;
}
