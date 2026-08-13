import { I18nContext } from 'nestjs-i18n';

export function t(key: string, options?: any): string {
    const i18n = I18nContext.current();
    if (i18n) {
        return i18n.t(key, options) as string;
    }
    return key;
}
