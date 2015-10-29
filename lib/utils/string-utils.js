
const
    REG_EXPS = {
        camelCase: /([a-z])([A-Z])/g
    };

function camelCaseToPascalCase(string) {
    return string.replace(REG_EXPS.camelCase, '$1-$2').toLowerCase();
}


export {
    camelCaseToPascalCase
};
