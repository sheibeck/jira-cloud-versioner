import { JiraTicket } from "./JiraTicket";
import { TicketStatus } from "./TicketStatus";

export class Issue {

    static GetIssues() : Array<JiraTicket> {                
        const integrationColumnId = document.querySelector("[title='Integrating']")?.getAttribute("data-id");
        const swimLanes = document.querySelectorAll(`[data-column-id="${integrationColumnId}"]`);
        const issueList = new Array<JiraTicket>();

        swimLanes.forEach( (swimLane) => {    
            const issues = swimLane?.querySelectorAll(".ghx-issue") ?? [];

            issues.forEach( (issue) => {   
            const ticketNumber = issue.getAttribute("data-issue-key");
            const extraFields = issue.querySelector(".ghx-extra-fields");
            let isPbi = false;
            
            if (issue.closest(".ghx-swimlane")?.classList.contains("ghx-first")) {
                isPbi = true;
            }

            let codeBase = "";            
            const codeBaseRows = extraFields?.querySelectorAll(".ghx-row"); 
            if (codeBaseRows) {        
                const codeBaseText = codeBaseRows[1].querySelector(".ghx-extra-field");
                if (codeBaseText) {
                codeBase = codeBaseText.getAttribute("data-tooltip") ?? "";
                codeBase = codeBase.replace("CodebaseKey: ", "");
                }
            }
            
            let status = TicketStatus.Unknown;
            let isSev = false;
            const statFields = issue.querySelector(".ghx-stat-fields");
            const statRows = statFields?.querySelectorAll(".ghx-row"); 
            if (statRows) {        
                const priority = statRows[0].querySelectorAll(".ghx-field")[1];
                if ((priority?.getAttribute("data-tooltip") ?? "").indexOf("Default") === -1) {
                isSev = true;
                }

                status = this.getTicketStatus(statRows[0]);
            }
                
            if (status && ticketNumber) {        
                const ticket = new JiraTicket(ticketNumber, status, codeBase, isPbi, isSev)
                issueList.push(ticket);
            }
            });    
        });

        return issueList;
    }

    private static getTicketStatus(elem) : TicketStatus {
        let status = TicketStatus.Unknown;
        const statusText = elem.querySelector("[id^='gh-dev-info-icon']")?.querySelector("[aria-label]");
        if (statusText) {
        const label = statusText.getAttribute("aria-label") ?? "";
        status = label as TicketStatus ?? TicketStatus.Unknown
        } 
    
        return status;
    }
}