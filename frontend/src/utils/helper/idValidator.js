export function isValidId(id, prefix, length) {
    if (!id) {
        return { isValid: false, error: "Please fill Id" };
    }

    if (id.length < 3) {
        return { isValid: false, error: `Entered "${id}" ID should be at least 3 characters long.` };
    }

    if (!id.startsWith(prefix)) {
        return { isValid: false, error: `Entered "${id}" ID must start with the prefix '${prefix}'.` };
    }

    const regex = new RegExp(`^${prefix}\\d+$`);
    if (!regex.test(id)) {
        return { isValid: false, error: `Entered "${id}" ID must contain only numbers after prefix '${prefix}'.` };
    }

    if (id.length !== length) {
        return { isValid: false, error: `Entered "${id}" Id length is ${id.length}, it must be exactly ${length} characters long.` };
    }

    return { isValid: true, error: null };
}
