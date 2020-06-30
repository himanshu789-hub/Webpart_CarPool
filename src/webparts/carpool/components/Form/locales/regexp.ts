export const NamePattern:RegExp=new RegExp('[^ ][a-zA-Z ]+');
export const EmailPattern: RegExp = new RegExp('[a-z]+@(.com|.in|.net)');
export const PasswordPattern: RegExp = new RegExp('[a-zA-Z[0-9]+[!@#$%^&*\(\):;{}\[\]\"\'<>//?]+]{4,6}');