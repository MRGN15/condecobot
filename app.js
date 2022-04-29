// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const fetch = require("node-fetch");
const schedule = require("node-schedule");
const config = require("./config.json");
const fs = require("fs");
const nconf = require("nconf");
const moment = require("moment");

//////////////////////////////

let submitter = "";
const roomAtt = [
  {
    text: { type: "plain_text", text: "Video Conference Unit", emoji: true },
    value: "170",
  },
  {
    text: { type: "plain_text", text: "Conference Phone", emoji: true },
    value: "175",
  },
  {
    text: { type: "plain_text", text: "Network Outlet", emoji: true },
    value: "177",
  },
  {
    text: { type: "plain_text", text: "Whiteboard", emoji: true },
    value: "178",
  },
  {
    text: { type: "plain_text", text: "Zoom enabled", emoji: true },
    value: "484",
  },
  {
    text: { type: "plain_text", text: "Teams enabled", emoji: true },
    value: "485",
  },
];
const deskOptions = [];
const countryOptions = [
  { text: { type: "plain_text", text: "UK", emoji: true }, value: "1" },
  { text: { type: "plain_text", text: "USA", emoji: true }, value: "5" },
];
const groupOptions = [];
const UKregionData = [];
const UKlocOptions2 = [
  {
    text: { type: "plain_text", text: "75 Bermondsey St", emoji: true },
    value: "19",
  },
  {
    text: { type: "plain_text", text: "73 Bermondsey St", emoji: true },
    value: "20",
  },
  {
    text: { type: "plain_text", text: "Woolyard", emoji: true },
    value: "21",
  },
  {
    text: { type: "plain_text", text: "Archetype 100US", emoji: true },
    value: "26",
  },
  {
    text: { type: "plain_text", text: "The Craft", emoji: true },
    value: "28",
  },
  {
    text: { type: "plain_text", text: "Publitek Luton", emoji: true },
    value: "29",
  },
  {
    text: { type: "plain_text", text: "Publitek Bath", emoji: true },
    value: "30",
  },
  {
    text: { type: "plain_text", text: "Twogether Marlow", emoji: true },
    value: "31",
  },
];
const UKlocOptions = [];
const USAregionData = [];
const USAlocOptions = [];
const USAlocOptions2 = [
  {
    text: { type: "plain_text", text: "250 PAS", emoji: true },
    value: "23",
  },
  {
    text: { type: "plain_text", text: "666 Third Ave", emoji: true },
    value: "25",
  },
  {
    text: { type: "plain_text", text: "100 Montgomery Street", emoji: true },
    value: "27",
  },
];
const UKLocData = [];
const USALocData = [];
const UKGroups = [];
const USAGroups = [];
const formatYmd = (date) => date.toISOString().slice(0, 10);
const today = formatYmd(new Date());
const optionFactory = (name, id) => {
  return {
    text: {
      type: "plain_text",
      text: name.substring(0, 60),
      emoji: true,
    },
    value: `${id}`,
  };
};
const roomFactory = (name, id, cap) => {
  return {
    text: {
      type: "plain_text",
      text: name.substring(0, 60) + " " + `(${cap})`,
      emoji: true,
    },
    value: `${id}`,
  };
};
const attFactory = (room, firstName, lastName, email) => {
  return {
    roomId: room,
    firstName: firstName,
    lastName: lastName,
    email: email,
    attendeeType: 1,
  };
};

const getUKLoc = async () => {
  try {
    const token = await updateToken();
    //get UK locations

    UKregionData.length = 0;

    //get regions
    const regFetch = await fetch(
      `https://integrationapi.condecosoftware.com/Next_Fifteen_Communications_Group_PLC/api/V1/regionsByParent/1`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + CON_SESS_TOKEN,
          "Ocp-Apim-Subscription-Key": process.env.CON_MAP_TOKEN,
        },
      }
    )
      .then((res) => res.json())
      .then((json) => {
        // console.log(json);
        for (let i in json.Data) {
          UKregionData.push(json.Data[i]);
        }
      })
      .catch((err) => console.log(err));
    console.log("UK Regions complete");
    // console.log(regionData);

    UKLocData.length = 0;
    UKlocOptions.length = 0;

    // get locations
    for (let r in UKregionData) {
      const locFetch = await fetch(
        `https://integrationapi.condecosoftware.com/Next_Fifteen_Communications_Group_PLC/api/V1/locations?regionId=${UKregionData[r].InternalId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + CON_SESS_TOKEN,
            "Ocp-Apim-Subscription-Key": process.env.CON_MAP_TOKEN,
          },
        }
      )
        .then((res) => res.json())
        .then((json) => {
          // console.log(json);
          for (let i in json.Data) {
            UKLocData.push(json.Data[i]);
            UKlocOptions.push(
              optionFactory(json.Data[i].ResourceName, json.Data[i].InternalId)
            );
          }
        })
        .catch((err) => console.log(err));
    }
    console.log("UK Locations complete");
    // console.log(UKLocData);
  } catch (error) {
    console.error(error);
  }
};
const getUSALoc = async () => {
  try {
    const token = await updateToken();

    //get USA locations
    USAregionData.length = 0;

    //get regions
    const USAregFetch = await fetch(
      `https://integrationapi.condecosoftware.com/Next_Fifteen_Communications_Group_PLC/api/V1/regionsByParent/5`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + CON_SESS_TOKEN,
          "Ocp-Apim-Subscription-Key": process.env.CON_MAP_TOKEN,
        },
      }
    )
      .then((res) => res.json())
      .then((json) => {
        // console.log(json);
        for (let i in json.Data) {
          USAregionData.push(json.Data[i]);
        }
      })
      .catch((err) => console.log(err));

    console.log("USA Regions complete");
    // console.log(USAregionData);
    USALocData.length = 0;
    USAlocOptions.length = 0;

    // get locations
    for (let r in USAregionData) {
      const USAlocFetch = await fetch(
        `https://integrationapi.condecosoftware.com/Next_Fifteen_Communications_Group_PLC/api/V1/locations?regionId=${USAregionData[r].InternalId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + CON_SESS_TOKEN,
            "Ocp-Apim-Subscription-Key": process.env.CON_MAP_TOKEN,
          },
        }
      )
        .then((res) => res.json())
        .then((json) => {
          // console.log(json);
          for (let i in json.Data) {
            USALocData.push(json.Data[i]);
            USAlocOptions.push(
              optionFactory(json.Data[i].ResourceName, json.Data[i].InternalId)
            );
          }
        })
        .catch((err) => console.log(err));
    }
    console.log("USA Locations complete");
    // console.log(USALocData);
  } catch (error) {
    console.error(error);
  }
};

const getUKGroups = async () => {
  try {
    const token = await updateToken();

    UKGroups.length = 0;

    const countryFetch = await fetch(
      `https://integrationapi.condecosoftware.com/Next_Fifteen_Communications_Group_PLC/api/V1/groups?countryId=1`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + CON_SESS_TOKEN,
          "Ocp-Apim-Subscription-Key": process.env.CON_MAP_TOKEN,
        },
      }
    )
      .then((res) => res.json())
      .then((json) => {
        // console.log(json);
        for (let i in json.Data) {
          UKGroups.push(
            optionFactory(json.Data[i].ResourceName, json.Data[i].InternalId)
          );
        }
      })
      .catch((err) => console.log(err));
    console.log("UKGroups complete");
    // console.log(UKGroups);
  } catch (error) {
    console.error(error);
  }
};
const getUSAGroups = async () => {
  try {
    const token = await updateToken();
    USAGroups.length = 0;

    const countryFetch = await fetch(
      `https://integrationapi.condecosoftware.com/Next_Fifteen_Communications_Group_PLC/api/V1/groups?countryId=5`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + CON_SESS_TOKEN,
          "Ocp-Apim-Subscription-Key": process.env.CON_MAP_TOKEN,
        },
      }
    )
      .then((res) => res.json())
      .then((json) => {
        // console.log(json);
        for (let i in json.Data) {
          USAGroups.push(
            optionFactory(json.Data[i].ResourceName, json.Data[i].InternalId)
          );
        }
      })
      .catch((err) => console.log(err));
    console.log("USAGroups complete");
    // console.log(USAGroups);
  } catch (error) {
    console.error(error);
  }
};

///////////////TOKEN UPDATER

let CON_SESS_TOKEN = "";
const updateToken = async () => {
  try {
    var details = {
      password: process.env.CON_PASS,
      grant_type: "password",
      client_id: process.env.CON_CLIENT_ID,
    };

    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    const conFetch = await fetch(
      "https://next15.condecosoftware.com/tokenproviderapi/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: formBody,
      }
    )
      .then((res) => res.json())
      .then((json) => {
        // console.log(json);
        CON_SESS_TOKEN = json.access_token;
      });
  } catch (error) {
    console.error(error);
  }
};

//////////////////////////////

