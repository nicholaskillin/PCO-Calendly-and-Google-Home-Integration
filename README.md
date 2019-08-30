# PCO-Home-Assistant-Integrations
This outlines the process that I went through in order to get an instance of Home Assitant up and running. Home assistant does two things for me at work.
1. I have my Google home to announce that I had a phone call coming up whenever it saw a Calendly appointment on my PCO Google Calendar.
2. I have Home Assistant automatically update my slack status for me at certain parts of the day.

Setting up Home Assistant will allow you to do one or both of these things, and probably a host of other things that I haven't thought of yet.

# The Overview
As crazy as it may seem, it's not possible to setup a Google home to watch a specific Google Calendar in order to let you know when specific events are coming up. So, I used an open source smart home platform to make this happen. The short version of the story is that Home Assistant is now watching my work Google Calendar for events that have either "Call" or "and Nick Killin" in the event name (these are two strings that Calendly uses when making events for me) and when it sees one of them it tells my Google Home to announce that I have a phone call (along with the name of the customer) 2 minutes before the event, and it sets my Slack status to "Phone Call" and changes my Slack emoji to the :phone: emoji. Sound cool? If you want a step-by-step process on how to set it up for yourself, you are in luck!

While it's keeping an eye on my calendar, I also have it automatically set my status for things such as breaks and lunch.

# What you will need
There are only two things that you will need to buy if you don't have them in order to get this up and running.
- [A Raspberry pi](https://www.amazon.com/CanaKit-Raspberry-Starter-Premium-Black/dp/B07BCC8PK7/ref=sr_1_1_sspa?crid=3D18BYD45TIEB&keywords=raspberry+pi+3+b%2B&qid=1558667764&s=gateway&sprefix=raspber%2Caps%2C169&sr=8-1-spons&psc=1)
- [A Google Home ](https://express.google.com/u/0/product/11316989343855662812_7008326304182003253_105696200?utm_source=google_shopping&utm_medium=tu_prop&utm_content=eid-lsjeuxoeqt&gtim=CMPLxN7GzL-5dhC5l6LI08OvqnUY8NOUESIDVVNEKOCw1ucFMMiXszI&utm_campaign=105696200&gclid=CjwKCAjwiZnnBRBQEiwAcWKfYjppMSn_FE73CCRuRFwHw2T0AOG97cw2E-0yq9MpGHYpz30mfNKYmhoCBscQAvD_BwE) - this isn't needed if you just want Home Assistant to update your Slack status based on your calendar. 

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

This is great! You've reached a real milestone. Home Assistant now knows when you are supposed to be on a phone call. 

If you are only doing this so that you can update your slack status, then you can repeat this process for other events that you want home assistant to watch for. Here is my setup to give you some ideas.

```
- cal_id: killin@ministrycentered.com
  entities:
  - device_id: nick_work
    ignore_availability: true
    name: Nick Work
    track: true
    max_results: 15
  - device_id: nick_calendly
    ignore_availability: true
    name: Nick Calendly
    track: true
    search: "and Nick Killin"
    search: "Call"
  - device_id: nick_breaks
    name: Nick Breaks
    track: true
    search: "Break"
  - device_id: nick_start_work
    name: Nick Start Work
    track: true
    search: "Start Tickets"
  - device_id: nick_end_work
    name: Nick End Work
    track: true
    search: "Wrap up tickets"
  - device_id: nick_one_to_one
    name: Nick One To One
    track: true
    search: "Killin 1:1"
  - device_id: nick_lunch
    name: Nick Lunch
    track: true
    search: "lunch"
```
### Getting notifications before an event (this is only needed for the google home side of things, not slack)
We are getting real close, but there is one issue. The `calendar.<device_id>` entity that you created will only switch to "on" at the exact moment that you are supposed to start your phone call. That's not super helpful. So now we need to create a sensor that will switch to "on" 3 minutes before your events in your calendar entity begin. This sensor will be the sensor that triggers our entire automation process.

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
        {% set st = state_attr('calendar.nick_calendly', 'start_time') %}
        {{ 'on' if st != None and as_timestamp(st) - (as_timestamp( strptime(states.sensor.date_time.state, "%Y-%m-%d, %H:%M" ) ) ) < 240 else 'off' }}
```

In that code you can change the number "240" on the last line to whatever you would like. That is the number of seconds before your event begins that this sensor will turn on. For some reason it seems like the first 60 seconds that you enter in don't count, so if you enter in "120" it will turn this sensor on 1 minute before your events. "240" was needed for 3 minutes. 

Once again, after you have made those changes save and restart. You are now down with the calendar portion of this integration!

# Step 5 - Setting up Google Home (can skip this if you only want slack)
This process should be MUCH easier than the Google Calendar integration. Once you have your Google Home setup and connected to the same network as your HASSIO device, you should be able to click on "Configuration" in the sidebar, and then select "Integrations". Your Google Home is a "Google Cast" device, so setting up that integration should be all you need to do in order to get access to your Google Home. If you want to verify that it is setup correctly after restarting HASSIO, you can go back to the integrations page after your server has restarted and click on "Google Cast". You should see the name of your Google Home device there.

# Step 6 - Getting ready to integration with Slack
In order to update your status over the Slack API you will need to get a Legacy Token that we can send along with our API calls. This basically acts like a username/password so that Slack knows who you are.

To get one of these you will need to go to `https://api.slack.com/custom-integrations/legacy-tokens` while logged into your Planning Center Staff Slack account. You can copy your token from here:

![](/pictures/slack_legacy_token.png)

# Step 7 - Putting it all together
Now it's time to head back over to Home Assistant in order to put it all together. We will do this in Node-red, so once you are in Home Assistant click on that in the sidebar. 

On the left are nodes that we will need to start dragging onto your flow and configuring to do what we want. I'm going to walk you through exactly how mine works, but you can customize it if you'd like.

### Setting up a flow to update your slack status
The first thing we have to do is setup the node that will trigger this entire process. For that you will want to grab one of the `events: state` nodes from the node sidebar of node red, and drag that onto your work area on the right. Here is how you will want to setup those nodes. 

![](/pictures/break_event_state.png)

Then we will need to use a `function` node from the left sidebar to format the data that we are going to send to Slack. Here is an example of the function that I would use to let Slack know that I'm on break. This function also automatically sends an update every 1 minute.

![](/pictures/break_slack_function_node.png)

Finally, we have to send that data to Slack with an `http request` node. Here is what that should look like.

![](/pictures/slack_http_request.png)

You can have a bunch of the `event:state` nodes connected to their own corresponding `function` nodes, then have all of those `function` nodes connect to a single node that sends the data to Slack, like this.

![](/pictures/slack_status_flow.png)

### Setting up a flow for Google Home
This data is coming soon.



