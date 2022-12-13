import { TicketStatus } from "./TicketStatus";
export class JiraTicket {
    Number: string;
    Status: TicketStatus;
    CodeBase: string;
    IsPbi: boolean;
    IsSev: boolean;

    constructor(number, status, codeBase, isPbi, isSev) {
      this.Number = number;
      this.Status = status;
      this.CodeBase = codeBase;
      this.IsPbi = isPbi;
      this.IsSev = isSev;
    }
  }
  