//Fetch testing
app.action("con_fetch", async ({ ack, body, client, payload, logger }) => {
  await ack();
  console.log("Fetch button click.");

  try {
        const token = await updateToken();
        // console.log(CON_SESS_TOKEN);
        const bookFetch = await fetch(
          `https://integrationapi.condecosoftware.com/Next_Fifteen_Communications_Group_PLC/api/V1/floorPlan?locationId=19&floorNumber=2&groupId=48&resourceTypeId=128`,
          // floorPlan?locationId=19&floorNumber=1&groupId=48&resourceTypeId
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + CON_SESS_TOKEN,
              "Ocp-Apim-Subscription-Key": process.env.CON_MAP_TOKEN,
            },
          }
        )
          .then((res) => res.json())
          .then((json) => {
            console.log(json.Data);
          });
    //           const countryFetch = await fetch(
    //       `https://integrationapi.condecosoftware.com/Next_Fifteen_Communications_Group_PLC/api/V1/deskBookings/availableDesks`,
    //       {
    //         method: "POST",
    //         headers: {
    //           "Content-Type": "application/json",
    //           Authorization: "Bearer " + CON_SESS_TOKEN,
    //           "Ocp-Apim-Subscription-Key": process.env.CON_BOOK_TOKEN,
    //         },
    //         body: JSON.stringify({
    //   "userID": 2536,
    //   "locationID": 20,
    //   "groupID": 50,
    //   "workSpaceTypeId": 2,
    //   "dateList": [
    //     {
    //       "date": "2022/03/25",
    //       "bookingType": 2
    //     }
    //   ],
    //   "pageNumber": 0,
    //   "pageSize": 0
    // }),
    //       }
    //     )
    //       .then((res) => console.log(res));
  } catch (error) {
    console.error(error);
  }
});

//////////////////////////////

//Meeting Room Shortcut
app.shortcut("con_meet_room", async ({ ack, payload, body, client }) => {
  // Acknowledge the command request
  await ack();
  console.log("Meeting room triggered.");
  submitter = body.user.id;
  getUKLoc();
  getUSALoc();
  getUKGroups();
  getUSAGroups();

  try {
    // Call views.open with the built-in client
    const result = await client.views.open({
      // Pass a valid trigger_id within 3 seconds of receiving it
      trigger_id: body.trigger_id,
      // View payload
      view: {
        type: "modal",
        callback_id: "con_meet_search",
        submit: {
          type: "plain_text",
          text: "Search",
          emoji: true,
        },
        close: {
          type: "plain_text",
          text: "Cancel",
          emoji: true,
        },
        title: {
          type: "plain_text",
          text: "Book Meeting Room",
          emoji: true,
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `:wave: Hi <@${submitter}>!\n\nPlease use the form below to find and book a meeting room on Condeco.`,
            },
          },
          {
            type: "divider",
          },
          {
            dispatch_action: true,
            type: "input",
            block_id: "meet_country",
            element: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              options: countryOptions,
              initial_option: {
                text: { type: "plain_text", text: "UK", emoji: true },
                value: "1",
              },
              action_id: "meet_country_input",
            },
            label: {
              type: "plain_text",
              text: "Country",
              emoji: true,
            },
          },
          {
            dispatch_action: true,
            type: "input",
            block_id: "meet_location",
            element: {
              type: "external_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              action_id: "loc_select_UK_meet",
              min_query_length: 0,
            },
            label: {
              type: "plain_text",
              text: "Location",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "meet_group",
            element: {
              type: "external_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              action_id: "group_input",
              min_query_length: 0,
            },
            label: {
              type: "plain_text",
              text: "Group",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "meet_date",
            element: {
              type: "datepicker",
              initial_date: today,
              placeholder: {
                type: "plain_text",
                text: "Select a date",
                emoji: true,
              },
              action_id: "meet_date_input",
            },
            label: {
              type: "plain_text",
              text: "Date and Time",
              emoji: true,
            },
          },
          {
            type: "actions",
            block_id: "meet_time",
            elements: [
              {
                type: "timepicker",
                placeholder: {
                  type: "plain_text",
                  text: "Start",
                  emoji: true,
                },
                action_id: "meet_start_time",
              },
              {
                type: "timepicker",
                placeholder: {
                  type: "plain_text",
                  text: "End",
                  emoji: true,
                },
                action_id: "meet_end_time",
              },
            ],
          },
          {
            type: "context",
            elements: [
              {
                type: "plain_text",
                text: "*Type or select",
                emoji: true,
              },
            ],
          },
          {
            type: "section",
            block_id: "requirements",
            text: {
              type: "mrkdwn",
              text: "Add room requirements:",
            },
            accessory: {
              type: "multi_static_select",
              placeholder: {
                type: "plain_text",
                text: "Select options",
                emoji: true,
              },
              options: roomAtt,
              action_id: "meet_req",
            },
          },
        ],
      },
    });
    // console.log(result);
  } catch (error) {
    console.error(error);
  }
});

//Ack meet req
app.action("meet_req", async ({ ack, body, payload, client }) => {
  await ack();
});

//Ack meet date-time
app.action("meet_start_time", async ({ ack, body, payload, client }) => {
  await ack();
});

app.action("meet_end_time", async ({ ack, body, payload, client }) => {
  await ack();
});

app.action("meet_date_input", async ({ ack, body, payload, client }) => {
  await ack();
});

//Meeting room search results
app.view("con_meet_search", async ({ ack, body, payload, client }) => {
  // console.log(payload.state.values);
  let roomOptions = [];
  let reqOptions = [];
  let reqs = reqOptions.join();
  let mLoc = "";
  let mLocName = "";
  if ("loc_select_UK_meet" in body.view.state.values.meet_location) {
    console.log("UK Room");
    mLoc =
      payload.state.values.meet_location.loc_select_UK_meet.selected_option
        .value;
    mLocName =
      payload.state.values.meet_location.loc_select_UK_meet.selected_option.text
        .text;
  } else {
    console.log("USA Room");
    mLoc =
      payload.state.values.meet_location.loc_select_USA_meet.selected_option
        .value;
    mLocName =
      payload.state.values.meet_location.loc_select_USA_meet.selected_option
        .text.text;
  }

  let mCon =
    payload.state.values.meet_country.meet_country_input.selected_option.value;
  let mGr = payload.state.values.meet_group.group_input.selected_option.value;
  let mReq = payload.state.values.requirements.meet_req.selected_options;
  let date = payload.state.values.meet_date.meet_date_input.selected_date;
  let startDateTime = `${date} ${payload.state.values.meet_time.meet_start_time.selected_time}`;
  let endDateTime = `${date} ${payload.state.values.meet_time.meet_end_time.selected_time}`;
  let mPass = {
    startDateTime: startDateTime,
    endDateTime: endDateTime,
    mLocName: mLocName,
  };

  console.log("LocId: " + mLoc);
  console.log("GroupId: " + mGr);
  console.log(mReq);
  console.log("Start: " + startDateTime);
  console.log("End: " + endDateTime);

  try {
    if (mReq.length === 0) {
      const roomFetch = await fetch(
        `https://integrationapi.condecosoftware.com/Next_Fifteen_Communications_Group_PLC/api/V1/bookings/availableRooms?locationID=${mLoc}&startDateTime=${startDateTime}&endDateTime=${endDateTime}&groupID=${mGr}&workSpaceTypeId=1&roomsPerDay=10`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + CON_SESS_TOKEN,
            "Ocp-Apim-Subscription-Key": process.env.CON_BOOK_TOKEN,
          },
        }
      )
        .then((res) => res.json())
        .then((json) => {
          // console.log(json);
          for (let i in json.availableRooms) {
            roomOptions.push(
              roomFactory(
                json.availableRooms[i].roomName,
                json.availableRooms[i].roomId,
                json.availableRooms[i].maxCapacity
              )
            );
          }
        });
    } else {
      for (let r in mReq) {
        reqOptions.push(mReq[r].value);
      }
      // console.log(reqOptions.join());
      const roomFetch = await fetch(
        `https://integrationapi.condecosoftware.com/Next_Fifteen_Communications_Group_PLC/api/V1/bookings/availableRooms?locationID=${mLoc}&startDateTime=${startDateTime}&endDateTime=${endDateTime}&groupID=${mGr}&roomAttributes=${reqs}&workSpaceTypeId=1&roomsPerDay=10`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + CON_SESS_TOKEN,
            "Ocp-Apim-Subscription-Key": process.env.CON_BOOK_TOKEN,
          },
        }
      )
        .then((res) => res.json())
        .then((json) => {
          // console.log(json);
          for (let i in json.availableRooms) {
            roomOptions.push(
              roomFactory(
                json.availableRooms[i].roomName,
                json.availableRooms[i].roomId,
                json.availableRooms[i].maxCapacity
              )
            );
          }
        });
    }

    if (roomOptions.length !== 0) {
      await ack({
        response_action: "update",
        view: {
          type: "modal",
          callback_id: "con_meet_options",
          private_metadata: JSON.stringify(mPass),
          submit: {
            type: "plain_text",
            text: "Book",
            emoji: true,
          },
          close: {
            type: "plain_text",
            text: "Cancel",
            emoji: true,
          },
          title: {
            type: "plain_text",
            text: "Book Meeting Room",
            emoji: true,
          },
          blocks: [
            {
              type: "input",
              block_id: "room_select",
              element: {
                type: "radio_buttons",
                options: roomOptions,
                action_id: "room_meet_input",
              },
              label: {
                type: "plain_text",
                text: "Select an available meeting room:",
                emoji: true,
              },
            },
            {
              type: "context",
              elements: [
                {
                  type: "plain_text",
                  text: "*(capacity)",
                  emoji: true,
                },
              ],
            },
            {
              type: "input",
              block_id: "meet_name",
              element: {
                type: "plain_text_input",
                action_id: "meet_name_action",
              },
              label: {
                type: "plain_text",
                text: "Meeting Name",
                emoji: true,
              },
            },
            {
              type: "input",
              block_id: "meet_host",
              element: {
                type: "users_select",
                placeholder: {
                  type: "plain_text",
                  text: "Select user",
                  emoji: true,
                },
                action_id: "meet_host_input",
              },
              label: {
                type: "plain_text",
                text: "Host",
                emoji: true,
              },
            },
            {
              type: "input",
              optional: true,
              block_id: "meet_attendees",
              element: {
                type: "multi_users_select",
                placeholder: {
                  type: "plain_text",
                  text: "Select users",
                  emoji: true,
                },
                action_id: "meet_attendees_input",
              },
              label: {
                type: "plain_text",
                text: "Attendees",
                emoji: true,
              },
            },
          ],
        },
      });
    } else {
      await ack({
        response_action: "push",
        view: {
          type: "modal",
          callback_id: "con_meet_options",
          close: {
            type: "plain_text",
            text: "Back",
            emoji: true,
          },
          title: {
            type: "plain_text",
            text: "Book Meeting Room",
            emoji: true,
          },
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `Sorry there are no available meeting rooms for this search :weary:`,
              },
            },
          ],
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
});

