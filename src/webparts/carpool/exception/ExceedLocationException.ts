export class ExceedLocation extends Error{
    constructor(message) {
        super(message);
        this.name = "Exceed Location Error";
    }
}