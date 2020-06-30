export const CityPattern: RegExp = new RegExp(/[a-zA-Z, ]+/);
export const EmailPattern: RegExp = new RegExp(
    /[a-z]+@[a-z]+\.[(.com)|(.in)|(.net)]/
);
export const NumberPlatePattern: RegExp = new RegExp(
    /([A-Z]{2} [0-9]{2} [0-9]{4})/
);
export const PasswordPattern: RegExp = new RegExp(
    /[a-zA-Z(0-9)+($&+,:;=?@#|'<>.^*()%!-)+]+/
);
export const NamePattern: RegExp = new RegExp(/[A-Z]{1}[a-zA-Z\s]+/);
export const DatePattern: RegExp = new RegExp(/\d{1,2}\/\d{1,2}\/\d{4}/);