//Submit meeting room booking
app.view("con_meet_options", async ({ ack, body, payload, client }) => {
  // console.log(payload.state.values);
  let slackEmail = "";
  let hostEmail = "";
  let hostId = "";
  let mName = payload.state.values.meet_name.meet_name_action.value;
  let mRoom =
    payload.state.values.room_select.room_meet_input.selected_option.value;
  let mRoomName =
    payload.state.values.room_select.room_meet_input.selected_option.text.text;
  let mHost = payload.state.values.meet_host.meet_host_input.selected_user;
  let mAttendees =
    payload.state.values.meet_attendees.meet_attendees_input.selected_users;
  let attendees = [];
  let passData = JSON.parse(payload.private_metadata);
  let status = "";
  // console.log(mAttendees);

  try {
    //Get host info
    const getEmail = await client.users.profile
      .get({
        user: mHost,
      })
      .then((res) => (slackEmail = res.profile.email));
    // console.log(slackEmail);

    //Get user data from Condeco

    const getConUser = await fetch(
      `https://integrationapi.condecosoftware.com/Next_Fifteen_Communications_Group_PLC/api/V1/users?emailId=${slackEmail}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + CON_SESS_TOKEN,
          "Ocp-Apim-Subscription-Key": process.env.CON_MAP_TOKEN,
        },
      }
    )
      .then((res) => res.json())
      .then((json) => {
        // console.log(json);
        hostEmail = json.Data[0].Email;
        hostId = json.Data[0].InternalId;
      });
    console.log(hostEmail);
    console.log(hostId);

    if (mAttendees.length !== 0) {
      for (let a in mAttendees) {
        let email = "";
        await client.users.profile
          .get({
            user: mAttendees[a],
          })
          .then((res) => (email = res.profile.email));

        await fetch(
          `https://integrationapi.condecosoftware.com/Next_Fifteen_Communications_Group_PLC/api/V1/users?emailId=${email}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + CON_SESS_TOKEN,
              "Ocp-Apim-Subscription-Key": process.env.CON_MAP_TOKEN,
            },
          }
        )
          .then((res) => res.json())
          .then((json) => {
            // console.log(json);
            attendees.push(
              attFactory(
                mRoom,
                json.Data[0].FirstName,
                json.Data[0].LastName,
                json.Data[0].Email
              )
            );
          });
      }
    }

    //submit booking
    const bookFetch = await fetch(
      `https://integrationapi.condecosoftware.com/Next_Fifteen_Communications_Group_PLC/api/V1/bookings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + CON_SESS_TOKEN,
          "Ocp-Apim-Subscription-Key": process.env.CON_BOOK_TOKEN,
        },
        body: JSON.stringify({
          userId: hostId,
          roomId: mRoom,
          startDateTime: passData.startDateTime,
          endDateTime: passData.endDateTime,
          meetingTitle: mName,
          bookingSource: 3,
          setDefaultStyle: true,
          numberOfAttendees: attendees.length + 1,
          attendees: attendees,
        }),
      }
    ).then((res) => {
      console.log(res);
      status = res.status
                    });

    if (status === 201) {
      await ack({
        response_action: "update",
        view: {
          type: "modal",
          title: {
            type: "plain_text",
            text: "Book Meeting Room",
            emoji: true,
          },
          close: {
            type: "plain_text",
            text: "Close",
            emoji: true,
          },
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `Your meeting has been booked :partying_face:\n\n*Meeting:* ${mName}\n*Building:* ${
                  passData.mLocName
                }\n*Room:* ${mRoomName}\n*Start:* ${moment(
                  passData.startDateTime
                ).format("LLLL")}\n*End:* ${moment(passData.endDateTime).format(
                  "LLLL"
                )}`,
              },
            },
          ],
        },
      });
      
    //handles
    const handles = [];
    for (let m in mAttendees) {
      handles.push(`<@${mAttendees[m]}>`);
    };
    
    //notify on Slack
    await client.chat.postMessage({
      channel: mHost,
      blocks: [
        {
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `Your meeting has been booked on <https://next15.condecosoftware.com/|Condeco> :thumbsup:\n\n*Meeting:* ${mName}\n*Building:* ${
                  passData.mLocName
                }\n*Room:* ${mRoomName}\n*Start:* ${moment(passData.startDateTime).format("LLLL")}\n*End:* ${moment(passData.endDateTime).format("LLLL")}\n*Attendees:* ${handles}`,
			}
		}
      ],
      text: "Message from Condeco-Bot"
    });
    
    //notify attendees
    for (let m in mAttendees) {
      await client.chat.postMessage({
        channel: mAttendees[m],
        blocks: [
        {
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `<@${mHost}> invited you to a meeting booked on <https://next15.condecosoftware.com/|Condeco>  :office:\n\n*Meeting:* ${mName}\n*Building:* ${
                  passData.mLocName
                }\n*Room:* ${mRoomName}\n*Start:* ${moment(passData.startDateTime).format("LLLL")}\n*End:* ${moment(passData.endDateTime).format("LLLL")}\n*Attendees:* ${handles}`,
			}
		}
      ],
      text: "Message from Condeco-Bot"
      });
    };
      
    } else {
      await ack({
        response_action: "update",
        view: {
          type: "modal",
          title: {
            type: "plain_text",
            text: "Book Meeting Room",
            emoji: true,
          },
          close: {
            type: "plain_text",
            text: "Close",
            emoji: true,
          },
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `Something went wrong :weary:\nPlease try again.`,
              },
            },
          ],
        },
      });
    };
    
    
  } catch (error) {
    console.error(error);
  }
});

//change meet country
app.action("meet_country_input", async ({ ack, body, client, payload }) => {
  // console.log(payload);
  let newOptions = "";

  try {
    if (payload.selected_option.value === "5") {
      newOptions = "loc_select_USA_meet";
    } else {
      newOptions = "loc_select_UK_meet";
    }
    // console.log(newOptions);

    const meet = await client.views.update({
      view_id: body.view.id,
      view: {
        type: "modal",
        callback_id: "con_meet_search",
        submit: {
          type: "plain_text",
          text: "Search",
          emoji: true,
        },
        close: {
          type: "plain_text",
          text: "Cancel",
          emoji: true,
        },
        title: {
          type: "plain_text",
          text: "Book Meeting Room",
          emoji: true,
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `:wave: Hi <@${submitter}>!\n\nPlease use the form below to find and book a meeting room on Condeco.`,
            },
          },
          {
            type: "divider",
          },
          {
            dispatch_action: true,
            type: "input",
            block_id: "meet_country",
            element: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              options: countryOptions,
              initial_option: {
                text: { type: "plain_text", text: "UK", emoji: true },
                value: "1",
              },
              action_id: "meet_country_input",
            },
            label: {
              type: "plain_text",
              text: "Country",
              emoji: true,
            },
          },
          {
            dispatch_action: true,
            type: "input",
            block_id: "meet_location",
            element: {
              type: "external_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              action_id: newOptions,
              min_query_length: 0,
            },
            label: {
              type: "plain_text",
              text: "Location",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "meet_group",
            element: {
              type: "external_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              action_id: "group_input",
              min_query_length: 0,
            },
            label: {
              type: "plain_text",
              text: "Group",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "meet_date",
            element: {
              type: "datepicker",
              initial_date: today,
              placeholder: {
                type: "plain_text",
                text: "Select a date",
                emoji: true,
              },
              action_id: "meet_date_input",
            },
            label: {
              type: "plain_text",
              text: "Date and Time",
              emoji: true,
            },
          },
          {
            type: "actions",
            block_id: "meet_time",
            elements: [
              {
                type: "timepicker",
                placeholder: {
                  type: "plain_text",
                  text: "Start",
                  emoji: true,
                },
                action_id: "meet_start_time",
              },
              {
                type: "timepicker",
                placeholder: {
                  type: "plain_text",
                  text: "End",
                  emoji: true,
                },
                action_id: "meet_end_time",
              },
            ],
          },
          {
            type: "context",
            elements: [
              {
                type: "plain_text",
                text: "*Type or select",
                emoji: true,
              },
            ],
          },
          {
            type: "section",
            block_id: "requirements",
            text: {
              type: "mrkdwn",
              text: "Add room requirements:",
            },
            accessory: {
              type: "multi_static_select",
              placeholder: {
                type: "plain_text",
                text: "Select options",
                emoji: true,
              },
              options: roomAtt,
              action_id: "meet_req",
            },
          },
        ],
      },
    });
    await ack();
  } catch (error) {
    console.error(error);
  }
});

//UK meet group options
app.action("loc_select_UK_meet", async ({ ack, body, payload, client }) => {
  // console.log(payload.selected_option);
  groupOptions.length = 0;
  // console.log(UKLocData);
  // console.log(UKGroups);

  try {
    for (let l = 0; l < UKLocData.length; l++) {
      if (
        UKLocData[l].InternalId.toString() ===
        payload.selected_option.value.toString()
      ) {
        console.log("MATCH");
        // console.log(UKLocData[l].LocationGroupMappings);
        for (let n in UKLocData[l].LocationGroupMappings) {
          // console.log(UKLocData[l].LocationGroupMappings[n]);
          for (let d = 0; d < UKGroups.length; d++) {
            if (
              UKLocData[l].LocationGroupMappings[n].GroupId.toString() ===
              UKGroups[d].value.toString()
            ) {
              // console.log(UKGroups[d]);
              groupOptions.push(UKGroups[d]);
            }
          }
        }
      }
    }
    // console.log(groupOptions);

    const groups = await client.views.update({
      view_id: body.view.id,
      view: {
        type: "modal",
        callback_id: "con_meet_search",
        submit: {
          type: "plain_text",
          text: "Search",
          emoji: true,
        },
        close: {
          type: "plain_text",
          text: "Cancel",
          emoji: true,
        },
        title: {
          type: "plain_text",
          text: "Book Meeting Room",
          emoji: true,
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `:wave: Hi <@${submitter}>!\n\nPlease use the form below to find and book a meeting room on Condeco.`,
            },
          },
          {
            type: "divider",
          },
          {
            dispatch_action: true,
            type: "input",
            block_id: "meet_country",
            element: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              options: countryOptions,
              initial_option: {
                text: { type: "plain_text", text: "UK", emoji: true },
                value: "1",
              },
              action_id: "meet_country_input",
            },
            label: {
              type: "plain_text",
              text: "Country",
              emoji: true,
            },
          },
          {
            dispatch_action: true,
            type: "input",
            block_id: "meet_location",
            element: {
              type: "external_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              action_id: "loc_select_UK_meet",
              min_query_length: 0,
            },
            label: {
              type: "plain_text",
              text: "Location",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "meet_group",
            element: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              options: groupOptions,
              action_id: "group_input",
            },
            label: {
              type: "plain_text",
              text: "Group",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "meet_date",
            element: {
              type: "datepicker",
              initial_date: today,
              placeholder: {
                type: "plain_text",
                text: "Select a date",
                emoji: true,
              },
              action_id: "meet_date_input",
            },
            label: {
              type: "plain_text",
              text: "Date and Time",
              emoji: true,
            },
          },
          {
            type: "actions",
            block_id: "meet_time",
            elements: [
              {
                type: "timepicker",
                placeholder: {
                  type: "plain_text",
                  text: "Start",
                  emoji: true,
                },
                action_id: "meet_start_time",
              },
              {
                type: "timepicker",
                placeholder: {
                  type: "plain_text",
                  text: "End",
                  emoji: true,
                },
                action_id: "meet_end_time",
              },
            ],
          },
          {
            type: "context",
            elements: [
              {
                type: "plain_text",
                text: "*Type or select",
                emoji: true,
              },
            ],
          },
          {
            type: "section",
            block_id: "requirements",
            text: {
              type: "mrkdwn",
              text: "Add room requirements:",
            },
            accessory: {
              type: "multi_static_select",
              placeholder: {
                type: "plain_text",
                text: "Select options",
                emoji: true,
              },
              options: roomAtt,
              action_id: "meet_req",
            },
          },
        ],
      },
    });

    await ack();
  } catch (error) {
    console.error(error);
  }
});

//USA meet group options
app.action("loc_select_USA_meet", async ({ ack, body, payload, client }) => {
  // console.log(payload.selected_option);
  groupOptions.length = 0;
  // console.log(UKLocData);
  // console.log(UKGroups);

  try {
    for (let l = 0; l < USALocData.length; l++) {
      if (
        USALocData[l].InternalId.toString() ===
        payload.selected_option.value.toString()
      ) {
        console.log("MATCH");
        // console.log(UKLocData[l].LocationGroupMappings);
        for (let n in USALocData[l].LocationGroupMappings) {
          // console.log(UKLocData[l].LocationGroupMappings[n]);
          for (let d = 0; d < USAGroups.length; d++) {
            if (
              USALocData[l].LocationGroupMappings[n].GroupId.toString() ===
              USAGroups[d].value.toString()
            ) {
              // console.log(UKGroups[d]);
              groupOptions.push(USAGroups[d]);
            }
          }
        }
      }
    }
    console.log(groupOptions);

    const groups = await client.views.update({
      view_id: body.view.id,
      view: {
        type: "modal",
        callback_id: "con_meet_search",
        submit: {
          type: "plain_text",
          text: "Search",
          emoji: true,
        },
        close: {
          type: "plain_text",
          text: "Cancel",
          emoji: true,
        },
        title: {
          type: "plain_text",
          text: "Book Meeting Room",
          emoji: true,
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `:wave: Hi <@${submitter}>!\n\nPlease use the form below to find and book a meeting room on Condeco.`,
            },
          },
          {
            type: "divider",
          },
          {
            dispatch_action: true,
            type: "input",
            block_id: "meet_country",
            element: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              options: countryOptions,
              initial_option: {
                text: { type: "plain_text", text: "UK", emoji: true },
                value: "1",
              },
              action_id: "meet_country_input",
            },
            label: {
              type: "plain_text",
              text: "Country",
              emoji: true,
            },
          },
          {
            dispatch_action: true,
            type: "input",
            block_id: "meet_location",
            element: {
              type: "external_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              action_id: "loc_select_USA_meet",
              min_query_length: 0,
            },
            label: {
              type: "plain_text",
              text: "Location",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "meet_group",
            element: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              options: groupOptions,
              action_id: "group_input",
            },
            label: {
              type: "plain_text",
              text: "Group",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "meet_date",
            element: {
              type: "datepicker",
              initial_date: today,
              placeholder: {
                type: "plain_text",
                text: "Select a date",
                emoji: true,
              },
              action_id: "meet_date_input",
            },
            label: {
              type: "plain_text",
              text: "Date and Time",
              emoji: true,
            },
          },
          {
            type: "actions",
            block_id: "meet_time",
            elements: [
              {
                type: "timepicker",
                placeholder: {
                  type: "plain_text",
                  text: "Start",
                  emoji: true,
                },
                action_id: "meet_start_time",
              },
              {
                type: "timepicker",
                placeholder: {
                  type: "plain_text",
                  text: "End",
                  emoji: true,
                },
                action_id: "meet_end_time",
              },
            ],
          },
          {
            type: "context",
            elements: [
              {
                type: "plain_text",
                text: "*Type or select",
                emoji: true,
              },
            ],
          },
          {
            type: "section",
            block_id: "requirements",
            text: {
              type: "mrkdwn",
              text: "Add room requirements:",
            },
            accessory: {
              type: "multi_static_select",
              placeholder: {
                type: "plain_text",
                text: "Select options",
                emoji: true,
              },
              options: roomAtt,
              action_id: "meet_req",
            },
          },
        ],
      },
    });

    await ack();
  } catch (error) {
    console.error(error);
  }
});

///////////

//Desk Shortcut
app.shortcut("con_desk", async ({ ack, payload, body, client }) => {
  // Acknowledge the command request
  await ack();
  console.log("Desk triggered.");
  submitter = body.user.id;
  getUKLoc();
  getUSALoc();
  getUKGroups();
  getUSAGroups();

  try {
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        callback_id: "con_desk_search",
        submit: {
          type: "plain_text",
          text: "Search",
          emoji: true,
        },
        close: {
          type: "plain_text",
          text: "Cancel",
          emoji: true,
        },
        title: {
          type: "plain_text",
          text: "Book a Desk",
          emoji: true,
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `:wave: Hi <@${submitter}>!\n\nPlease use the form below to find and book a desk on Condeco.`,
            },
          },
          {
            type: "divider",
          },
          {
            dispatch_action: true,
            type: "input",
            block_id: "desk_country",
            element: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              options: countryOptions,
              initial_option: {
                text: { type: "plain_text", text: "UK", emoji: true },
                value: "1",
              },
              action_id: "desk_country_input",
            },
            label: {
              type: "plain_text",
              text: "Country",
              emoji: true,
            },
          },
          {
            dispatch_action: true,
            type: "input",
            block_id: "desk_location",
            element: {
              type: "external_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              action_id: "loc_select_UK",
              min_query_length: 0,
            },
            label: {
              type: "plain_text",
              text: "Location",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "desk_group",
            element: {
              type: "external_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              action_id: "group_input",
              min_query_length: 0,
            },
            label: {
              type: "plain_text",
              text: "Group",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "desk_date",
            element: {
              type: "datepicker",
              initial_date: today,
              placeholder: {
                type: "plain_text",
                text: "Select a date",
                emoji: true,
              },
              action_id: "desk_date",
            },
            label: {
              type: "plain_text",
              text: "Date",
              emoji: true,
            },
          },
        ],
      },
    });
    // console.log(result);
  } catch (error) {
    console.error(error);
  }
});

//Desk search results
app.view("con_desk_search", async ({ ack, body, payload, client }) => {
  // console.log(body.view.state.values);
  let slackEmail = "";
  let userEmail = "";
  let userId = "";
  let deskLocation = "";
  let locName = "";
  if ("loc_select_UK" in body.view.state.values.desk_location) {
    console.log("UK Desk");
    deskLocation =
      body.view.state.values.desk_location.loc_select_UK.selected_option.value;
    locName =
      body.view.state.values.desk_location.loc_select_UK.selected_option.text
        .text;
  } else {
    console.log("USA Desk");
    deskLocation =
      body.view.state.values.desk_location.loc_select_USA.selected_option.value;
    locName =
      body.view.state.values.desk_location.loc_select_USA.selected_option.text
        .text;
  }
  let dataPass = {
    loc: locName,
    date: body.view.state.values.desk_date.desk_date.selected_date,
    userId: userId,
  };

  try {
    //update token
    const token = await updateToken();
    deskOptions.length = 0;

    //Get submitter info
    const getEmail = await client.users.profile
      .get({
        user: body.user.id,
      })
      .then((res) => (slackEmail = res.profile.email));
    // console.log(slackEmail);

    //Get user data from Condeco

    const getConUser = await fetch(
      `https://integrationapi.condecosoftware.com/Next_Fifteen_Communications_Group_PLC/api/V1/users?emailId=${slackEmail}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + CON_SESS_TOKEN,
          "Ocp-Apim-Subscription-Key": process.env.CON_MAP_TOKEN,
        },
      }
    )
      .then((res) => res.json())
      .then((json) => {
        // console.log(json);
        userEmail = json.Data[0].Email;
        userId = json.Data[0].InternalId;
      });
    // console.log("LOOK HERE");
    // console.log(userEmail);
    // console.log(userId);
    // console.log(deskLocation);
    // console.log(body.view.state.values.desk_group.group_input.selected_option.value);

    //get desk availability

    const deskFetch = await fetch(
      `https://integrationapi.condecosoftware.com/Next_Fifteen_Communications_Group_PLC/api/V1/deskBookings/availableDesks`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + CON_SESS_TOKEN,
          "Ocp-Apim-Subscription-Key": process.env.CON_BOOK_TOKEN,
        },
        body: JSON.stringify({
          userID: userId,
          locationID: deskLocation,
          groupID:
            body.view.state.values.desk_group.group_input.selected_option.value,
          workSpaceTypeId: 2,
          dateList: [
            {
              date: body.view.state.values.desk_date.desk_date.selected_date,
              bookingType: 2,
            },
          ],
          pageNumber: 0,
          pageSize: 0,
        }),
      }
    )
      .then((res) => res.json())
      .then((json) => {
        // console.log(json.availableDesks[0].deskAttributes);
        for (let i in json.availableDesks) {
          deskOptions.push(
            optionFactory(
              json.availableDesks[i].deskName,
              json.availableDesks[i].deskID
            )
          );
        }
      });

    let dataPass = {
      loc: locName,
      date: body.view.state.values.desk_date.desk_date.selected_date,
      userId: userId,
    };

    //update modal
    if (deskOptions.length !== 0) {
      await ack({
        response_action: "update",
        view: {
          type: "modal",
          callback_id: "con_desk_confirm",
          private_metadata: JSON.stringify(dataPass),
          submit: {
            type: "plain_text",
            text: "Select",
            emoji: true,
          },
          close: {
            type: "plain_text",
            text: "Cancel",
            emoji: true,
          },
          title: {
            type: "plain_text",
            text: "Book a Desk",
            emoji: true,
          },
          blocks: [
            {
              type: "input",
              block_id: "desk_results",
              element: {
                type: "external_select",
                placeholder: {
                  type: "plain_text",
                  text: "Select an item",
                  emoji: true,
                },
                action_id: "desk_results_input",
                min_query_length: 0,
              },
              label: {
                type: "plain_text",
                text: "Select a desk:",
                emoji: true,
              },
            },
          ],
        },
      });
    } else {
      await ack({
        response_action: "push",
        view: {
          type: "modal",
          callback_id: "con_desk_none",
          close: {
            type: "plain_text",
            text: "Back",
            emoji: true,
          },
          title: {
            type: "plain_text",
            text: "Book a Desk",
            emoji: true,
          },
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `Sorry there are no available desks for this search :weary:`,
              },
            },
          ],
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
});

