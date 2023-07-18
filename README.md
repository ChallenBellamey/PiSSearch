To get started:

1. Install an integrated development environment (IDE), I recommend Visual Studio Code (https://code.visualstudio.com/download)
2. Download the files and open up the main directory in your IDE
3. Set up Node.js and npm (Node package manager), you can find tutorials for this on Youtube

Google APIs and services is required to run the program. Again, Youtube tutorials may help with these steps

4. Go to "https://console.cloud.google.com" and create a project.
5. In the API library section, search for "YouTube Data API v3" and enable it
6. In the credentials section, create a new API key and copy it
7. Back to your IDE, in the main directory of the program create a file called "auth.json" and save the following code in it:

`{
    "apiKey": "YOUR API KEY HERE"
}`

8. Open up a new terminal in your IDE
9. Enter "npm i" into the terminal to install the necessary dependencies

The file you will use to search is index.js. I have added an example on there to show how it works.

10. Enter "node index.js" into the terminal to run the program. It may take a few minutes to download the captions.
11. Look for a newly created "matches" folder, and the results will be contained within.

*Make sure to check the quotas section on the YouTube Data API v3 page of the Google APIs and services dashboard, as they only give you 10,000 requests per day. If you start encountering errors, it may be because you have exhausted your daily API quota.*

*This version of the program involves some "web-scraping" to download the captions of the videos, which is probably a no-no in the eyes of Youtube. It is possible to replace this using Youtube API, however it will significantly increase your quota usage. If required, I can modify the program to fully use the Youtube API and avoid web-scraping.*

Please feel free to contact me if you need any help with any of these steps!
- Challen
