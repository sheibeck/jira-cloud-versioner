<template>
  <!-- Latest compiled and minified CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css" integrity="sha512-MV7K8+y+gLIBoVD59lQIYicR65iaqukzvf/nwasF0nqhPay5w/9lJmVM2hMDcnK1OnMGCdVK+iQrJ7lzPJQd1w==" crossorigin="anonymous" referrerpolicy="no-referrer" />
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css">
  
  <div id="jcv-root" class="container" :class="{ hidden: !isVisible }">
    <div class="row">      
      <div class="col-8">
        <div class="h2">Jira Version Manager</div>
      </div>
      <div class="col d-flex flex-row-reverse">
        <button type="button" class="btn btn-secondary m-1" @click="toggleApp()">Close</button>
        <button type="button" class="btn btn-secondary m-1" @click="processSwimlanes()">Refresh Issues</button>             
      </div>
    </div>
    
    <div class="row">
      <div class="col">        
        <div v-for="codebase in component.CodeBases" v-bind:key="codebase.Name">
          <div class="h4 border-bottom">
            {{codebase.Name}}
          </div>        
          <draggable 
            @change="issueListChanged"
            v-model="codebase.Issues" 
            class="border version-drop"
            group="version"               
            item-key="Number">
            <template #item="{element}">
              <div> 
                <div>
                  {{ element.Number }}                          
                  <i v-if="element.Status == TicketStatus.PullRequest" :title="element.Status" class="fa-solid fa-code-pull-request p-1"></i>
                  <i v-if="element.Status == TicketStatus.Merged" :title="element.Status" class="fa-solid fa-code-merge p-1"></i>
                  <i v-if="element.Status == TicketStatus.Unknown" :title="element.Status" class="fa-solid fa-question p-1"></i>
                  <i v-if="element.IsPbi" title="pbi" class="fa-solid fa-triangle-exclamation p-1"></i>
                  <i v-if="element.IsSev" title="sev" class="fa-solid fa-circle-exclamation p-1"></i>                    
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>

      <div class="col">
        <div class="row">
          <div class="col">
            <span class="h3">Versions</span>
          </div>
        </div>
        <div class="row d-flex border-bottom pb-2 mb-2">
          <div class="col">
            <div class="input-group input-group-sm">
              <div class="input-group-prepend">
                <span class="input-group-text" id="new-version-number">#</span>
              </div>
              <input ref="newVersionNumber" type="text" class="form-control" aria-label="Version Number" aria-describedby="new-version-number">
            </div>
          </div>
          <div class="col-4">
            <div class="input-group input-group-sm">
              <div class="input-group-prepend">
                <span class="input-group-text" id="new-version-number">Code</span>
              </div>
              <input ref="versionCodeBase" type="text" class="form-control" aria-label="Version Number" aria-describedby="new-version-number" value="VHCLIAA">
            </div>
          </div>
          <div class="col d-flex flex-row-reverse">
            <button type="button" class="btn" :class="{ 'btn-primary': showReleasedVersions, 'btn-secondary': !showReleasedVersions }" 
              @click="toggleReleasedVersions()">Released</button>
            <button type="button" class="btn btn-secondary" @click="addVersion()">Add</button>      
          </div>
        </div>        
        <div class="row">
          <div v-for="version in getVersionListByFilter()" v-bind:key="version.Number" class="mb-2">
            <div class="h4">
              {{version.CodeBase}} {{version.Number}}
              <i class="fa-solid fa-trash pe-1" @click="removeVersion(version.Number)"></i>
              <i class="fa-brands fa-slack pe-1" @click="copyVersionForSlack(version.Number)"></i>
              <i class="fa-regular fa-file-excel pe-1" @click="copyVersionForExcel(version.Number)"></i>              
            </div>
            <div class="col">
              <div class="form-check">
                <input type="checkbox" class="form-check-input" v-model="version.Released">
                <label class="form-check-label">Released</label>
              </div>            
            </div>
            <draggable 
              @change="versionListChanged"
              v-model="version.Issues" 
              class="border version-drop"
              group="version"               
              item-key="Number">
              <template #item="{element}">
                <div> 
                  <div>
                    {{ element.Number }}                          
                    <i v-if="element.Status == TicketStatus.PullRequest" :title="element.Status" class="fa-solid fa-code-pull-request p-1"></i>
                    <i v-if="element.Status == TicketStatus.Merged" :title="element.Status" class="fa-solid fa-code-merge p-1"></i>
                    <i v-if="element.Status == TicketStatus.Unknown" :title="element.Status" class="fa-solid fa-question p-1"></i>
                    <i v-if="element.IsPbi" title="pbi" class="fa-solid fa-triangle-exclamation p-1"></i>
                    <i v-if="element.IsSev" title="sev" class="fa-solid fa-circle-exclamation p-1"></i>                    
                  </div>
                </div>
              </template>
            </draggable>
                   
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
import { Issue } from "./Issue";
import { Database } from "./Database";
import draggable from 'vuedraggable'
import Toastify from 'toastify-js'