//confirm desk
app.view("con_desk_confirm", async ({ ack, body, payload, client }) => {
  // console.log(payload.state.values);
  let deskName =
    body.view.state.values.desk_results.desk_results_input.selected_option.text
      .text;
  let deskId =
    payload.state.values.desk_results.desk_results_input.selected_option.value;
  let pass = JSON.parse(body.view.private_metadata);
  // console.log(pass);
  let dataPass2 = {
    userId: pass.userId,
    deskId: deskId,
    date: pass.date,
    deskName: deskName,
    deskLoc: pass.loc,
    date: pass.date
  };

  try {
    await ack({
      response_action: "update",
      view: {
        callback_id: "con_desk_book",
        private_metadata: JSON.stringify(dataPass2),
        submit: {
          type: "plain_text",
          text: "Book",
          emoji: true,
        },
        close: {
          type: "plain_text",
          text: "Cancel",
          emoji: true,
        },
        type: "modal",
        title: {
          type: "plain_text",
          text: "Book a Desk",
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Would you like to book this desk?",
            },
          },
          {
            type: "divider",
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Desk:* ${deskName}\n*Building:* ${pass.loc} \n*Date:* ${pass.date}`,
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error(error);
  }
});

//Submit desk booking
app.view("con_desk_book", async ({ ack, body, payload, client }) => {
  console.log(body.user.id);
  let pass2 = JSON.parse(body.view.private_metadata);
  let status = 0;
  console.log(pass2);

  try {
    const bookDesk = await fetch(
      `https://integrationapi.condecosoftware.com/Next_Fifteen_Communications_Group_PLC/api/V1/deskBookings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + CON_SESS_TOKEN,
          "Ocp-Apim-Subscription-Key": process.env.CON_BOOK_TOKEN,
        },
        body: JSON.stringify({
          userId: pass2.userId,
          deskId: pass2.deskId,
          bookingSource: 1,
          dateList: [
            {
              date: pass2.date,
              bookingType: 2,
            },
          ],
        }),
      }
    ).then((res) => {
      // console.log(res);
      status = res.status
       });

    if (status === 201) {
      await ack({
        response_action: "update",
        view: {
          callback_id: "con_desk_book",
          close: {
            type: "plain_text",
            text: "Close",
            emoji: true,
          },
          type: "modal",
          title: {
            type: "plain_text",
            text: "Book a Desk",
          },
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "Your desk is booked :thumbsup:",
              },
            },
          ],
        },
      });
      
      //notify user
      await client.chat.postMessage({
        channel: body.user.id,
        blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `You desk has been booked on <https://next15.condecosoftware.com/|Condeco> :thumbsup:\n\n*Desk:* ${pass2.deskName}\n*Building:* ${pass2.deskLoc} \n*Date:* ${pass2.date}`,
              },
            },
          ],
        text: "Message from Condeco-Bot"
      });
      
      
    } else {
      await ack({
        response_action: "update",
        view: {
          type: "modal",
          title: {
            type: "plain_text",
            text: "Book Meeting Room",
            emoji: true,
          },
          close: {
            type: "plain_text",
            text: "Close",
            emoji: true,
          },
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `Something went wrong :weary:\nPlease try again.`,
              },
            },
          ],
        },
      });
    };
    
    
    
  } catch (error) {
    console.error(error);
  }
});

