/**
 * Responsible for rendering registered pregnancies
 */
'use strict';

var supervisionList, date, reg, regNome, hcarea, hcareaNome;
function display() {
    date = util.getQueryParameter('date');
    reg = util.getQueryParameter('reg');
    regNome = util.getQueryParameter('regNome');
    hcarea = util.getQueryParameter('hcarea');
    hcareaNome = util.getQueryParameter('hcareaNome');
    
    var head = $('#main');
    head.prepend("<h1>" + hcareaNome + " </br> <h3> Supervisão nos centros de saúde");
    
    doSanityCheck();
    loadSupervision();
}

function doSanityCheck() {
    console.log("Checking things");
    console.log(odkData);
}

function loadSupervision() {
    // SQL to get pregnancies
    var sql = "SELECT _id, _savepoint_type, ASSISTANT, HCAREANOME, VISITDATE" +
        " FROM SUPERVISIONHC" + 
        " WHERE REG = " + reg + " AND HCAREA = " + hcarea +
        " ORDER BY " +
        " substr(VISITDATE, instr(VISITDATE, 'Y:')+2, 4) || " +
        " substr('00'|| trim(substr(VISITDATE, instr(VISITDATE, 'M:')+2, 2),','), -2, 2) || " +
        " substr('00'|| trim(substr(VISITDATE, instr(VISITDATE, 'D:')+2, 2),','), -2, 2) ASC " // For some reason this shold be ASC, but DESC when putting the code in SQL-database viewer
    supervisionList = [];
    console.log("Querying database for supervisions...");
    console.log(sql);
    var successFn = function( result ) {
        console.log("Found " + result.getCount() + " supervisions");
        for (var row = 0; row < result.getCount(); row++) {
            var rowId = result.getData(row,"_id"); // row ID 
            
            var ASSISTANT = result.getData(row,"ASSISTANT");
            var HCAREANOME = result.getData(row,"HCAREANOME")
            var VISITDATE = result.getData(row,"VISITDATE");

            var s = {type: 'supervision', rowId, ASSISTANT, HCAREANOME, VISITDATE};
            supervisionList.push(s);
        }
        console.log("Supervisions:", supervisionList)
        populateView();
        return;
    }
    var failureFn = function( errorMsg ) {
        console.error('Failed to get supervisions from database: ' + errorMsg);
        console.error('Trying to execute the following SQL:');
        console.error(sql);
        alert("Program error Unable to look up supervisions.");
    }
    odkData.arbitraryQuery('SUPERVISIONHC', sql, null, null, null, successFn, failureFn);
}

function populateView() {
    // button for new supervision
    var newSup = $('#newSup')
    newSup.on("click", function() {
        openFormNewSup();
    })
    
    var ul = $('#li');
    // list
    $.each(supervisionList, function() {
        var that = this; 
        var id = this.rowId.slice(10)
        
        // set text to display
        var displayText = setDisplayText(that);
        
        // list
        ul.append($("<li />").append($("<button />").attr('id',id).attr('class',"btnSup",).append(displayText)));
        
        // Buttons
        var btn = ul.find('#' + id);
        btn.on("click", function() {
            console.log("Click");
            openForm(that);
        }) 
    });       

}

function setDisplayText(supervision) {
    var displayText, visitdate;

    visitdate = formatDate(supervision.VISITDATE);
    displayText = "Centro: " + supervision.HCAREANOME + "<br />" + 
        "Data da visita: " + visitdate + "<br />" +
        "Nome: " + supervision.ASSISTANT;
    return displayText
}

function formatDate(adate) {
    var d = adate.slice(2, adate.search("M")-1);
    var m = adate.slice(adate.search("M")+2, adate.search("Y")-1);
    var y = adate.slice(adate.search("Y")+2);
    var date = d + "/" + m + "/" + y;
    return date;
}

function openFormNewSup() {
    console.log("Preparing form for new supervision");

    var defaults = {};
    defaults['HCAREA'] = hcarea;
    defaults['HCAREANOME'] = hcareaNome;
    defaults['REG'] = reg;
    defaults['REGNOME'] = regNome;
    defaults['VISITDATE'] = toAdate(date);
 
    console.log("Opening form with: ", defaults); 
    odkTables.addRowWithSurvey(
        null,
        'SUPERVISIONHC',
        'SUPERVISIONHC',
        null,
        defaults);
}

function openForm(supervision) {
    console.log("openfor",supervision);
    var rowId = supervision.rowId;
    odkTables.editRowWithSurvey(
        null,
        'SUPERVISIONHC',
        rowId,
        'SUPERVISIONHC',
        null,);
}

function toAdate(date) {
    var jsDate = new Date(date);
    return "D:" + jsDate.getDate() + ",M:" + (Number(jsDate.getMonth()) + 1) + ",Y:" + jsDate.getFullYear();
}