/**
 * Responsible for rendering the select tabanca screen 
 */
'use strict';
/* global odkTables, util, odkCommon, odkData */

var masterList, date, reg, regNome, hcarea, hcareaNome, listGroup;
function display() {
    console.log("Tabanca list loading");
    date = util.getQueryParameter('date');
    reg = util.getQueryParameter('reg');
    regNome = util.getQueryParameter('regNome');
    hcarea = util.getQueryParameter('hcarea');
    hcareaNome = util.getQueryParameter('hcareaNome');
    listGroup = util.getQueryParameter('listGroup');

    var head = $('#main');
    head.prepend("<h1>" + hcareaNome + " </br> <h3> Tabancas");
    
    doSanityCheck();
}

function doSanityCheck() {
    console.log("Checking things");
    console.log(odkData);
}

// Get masterlList from CSV
$.ajax({
    url: 'masterList.csv',
    dataType: ' ',
}).done(getMasterList);

function getMasterList(data) {
    masterList = [];
    var allRows = data.split(/\r?\n|\r/);
    for (var row = 1; row < allRows.length; row++) {  // start at row = 1 to skip header
            allRows[row] = allRows[row].replace(/"/g,""); // remove quotes from strings
            var rowValues = allRows[row].split(",");
            var p = {reg: rowValues[0], regNome: rowValues[1], hcarea: rowValues[2], hcareaNome: rowValues[3], tab: rowValues[4], tabNome: rowValues[5], listGroup: rowValues[6]};
            if (p.reg != "") { // only push rows with reg number
                masterList.push(p);
            }
    }
    console.log("masterList", masterList);
    initButtons()
}

function initButtons() {
    // Group by tab
    const tabs = [];
    const map = new Map();
    for (const item of masterList) {
        if (item.reg == reg & item.listGroup == listGroup) {
            if(!map.has(item.tab)){
                map.set(item.tab, true);    // set any value to Map
                tabs.push(item);
            }
        }
    }
    console.log("tabs", tabs);

    // Tabanca buttons
    var ul = $('#li');
    $.each(tabs, function() {
        var that = this;      
        
        ul.append($("<li />").append($("<button />").attr('id',this.tab).attr('class','btn' + this.reg).append(this.tabNome)));
        
        // Buttons
        var btn = ul.find('#' + this.tab);
        btn.on("click", function() {
            var queryParams = util.setQuerystringParams(date, that.reg, that.regNome, that.hcarea, that.hcareaNome, that.listGroup, that.tab, that.tabNome);
            odkTables.launchHTML(null, 'config/assets/list.html' + queryParams);
        })        
    });
}