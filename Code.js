/**
 * selects candidates to reach out this week, update the original spreadsheet, and send the name of the candidates to the specified email
 */
function selectReachOutCandidates() {
  // ID of the spreadsheet
  const SPREADSHEET_ID = ScriptProperties.getProperty("SPREADSHEET_ID");
  // email of the person who wants to receive the weekly selection
  const EMAIL = ScriptProperties.getProperty("EMAIL");
  // timezone database name https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  // e.g. America/Toronto
  const TIMEZONE = ScriptProperties.getProperty("TIMEZONE");
  // maximum number of contacts to be selected in a week for reaching out
  const MAX_CONTACT_PER_WEEK = ScriptProperties.getProperty("MAX_CONTACT_PER_WEEK");
  // data range in the spreadsheet that contains contact information. It should have four columns:
  // contact Name | Category | Last Contacted | Last Selected
  // e.g. John Doe | B | 2022-09-08 | 2022-11-02 : John Doe is in category B. He was last contacted on 2022-09-08. Simple Relationship Manager selected him on 2022-11-02
  // dates should be in yyyy-MM-dd format
  // category should be a valid cateogory defined in CATEGORIES_SHEET_RANGE
  const NAMES_SHEET_RANGE = 'Names!A2:D1000';
  // data range in the spreadsheet that contains categories information. It should have three columns:
  // category Name | Description | Frequency (in weeks)
  // e.g. B | College friends | 6 : Category B represents college friends that need to be contacted every 6 weeks
  // frequency should be an integer >0
  const CATEGORIES_SHEET_RANGE = 'Categories!A2:C5';
  // amount of milliseconds in one week
  const WEEK_MILLIS = 7 * 24 * 60 * 60 * 1000;
  // subject of the weekly email
  const EMAIL_SUBJECT = "Weekly Contacts";
  // the beginning part of the email body which will follow with the name of the contacts
  const EMAIL_BODY_PREPEND = "Reach out to your contacts this week:\n";

  try {
    // seading the contents of the contact information sheet
    // using Sheets.Spreadsheets.Values.get trims trailing blank rows and columns
    // filtering data that have non-empty first two columns (name and category)
    // note: Google asks for permission to access Drive because of this line
    const namesSheetContents = Sheets.Spreadsheets.Values.get(SPREADSHEET_ID, NAMES_SHEET_RANGE).values
      .filter(value => value.length >= 2)
      .filter(value => value[0] != '' && value[1] !='');
    
    // reading the contents of the categories sheet
    // using Sheets.Spreadsheets.Values.get trims trailing blank rows and columns
    // filtering data that have non-empty first and third columns (name and frequency)
    // note: Google asks for permission to access Drive because of this line
    const categoriesSheetContents = Sheets.Spreadsheets.Values.get(SPREADSHEET_ID, CATEGORIES_SHEET_RANGE).values
      .filter(value => value.length == 3)
      .filter(value => value[0] != '' && value[2] !='');
    
    // creating a map between category and frequency. e.g {'A'=3, 'B'=8}
    const categoryToWeeksMap = {};
    categoriesSheetContents.forEach(value => categoryToWeeksMap[value[0]] = +value[2]);

    // constant string to be appended to dates to create yyyy-MM-ddThh:mm:ss.SSSTZD
    const timeAndTimeZoneString = 'T00:00:00.000' + getTimezoneOffset(TIMEZONE);
    // finding the contacts that are due to reach out
    // select the contacts that don't have "Last Reached Out" value or the time from the last reached out until now is more than the specified frequency
    const contactDues = namesSheetContents.filter(value => value.length == 2 || value[2] == '' || new Date(value[2]+timeAndTimeZoneString).getTime() + +categoryToWeeksMap[value[1]]*WEEK_MILLIS < new Date().getTime());
    
    // if there is no one to contact this week, do nothing.
    if(contactDues.length == 0) {
      Logger.log("No one to contact this week");
      return;
    }
      
    // randomize the contacts that are due
    shuffleArray(contactDues);
    // select the top MAC_CONTACT_PER_WEEK from the shuffled array
    const selectedContactDues = contactDues.slice(0,Math.min(MAX_CONTACT_PER_WEEK,contactDues.length)).reduce(function(arr,obj) {
      // only pick name from the row
      arr.push(obj[0]);
      return arr;
    },[]);

    // updating the contents 
    namesSheetContents.filter(value => selectedContactDues.includes(value[0])).forEach(value => {
      // add extra blank cell if neede
      if (value.length == 2)
        value.push('');
      
      // add extra blank cell if neede
      if (value.length == 3)
        value.push('');
      
      value[3] = Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd');
    })

    // updating the spreadsheet with the "Last Selected On" field
    Sheets.Spreadsheets.Values.update({
      range: NAMES_SHEET_RANGE,
      values : namesSheetContents
      }, SPREADSHEET_ID, NAMES_SHEET_RANGE, {valueInputOption: 'USER_ENTERED'});

    // generating a simple email body
    var emailBody = selectedContactDues.reduce(function(str,obj) {
      return str + obj + "\n";
    },EMAIL_BODY_PREPEND);

    // sending email with the names of the individuals selected to contact this week
    // note: Google asks for permission to send email on your behalf because of this line 
    MailApp.sendEmail(EMAIL, EMAIL_SUBJECT, emailBody);

  } catch (err) {
    Logger.log('Failed with error %s', err.message);
  }
}

/**
 * shuffles the array
 */
function shuffleArray(array) {
  var i, j, temp;
  for (i = array.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

/**
 * converts a timezone DB name (e.g. America/Toronto) to UTC offset (e.g. -05:00)
 */
function getTimezoneOffset(timezone) {
  const date = new Date();
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  const offsetInMinutes = (tzDate.getTime() - utcDate.getTime()) / 6e4;

  const offsetHours = Math.abs(Math.floor(offsetInMinutes/60));
  const offsetHoursFormatted = (offsetInMinutes >= 0 ? '+' : '-') + (offsetHours < 10 ? '0' + offsetHours : offsetHours);
  const offsetMinutes = (offsetInMinutes % 60);
  const offseMinutesFormatted =  offsetMinutes < 10 ? '0' + offsetMinutes : offsetMinutes;

  return offsetHoursFormatted + ":" + offseMinutesFormatted;
}