export const EmailPattern: RegExp = new RegExp('[a-z]+[0-9]+@[a-z]+(.com|.in|.net)');
export const PasswordPattern: RegExp = new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,8}$/);