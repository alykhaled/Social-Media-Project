module.exports.validateRegisterInput = (
    username,
    email,
    password,
    confirmPassword
) => {
    const errors = {};
    if (username.length < 3) {
        errors.username = 'Username must be at least 3 characters long.';
    }
    if (email.length < 3) {
        errors.email = 'Email must be at least 3 characters long.';
    }
    else
    {
        const regEx = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (!email.match(regEx)) {
            errors.email = 'Invalid email address.';
        }
    }
    if (password.length < 3) {
        errors.password = 'Password must be at least 3 characters long.';
    }
    if (password !== confirmPassword) {
        errors.password = 'Passwords do not match.';
    }
    return {
        errors,
        valid: Object.keys(errors).length === 0
    };
}

module.exports.validateLoginInput = (
    username,
    password
) => {
    const errors = {};
    if (username.length < 3) {
        errors.username = 'Username must be at least 3 characters long.';
    }
    if (password.length < 3) {
        errors.password = 'Password must be at least 3 characters long.';
    }
    return {
        errors,
        valid: Object.keys(errors).length === 0
    };
}