//change desk country
app.action("desk_country_input", async ({ ack, body, client, payload }) => {
  // console.log(payload);
  let newOptions = "";
  groupOptions.length = 0;

  try {
    if (payload.selected_option.value === "5") {
      newOptions = "loc_select_USA";
    } else {
      newOptions = "loc_select_UK";
    }
    console.log(newOptions);

    const desk = await client.views.update({
      view_id: body.view.id,
      // hash: body.view.hash,
      view: {
        type: "modal",
        callback_id: "con_desk_search",
        submit: {
          type: "plain_text",
          text: "Search",
          emoji: true,
        },
        close: {
          type: "plain_text",
          text: "Cancel",
          emoji: true,
        },
        title: {
          type: "plain_text",
          text: "Book a Desk",
          emoji: true,
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `:wave: Hi <@${submitter}>!\n\nPlease use the form below to find and book a desk on Condeco.`,
            },
          },
          {
            type: "divider",
          },
          {
            dispatch_action: true,
            type: "input",
            block_id: "desk_country",
            element: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              options: countryOptions,
              action_id: "desk_country_input",
            },
            label: {
              type: "plain_text",
              text: "Country",
              emoji: true,
            },
          },
          {
            dispatch_action: true,
            type: "input",
            block_id: "desk_location",
            element: {
              type: "external_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              action_id: newOptions,
              min_query_length: 0,
            },
            label: {
              type: "plain_text",
              text: "Location",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "desk_group",
            element: {
              type: "external_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              action_id: "group_input",
              min_query_length: 0,
            },
            label: {
              type: "plain_text",
              text: "Group",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "desk_date",
            element: {
              type: "datepicker",
              initial_date: today,
              placeholder: {
                type: "plain_text",
                text: "Select a date",
                emoji: true,
              },
              action_id: "desk_date",
            },
            label: {
              type: "plain_text",
              text: "Date",
              emoji: true,
            },
          },
        ],
      },
    });
    console.log(desk);

    await ack();
  } catch (error) {
    console.error(error);
  }
});

