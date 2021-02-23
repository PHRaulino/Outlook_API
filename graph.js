// Create an authentication provider
const authProvider = {
  getAccessToken: async () => {
    // Call getToken in auth.js
    return await getToken();
  }
};

// Initialize the Graph client
const graphClient = MicrosoftGraph.Client.initWithMiddleware({authProvider});

async function getUser() {
  return await graphClient
    .api('/me')
    // Only get the fields used by the app
    .select('id,displayName,mail,userPrincipalName,mailboxSettings')
    .get();
}

async function getEvents() {
  const user = JSON.parse(sessionStorage.getItem('graphUser'));

  // Convert user's Windows time zone ("Pacific Standard Time")
  // to IANA format ("America/Los_Angeles")
  // Moment needs IANA format
  let ianaTimeZone = getIanaFromWindows(user.mailboxSettings.timeZone);
  console.log(`Converted: ${ianaTimeZone}`);

  // Configure a calendar view for the current week
  // Get midnight on the start of the current week in the user's timezone,
  // but in UTC. For example, for Pacific Standard Time, the time value would be
  // 07:00:00Z
  let startOfWeek = moment.tz('America/Los_Angeles').startOf('week').utc();
  // Set end of the view to 7 days after start of week
  let endOfWeek = moment(startOfWeek).add(7, 'day');

  try {
    // GET /me/calendarview?startDateTime=''&endDateTime=''
    // &$select=subject,organizer,start,end
    // &$orderby=start/dateTime
    // &$top=50
    let response = await graphClient
      .api('/me/calendarview')
      // Set the Prefer=outlook.timezone header so date/times are in
      // user's preferred time zone
      .header("Prefer", `outlook.timezone="${user.mailboxSettings.timeZone}"`)
      // Add the startDateTime and endDateTime query parameters
      .query({ startDateTime: '2021-02-10T19:10', endDateTime: '2022-02-10T19:10' })
      // Select just the fields we are interested in
      .select('subject,organizer,start,end, id')
      // Sort the results by start, earliest first
      .orderby('start/dateTime')
      // Maximum 50 events in response
      .top(50)
      .get();

    updatePage(Views.calendar, response.value);
  } catch (error) {
    updatePage(Views.error, {
      message: 'Error getting events',
      debug: error
    });
  }
}


async function deleteAllEvents() {
  const user = JSON.parse(sessionStorage.getItem('graphUser'));

  // Convert user's Windows time zone ("Pacific Standard Time")
  // to IANA format ("America/Los_Angeles")
  // Moment needs IANA format
  let ianaTimeZone = getIanaFromWindows(user.mailboxSettings.timeZone);
  console.log(`Converted: ${ianaTimeZone}`);

  // Configure a calendar view for the current week
  // Get midnight on the start of the current week in the user's timezone,
  // but in UTC. For example, for Pacific Standard Time, the time value would be
  // 07:00:00Z
  let startOfWeek = moment.tz('America/Los_Angeles').startOf('week').utc();
  // Set end of the view to 7 days after start of week
  let endOfWeek = moment(startOfWeek).add(7, 'day');
  try {
    // GET /me/calendarview?startDateTime=''&endDateTime=''
    // &$select=subject,organizer,start,end
    // &$orderby=start/dateTime
    // &$top=50
    let response = await graphClient
      .api('/me/calendarview')
      // Set the Prefer=outlook.timezone header so date/times are in
      // user's preferred time zone
      .header("Prefer", `outlook.timezone="${user.mailboxSettings.timeZone}"`)
      // Add the startDateTime and endDateTime query parameters
      .query({ startDateTime: '2021-02-06T19:10', endDateTime: '2022-02-10T19:10' })
      // Select just the fields we are interested in
      .select('id')
      // Sort the results by start, earliest first
      .orderby('start/dateTime')
      // Maximum 50 events in response
      .top(400)
      .get();
      ids = response.value
      for (let index = 0; index < ids.length; index++) {
        console.log(ids[index].id);
        try {
          // POST the JSON to the /me/events endpoint
      
          await graphClient
            .api(`/me/events/${ids[index].id}`)
            .delete();
    
          // Return to the calendar view
          // getEvents();
        } catch (error) {
          console.log({
            message: 'Error creating event',
            debug: error
          });
        }
      }



    // console.log(response.value);
  } catch (error) {
    console.error({
      message: 'Error getting events',
      debug: error
    });
  }
}

async function createNewEvent() {

  for (let index = 0; index < eventos.length; index++) {
    try {
      // POST the JSON to the /me/events endpoint
  
      await graphClient
        .api('/me/events')
        .post(eventos[index]);
      console.log('Evento ', index, 'Criado com sucesso!')
      // Return to the calendar view
      // getEvents();
    } catch (error) {
      console.log({
        message: 'Error creating event',
        debug: error
      });
    }
  }

}