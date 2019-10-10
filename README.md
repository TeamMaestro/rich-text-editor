![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

# Hive Rich Text Editor
This web component allows you to add rich text editing to your applications.

&nbsp;

# Features
- Add styling to your text inputs
- Fully customizable toolbar
- Flexbox based

&nbsp;

# Installation
- `npm i @teamhive/rich-text-editor`

&nbsp;

# Usage
Somewhere in your project (e.g. `main.ts`):
```
import { defineCustomElements } from '@teamhive/rich-text-editor/dist/loader';
defineCustomElements(window);
```

```
<hive-rich-text [options]="options"></hive-rich-text>
```

Where `options` can be populated with any of the following properties:

&nbsp;

## Properties
|Property|Default|Description|Values|
:---|:---|:---|:---
|`toolbar`|`['bold', 'italic', 'underline', 'strikethrough', '\|', 'link', '\|', 'color', 'highlight']`|The components that will show up in the toolbar.|`bold, italic, underline, strikethrough, link, color, highlight, undo, redo, superscript, subscript, orderedList, unorderedList, removeFormat, -, \|`|
|`colors`|`['#FF4541', '#E65100', '#43A047', '#1C9BE6', '#6446EB', '#ACACC2', '#626272']`|The colors that will show up for a quick selection when formating text color.|Any valid hex code|
|`highlights`|`['#f3f315', '#ff0099', '#83f52c', '#ff6600', '#6e0dd0']`|The colors that will show up for a quick selection when formating highlight color.|Any valid hex code|
|`position`|`top`|The position of the toolbar in relation to the text container.|`top` or `bottom`|
|`content`|`null`|The content that will be loaded into the text container upon loading.|`plain text` and/or `html text` as a `string`|
|`placeholder`|`Insert text...`|The text that will display when the rich editor is unfocused in the empty state.|`string`|
|`showToolbar`|`always`|How the toolbar should be shown or hidden based on user actions |`always`, `onHover`, or `onSelect`|
|`autoFocus`|`false`|To focus on the text component upon init.|`boolean`|
|`font: {`</br>`family,`</br>`url,`<br>`format,`<br>`size,`</br>`color,`</br>`};`| `family: Arial`</br>`url: null`<br>`format: null`<br>`size: 12px`</br>`color: #626272` | To set what the font variables will be in the rich text editor. When passing through a custom font, the url will need to be the location of the font asset in relation to where its loaded when served (ex. './arial.otf' when found at https://localhost:4200/arial.otf). The format needs to be whatever the font asset format is (ex. 'woff2', 'otf', etc) in order to load correctly. | `family: string`</br>`url: string`<br>`format: string`<br>`size: string`</br>`color: string`

&nbsp;

## Custom Styling
|Property|Default
:---|:---
|`--hive-rte-background`|`none`|
|`--hive-rte-button-size`|`25px`|
|`--hive-rte-border`|`1px solid #d1d1d1`|
|`--hive-rte-focus-border`|`1px solid #d1d1d1`|
|`--hive-rte-border-radius`|`0`|
|`--hive-rte-font-family`|`Arial`|
|`--hive-rte-font-size`|`14px`|
|`--hive-rte-font-color`|`#626272`|
|`--hive-rte-placeholder-color`|`#ccc`|
|`--hive-rte-placeholder-position-top`|`10px`|
|`--hive-rte-placeholder-position-left`|`10px`|
|`--hive-rte-placeholder-position-right`|`none`|
|`--hive-rte-placeholder-position-bottom`|`none`|
|`--hive-rte-max-height`|`none`|
|`--hive-rte-height`|`100%`|
|`--hive-rte-min-height`|`0`|
|`--hive-rte-max-width`|`none`|
|`--hive-rte-width`|`100%`|
|`--hive-rte-min-width`|`0`|
|`--hive-rte-toolbar-padding`|`10px 5px`|
|`--hive-rte-body-padding`|`10px`|

&nbsp;

## Methods
|Event|Description|Values|Return|
:---|:---|:---|:---
|`getContent()`|To return the current contents of the editor.|`null`|`return: { text: 'Hive Rich Text Editor', html: '<b>Hive Rich Text Editor</b> }'`
|`setContent(value: string)`|To set the content within the editor at any given time. Will override any and all values within the text editor.|`plain text` and/or `html text` as a `string`|`null`

&nbsp;

## Events
|Event|Description|Return|
:---|:---|:---
|`textChange`|Key-up event hook when the user types in the editor.|`KeyboardEvent`
|`styleChange`|Style change event hook when user selects a style from the toolbar.|`CustomEvent`

&nbsp;

# Contributors

[<img alt="Austin Miller" src="https://avatars2.githubusercontent.com/u/24658060?s=460&v=4" width="117">](https://github.com/mr-austinmiller) |
:---:
|[Austin Miller](https://github.com/mr-austinmiller)|