//UK desk group options
app.action("loc_select_UK", async ({ ack, body, payload, client }) => {
  // console.log(payload.selected_option);
  groupOptions.length = 0;
  // console.log(UKLocData);
  // console.log(UKGroups);

  try {
    for (let l = 0; l < UKLocData.length; l++) {
      if (
        UKLocData[l].InternalId.toString() ===
        payload.selected_option.value.toString()
      ) {
        console.log("MATCH");
        // console.log(UKLocData[l].LocationGroupMappings);
        for (let n in UKLocData[l].LocationGroupMappings) {
          // console.log(UKLocData[l].LocationGroupMappings[n]);
          for (let d = 0; d < UKGroups.length; d++) {
            if (
              UKLocData[l].LocationGroupMappings[n].GroupId.toString() ===
              UKGroups[d].value.toString()
            ) {
              // console.log(UKGroups[d]);
              groupOptions.push(UKGroups[d]);
            }
          }
        }
      }
    }

    const visit = await client.views.update({
      view_id: body.view.id,
      view: {
        type: "modal",
        callback_id: "con_desk_search",
        submit: {
          type: "plain_text",
          text: "Search",
          emoji: true,
        },
        close: {
          type: "plain_text",
          text: "Cancel",
          emoji: true,
        },
        title: {
          type: "plain_text",
          text: "Book a Desk",
          emoji: true,
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `:wave: Hi <@${submitter}>!\n\nPlease use the form below to find and book a desk on Condeco.`,
            },
          },
          {
            type: "divider",
          },
          {
            dispatch_action: true,
            type: "input",
            block_id: "desk_country",
            element: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              options: countryOptions,
              initial_option: {
                text: { type: "plain_text", text: "UK", emoji: true },
                value: "1",
              },
              action_id: "desk_country_input",
            },
            label: {
              type: "plain_text",
              text: "Country",
              emoji: true,
            },
          },
          {
            dispatch_action: true,
            type: "input",
            block_id: "desk_location",
            element: {
              type: "external_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              action_id: "loc_select_UK",
              min_query_length: 0,
            },
            label: {
              type: "plain_text",
              text: "Location",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "desk_group",
            element: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              options: groupOptions,
              action_id: "group_input",
            },
            label: {
              type: "plain_text",
              text: "Group",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "desk_date",
            element: {
              type: "datepicker",
              initial_date: today,
              placeholder: {
                type: "plain_text",
                text: "Select a date",
                emoji: true,
              },
              action_id: "desk_date",
            },
            label: {
              type: "plain_text",
              text: "Date",
              emoji: true,
            },
          },
        ],
      },
    });

    await ack();
  } catch (error) {
    console.error(error);
  }
});

//USA desk group options
app.action("loc_select_USA", async ({ ack, body, payload, client }) => {
  // console.log(payload.selected_option);
  groupOptions.length = 0;
  // console.log(UKLocData);
  // console.log(UKGroups);

  try {
    for (let l = 0; l < USALocData.length; l++) {
      if (
        USALocData[l].InternalId.toString() ===
        payload.selected_option.value.toString()
      ) {
        console.log("MATCH");
        // console.log(UKLocData[l].LocationGroupMappings);
        for (let n in USALocData[l].LocationGroupMappings) {
          // console.log(UKLocData[l].LocationGroupMappings[n]);
          for (let d = 0; d < USAGroups.length; d++) {
            if (
              USALocData[l].LocationGroupMappings[n].GroupId.toString() ===
              USAGroups[d].value.toString()
            ) {
              // console.log(UKGroups[d]);
              groupOptions.push(USAGroups[d]);
            }
          }
        }
      }
    }
    // console.log(groupOptions);

    const visit = await client.views.update({
      view_id: body.view.id,
      view: {
        type: "modal",
        callback_id: "con_desk_search",
        submit: {
          type: "plain_text",
          text: "Search",
          emoji: true,
        },
        close: {
          type: "plain_text",
          text: "Cancel",
          emoji: true,
        },
        title: {
          type: "plain_text",
          text: "Book a Desk",
          emoji: true,
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `:wave: Hi <@${submitter}>!\n\nPlease use the form below to find and book a desk on Condeco.`,
            },
          },
          {
            type: "divider",
          },
          {
            dispatch_action: true,
            type: "input",
            block_id: "desk_country",
            element: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              options: countryOptions,
              initial_option: {
                text: { type: "plain_text", text: "UK", emoji: true },
                value: "1",
              },
              action_id: "desk_country_input",
            },
            label: {
              type: "plain_text",
              text: "Country",
              emoji: true,
            },
          },
          {
            dispatch_action: true,
            type: "input",
            block_id: "desk_location",
            element: {
              type: "external_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              action_id: "loc_select_USA",
              min_query_length: 0,
            },
            label: {
              type: "plain_text",
              text: "Location",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "desk_group",
            element: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              options: groupOptions,
              action_id: "group_input",
            },
            label: {
              type: "plain_text",
              text: "Group",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "desk_date",
            element: {
              type: "datepicker",
              initial_date: today,
              placeholder: {
                type: "plain_text",
                text: "Select a date",
                emoji: true,
              },
              action_id: "desk_date",
            },
            label: {
              type: "plain_text",
              text: "Date",
              emoji: true,
            },
          },
        ],
      },
    });

    await ack();
  } catch (error) {
    console.error(error);
  }
});

//desk search results
app.options("desk_results_input", async ({ ack, body, payload, client }) => {
  await ack({
    options: deskOptions,
  });
});

///////////

