$( function() { //make calendar with jQuery UI
    var dateFormat = "yy-mm-dd",
      from = $( "#from" )
        .datepicker({
          defaultDate: "+1w",
          changeMonth: true,
          numberOfMonths: 1,
          dateFormat: dateFormat,
          maxDate: '0'
        })
        .on( "change", function() {
          to.datepicker( "option", "minDate", getDate( this ) );
        }),
      to = $( "#to" ).datepicker({
        defaultDate: "+1w",
        changeMonth: true,
        numberOfMonths: 1,
        dateFormat: dateFormat,
        maxDate: '0'
      })
      .on( "change", function() {
        from.datepicker( "option", "maxDate", getDate( this ) );
      });
 
    function getDate( element ) {
      var date;
      try {
        date = $.datepicker.parseDate( dateFormat, element.value );
      } catch( error ) {
        date = null;
      }
 
      return date;
    }
  } );

function slider(min, max, mediana) { //make range sliderw jQuery UI
    $( "#slider-range" ).slider({
      range: true,
      min: min,
      max: max,
      values: [ mediana-0.1, mediana+0.1 ], //set start value near mediana
      step: 0.01,
      slide: function( event, ui ) {
        $( "#amount" ).val( "" + ui.values[ 0 ] + " - " + ui.values[ 1 ] + " [zł]" );
      }
    });
    $( "#amount" ).val( "" + $( "#slider-range" ).slider( "values", 0 ) +
      " - " + $( "#slider-range" ).slider( "values", 1 ) + " [zł]" );
  }

var item;
var min;
var max;
var mediana;
var tableBody = $(".table-body");
var properties = $(".properties");
var minRange;
var maxRange;


function getDates(){ //get dates range
  startDate = $("#from")[0].value;
  endDate = $("#to")[0].value;
  return [startDate, endDate]
}

function checkDisplayValue(){ //check display value to show or hide rows with filtr
  for(i=0; i<item.length; i++){
    if(item[i].display === "no"){
      $( "td:contains('"+item[i].cena+"')" ).parent().addClass("no-display");
    }
    else{
      $( "td:contains('"+item[i].cena+"')" ).parent().removeClass("no-display");
    }
  }
}

function filtrTable(){ //filtr table with the selected range
  minRange = parseFloat(Number($( "#slider-range" ).slider( "values", 0 )).toFixed(2));
  maxRange = parseFloat(Number($( "#slider-range" ).slider( "values", 1 )).toFixed(2));
  
    for(i=0; i<item.length; i++){
      if(item[i].cena < minRange || item[i].cena > maxRange){
        item[i].display = "no";
      }
      else{
        item[i].display = "yes" 
      }
    }
  checkDisplayValue();
}




function getGoldPrices(dateRange){

  $.ajax({ //get data with ajax
  dataType: "json",
  url: "http://api.nbp.pl/api/cenyzlota/"+getDates()[0]+"/"+getDates()[1]+"/?format=json",
  success: function(data, textStatus) {
    
    console.log("http://api.nbp.pl/api/cenyzlota/"+getDates()[0]+"/"+getDates()[1]+"/?format=json") //get data from server

    tableBody.empty(); //empty table
    properties.empty(); //empty table
    item = []; //emty array
    min = "";
    max = "";
    mediana = "";
    

    for(i=0; i<data.length; i++){ //put data from server to array
      item.push(data[i]);
    }

    for(i=0; i<item.length; i++){ //make html table
      tableBody.append("<tr id="+i+"><td>"+item[i].data+"</td><td>"+Number(item[i].cena).toFixed(2)+"</td></tr>");
    }
    
    
    for(i=0; i<item.length; i++){ //sort increase by price to get min,max,mediana
              item[i].cenaSortable = (""+Number(item[i].cena).toFixed(2)+"").replace(".", "")
            }  

    itemSorted = item.sort(function (a, b) { //sort increase by price to get min,max,mediana
      return parseInt(a.cenaSortable, 10) - parseInt(b.cenaSortable, 10);
    });
    

    min = parseInt(itemSorted[0].cenaSortable, 10) / 100;
    max = parseInt(itemSorted[itemSorted.length-1].cenaSortable, 10) /100;

    if(item.length % 2 === 0){ //calc mediana 
      medianaLow = parseInt(item[item.length/2 - 1].cenaSortable, 10);
      medianaHight = parseInt(item[item.length/2].cenaSortable, 10);
      mediana = parseFloat(Number(((medianaLow+medianaHight)/2) / 100).toFixed(2));
    }
    else{
      medianaMid = parseFloat(item[item.length/2 - 0.5].cenaSortable, 10);
      mediana = medianaMid / 100
    }
    
    properties.append("<p class=info>Cena minimalna: <span>"+min+" zł</span></p>");
    properties.append("<p class=info>Cena maksymalna: <span>"+max+" zł</span></p>");
    properties.append("<p class=info>Mediana cen: <span>"+mediana+" zł</span></p>");
    
    slider(min, max, mediana);
    
    $(".row.no-display").removeClass("no-display");
    
    
    if(textStatus !== "success")  alert(textStatus.responseText); // alert error from server if exist
  },
    
  error: function(textStatus) {
    alert(textStatus.responseText);
  }  
  });
}

function sortDate(direction) { //sort function by date
  
  for(i=0; i<item.length; i++){
    item[i].dataSortable = (item[i].data).replace(/-/g, "")
  }
  
  if(direction === "increase"){
    item.sort(function (a, b) {
    return parseInt(a.dataSortable, 10) - parseInt(b.dataSortable, 10);
    });
  }
  if(direction === "decrease"){
    item.sort(function (a, b) {
    return parseInt(b.dataSortable, 10) - parseInt(a.dataSortable, 10);
    });
  }
  
  tableBody.empty();
  
  for(i=0; i<item.length; i++){
      tableBody.append("<tr id="+i+"><td>"+item[i].data+"</td><td>"+Number(item[i].cena).toFixed(2)+"</td></tr>");
  }
  checkDisplayValue();
};

function sortPrice(direction) { //sort function by prices
  
  for(i=0; i<item.length; i++){
    item[i].cenaSortable = (""+item[i].cena+"").replace(".", "")
  }  
  
  if(direction === "increase"){
    item.sort(function (a, b) {
    return parseInt(a.cenaSortable, 10) - parseInt(b.cenaSortable, 10);
    });
  }
  if(direction === "decrease"){
    item.sort(function (a, b) {
    return parseInt(b.cenaSortable, 10) - parseInt(a.cenaSortable, 10);
    });
  }
  
  tableBody.empty();
  
  for(i=0; i<item.length; i++){
      tableBody.append("<tr id="+i+"><td>"+item[i].data+"</td><td>"+Number(item[i].cena).toFixed(2)+"</td></tr>");
  } 
  checkDisplayValue();
};



$("#download").on( "click", function() {
  getGoldPrices(getDates);
});

$("#date-increase").on( "click", function() {
  sortDate("increase")
});

$("#date-decrease").on( "click", function() {
  sortDate("decrease")
});


$("#price-increase").on( "click", function() {
  sortPrice("increase")
});

$("#price-decrease").on( "click", function() {
  sortDate("decrease")
});

$("#filtr").on( "click", function() {
  filtrTable();
});






