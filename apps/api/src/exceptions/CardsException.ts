export class CardsException extends Error {
    status: number;
    constructor(message: string, status = 400) {
        super(message);
        this.name = 'CardsError';
        this.status = status;
    }
}