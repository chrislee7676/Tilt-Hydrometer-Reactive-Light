# Tilt Hydrometer Reactive Light
This script allows a Philips Hue lightbulb to change its color depending on the progress of a beer's fermentation using the data supplied by a Tilt Hydrometer.  The script utilizes both the Google Sheets API and the Philips Hue API to pull the latest fermentation data every 15 minutes from the spreadsheet the Tilt Hydrometer updates and, depending on the progress of the fermentation, will gradually change a Hue color light from red to green using user-defined beginning and ending specific gravity values.

## What You'll Need
- Tilt Hydrometer, actively logging
- Hue color lightbulb
- Hue Bridge

## Initial Configuration
After cloning or unzipping the repository, install Node.js using `$ sudo apt install nodejs`.  Install npm with `$ sudo apt install npm` and, after navigating into the folder where the repository was cloned or unzipped, run `$ sudo npm install` to download all necessary node modules.  Rename `template.env` to `.env`.  The six values in `.env` will have to be filled in with information specific to your project and environment, detailed below.

### HUE_BRIDGE_IP
This value should be filled in with the local IP address of the Hue Bridge controlling the light you plan on using the script with.  If you have the Hue app running on your phone, navigating to Settings -> Hue Bridges and then selecting your Hue Bridge will display the local IP address of your bridge.  Logging into your router's settings should also allow you to find the Bridge's IP address if you don't have access to the app.  If you plan on running the script on a device outside of your local network, this value should be filled in with your router's public IP address.  You will also need to forward port 80 to your Hue Bridge's local IP address if running externally.  Place this IP address after `HUE_BRIDGE_IP=`.

### HUE_API_KEY
To get an API key that will allow you to interface with your Hue Bridge, you need to navigate in a browser to your Hue Bridge's internal IP address with /debug/clip.html appended to the end of it (https://192.168.x.xxx/debug/clip.html).  This should bring up the Hue debugging utility.  Fill in the URL box with `/api` and the body box with `{"devicetype":"fermenterlight"}` and use the `POST` button to get your Hue API key.  You will need to press the physical button on the bridge before sending the POST request;  if it hasn't been pressed prior to the request, you'll receive an `Error 101`.  If everything works correctly, you'll receive a Success message with an alphanumeric string that makes up your key between quotation marks.  Put this string after `HUE_API_KEY=`.

### LIGHT_ID
Using the previously found Hue Bridge IP and Hue API key, navigate back to the Hue debugging utility and put `/api/YOUR_API_KEY_HERE/lights` into the URL box, substituting in your API key where appropriate.  After pressing the `GET` button, you'll receive a list of all lights currently connected to your Hue Bridge, starting from an ID of 1 onward.  The goal is to find the ID of the light that contains the name of the light you plan on using with your hydrometer in its object properties.  Looking at your lights in the Hue app will show their names.  Once you find the ID of the light that contains the name of the light you wish to use, place it after `LIGHT_ID=`.

### GREEN_HUE
Different Hue lights have different Hue values for the color green.  As of now, the only tested values are for the Hue Bloom and the standard A19 bulb. The values for these bulbs are as follows:

`Hue A19 Bulb = 20000`
`Hue Bloom = 25000`

Place the appropriate value for your setup after `GREEN_HUE=`.


### SPREADSHEET_ID
The URL you receive when you begin to log your Tilt Hydrometer data should come in the format of `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_IS_HERE/edit#gid=xxxxxxxxx`.  Copy the string located where `SPREADSHEET_ID_IS_HERE` is and place it after `SPREADSHEET_ID=`.


### GOOGLE_API_KEY
In order to allow one to pull data from a Google spreadsheet using their API, Google requires that you supply an API key with each request.  Go to the [Google API Dashboard](https://console.developers.google.com/apis/dashboard) and log in to your Google account.  Create a project using the link at the top and, when the project is selected, an `Enable APIS and Services` link will be visible.  After clicking it, search or find the Sheets API, click it, and press `Enable`.  After enabling, go back to the main dashboard page for your project.  Click the `Credentials` link in the dashboard menu. On the resulting page, click the `Create Credentials` button, followed by `API Key`.  The resulting value will be the key you place after `GOOGLE_API_KEY=`.

## Starting the Script
After your `.env` file is complete, run `$ node thl.js` to start the script.  The script will prompt you for both the starting specfic gravity and the anticipated ending specific gravity for your beer, entered in the format X.XXX, ie. 1.050.  The script will use these values to adjust the color ramp specific to your beer's fermentation over time.  The color hue begins at 0 (red) and gradually shifts towards the green hue set in the .env file.  The hue will never go below 0 or past the set green hue.  Every 15 minutes, the script will pull the latest data from the spreadsheet, set the light's hue, and display in the terminal the time of each data request, the current specific gravity, and the hue value being set.

## Additional Notes
If running this externally on a Digital Ocean droplet or AWS EC2, make sure to use screen so you can detach the process from the shell before closing it.
