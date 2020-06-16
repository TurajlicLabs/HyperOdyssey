export const createSpyObj = (baseName, methodNames) => {
    let obj: any = {};

    for (let i = 0; i < methodNames.length; i++) {
        obj[methodNames[i]] = jest.fn();
    }

    return obj;
};