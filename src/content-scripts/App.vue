<template>
  <!-- Latest compiled and minified CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css" integrity="sha512-MV7K8+y+gLIBoVD59lQIYicR65iaqukzvf/nwasF0nqhPay5w/9lJmVM2hMDcnK1OnMGCdVK+iQrJ7lzPJQd1w==" crossorigin="anonymous" referrerpolicy="no-referrer" />

  <div id="jcv-root" class="container" :class="{ hidden: !isVisible }">
    <div class="row">      
      <div class="col-10">
        <div class="h2">Jira Version Manager</div>
      </div>
      <div class="col-1">
        <button type="button" class="btn btn-secondary" @click="processSwimlanes()">Refresh</button>
      </div>
      <div class="col-1">
        <button type="button" class="btn btn-secondary" @click="toggleApp()">Close</button>
      </div>
    </div>
    
    <div class="row">
      <div class="col">        
        <div v-for="codebase in component.CodeBases">
          <div class="h4">
            {{codebase.Name}}
          </div>
          <li v-for="issue in codebase.Issues">
            {{ issue.Number }}
            <i v-if="issue.Status == TicketStatus.PullRequest" :title="issue.Status" class="fa-solid fa-code-pull-request p-1"></i>
            <i v-if="issue.Status == TicketStatus.Merged" :title="issue.Status" class="fa-solid fa-code-merge p-1"></i>
            <i v-if="issue.Status == TicketStatus.Unknown" :title="issue.Status" class="fa-solid fa-question p-1"></i>
            <i v-if="issue.IsPbi" title="pbi" class="fa-solid fa-triangle-exclamation p-1"></i>
            <i v-if="issue.IsSev" title="sev" class="fa-solid fa-circle-exclamation p-1"></i>
          </li>
        </div>
      </div>

      <div class="col">
        <div class="row">
          <div class="col h3">
            Versions
          </div>
          <div class="col">
            <div class="input-group input-group-sm">
              <div class="input-group-prepend">
                <span class="input-group-text" id="new-version-number">#</span>
              </div>
              <input ref="newVersionNumber" type="text" class="form-control" aria-label="Version Number" aria-describedby="new-version-number">
            </div>
            <div class="input-group input-group-sm">
              <div class="input-group-prepend">
                <span class="input-group-text" id="new-version-number">Code</span>
              </div>
              <input ref="versionCodeBase" type="text" class="form-control" aria-label="Version Number" aria-describedby="new-version-number" value="VHCLIAA">
            </div>
            
            <button type="button" class="btn btn-secondary" @click="addVersion()">Add</button>
          </div>
        </div>
        <div class="row">
          <div v-for="version in versions">
            <div class="h4">
              {{version.CodeBase}} {{version.Number}}
            </div>
            <li v-for="issue in version.Issues">
              {{ issue.Number }}
              <i v-if="issue.Status == TicketStatus.PullRequest" :title="issue.Status" class="fa-solid fa-code-pull-request p-1"></i>
              <i v-if="issue.Status == TicketStatus.Merged" :title="issue.Status" class="fa-solid fa-code-merge p-1"></i>
              <i v-if="issue.Status == TicketStatus.Unknown" :title="issue.Status" class="fa-solid fa-question p-1"></i>
              <i v-if="issue.IsPbi" title="pbi" class="fa-solid fa-triangle-exclamation p-1"></i>
              <i v-if="issue.IsSev" title="sev" class="fa-solid fa-circle-exclamation p-1"></i>
            </li>            
          </div>
        </div>     
      </div>
    </div>
  </div>  
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Component } from "./Component";
import { CodeBase } from "./CodeBase";
import { JiraTicket } from "./JiraTicket";
import { TicketStatus } from "./TicketStatus";
import { Version } from "./Version";
import { version } from "os";

let component = ref(new Component("C2C"));
let versions = ref(new Array<Version>());
const newVersionNumber = ref();
const versionCodeBase = ref();

let isVisible = ref(false);

const toggleApp = function() {
  isVisible.value = !isVisible.value;
  
  const appRoot = document.getElementById("jcvApp");
  if (isVisible.value) {
    appRoot?.classList.remove("hidden");
  }
  else {
    appRoot?.classList.add("hidden");
  }
}

function compareCodeBase( a: JiraTicket, b: JiraTicket ) {
  if ( a.CodeBase < b.CodeBase ){
    return -1;
  }
  if ( a.CodeBase > b.CodeBase ){
    return 1;
  }
  return 0;
}

const processSwimlanes = function() {
  component = ref(new Component("C2C"))

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

        status = getTicketStatus(statRows[0]);
      }
          
      if (status && ticketNumber) {        
        const ticket = new JiraTicket(ticketNumber, status, codeBase, isPbi, isSev)
        issueList.push(ticket);
      }
    });    
  });

  //sort the issues list and then create the component/codebases  
  issueList.sort(compareCodeBase).forEach( (issue) => {
      if ( !component.value.CodeBases.find( cb => cb.Name == issue.CodeBase ) ) {
        component.value.AddCodeBase(new CodeBase(issue.CodeBase));
      }
      const codeBase = component.value.CodeBases.find( cb => cb.Name == issue.CodeBase );
      codeBase?.AddIssue(issue);
    });
}

const getTicketStatus = function(elem) : TicketStatus {
  let status = TicketStatus.Unknown;
  const statusText = elem.querySelector("[id^='gh-dev-info-icon']")?.querySelector("[aria-label]");
  if (statusText) {
    const label = statusText.getAttribute("aria-label") ?? "";
    status = label as TicketStatus ?? TicketStatus.Unknown
  } 

  return status;
}

const addVersion = function() {  
  const version = new Version(newVersionNumber.value.value, versionCodeBase.value.value);
  versions.value.unshift(version);
}

onMounted(() => {
  document.addEventListener("openJcv", (event) => {
    toggleApp();
  });  

  processSwimlanes(); 
});
</script>

<style>
#jcvApp { 
  position: absolute;
  left: 0;
  top: 0;  
  height: 100%;
  width: 100%;
  z-index: 999;
}

#jcv-root { 
  overflow: scroll;
  border: solid 1px black;
  background-color: black;
  height: 100%;
  width: 100%;
}

.fa-triangle-exclamation {
  color: gold;
}

.fa-circle-exclamation {
  color: darkred;
}

.fa-code-merge {
  color: green;
}
</style>