//Visitor Shortcut
app.shortcut("con_visitor", async ({ ack, payload, body, client }) => {
  await ack();
  console.log("Visitor triggered.");
  submitter = body.user.id;
  getUKLoc();
  getUSALoc();

  try {
    // Call views.open with the built-in client
    const visit = await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        callback_id: "con_book_visitor",
        submit: {
          type: "plain_text",
          text: "Submit",
          emoji: true,
        },
        close: {
          type: "plain_text",
          text: "Cancel",
          emoji: true,
        },
        title: {
          type: "plain_text",
          text: "Register Visitor",
          emoji: true,
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `:wave: Hi <@${submitter}>!\n\nPlease use the form below to register a visitor on Condeco.`,
            },
          },
          {
            type: "divider",
          },
          {
            type: "input",
            block_id: "vis_first_name",
            element: {
              type: "plain_text_input",
              action_id: "vis_first_input",
            },
            label: {
              type: "plain_text",
              text: "Visitor First Name",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "vis_last_name",
            element: {
              type: "plain_text_input",
              action_id: "vis_last_input",
            },
            label: {
              type: "plain_text",
              text: "Visitor Last Name",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "com_name",
            element: {
              type: "plain_text_input",
              action_id: "com_name_input",
            },
            label: {
              type: "plain_text",
              text: "Visitor Company",
              emoji: true,
            },
          },
          {
            dispatch_action: true,
            type: "input",
            block_id: "country",
            element: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "Select an country",
                emoji: true,
              },
              options: countryOptions,
              initial_option: {
                text: { type: "plain_text", text: "UK", emoji: true },
                value: "1",
              },
              action_id: "country_select",
            },
            label: {
              type: "plain_text",
              text: "Office Country",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "location",
            element: {
              type: "external_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              action_id: "loc_select_UK",
              min_query_length: 0,
            },
            label: {
              type: "plain_text",
              text: "Office Location",
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Arrival Date and Time*",
            },
          },
          {
            type: "actions",
            block_id: "date_time",
            elements: [
              {
                type: "datepicker",
                initial_date: today,
                placeholder: {
                  type: "plain_text",
                  text: "Select a date",
                  emoji: true,
                },
                action_id: "arrival_date",
              },
              {
                type: "timepicker",
                placeholder: {
                  type: "plain_text",
                  text: "Type or select",
                  emoji: true,
                },
                action_id: "arrival_time",
              },
            ],
          },
        ],
      },
    });
    // console.log(visit);
  } catch (error) {
    console.error(error);
  }
});

//change visitor country
app.action("country_select", async ({ ack, body, client, payload }) => {
  // console.log(payload);
  // console.log(
  //   body.view.state.values.country.country_select.selected_option.value
  // );
  let newOptions = "";

  try {
    if (
      body.view.state.values.country.country_select.selected_option.value ===
      "5"
    ) {
      newOptions = "loc_select_USA";
    } else {
      newOptions = "loc_select_UK";
    }
    console.log(newOptions);

    const visit = await client.views.update({
      view_id: body.view.id,
      view: {
        type: "modal",
        callback_id: "con_book_visitor",
        submit: {
          type: "plain_text",
          text: "Submit",
          emoji: true,
        },
        close: {
          type: "plain_text",
          text: "Cancel",
          emoji: true,
        },
        title: {
          type: "plain_text",
          text: "Register Visitor",
          emoji: true,
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `:wave: Hi <@${submitter}>!\n\nPlease use the form below to register a visitor on Condeco.`,
            },
          },
          {
            type: "divider",
          },
          {
            type: "input",
            block_id: "vis_first_name",
            element: {
              type: "plain_text_input",
              action_id: "vis_first_input",
            },
            label: {
              type: "plain_text",
              text: "Visitor First Name",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "vis_last_name",
            element: {
              type: "plain_text_input",
              action_id: "vis_last_input",
            },
            label: {
              type: "plain_text",
              text: "Visitor Last Name",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "com_name",
            element: {
              type: "plain_text_input",
              action_id: "com_name_input",
            },
            label: {
              type: "plain_text",
              text: "Visitor Company",
              emoji: true,
            },
          },
          {
            dispatch_action: true,
            type: "input",
            block_id: "country",
            element: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "Select an country",
                emoji: true,
              },
              options: countryOptions,
              action_id: "country_select",
            },
            label: {
              type: "plain_text",
              text: "Office Country",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "location",
            element: {
              type: "external_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              action_id: newOptions,
              min_query_length: 0,
            },
            label: {
              type: "plain_text",
              text: "Office Location",
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Arrival Date and Time*",
            },
          },
          {
            type: "actions",
            block_id: "date_time",
            elements: [
              {
                type: "datepicker",
                initial_date: today,
                placeholder: {
                  type: "plain_text",
                  text: "Select a date",
                  emoji: true,
                },
                action_id: "arrival_date",
              },
              {
                type: "timepicker",
                placeholder: {
                  type: "plain_text",
                  text: "Type or select",
                  emoji: true,
                },
                action_id: "arrival_time",
              },
            ],
          },
        ],
      },
    });
    // console.log(visit);
    await ack();
  } catch (error) {
    console.error(error);
  }
});

//UK external location options
app.options("loc_select_UK", async ({ ack, body, payload, client }) => {
  // await getUKLoc();
  await ack({
    options: UKlocOptions,
  });
});

//USA external location options
app.options("loc_select_USA", async ({ ack, body, payload, client }) => {
  // await getUSALoc();
  await ack({
    options: USAlocOptions,
  });
});

//UK external location meet options
app.options("loc_select_UK_meet", async ({ ack, body, payload, client }) => {
  // await getUKLoc();
  await ack({
    options: UKlocOptions,
  });
});

//USA external location meet options
app.options("loc_select_USA_meet", async ({ ack, body, payload, client }) => {
  // await getUSALoc();
  await ack({
    options: USAlocOptions,
  });
});

//Submit visitor
app.view("con_book_visitor", async ({ ack, body, payload, client }) => {
  console.log(payload.state.values.date_time.arrival_time.selected_time);
  let slackEmail = "";
  let userEmail = "";
  let userId = "";
  let status = 0;
  let location = "";
  if (payload.state.values.country.country_select.selected_option.text.text === "UK") {
    location = payload.state.values.location.loc_select_UK.selected_option.value;
  } else if (payload.state.values.country.country_select.selected_option.text.text === "USA") {
    location = payload.state.values.location.loc_select_USA.selected_option.value;
  };

  try {
    const token = await updateToken();
    // console.log(CON_SESS_TOKEN);

    //Get submitter info
    const getEmail = await client.users.profile
      .get({
        user: body.user.id,
      })
      .then((res) => (slackEmail = res.profile.email));
    // console.log(slackEmail);

    //Get user data from Condeco

    const getConUser = await fetch(
      `https://integrationapi.condecosoftware.com/Next_Fifteen_Communications_Group_PLC/api/V1/users?emailId=${slackEmail}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + CON_SESS_TOKEN,
          "Ocp-Apim-Subscription-Key": process.env.CON_MAP_TOKEN,
        },
      }
    )
      .then((res) => res.json())
      .then((json) => {
        // console.log(json);
        userEmail = json.Data[0].Email;
        userId = json.Data[0].InternalId;
      });
    // console.log(userEmail);
    // console.log(userId);

    //Submit visitor
    const submitVisitor = await fetch(
      `https://integrationapi.condecosoftware.com/Next_Fifteen_Communications_Group_PLC/api/V1/visitor`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + CON_SESS_TOKEN,
          "Ocp-Apim-Subscription-Key": process.env.CON_VIS_TOKEN,
        },
        body: JSON.stringify({
          firstName: payload.state.values.vis_first_name.vis_first_input.value,
          lastName: payload.state.values.vis_last_name.vis_last_input.value,
          visitorCompany: payload.state.values.com_name.com_name_input.value,
          hostData: {
            hostId: userId,
            hostEmailAddress: userEmail,
          },
          locationId: location,
          arrivalDate:
            `${payload.state.values.date_time.arrival_date.selected_date}` +
            " " +
            `${payload.state.values.date_time.arrival_time.selected_time}`,
          passType: 2,
          notifyByEmail: true,
          purposeOfVisit: 2,
          floorNumber: 0,
        }),
      }
    ).then((res) => {
      console.log(res);
      status = res.status
                    });

    if (status === 201) {
      await ack({
        response_action: "update",
        view: {
          type: "modal",
          title: {
            type: "plain_text",
            text: "Register Visitor",
            emoji: true,
          },
          close: {
            type: "plain_text",
            text: "Close",
            emoji: true,
          },
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "Visitor booked successfully :partying_face:",
              },
            },
          ],
        },
      });
      
      //notify host
      await client.chat.postMessage({
        channel: body.user.id,
        blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `Your visitor has been booked on <https://next15.condecosoftware.com/|Condeco> :thumbsup:\n\n*Name:* ${payload.state.values.vis_first_name.vis_first_input.value + " " + payload.state.values.vis_last_name.vis_last_input.value}\n*Company:* ${payload.state.values.com_name.com_name_input.value}\n*Arrival:* ${moment(payload.state.values.date_time.arrival_date.selected_date).format('dddd, MMMM Do YYYY') + " - " + payload.state.values.date_time.arrival_time.selected_time}`,
              },
            },
          ],
        test: "Message from Condeco-Bot"
      });
      
    } else {
      await ack({
        response_action: "update",
        view: {
          type: "modal",
          title: {
            type: "plain_text",
            text: "Register Visitor",
            emoji: true,
          },
          close: {
            type: "plain_text",
            text: "Close",
            emoji: true,
          },
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `Something went wrong :weary:\nPlease try again.`,
              },
            },
          ],
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
});

