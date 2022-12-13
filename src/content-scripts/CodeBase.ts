import { JiraTicket } from "./JiraTicket";

export class CodeBase {
    Name: string;
    Issues = new Array<JiraTicket>();

    constructor(name) {
      this.Name = name;      
    }

    AddIssue(issue) {
      this.Issues.push(issue);
    }
}
  