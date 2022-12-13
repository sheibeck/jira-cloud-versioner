<template>
  <!-- Latest compiled and minified CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">

  <div id="jcv-root" class="container" :class="{ hidden: !isVisible }">
    <div class="row">      
      <div class="col-11">
        <div class="h2">Jira Version Manager</div>
      </div>
      <div class="col-1">
        <button type="button" class="btn btn-secondary" @click="toggleApp()">Close</button>
      </div>
    </div>
    
    <div class="row">
      <div class="col">
        <div class="h3">Subtasks</div>
        <li v-for="ticket in tickets">
          {{ ticket }}
        </li>
      </div>

      <div class="col">
        <div class="h3">Versions</div>
        
      </div>
    </div>
  </div>  
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

class JiraTicket {
  number: string;
  status: string;

  constructor(number, status) {
    this.number = number;
    this.status = status;
  }
}

const tickets = ref(new Array<string>());
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

onMounted(() => {  
  document.addEventListener("openJcv", (event) => {    
    toggleApp();
  });

  const integrationColumnId = document.querySelector("[title='Integrating']")?.getAttribute("data-id");
  const swimLanes = document.querySelectorAll(`[data-column-id="${integrationColumnId}"]`);

  swimLanes.forEach( (swimLane) => {
    const issues = swimLane?.querySelectorAll(".ghx-issue") ?? [];

    issues.forEach( (issue) => {   
      const ticketNumber = issue.getAttribute("data-issue-key");
      const extraFields = issue.querySelector(".ghx-extra-fields");
      let isPBI = false;
      
      if (issue.closest(".ghx-swimlane")?.classList.contains("ghx-first")) {
        isPBI = true;
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
      
      let status = "";
      let isSEV = false;
      const statFields = issue.querySelector(".ghx-stat-fields");
      const statRows = statFields?.querySelectorAll(".ghx-row"); 
      if (statRows) {        
        const priority = statRows[0].querySelectorAll(".ghx-field")[1];
        if ((priority?.getAttribute("data-tooltip") ?? "").indexOf("Default") === -1) {
          isSEV = true;
        }

        const statusText = statRows[0].querySelector("[id^='gh-dev-info-icon']")?.querySelector("[aria-label]");
        if (statusText) {
          status = statusText.getAttribute("aria-label") ?? "";
        }
      }
          
      if (status && ticketNumber) {
        const ticket = `${ticketNumber} (${status}, ${codeBase}) ${isPBI ? "PBI" : ""} ${isSEV ? "SEV" : ""}`;//new JiraTicket(ticketNumber, status);
        tickets.value.push(ticket);
      }
    });
  });
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
</style>