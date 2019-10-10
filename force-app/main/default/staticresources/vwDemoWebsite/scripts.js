window.addEventListener("load", function() {

    // SWITCH LOCAL / WEB MODE -> IF LOCAL MODE SET TO true, SKIP ALL CALLS TO SALESFORCE
    let LOCAL_MODE = true;
    console.log('location.hostname: ' + location.hostname);
    if (location.hostname.includes("visualforce.com")) LOCAL_MODE = false;

    let access_token = null;
    let instance_url = null;
    let org_id = null;

    let td_date = "22.02.2019 14:00";

    const ACCESS_TOKEN = "accessToken";
    const REFRESH_TOKEN = "refreshToken";
    const INSTANCE_URL = "instanceUrl";

    if(!LOCAL_MODE){
    //check access token and if it is still valid
      //get token from cookie
      let token = getCookie(ACCESS_TOKEN);
      if(token){
        console.log("token detected");
        access_token = token;
        org_id = token.substring(0,15);
        
        console.log("org id set to ", org_id);
        instance_url = getCookie(INSTANCE_URL);
        /*console.log("check token from cookie - token:",token);
        //check if token is still valid
        if(isTokenValid(token)){
          //set access token
          access_token = token;
        } else {
          //delete cookie just in case
          document.cookie = ACCESS_TOKEN+"=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          console.log("cookie deleted");
          getAccessToken();
        }*/
      } else {
        //check if we have the parameters in the URL
        if(window.location.hash) {
          const response = getUrlParams(window.location.hash);
          console.log("auth response = ", response);
          access_token = response.access_token;
          org_id = access_token.substring(0,15);
          
          console.log("org id set to ", org_id);
          instance_url = response.instance_url;
          console.log("access_token: ",access_token);
          //write access token to cookie
          setCookie(ACCESS_TOKEN,access_token,1);
          setCookie(INSTANCE_URL,response.instance_url,1);
        } else {
          //launch log in flow and write cookie
          getAccessToken();
        }

      }
    }

//populate calendar
let now = new Date();
document.getElementById("dateHeading").innerHTML = getMonth(now.getMonth()) + " " + now.getFullYear();
  renderCalendar(now);

//do sitework
var navbar = document.getElementById("continue-one");
var navbarHost = document.getElementById("step1-expander");
// Get the offset position of the navbar
sticky = navbarHost.offsetTop + navbarHost.offsetHeight;
console.log("offset :",sticky);
var powerlayer = document.getElementById("powerlayer");
if (powerlayer.scrollTop <= sticky+navbar.offsetHeight) {
    navbar.classList.add("form-section-continue-row--sticky")
  } else {
    navbar.classList.remove("form-section-continue-row--sticky");
  }
powerlayer.addEventListener("scroll",function() {
    if (powerlayer.scrollTop + powerlayer.offsetHeight <= sticky+navbar.offsetHeight) {
      navbar.classList.add("form-section-continue-row--sticky")
    } else {
      navbar.classList.remove("form-section-continue-row--sticky");
    }
  });

var step1button = document.getElementById("step1button");
step1button.addEventListener("click",function (){
    powerlayer.scrollTo(0,0);
    hide("step1");
    show("step2");
});

function show(classname){
    var s2e = document.getElementsByClassName(classname);
    for (const e of s2e) {
        e.classList.remove("hidden");
    }

}

function hide(classname){
        var s2e = document.getElementsByClassName(classname);
        for (const e of s2e) {
            e.classList.add("hidden");
        }

    }

function remove(classname){
    var s2e = document.getElementsByClassName(classname);
    let i = s2e.length;
    while (i--) {
        s2e[i].parentNode.removeChild(s2e[i]);
    }
}

var motorClickAreas = document.getElementsByClassName("radio-native")

for (const a of motorClickAreas) {
    a.addEventListener("click", (e) => {
        //remove previous
        for (const b of motorClickAreas) {
            b.parentNode.parentNode.parentNode.classList.remove("expander--open")
            b.parentNode.parentNode.parentNode.setAttribute("style","")
        }
        const expander = e.target.parentNode.parentNode.parentNode
        expander.classList.add("expander--open")
        expander.setAttribute("style", "margin-bottom:" + e.target.parentNode.parentNode.nextElementSibling.offsetHeight + "px")
        sticky = expander.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.offsetTop + expander.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.offsetHeight;
        if (powerlayer.scrollTop <= sticky+navbar.offsetHeight) {
            navbar.classList.add("form-section-continue-row--sticky")
          } else {
            navbar.classList.remove("form-section-continue-row--sticky");
          }
    })
}

var tdcClickAreas = document.getElementsByClassName("radio-tdc")

for (const a of tdcClickAreas) {
    a.addEventListener("click", (e) => {
        //remove class if existing
        for (const b of tdcClickAreas) {
            b.parentNode.parentNode.classList.remove("selected")
        }
        e.target.parentNode.parentNode.classList.add("selected")
        document.getElementById("step5").disabled = false;
        document.getElementById("step5").classList.remove("button--disabled");
    })
}

document.getElementById("step4button").addEventListener("click",() => {
    show("step4")
    remove("step4remove")
})
//Step 5
document.getElementById("step5").addEventListener("click",() => {
    show("step6")
    remove("step5remove")
    navbar = document.getElementById("continue-three");
    navbarHost = document.getElementById("form-section-3");
    sticky = navbarHost.offsetTop + navbarHost.offsetHeight - 84;
    console.log("offset :",sticky);
    if (powerlayer.scrollTop <= sticky+navbar.offsetHeight) {
        navbar.classList.add("form-section-continue-row--sticky")
    } else {
        navbar.classList.remove("form-section-continue-row--sticky");
    }
})

//Step 7
document.getElementById("step7button").addEventListener("click",() => {
    remove("step7remove")
    show("step7")

    if(!LOCAL_MODE){
      // post event to salesforce
      const http = new XMLHttpRequest();
      const url= instance_url + "/services/data/v45.0/sobjects/general_message__e/";
      const params = JSON.stringify({
          "main_icon__c" : "standard:contact",
          "headline__c" : "Contact Activity",
          "category_1__c" : "Contact",
          "category_2__c" : "Context:",
          "icon_1__c" : "standard:contact",
          "message_1__c" : "logged in via VW ID",
          "message_2__c" : "Test Drive Request Form on https://www.volkswagen.de/app/formulare/vw-de/probefahrt",
          "record_id_1__c" : '0031t00000AEpK0AAL',
          "record_name_1__c" : 'John Fisher',
      })
      http.open("POST", url, true);
      http.setRequestHeader('Authorization', 'Bearer ' + access_token);
      http.setRequestHeader('Content-Type', 'application/json');
      http.send(params);
      http.onreadystatechange=(e)=>{
          console.log("(create login message on server) http.responseText",http.responseText)
      }
    }


    // show spinner to emulate log-in
    setTimeout(() => {
        remove("step8remove")
        show("step8")

        // prefill form fields
        let salutation = document.getElementsByName("salutation")
        for(const field of salutation){
            field.value == "Mr" ? field.checked = true : null
        }
        document.getElementsByName("firstname")[0].value = "John"
        document.getElementsByName("lastname")[0].value = "Fisher"
        document.getElementsByName("email")[0].value = "John.fisher-demo@gmail.com"
        document.getElementsByName("phone")[0].value = "+49 172 548 4773"
        document.getElementsByName("street")[0].value = "Zachertstr. 15"
        document.getElementsByName("zip")[0].value = "10315"
        document.getElementsByName("city")[0].value = "Berlin"
        document.getElementsByName("country")[0].value = "Germany"
        document.getElementsByName("email-optin")[0].checked = true
        document.getElementsByName("app-optin")[0].checked = true
        document.getElementsByName("ad-optin")[0].checked = true
        document.getElementById("hiddenmail").value ="John.fisher-demo@gmail.com"
    }, 1000);

})

//Step 9
document.getElementById("step9button").addEventListener("click",() => {
    hide("step9remove")
    show("step9")

    if(!LOCAL_MODE){
      //show dealer matching
      const http = new XMLHttpRequest();
      const url= instance_url + "/services/data/v45.0/sobjects/general_message__e/";
      const params = JSON.stringify({
          'main_icon__c' : 'standard:person_account',
          'headline__c' : 'Dealer Activity',
          'category_1__c' : 'Dealer',
          'category_2__c' : 'Strategy:',
          'category_3__c' : 'Context:',
          'icon_1__c' : 'standard:person_account',
          'message_1__c' : 'matched to test drive scheduling request',
          'message_2__c' : 'Zip code proximity match',
          'message_3__c' : 'Test Drive Request Form on https://www.volkswagen.de/app/formulare/vw-de/probefahrt',
          'record_id_1__c' : '0011t000002yesYAAQ',
          'record_name_1__c' : 'VW Berlin'
      })
      http.open("POST", url, true);
      http.setRequestHeader('Authorization', 'Bearer ' + access_token);
      http.setRequestHeader('Content-Type', 'application/json');
      http.send(params);
      http.onreadystatechange=(e)=>{
          console.log("(create login message on server) http.responseText",http.responseText)
      }
    }


    navbar = document.getElementById("continue-four");
    navbarHost = document.getElementById("form-section-4");
    sticky = navbarHost.offsetTop + navbarHost.offsetHeight - 84;
    console.log("offset :",sticky);
    if (powerlayer.scrollTop <= sticky+navbar.offsetHeight) {
        navbar.classList.add("form-section-continue-row--sticky")
    } else {
        navbar.classList.remove("form-section-continue-row--sticky");
    }
})

//add eventListener to change Dealer Button
document.getElementById("changeDealerButton").addEventListener("click",() => {
  hide("step9")
  show("dealerSelector")

  navbar = document.getElementById("dealerSelect");
  navbarHost = document.getElementById("dealerSelectorSection");
  sticky = navbarHost.offsetTop + navbarHost.offsetHeight - 84;
  console.log("offset :",sticky);

})

//add event listener to Dealer Select Button
document.getElementById("dealerSelectButton").addEventListener("click",() => {
  hide("dealerSelector")
  show("step9")

  navbar = document.getElementById("continue-four");
  navbarHost = document.getElementById("form-section-4");
  sticky = navbarHost.offsetTop + navbarHost.offsetHeight - 84;
  console.log("offset :",sticky);
  if (powerlayer.scrollTop <= sticky+navbar.offsetHeight) {
      navbar.classList.add("form-section-continue-row--sticky")
  } else {
      navbar.classList.remove("form-section-continue-row--sticky");
  }
})


//add event listener to calendar days
const days = document.getElementsByClassName("calendar-day-copy--selectable")
for(const day of days){

        day.addEventListener("click", (e) => {

                //get clicked date
                var datestring = document.getElementsByClassName("calendar-month-text")[0].innerHTML.split(" ");
                datestring[1] = datestring[1].replace(/\s/g, "");
                const clickDate = new Date(datestring[0] + " " + e.target.innerHTML + ", " + datestring[datestring.length-1]);

                if(!LOCAL_MODE){
                  //show dealer time slot request
                  const http = new XMLHttpRequest();
                  const url= instance_url + "/services/data/v45.0/sobjects/general_message__e/";
                  const params = JSON.stringify({
                      'main_icon__c' : 'standard:event',
                      'headline__c' : 'Scheduler Request',
                      'category_1__c' : 'Dealer',
                      'category_2__c' : 'Context:',
                      'icon_1__c' : 'standard:person_account',
                      'message_1__c' : '- schedule request for ' + clickDate.getDate() + '.' + (clickDate.getMonth()+1) + '.' + clickDate.getFullYear() + ' -  return free slots for activity \"test drive\"',
                      'message_2__c' : 'Test Drive Request Form on https://www.volkswagen.de/app/formulare/vw-de/probefahrt',
                      'record_id_1__c' : '0011t000002yesYAAQ',
                      'record_name_1__c' : 'VW Berlin'
                  })
                  http.open("POST", url, true);
                  http.setRequestHeader('Authorization', 'Bearer ' + access_token);
                  http.setRequestHeader('Content-Type', 'application/json');
                  http.send(params);
                  http.onreadystatechange=(e)=>{
                      console.log("(create login message on server) http.responseText",http.responseText)
                  }
                }

                //split date / time string into date and time to reuse time later
                td_date_elements = td_date.split(" ");
                td_date = clickDate.getDate() + '.' + (clickDate.getMonth()+1) + '.' + clickDate.getFullYear() + ' ' + td_date_elements[1];
                console.log("td_date = ", td_date)



            for(let d of document.getElementsByClassName("calendar-day-copy--selected")){
                    d.classList.remove("calendar-day-copy--selected")
                    d.parentNode.classList.remove("calendar-day-inner--selected")
                    d.classList.add("calendar-day-copy--selectable")
                    d.parentNode.classList.add("calendar-day-inner--selectable")
            }
            e.target.parentNode.classList.add("calendar-day-inner--selected")
            e.target.parentNode.classList.remove("calendar-day-inner--selectable")
            e.target.classList.add("calendar-day-copy--selected")
            e.target.classList.remove("calendar-day-copy--selectable")
            if(document.getElementsByClassName("appointment-selector-date-time-step__headline--disabled").length > 0){
                document.getElementsByClassName("appointment-selector-date-time-step__headline--disabled")[0].classList.remove("appointment-selector-date-time-step__headline--disabled")
            }
            if(document.getElementsByClassName("appointment-selector-time--disabled").length > 0){
                document.getElementsByClassName("appointment-selector-time--disabled")[0].classList.remove("appointment-selector-time--disabled")
                hide("selectHide")
                show("selectShow")
            }
            show("appointment-selector-time--date-specific")
            //parse weekday
            let weekday = getWeekday(clickDate.getDay());
            let month = getMonth(clickDate.getMonth());
            document.getElementsByClassName("appointment-selector-time--date-specific")[0].innerHTML = "<b>" + weekday + "</b> " + clickDate.getDate() + " " + month + " " + clickDate.getFullYear();
            document.getElementById("time-selector").disabled = false
        })


}

document.getElementById("select_td_time").addEventListener('change', (e) => {
    console.log("e.target.value",e.target.value)
    //split date / time string into date and time to reuse date later
    td_date_elements = td_date.split(" ");
    td_date = td_date_elements[0] + ' ' + e.target.value;

})

function getWeekday(day){
    var weekday = "";
    switch(day) {
        case 0:
            weekday = "Sunday";
          break;
          case 1:
          weekday = "Monday";
        break;
        case 2:
            weekday = "Tuesday";
          break;
          case 3:
            weekday = "Wednesday";
          break;
          case 4:
            weekday = "Thursday";
          break;
          case 5:
            weekday = "Friday";
          break;
          case 6:
            weekday = "Saturday";
          break;
        default:
            weekday = "Monday";
      };
      return weekday;
}

function getMonth(number){
    var month = ""
    switch(number) {
        case 0:
            month = "January";
          break;
          case 1:
          month = "February";
        break;
        case 2:
            month = "March";
          break;
          case 3:
            month = "April";
          break;
          case 4:
            month = "May";
          break;
          case 5:
            month = "June";
          break;
          case 6:
            month = "July";
          break;
          case 7:
            month = "August";
          break;
          case 8:
            month = "September";
          break;
          case 9:
            month = "October";
          break;
          case 10:
            month = "November";
          break;
          case 11:
            month = "December";
          break;
          default:
          month = "January";
    };
    return month;
}

function setCookie(parameter, value, daysvalid) {
  console.log("step in setCookie");
  var d = new Date();
  d.setTime(d.getTime() + (daysvalid*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = parameter + "=" + value + ";" + expires + ";path=/";
  console.log("cookie set: ",parameter + "=" + value + ";" + expires + ";path=/")
  return true;
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  console.log("step in getCookie");
  console.log("cookie = ", decodedCookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  console.log("exit getCookie with false")
  return false;
}

function isTokenValid(token){
//do a bogus https request
    const http = new XMLHttpRequest();
    const url='https://login.salesforce.com/services/oauth2/userinfo';
    http.open("GET", url, true);
    http.setRequestHeader('Authorization', "Bearer "+token);
    http.setRequestHeader('Content-Type', 'application/json');
    http.send();
    http.onreadystatechange=(e)=>{
        if(http.responseText){
        const response = JSON.parse(http.responseText)
        console.log("Request sent\nresponse:",response);
        if(http.status === 200){
          return true;
        } else {
          console.log("status is ",http.status);
          return false;
        }
      } else {
        console.log("no response");
        return false
      }
    }
  }
function getAccessToken(){
  const uri = "https://login.salesforce.com/services/oauth2/authorize"
              +"?response_type=token"
              //+"&scope=full%20refresh_token"
              +"&scope=full"
              +"&client_id=3MVG9fTLmJ60pJ5IemOI7_JDGregOahfCNzGj9.nYV6nCqSF96_ZGFDer9hnLUJMfBQPxHwuYNOrYHyAPmrXw"
              +"&redirect_uri=https%3A%2F%2Fohana.cab%2Fwe%2Ftestdrive";

  window.location.replace(uri);
}
function getUrlParams(search) {
  let hashes = search.slice(search.indexOf('#') + 1).split('&')
  let params = {}
  hashes.map(hash => {
      let [key, val] = hash.split('=')
      params[key] = decodeURIComponent(val)
  })

  return params
}

function renderCalendar(now) {
  //get injection point
  const dayContainer = document.getElementById("dayContainer");

  //get starting day
  const firstDayOfMonth = new Date(now.getFullYear(),now.getMonth(),1);
  const lastDayOfMonth = new Date(now.getFullYear(),now.getMonth()+1,0);
  console.log("first day of month = ", firstDayOfMonth);
  console.log("weekday = ", firstDayOfMonth.getDay());
  const startDayOffset = firstDayOfMonth.getDay();

  //out of range day
  const cell = `<div class="calendar-day calendar-child">
                <div class="calendar-day-inner calendar-day-inner--outOfRange">
                    <p class="copy copy--1 calendar-day-copy calendar-day-copy--outOfRange">`;
  const cellToday = `<div class="calendar-day calendar-child">
  <div class="calendar-day-inner calendar-day-inner--selectable calendar-day-inner--today">
      <p class="copy copy--1 copy--bold calendar-day-copy calendar-day-copy--selectable">`;
  const cellSelectable = `<div class="calendar-day calendar-child">
  <div class="calendar-day-inner calendar-day-inner--selectable">
      <p class="copy copy--1 copy--bold calendar-day-copy calendar-day-copy--selectable">`;
  const cellSunday = `<div class="calendar-day calendar-child">
  <div class="calendar-day-inner calendar-day-inner--disabled">
      <p class="copy copy--1 calendar-day-copy calendar-day-copy--disabled">`;
  const cellClosing = "</p></div></div>";

  //build calendar days
  let dayString = "";
  let preDate = new Date();
  let postDate = new Date(now.getFullYear(),now.getMonth(),1);
  preDate.setDate(firstDayOfMonth.getDate()-(startDayOffset));
  for (i = 1; i < 36; i++){
    if(i < 7 && i < startDayOffset){
      preDate.setDate(preDate.getDate()+1);
      dayString+=cell+(
        preDate.getDate()
        )+cellClosing;
    } else {
      if((i-startDayOffset+1) < now.getDate()){
        dayString+=cell+(i-startDayOffset+1)+cellClosing;
      }
      //today?
      if((i-startDayOffset+1) == now.getDate()){
        dayString+=cellToday+(i-startDayOffset+1)+cellClosing;
      }
      //selectable day after today?
      if((i-startDayOffset+1) > now.getDate() && (i-startDayOffset+1) <= lastDayOfMonth.getDate()){
        //Sunday?
        if(i%7 == 0){
          dayString+=cellSunday+(i-startDayOffset+1)+cellClosing;
        } else {
          dayString+=cellSelectable+(i-startDayOffset+1)+cellClosing;
        }

      }
      if((i-startDayOffset+1) > lastDayOfMonth.getDate()) {
        //if it is next month already
        //Sunday?
        if(i%7 == 0){
          dayString+=cellSunday+(postDate.getDate())+cellClosing;
        } else {
          dayString+=cellSelectable+(postDate.getDate())+cellClosing;
        }
        postDate.setDate(postDate.getDate()+1);
      }

    }
  }
  dayContainer.innerHTML = dayContainer.innerHTML + dayString;
  /*

  //current day
  22</p>
      </div>
  </div>

  //selectable day
  23</p>
      </div>
  </div>

  //Sunday
  26</p>
      </div>
  </div>
  */

}
document.getElementById("submit_button").addEventListener("click",function() {createLead()},0);

function createLead(){

 if(!LOCAL_MODE){
  //define salutation
  let salutation_value = "Mr"
  let salutation_field = document.getElementsByName("salutation")
        for(const field of salutation_field){
          field.checked = true ? salutation_value = field.value : null;
        }
  //define td_date_formatted
  let td_date_formatted = td_date.substr(6,4) + '-' + td_date.substr(3,2) + '-' + td_date.substr(0,2) + 'T' + td_date.substr(11,5) + ':00';
  //2019-02-22T14:00:00
  //22.02.2019 14:00
  //0123456789012345

  //createLead
  const http = new XMLHttpRequest();
  const url= instance_url + "/services/data/v45.0/sobjects/Lead/";
  const params = JSON.stringify({
      'Salutation' : salutation_value,
      'FirstName' : document.getElementsByName("firstname")[0].value,
      'LastName' : document.getElementsByName("lastname")[0].value,
      'Email' : document.getElementsByName("email")[0].value,
      'Company' : document.getElementsByName("lastname")[0].value + ' household',
      'Phone' : document.getElementsByName("phone")[0].value,
      'Street' : document.getElementsByName("street")[0].value,
      'PostalCode' : document.getElementsByName("zip")[0].value,
      'City' : document.getElementsByName("city")[0].value,
      'LeadSource' : 'Website',
      'td_date_requested__c' : td_date_formatted,
      'test_drive__c' : true
  })
  console.log("json data = ", params);
  http.open("POST", url, true);
  http.setRequestHeader('Authorization', 'Bearer ' + access_token);
  http.setRequestHeader('Content-Type', 'application/json');
  http.send(params);
  http.onreadystatechange=(e)=>{
      console.log("lead created - response: ",http.responseText)
      //window.location.href = "thankyou.html";
  }
}
}

})






