# Simple Relationship Manager
Simple Relationship Manager is a simple yet powerful tool that can help you keep in touch with your contacts and maintain strong relationships with the important people in your life. Whether you're a busy professional, a small business owner, or simply someone who wants to stay connected with their friends and family, Simple Relationship Manager can help you stay organized and on top of your communication. It only requires you to have a Google Account. So why not give it a try and see how it can help you stay connected and build stronger relationships?

## Installation

### Create a datastore
*Make a Copy* of [this sheet](https://docs.google.com/spreadsheets/d/1GhOPluRsEyXQIOCWiDaFfHna99PAWi-8fgBofeIBPiM/edit) in your Google Drive. 

We are going to use a Google Sheet for our datastore. It is simple and doesn't need any complicated database setup. 

**Write down the newly created sheet ID. You'll need to set up the script**. The Sheet ID can be found in the URL. For example, if the URL is `https://docs.google.com/spreadsheets/d/1GhOPluRsEyXQIOCWiDaFfHna99PAWi-8fgBofeIBPiM/edit`, then the sheet ID is `1GhOPluRsEyXQIOCWiDaFfHna99PAWi-8fgBofeIBPiM`.

### Add your categories & contacts

Define your categories based on your preference. There is no limitation on the number of categories that you want to define. You can add or remove categories at any time. After categories, you can add your contacts and place them in the right category.

The Google Sheet has two sheets:
* `Categories`: Holds categories information
    - `Category Name`: Name of the category. Since it will be used as a foreign key in the `Names` sheet, it is best to have something simple. so you don't need to change them. Something like `A`, `B`, `C` etc., should be good.
    - `Description`: Description of a category. This is just for you to read and understand. The script is not going to use it.
    - `Frequency (In Weeks)`: The frequency that a category should be contacted. *Week* is a good compromise between *Day*, which is too short, and *Month` which is too long. The sheet has validation on this column to make sure only positive numbers are added.
* `Names`: Holds metadata of your contacts. It has the following columns:
    - `Name`: Name of the contact. The Google Sheet has data validation in place to prevent duplicate names.
    - `Category`: References a category in the `Categories` sheet that this contact belongs to. The sheet gives you a drop-down with items available from the `Category Name` column of the `Categories` sheet.
    - `Last Contacted On`: Indicates when was the last time that you contacted this person. **This is the only column that you have to maintain manually after the installation.** If this column is not updated, the contact *may* be selected again in the next script run.
    - `Last Selected On`: Indicates when was the last time that the script selected this contact. The data will be updated by the script. That column is protected from accidental editing.

### Create a Google App Scripts project

Go to [Google Apps Script](https://script.google.com/home/start) and **create a new project**. Name the project, whatever is easy for you to remember, like `Simple Relationship Manager`. 

### Update Code.gs
`Code.gs` is the main script file that does the magic of selecting the contacts and informing you. There are multiple ways to make it work.

#### Option 1: Use the deployed library (recommended)
The code in this repository has already been deployed as a library and everyone can use it. If you don't want to go through the hassle of maintaining code, you can add the library with `1ar6-SoEEx2qtkjq0Yndgttur4iAtDDI0Do3qQwHjOefsZvJr7Y9d9h_u` as Script ID to your project. Choose the library version when prompted. The current version is `1`. You should see that `SimpleRelationshipManager` is added as a library in the Google Apps Script editor.

In the default `myFunction()` function in `Code.gs`, add the following line:

```
SimpleRelationshipManager.selectReachOutCandidates('[Your Google Sheet ID from the first step]', '[Your email]', '[Your timezone]', [Max number of contacts per week]);
```

Replace the placeholders with your preference. It should look something like this:

```javascript
SimpleRelationshipManager.selectReachOutCandidates('1GhOPluRsEyXQIOCWiDaFfHna99PAWi-8fgBofeIBPiM', 'your-email@gmail.com', 'America/Toronto', 5);
```
#### Option 2: Embed the library in your code
If you don't want the default values in the code or you want to test other things, you can copy/paste the content of [Code.gs](https://github.com/pooyas/simple-relationship-manager/blob/main/Code.js) in this repository in your project's `Code.gs` file. 

Since `Code.gs` in this repository is meant to be deployed as a library, you need an extra function to call it. On top of your Code.gs file, add the following:

```
selectReachOutCandidates('[Your Google Sheet ID from the first step]', '[Your email]', '[Your timezone]', [Max number of contacts per week]);
```
Replace the placeholders with your preference. It should look something like this:

```javascript
selectReachOutCandidates('1GhOPluRsEyXQIOCWiDaFfHna99PAWi-8fgBofeIBPiM', 'your-email@gmail.com', 'America/Toronto', 5);
```
### Add required services
The script uses Gmail API and Google Spreadsheet API. Before running the script, these services should be added to your project. To add the services, in the editor section of the project, add `Gmail API` (V1) and `Google Spreadsheet API` (V4).

If you used the recommended option in the previous section to use Simple Relationship Manager as a library, you only need to add Google Spreadsheet API (V4), otherwise, both Gmail API and Google Spreadsheet API are required.

### Test run
You should do a test run first to make sure everything is set up correctly, and all of the accesses are granted. 

Make sure your main function (e.g. `myFunction`)is selected on the top banner new the Run and Debug buttons. Hit `Run`. 

You may get a concerning warning from Google. If you read the warning carefully, it says that **You**, as a developer, need to verify your app with Google first. You can ignore the warning and continue to allow the requested permissions.

If everything works fine, you should get an email with your selected candidates. Check your Google Sheet and confirm that `Last Selected On` column for the selected candidates has today's date stamp. 

### Scheduled run
The last step is to run the script in a defined cadence, for example, weekly. In the Google Apps Script project, go to `Triggers` and add a `Time-driven` trigger. Depending on your preference, you can select any type of time-based triggers, but since the script works in *weeks*, it makes sense to schedule it weekly. 

Select the time that is suitable for you and complete the trigger setup.

### Congratulations
Your Simple Relationship Manager is set up and you'll get notified automatically every time the script runs (e.g. weekly). 

**Just remember, if you contacted the candidates, update the `Last Contacted On` column in the spreadsheet.**

## Acknowledgement
This work is inspired by this [article](https://jakobgreenfeld.com/stay-in-touch) from Jakob Greenfeld. His approach is using Airtable. If you are interested, you can check his work.