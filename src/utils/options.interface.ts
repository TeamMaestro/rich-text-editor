export interface RichTextEditorOptions {
    toolbar: string[]; // what components to render in the corresponding order
    colors: string[]; // default colors for text color selection
    highlights: string[]; // default colors for highlighting selection

    position: 'top' | 'bottom'; // position of the bar. ('top' || 'bottom')
    content: string; // content to be initialized inside the editor

    height: string; // height of the editor text container
    width: string; // width of the editor text container
    
    placeholder: string; // what to display when the text box is empty
    
    border: string; // styling of the border for the host component
    borderRadius: string; // styling of the border for the host component
    
    phantom: boolean; // only have the toolbar appear when you are hovering over the text container
    dynamicSizing: boolean; // checks when the window resizes to resize the editor 
    autoFocus: boolean;
}