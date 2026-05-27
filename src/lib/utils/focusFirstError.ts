import type { StandardSchemaV1Issue } from '@tanstack/react-form';

export const focusFirstError = (selector: string, errorMap?: Record<string, StandardSchemaV1Issue[]>) => {
    if (!errorMap) {
        return;
    }
    const inputs = [...document.querySelectorAll(selector)] as HTMLInputElement[];
    let firstInput: HTMLInputElement | undefined;
    for (const input of inputs) {
        if (errorMap[input.name]) {
            firstInput = input;
            break;
        }
    }
    firstInput?.focus();
};
