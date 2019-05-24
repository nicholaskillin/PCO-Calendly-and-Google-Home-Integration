# PCO-Calendly-and-Google-Home-Integration
This outlines the process that I went through in order to get my Google home to announce that I had a phone call coming up whenever it saw a Calendly appointment on my PCO Google Calendar as well as set my slack status for me.

# The Overview
As crazy as it may seem, it's not possible to setup a Google home to watch a specific Google Calendar in order to let you know when specific events are coming up. So, I used an open source smart home platform to make this happen. The short version of the story is that Home Assistant is now watching my work Google Calendar for events that have either "Call" or "and Nick Killin" in the event name (these are two strings that Calendly uses when making events for me) and when it sees one of them it tells my Google Home to announce that I have a phone call (along with the name of the customer) 2 minutes before the event, and it sets my Slack status to "Phone Call" and changes my Slack emoji to the :phone: emoji. Sound cool? If you want a step-by-step process on how to set it up for yourself, you are in luck!

# What you will need
There are only two things that you will need to buy if you don't have them in order to get this up and running.
- [A Raspberry pi](https://www.amazon.com/CanaKit-Raspberry-Starter-Premium-Black/dp/B07BCC8PK7/ref=sr_1_1_sspa?crid=3D18BYD45TIEB&keywords=raspberry+pi+3+b%2B&qid=1558667764&s=gateway&sprefix=raspber%2Caps%2C169&sr=8-1-spons&psc=1)
- [A Google Home](https://express.google.com/u/0/product/11316989343855662812_7008326304182003253_105696200?utm_source=google_shopping&utm_medium=tu_prop&utm_content=eid-lsjeuxoeqt&gtim=CMPLxN7GzL-5dhC5l6LI08OvqnUY8NOUESIDVVNEKOCw1ucFMMiXszI&utm_campaign=105696200&gclid=CjwKCAjwiZnnBRBQEiwAcWKfYjppMSn_FE73CCRuRFwHw2T0AOG97cw2E-0yq9MpGHYpz30mfNKYmhoCBscQAvD_BwE)

# Step 1 - Install Home Assistant
Home Assistant is free, open source software usually used for controlling your smart home devices. However, with a little creativity you can set it up to do much more.

I installed a version of Home Assistant called HASSIO. HASSIO was designed specifically to run on a Raspberry pi, and that is what I installed it on. For detailed instructions on how to get HASSIO and set it up on a Raspberry pi you can checkout https://www.home-assistant.io/hassio/installation/.

# Step 2 - Install Configurator in Home Assistant
The next step is to install Configurator. In order to setup integrations with Google Calendar you will need to make some small changes to the `configuration.yaml` file in Home Assistant. Configurator will make it easy to access the files that you will need to edit in order to make this work.

To install:
- Click on Hass.io in your sidebar navigation on the left. 
- Click on Add-On Store
- Scroll down until you see a "Configurator" option. Click on that.
- Click on Install

Once you have configurator installed, if you go back to the add-ons section and click on configurator, you will have the option to add configurator to your sidebar. I would do that to make it easy to find in the future.

# Step 3 - Install Node-red in Home Assistant
Node-red is an easy to use, flow based automation program. It makes it easy to create very complex automations once you have Home Assistant talking to all of the right people (Google Calendar, Google Home, Slack).

To install:
- Click on Hass.io in your sidebar navigation on the left. 
- Click on Add-On Store
- Scroll down until you see a "Node-red" option. Click on that.
- Click on Install

Once you have Node-red installed, if you go back to the add-ons section and click on Node-red, you will have the option to add Node-red to your sidebar. I would do that to make it easy to find in the future.

# Step 4 - Connect your Google Calendar
Now it's time to start connecting the pieces to Home Assistant. The first thing is Google Calendar. You will want to follow the instructions on this website to connect Home Assistant up to your Google Calendars. https://www.home-assistant.io/components/calendar.google/

That guide should help you get Google Calendar connected, and it mentions a `google_calendars.yaml` file which is created in the same directory as your `configuration.yaml` file. You should be able to access both of those in the Configurator. In order to get this working, you will need to add an entity to your work calendar that Google pulled in. This entity will be looking for calendly events. Here is how my work calendar looks:

```
- cal_id: killin@ministrycentered.com
  entities:
  - device_id: nick_work
    ignore_availability: true
    name: Nick Work
    track: true
  - device_id: nick_calendly
    ignore_availability: true
    name: Nick Calendly
    track: true
    search: "and Nick Killin"
    search: "Call"
 ```
The only thing that you should have to add is the part where you see `device_id: nick_calendly` and down. Since the round robin creates events called `<Customer Name> and <Agent Name>` I have it searching for "and Nick Killin". My personal Calendly link formats the event names `<Customer Name>: 20 Minute Call` which is why I have a second search also looking for "Call".

Once you have added that in save your file, click on the gear in the top right-hand corner of Configurator, and select "Restart HASS".

Once home assistant restarts you should now have an entity called `calendar.<device_id>` with `<device_id>` being whatever you entered into your `google_calendars.yaml` file. This entity is kind of like a switch and it's state will switch to "on" when you have an event happening and "off" when there is no event currently happening. It also contains information about your event like the name of the event. 

This is great! You've reached a real milestone. Home Assistant now knows when you are supposed to be on a phone call. There is only one catch. The `calendar.<device_id>` entity that you created will only switch to "on" at the exact moment that you are supposed to start your phone call. That's not super helpful. So now we need to create a sensor that will switch to "on" 2 minutes before your events in your calendar entity being. This sensor will be the sensor tha triggers our entire automation process.

To set this up you will want to go into your `configuration.yaml` file and add the following code:

```
# Date time sensor for Calendly offset calculations
- platform: time_date
  display_options:
    - 'date_time'

- platform: template

# 2 minute offset for Calendly Calendar items
  sensors:
    calendly_event_offset:
      friendly_name: "Calendly Offset"
      value_template: >
        {% if as_timestamp(states.calendar.nick_calendly.attributes.start_time) - as_timestamp(strptime(states.sensor.date_time.state, "%Y-%m-%d, %H:%M")) < 180 %}on{% else %}off{% endif %}
```

In that code you can change the number "180" on the last line to whatever you would like. That is the number of seconds before your event begins that this sensor will turn on. For some reason it seems like the first 60 seconds that you enter in don't count, so if you enter in "120" it will turn this sensor on 1 minute before your events. "180" was needed for 2 minutes. 

Once again, after you have made those changes save and restart. You are now down with the calendar portion of this integration!

# Step 5 - Setting up Google Home
This process should be MUCH easier than the Google Calendar integration. Once you have your Google Home setup and connected to the same network as your HASSIO device, you should be able to click on "Configuration" in the sidebar, and then select "Integrations". Your Google Home is a "Google Cast" device, so setting up that integration should be all you need to do in order to get access to your Google Home. If you want to verify that it is setup correctly after restarting HASSIO, you can go back to the integrations page after your server has restarted and click on "Google Cast". You should see the name of your Google Home device there.

# Step 6 - Getting ready to integration with Slack
The Slack integration will work just a little differently than the other two. We aren't actually going to integrate with Slack, but instead will create a Slack app that we can send a generic web request to in order to have it update our status.

To create a Slack app you can head to https://api.slack.com/apps. Enter in a name for your app and for the development workspace select "Planning Center Staff". Once you have created your app select "oAuth and Permissions" from the left hand sidebar. On that page scroll down and under "Scopes" search for and select `users.profile:write`. Click on "Save Changes" right below that.

Now scroll up and click on "Install App to Workplace". Then click on "Authorize". Once you are back on the oAuth page copy that oAuth Access Token, you will need that later.

# Step 7 - Putting it all together
Now it's time to head back over to Home Assistant in order to put it all together. We will do this in Node-red, so once you are in Home Assistant click on that in the sidebar. 

On the left are nodes that we will need to start dragging onto your flow and configuring to do what we want. I'm going to walk you through exactly how mine works, but you can customize it if you'd like.

The first thing we have to do is setup the node that will trigger this entire process. A while back we create a sensor that turns on 2 minutes before our calendly events begin. So to get Node-red to watch that sensor you will want to drag over an `Events:state` node. Configure it like this.

![](/pictures/calendly%20event%20offset%20sensor%20node.png)

Next we are going to have that node connect to a `function` node. Drag a `function` node onto your flow. Then click and drag from the white dot on the right of your `events:state` node to the dot on the left of your `function` node. That connects the output of the `events:state` to the input of the `function` node. Open up your function node and configure it like this:

![](/pictures/function%20node.png)