let component = ref(new Component("C2C"));
const newVersionNumber = ref();
const versionCodeBase = ref();
const db = new Database("c2c");
const versions = ref(db.fetch());

let isVisible = ref(false);
let showReleasedVersions = ref(true);

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
  component = ref(new Component("C2C"));
  const issueList = Issue.GetIssues().sort(compareCodeBase);
  
  //sort the issues list and then create the component/codebases  
  issueList.forEach( (issue) => {
    if ( !component.value.CodeBases.find( cb => cb.Name == issue.CodeBase ) ) {
      component.value.AddCodeBase(new CodeBase(issue.CodeBase));
    }
    const codeBase = component.value.CodeBases.find( cb => cb.Name == issue.CodeBase );
    codeBase?.AddIssue(issue);
  });

  handleVersionedIssues();
}

const handleVersionedIssues = function() {  
  component.value.CodeBases.forEach( (codebase) => {
    const versionedIssues = new Array<string>();
    codebase.Issues.forEach( (issue) => {      
      const issueIsVersioned = versions.value.findIndex( v => {
        const index = v.Issues.findIndex( i => i.Number === issue.Number);
        return index > -1;
      }) > -1;

      if (issueIsVersioned) {
        versionedIssues.push(issue.Number);
      }
    });    
    codebase.Issues = codebase.Issues.filter( i => !versionedIssues.includes(i.Number) );
  });
}

const toggleReleasedVersions = function() {
  showReleasedVersions.value = !showReleasedVersions.value;
}

const getVersionListByFilter = function() {  
  const vs = versions.value.filter( v => v.Released === false || v.Released == null || v.Released == undefined || v.Released === showReleasedVersions.value );  
  return vs;
}

const addVersion = function() {  
  const version = new Version(newVersionNumber.value.value, versionCodeBase.value.value);
  versions.value.unshift(version);

  db.save(versions.value);
}

const removeVersion = function(versionNumber) {
  const verifyDelete = window.confirm("Are you sure you want to delete this version?");
  if (verifyDelete) {
    const v = versions.value.find( v => v.Number === versionNumber);
    if (v) {
      var index = versions.value.indexOf(v);
      if (index > -1) {
        versions.value.splice(index, 1);
      }
    }

    db.save(versions.value);
    processSwimlanes();
  }  
}

const copyVersionForSlack = function(versionNumber) {
  const v = versions.value.find( v => v.Number === versionNumber);
  if (v) {
    let output = `@c2c-integrators\r\n`;
    output += `${v.CodeBase} ${v.Number}\r\n`;
    v.Issues.forEach( (issue) => {
      output += `${issue.Number}${issue.IsSev ? " [SEV]" : ""}\r\n`;
    });
    output += `\r\n`;

    // Copy the text inside the text field
    navigator.clipboard.writeText(output);

    sendMessage("copied for Slack");
  }
}

const copyVersionForExcel = function(versionNumber) {
  const v = versions.value.find( v => v.Number === versionNumber);
  if (v) {
    const hasSev = v.Issues.findIndex(i => i.IsSev) > -1;
    let output = `v${v.Number}\t`;                  //A
    output += `${v.Number}+?\t`;                    //B
    output += `${"PI?"}\t`;                         //C
    output += `\t`;                                 //D
    output += `${getFormattedDate().toString()}\t`  //E
    output += `Regular\t`                           // F
    output += `${ hasSev ? "SEV" : ""}\t"`;         // G

    //H
    v.Issues.forEach( (issue) => {
      output += `${issue.Number}\n`;
    });

    output += `"\t${hasSev ? "Yes" : "No"}`;        //I

    // Copy the text inside the text field
    navigator.clipboard.writeText(output);

    sendMessage("copied for Excel");
  }
}

function getFormattedDate() {
  const date = new Date();
  var year = date.getFullYear();

  var month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;

  var day = date.getDate().toString();
  day = day.length > 1 ? day : '0' + day;
  
  return month + '/' + day + '/' + year;
}

const sendMessage = function (message) {
  Toastify({
      text: message,
      position: "right",
      gravity: "bottom",
      duration: 2000,
      style: {
        zIndex: 999999,
      },
    }).showToast();
}

function issueListChanged(added, removed, moved){
  //alert("issue list changed");
}

function versionListChanged(added, removed, moved){  
    db.save(versions.value);    
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

.version-drop {
  min-height: 100px;  
}
</style>