//Ack visitor date input
app.action("arrival_date", async ({ ack, body, client, payload }) => {
  await ack();
});
//Ack visitor time input
app.action("arrival_time", async ({ ack, body, client, payload }) => {
  await ack();
});

///////////////

//Home Tab
app.event("app_home_opened", async ({ event, client, context }) => {
  try {
    const result = await client.views.publish({
      user_id: event.user,
      view: {
        type: "home",
        callback_id: "home_view",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Condeco-Bot* by <@U02P0L4HM3M>",
            },
          },
          {
            type: "divider",
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Hello :wave:,\n\nI'm the helpful *Condeco-Bot*.\n\nHow can I help?\n",
            },
          },
          // {
          //   type: "actions",
          //   elements: [
          //     {
          //       type: "button",
          //       text: {
          //         type: "plain_text",
          //         emoji: true,
          //         text: "Fetch",
          //       },
          //       style: "primary",
          //       value: "con_click_fetch",
          //       action_id: "con_fetch",
          //     },
          //   ],
          // },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  emoji: true,
                  text: "Book Meeting Room",
                },
                style: "primary",
                value: "con_meet_home",
                action_id: "con_meet_button",
              },
            ],
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  emoji: true,
                  text: "Book Desk",
                },
                style: "primary",
                value: "con_desk_home",
                action_id: "con_desk_button",
              },
            ],
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  emoji: true,
                  text: "Register Visitor",
                },
                style: "primary",
                value: "con_vis_home",
                action_id: "con_vis_button",
              },
            ],
          },
        ],
      },
    });
  } catch (error) {
    console.error(error);
  }
});

//Meeting Room home button
app.action("con_meet_button", async ({ ack, payload, body, client }) => {
  // Acknowledge the command request
  await ack();
  console.log("Meeting room triggered.");
  submitter = body.user.id;
  getUKLoc();
  getUSALoc();
  getUKGroups();
  getUSAGroups();

  try {
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        callback_id: "con_meet_search",
        submit: {
          type: "plain_text",
          text: "Search",
          emoji: true,
        },
        close: {
          type: "plain_text",
          text: "Cancel",
          emoji: true,
        },
        title: {
          type: "plain_text",
          text: "Book Meeting Room",
          emoji: true,
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `:wave: Hi <@${submitter}>!\n\nPlease use the form below to find and book a meeting room on Condeco.`,
            },
          },
          {
            type: "divider",
          },
          {
            dispatch_action: true,
            type: "input",
            block_id: "meet_country",
            element: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              options: countryOptions,
              initial_option: {
                text: { type: "plain_text", text: "UK", emoji: true },
                value: "1",
              },
              action_id: "meet_country_input",
            },
            label: {
              type: "plain_text",
              text: "Country",
              emoji: true,
            },
          },
          {
            dispatch_action: true,
            type: "input",
            block_id: "meet_location",
            element: {
              type: "external_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              action_id: "loc_select_UK_meet",
              min_query_length: 0,
            },
            label: {
              type: "plain_text",
              text: "Location",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "meet_group",
            element: {
              type: "external_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              action_id: "group_input",
              min_query_length: 0,
            },
            label: {
              type: "plain_text",
              text: "Group",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "meet_date",
            element: {
              type: "datepicker",
              initial_date: today,
              placeholder: {
                type: "plain_text",
                text: "Select a date",
                emoji: true,
              },
              action_id: "meet_date_input",
            },
            label: {
              type: "plain_text",
              text: "Date and Time",
              emoji: true,
            },
          },
          {
            type: "actions",
            block_id: "meet_time",
            elements: [
              {
                type: "timepicker",
                placeholder: {
                  type: "plain_text",
                  text: "Start",
                  emoji: true,
                },
                action_id: "meet_start_time",
              },
              {
                type: "timepicker",
                placeholder: {
                  type: "plain_text",
                  text: "End",
                  emoji: true,
                },
                action_id: "meet_end_time",
              },
            ],
          },
          {
            type: "context",
            elements: [
              {
                type: "plain_text",
                text: "*Type or select",
                emoji: true,
              },
            ],
          },
          {
            type: "section",
            block_id: "requirements",
            text: {
              type: "mrkdwn",
              text: "Add room requirements:",
            },
            accessory: {
              type: "multi_static_select",
              placeholder: {
                type: "plain_text",
                text: "Select options",
                emoji: true,
              },
              options: roomAtt,
              action_id: "meet_req",
            },
          },
        ],
      },
    });
    // console.log(result);
  } catch (error) {
    console.error(error);
  }
});

//Desk home button
app.action("con_desk_button", async ({ ack, payload, body, client }) => {
  await ack();
  console.log("Desk triggered.");
  submitter = body.user.id;
  getUKLoc();
  getUSALoc();
  getUKGroups();
  getUSAGroups();

  try {
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        callback_id: "con_desk_search",
        submit: {
          type: "plain_text",
          text: "Search",
          emoji: true,
        },
        close: {
          type: "plain_text",
          text: "Cancel",
          emoji: true,
        },
        title: {
          type: "plain_text",
          text: "Book a Desk",
          emoji: true,
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `:wave: Hi <@${submitter}>!\n\nPlease use the form below to find and book a desk on Condeco.`,
            },
          },
          {
            type: "divider",
          },
          {
            dispatch_action: true,
            type: "input",
            block_id: "desk_country",
            element: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              options: countryOptions,
              initial_option: {
                text: { type: "plain_text", text: "UK", emoji: true },
                value: "1",
              },
              action_id: "desk_country_input",
            },
            label: {
              type: "plain_text",
              text: "Country",
              emoji: true,
            },
          },
          {
            dispatch_action: true,
            type: "input",
            block_id: "desk_location",
            element: {
              type: "external_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              action_id: "loc_select_UK",
              min_query_length: 0,
            },
            label: {
              type: "plain_text",
              text: "Location",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "desk_group",
            element: {
              type: "external_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              action_id: "group_input",
              min_query_length: 0,
            },
            label: {
              type: "plain_text",
              text: "Group",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "desk_date",
            element: {
              type: "datepicker",
              initial_date: today,
              placeholder: {
                type: "plain_text",
                text: "Select a date",
                emoji: true,
              },
              action_id: "desk_date",
            },
            label: {
              type: "plain_text",
              text: "Date",
              emoji: true,
            },
          },
        ],
      },
    });
    // console.log(result);
  } catch (error) {
    console.error(error);
  }
});

//Visitor Shortcut
app.action("con_vis_button", async ({ ack, payload, body, client }) => {
  await ack();
  console.log("Visitor triggered.");
  submitter = body.user.id;
  getUKLoc();
  getUSALoc();

  try {
    const visit = await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        callback_id: "con_book_visitor",
        submit: {
          type: "plain_text",
          text: "Submit",
          emoji: true,
        },
        close: {
          type: "plain_text",
          text: "Cancel",
          emoji: true,
        },
        title: {
          type: "plain_text",
          text: "Register Visitor",
          emoji: true,
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `:wave: Hi <@${submitter}>!\n\nPlease use the form below to register a visitor on Condeco.`,
            },
          },
          {
            type: "divider",
          },
          {
            type: "input",
            block_id: "vis_first_name",
            element: {
              type: "plain_text_input",
              action_id: "vis_first_input",
            },
            label: {
              type: "plain_text",
              text: "Visitor First Name",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "vis_last_name",
            element: {
              type: "plain_text_input",
              action_id: "vis_last_input",
            },
            label: {
              type: "plain_text",
              text: "Visitor Last Name",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "com_name",
            element: {
              type: "plain_text_input",
              action_id: "com_name_input",
            },
            label: {
              type: "plain_text",
              text: "Visitor Company",
              emoji: true,
            },
          },
          {
            dispatch_action: true,
            type: "input",
            block_id: "country",
            element: {
              type: "static_select",
              placeholder: {
                type: "plain_text",
                text: "Select an country",
                emoji: true,
              },
              options: countryOptions,
              initial_option: {
                text: { type: "plain_text", text: "UK", emoji: true },
                value: "1",
              },
              action_id: "country_select",
            },
            label: {
              type: "plain_text",
              text: "Office Country",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "location",
            element: {
              type: "external_select",
              placeholder: {
                type: "plain_text",
                text: "Select an item",
                emoji: true,
              },
              action_id: "loc_select_UK",
              min_query_length: 0,
            },
            label: {
              type: "plain_text",
              text: "Office Location",
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Arrival Date and Time*",
            },
          },
          {
            type: "actions",
            block_id: "date_time",
            elements: [
              {
                type: "datepicker",
                initial_date: today,
                placeholder: {
                  type: "plain_text",
                  text: "Select a date",
                  emoji: true,
                },
                action_id: "arrival_date",
              },
              {
                type: "timepicker",
                placeholder: {
                  type: "plain_text",
                  text: "Type or select",
                  emoji: true,
                },
                action_id: "arrival_time",
              },
            ],
          },
        ],
      },
    });
    // console.log(visit);
  } catch (error) {
    console.error(error);
  }
});

//////////////////////////////

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
