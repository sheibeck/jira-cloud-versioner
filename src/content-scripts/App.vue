<template>
  <!-- Latest compiled and minified CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">

  <div id="jcv-root" class="container">
    <div class="row">      
      <div class="col-11">
        <div class="h2">Jira Version Manager</div>
      </div>
      <div class="col-1">
        <button type="button" class="btn btn-secondary">Close</button>
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

onMounted(() => {   
  const integrationColumnId = document.querySelector("[title='Integrating']")?.getAttribute("data-id");
  const swimLanes = document.querySelectorAll(`[data-column-id="${integrationColumnId}"]`);

  swimLanes.forEach( (swimLane) => {
    const statFields = swimLane?.querySelectorAll(".ghx-stat-fields") ?? []

    statFields.forEach( (stat) => {   
      const rows = stat.querySelectorAll(".ghx-row"); 
      let status = "";
      const statusText = rows[0].querySelector("[id^='gh-dev-info-icon']")?.querySelector("[aria-label]");
      if (statusText) {
        status = statusText.getAttribute("aria-label") ?? "";
      }
      const ticketNumber = rows[1].querySelectorAll("a")[0].getAttribute("aria-label");
    
      if (status && ticketNumber) {
        const ticket = `${ticketNumber} (${status})`;//new JiraTicket(ticketNumber, status);
        tickets.value.push(ticket);
      }
    });
  });
});
</script>

<style>
#app { 
  position: absolute;
  left: 0;
  top: 0;  
  z-index: 999;
  height: 100%;
  width: 100%;
}

#jcv-root { 
  height: 100%;
  width: 100%;
  border: solid 1px black;
  background-color: black;
  
  overflow: scroll;
}
</style>