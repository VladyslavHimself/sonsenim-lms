export class DecksException extends Error {
    status: number;
    constructor(message: string, status = 400) {
        super(message);
        this.name = 'DecksError';
        this.status = status;
    }
}