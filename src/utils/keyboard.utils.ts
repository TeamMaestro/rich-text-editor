export const keys: { [name: string]: number } = {
    'Backspace': 8,
    'Enter': 13,
    'Shift': 16,
    'Ctrl': 17,
    'Alt': 18,
    'Delete': 46,
    'ArrowLeft': 37,
    'ArrowUp': 38,
    'ArrowRight': 39,
    'ArrowDown': 40,
    'KeyB': 66,
    'KeyI': 73,
    'KeyU': 85,
    'OSLeft': 91,
    'OSRight': 93
}

export const specialKeys: { [code: number]: boolean } = {

    // control
    [keys['Shift']]: true,
    [keys['Ctrl']]: true,
    [keys['Alt']]: true,
    [keys['Delete']]: true,

    // navigation
    [keys['ArrowUp']]: true,
    [keys['ArrowDown']]: true,
    [keys['ArrowLeft']]: true,
    [keys['ArrowRight']]: true,

    // meta
    [keys['OSLeft']]: true,
    [keys['OSRight']]: true,
};

export const isKey = (keyCode: number, keyName: string | string[]) => {
    return Array.isArray(keyName)
        ? keyName.some(name => keys[name] === keyCode)
        : keys[keyName] === keyCode;
}

export const isSpecialKey = (keyCode: number) => {
    return specialKeys[keyCode];
};

export const isOSKey = (keyCode: number) => {
    return isKey(keyCode, ['OSLeft', 'OSRight'])
}
