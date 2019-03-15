![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

# Hive PDF Viewer
This web component allows you to add rich text editing to your applications.

## Features
- Add styling to your text inputs
- Fully customizable toolbar
- Allows for dynamic and static sizing

## Installation
- `npm i @teamhive/rich-text-editor`

## Usage
```
<hive-rich-text [options]="options"></hive-rich-text>
```

Where `options` can be populated with any of the following properties.

## Properties
|Property|Default|Description|Values|
:---|:---|:---|:---
|`toolbar`|`['bold', 'italic', 'underline', 'strikethrough', '\|', 'link', '\|', 'color', 'highlight']`|The components that will show up in the toolbar.|`bold, italic, underline, strikethrough, link, color, highlight, -, \|`|
|`colors`|`['#FF4541', '#E65100', '#43A047', '#1C9BE6', '#6446EB', '#ACACC2', '#626272']`|The colors that will show up for a quick selection when formating text color.|Any valid hex code|
|`highlights`|`['#f3f315', '#ff0099', '#83f52c', '#ff6600', '#6e0dd0']`|The colors that will show up for a quick selection when formating highlight color.|Any valid hex code|
|`position`|`top`|The position of the toolbar in relation to the text container.|`top` or `bottom`|
|`content`|`null`|The content that will be loaded into the text container upon loading.|`plain text` and `html text` as a `string`|
|`height`|`100%`|The total height of the entire component. The text container will be equal to this subtracted by the toolbar height.|Any valid css|
|`width`|`100%`|The total width of the entire component.|Any valid css|
|`border`|`1px solid #d1d1d1`|The border style that will show up.|Any valid css|
|`borderRadius`|`2px`|The border radius that will be applied to entire component.|Any valid css.|
|`phantom`|`false`|To hide the toolbar and reveal it upon hovering over the text component.|`boolean`|
|`resize`|`true`|To constantly check if the component needs to dynamically be resized.|`boolean`|
|`autoFocus`|`false`|To focus on the text component upon init.|`boolean`|


### Methods
|Event|Description|Return|
:---|:---|:---
|`getContent()`|To return the current contents of the editor.|`return: { text: 'Hive Rich Text Editor', html: '<b>Hive Rich Text Editor</b>'`|

---

## Contributors

[<img alt="Austin Miller" src="https://avatars2.githubusercontent.com/u/24658060?s=460&v=4" width="117">](https://github.com/mr-austinmiller) |
:---:
|[Austin Miller](https://github.com/mr-austinmiller)|
