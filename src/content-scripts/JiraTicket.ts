export class JiraTicket {
    Number: string;    
    CodeBase: string;
    IsPbi: boolean;
    IsSev: boolean;

    constructor(number, codeBase, isPbi, isSev) {
      this.Number = number;      
      this.CodeBase = codeBase;
      this.IsPbi = isPbi;
      this.IsSev = isSev;
    }
}
  