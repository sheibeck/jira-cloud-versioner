import { JiraTicket } from "./JiraTicket";

export class Version {
    Number: string;
    CodeBase: string;
    Issues = new Array<JiraTicket>();

    constructor(number, codebase) {
        this.Number = number;
        this.CodeBase = codebase;
    }
}