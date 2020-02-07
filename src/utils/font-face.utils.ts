import { FontFace } from '../interface';

export function GetFontFaces(family: string, faces: FontFace[]) {
    return faces.map(face => {
        let srcStack: string;

        if (Array.isArray(face.src)) {
            srcStack = face.src.map(src =>
                `url('${src}') format('${getFormat(src)}')`
            ).join(',');
        } else {
            srcStack = `url('${face.src}') format('${getFormat(face.src)}')`;
        }

        return `
            @font-face {
                font-family: '${family}';
                font-weight: ${face.weight};
                font-style: ${face.style};
                src: ${srcStack};
            }
        `;
    }).join('');
}

function getFormat(src: string) {
    const extension = src.split('.').pop();
    switch (extension) {
        case 'ttf':
            return 'truetype';
        case 'otf':
            return 'opentype';
        case 'eot':
            return 'embedded-opentype';
        default:
            return extension;
    }
}
