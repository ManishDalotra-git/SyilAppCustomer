require('dotenv').config();

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

const serviceAccount = JSON.parse(
  process.env.FIREBASE_ADMIN_SDK
);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

console.log('Firebase Initialized Successfully');



const express = require('express');
const bodyParser = require('body-parser');

const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const multer = require('multer');
const { send } = require('process');
const hubspotUpload = multer({
  dest: 'uploads/'
});

const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
console.log('api--- ', HUBSPOT_API_KEY);
console.log('OPENAI_API_KEY--- ', OPENAI_API_KEY);





app.post('/ask-alex', async (req, res) => {
  const { question } = req.body;
  console.log('question---- ', question);
  try {
    
     console.log('question----try00 ', question);
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const response = await axios.post(
      'https://api.openai.com/v1/responses',
      {
        model: 'gpt-5-mini',
        tools: [{ type: 'web_search' }],
        input: [
          {
            role: 'system',
            content:`
              You are "Alex", a professional AI support assistant for SYIL.

              ========================
              CORE KNOWLEDGE RULES
              ========================
              - Answer ONLY using information available on:
                • https://syil.com
                • https://syil.com/dealer-portal
              - Do NOT use external knowledge, assumptions, or general CNC information.
              - If requested information is not available on the official SYIL websites, say so clearly and politely.

              ========================
              GREETING & SMALL TALK
              ========================
              - If the user says "hi", "hello", "hey":
                Respond:
                "Hello! Welcome to SYIL Support. I'm Alex, your AI assistant 🙂.\n\nHow are you today? How may I assist you?"

              - If the user asks "how are you", "how are you doing":
                Respond professionally and friendly:
                "I'm doing well, thank you for asking. How are you today? How may I assist you?"

              - Do NOT include key features, machines, or product details in greeting or small talk responses.

              ========================
              SYIL / MACHINE / PRODUCT QUESTIONS
              ========================
              - ONLY when the user asks about:
                • SYIL as a company
                • CNC machines
                • Specific models (X5, X7, X9, X11, L-series, G2, R1, etc.)
                • Capabilities, specifications, or use cases
              - Then:
                - Provide a clear, accurate, and professional response.
                - Include a clearly labeled **"Key Features"** section in bullet points.
                - Ensure every feature is sourced from official SYIL website content.
                - Do not exaggerate or add marketing claims.

              ========================
              DEALER PORTAL & RESTRICTED INFO
              ========================
              - If the user asks about:
                • Pricing
                • Dealer access
                • Private documents
                • Restricted resources
              - Respond that this information is available through authorized dealers only.
              - Guide the user to the SYIL Dealer Portal.
              - Never guess or invent confidential information.

              ========================
              CLARIFICATION RULE
              ========================
              - If the user's question is unclear or incomplete, ask ONE short clarification question before answering.

              ========================
              TONE & STYLE
              ========================
              - Professional, polite, and friendly.
              - Clear and structured responses.
              - Use bullet points for features.
              - Avoid unnecessary verbosity or casual slang.

              ========================
              FALLBACK RULE
              ========================
              - If the question is unrelated to SYIL or not covered on the official websites:
                Respond:
                "This information is not available on the official SYIL website. Please contact SYIL support or an authorized dealer for further assistance."
              `
          },
          {
            role: 'user',
            content: question
          }
        ],
        text: {
          format: { type: 'text' }
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    
    const messageBlock = response.data.output.find(
      o => o.type === 'message'
    );

    const content = messageBlock?.content?.[0] || {};
    const text = content.text || '';
    const annotations = content.annotations || [];

      
    const title =
      annotations.length > 0 && annotations[0].title
        ? annotations[0].title
        : '';


        console.log('content---- ', content);
        console.log('text---- ', text);
        console.log('annotations---- ', annotations);
        console.log('title---- ', title);

    return res.json({
      title,
      text
    });

  } catch (error) {
    console.error('OpenAI Error:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to fetch answer from OpenAI'
    });
  }
});





app.get('/articles', (req, res) => {
  const filePath = path.join(__dirname, 'assets', 'articles.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to read articles' });
    }

    try {
      const json = JSON.parse(data);
      res.json(json);
    } catch (e) {
      res.status(500).json({ message: 'Invalid JSON format' });
    }
  });
});









const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'application/json') {
      return cb(new Error('Only JSON files are allowed'));
    }
    cb(null, true);
  }
});

app.post('/upload-articles', upload.single('file'), (req, res) => {
  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, 'assets', 'articles.json');

  fs.readFile(tempPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error reading file' });
    try {
      JSON.parse(data);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid JSON file' });
    }

    fs.writeFile(targetPath, data, 'utf8', (err) => {
      if (err) return res.status(500).json({ message: 'Error saving file' });

      fs.unlinkSync(tempPath);

      res.json({ message: 'articles.json updated successfully' });
    });
  });
});




app.post('/get-contact-id', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const fetch = (...args) =>
      import('node-fetch').then(({ default: fetch }) => fetch(...args));

    const searchResponse = await fetch(
      'https://api.hubapi.com/crm/v3/objects/contacts/search',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
        },
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'email',
                  operator: 'EQ',
                  value: email,
                },
              ],
            },
          ],
          properties: ['email'],
        }),
      }
    );

    const searchData = await searchResponse.json();

    // ✅ Contact Found
    if (searchResponse.ok && searchData.results?.length > 0) {
      return res.json({
        contactId: searchData.results[0].id,
        created: false,
      });
    }

    // 2️⃣ CREATE CONTACT (IF NOT FOUND)
    const createResponse = await fetch(
      'https://api.hubapi.com/crm/v3/objects/contacts',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
        },
        body: JSON.stringify({
          properties: {
            email: email,
            hubspot_owner_id: '86106481'
          },
        }),
      }
    );

    const createData = await createResponse.json();

    if (createResponse.ok) {
      return res.json({
        contactId: createData.id,
        created: true,
      });
    } else {
      return res.status(createResponse.status).json(createData);
    }

  } catch (error) {
    console.error('Contact Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/save-fcm-token', async (req, res) => {

  const { email, fcmToken } = req.body;

  console.log("Email:", email);
  console.log("FCM Token:", fcmToken);


  if (!email || !fcmToken) {
    return res.status(400).json({
      message:"Email and FCM token required"
    });
  }


  try {

    const fetch = (...args) =>
      import('node-fetch').then(({default: fetch}) => fetch(...args));


    // 1. Search contact by email

    const searchResponse = await fetch(
      'https://api.hubapi.com/crm/v3/objects/contacts/search',
      {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          Authorization:`Bearer ${HUBSPOT_API_KEY}`
        },

        body:JSON.stringify({

          filterGroups:[
            {
              filters:[
                {
                  propertyName:'email',
                  operator:'EQ',
                  value:email
                }
              ]
            }
          ],

          properties:[
            'email'
          ]

        })

      }
    );


    const searchData = await searchResponse.json();


    if(!searchData.results.length){

      return res.status(404).json({
        message:"Contact not found"
      });

    }


    const contactId = searchData.results[0].id;



    // 2. Update FCM Token in HubSpot

    const updateResponse = await fetch(

      `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,

      {

        method:'PATCH',

        headers:{
          'Content-Type':'application/json',
          Authorization:`Bearer ${HUBSPOT_API_KEY}`
        },


        body:JSON.stringify({

          properties:{
            fcm_token:fcmToken
          }

        })

      }

    );



    if(!updateResponse.ok){

      const error = await updateResponse.text();

      return res.status(400).json({
        error
      });

    }



    return res.json({

      success:true,
      message:"FCM Token saved"

    });


  }
  catch(error){

    console.log(error);

    res.status(500).json({
      message:"Server error"
    });

  }


});


// ============================================================
// REMOVE CUSTOMER FCM TOKEN
// ============================================================

app.post('/remove-fcm-token', async (req, res) => {

  const {
    email,
  } = req.body;


  if (!email) {

    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });

  }


  try {

    const fetch =
      (...args) =>
        import('node-fetch').then(
          ({ default: fetch }) =>
            fetch(...args)
        );


    const normalizedEmail =
      String(email)
        .trim()
        .toLowerCase();


    // =====================================================
    // FIND HUBSPOT CONTACT
    // =====================================================

    const searchResponse =
      await fetch(
        'https://api.hubapi.com/crm/v3/objects/contacts/search',
        {
          method: 'POST',

          headers: {
            Authorization:
              `Bearer ${HUBSPOT_API_KEY}`,

            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({

            filterGroups: [
              {
                filters: [
                  {
                    propertyName:
                      'email',

                    operator:
                      'EQ',

                    value:
                      normalizedEmail,
                  },
                ],
              },
            ],

            properties: [
              'email',
              'fcm_token',
            ],

            limit: 1,

          }),
        }
      );


    const searchData =
      await searchResponse.json();


    // =====================================================
    // HUBSPOT SEARCH ERROR
    // =====================================================

    if (!searchResponse.ok) {

      console.error(
        'Customer FCM contact search failed:',
        searchData
      );

      return res
        .status(searchResponse.status)
        .json({
          success: false,
          message:
            'Unable to find customer contact',
        });

    }


    // =====================================================
    // CONTACT NOT FOUND
    // =====================================================

    if (
      !searchData.results ||
      searchData.results.length === 0
    ) {

      return res.status(404).json({
        success: false,
        message:
          'Customer contact not found',
      });

    }


    const contactId =
      String(
        searchData.results[0].id
      );


    // =====================================================
    // CLEAR FCM TOKEN
    // =====================================================

    const updateResponse =
      await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
        {
          method: 'PATCH',

          headers: {
            Authorization:
              `Bearer ${HUBSPOT_API_KEY}`,

            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({

            properties: {
              fcm_token: '',
            },

          }),
        }
      );


    const updateText =
      await updateResponse.text();


    // =====================================================
    // HUBSPOT UPDATE ERROR
    // =====================================================

    if (!updateResponse.ok) {

      console.error(
        'Customer FCM token remove failed:',
        updateText
      );

      return res
        .status(updateResponse.status)
        .json({
          success: false,
          message:
            'Unable to remove FCM token',
        });

    }


    console.log(
      `Customer FCM token removed for contact ${contactId}`
    );


    return res.status(200).json({

      success: true,

      message:
        'Customer FCM token removed successfully',

      contactId,

    });


  } catch (error) {

    console.error(
      'Remove customer FCM token error:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        'Internal server error',

    });

  }

});



// const { getMessaging } = require("firebase-admin/messaging");


app.post("/hubspot-webhook", async (req, res) => {
  console.log("========== CUSTOMER WEBHOOK RECEIVED ==========");

  try {
    // STEP 1: Validate webhook
    if (!Array.isArray(req.body) || req.body.length === 0) {
      console.log("Invalid webhook body");
      return res.sendStatus(200);
    }

    const event = req.body[0];

    const threadId = event?.objectId;
    const webhookMessageId = event?.messageId;

    if (!threadId || !webhookMessageId) {
      console.log("Webhook threadId or messageId missing");
      return res.sendStatus(200);
    }

    const fetch = (...args) =>
      import("node-fetch").then(({ default: fetch }) =>
        fetch(...args)
      );

    const headers = {
      Authorization: `Bearer ${HUBSPOT_API_KEY}`,
      "Content-Type": "application/json",
    };

    // STEP 2: Get conversation messages
    const messageResponse = await fetch(
      `https://api.hubapi.com/conversations/v3/conversations/threads/${threadId}/messages`,
      {
        method: "GET",
        headers,
      }
    );

    const messageData = await messageResponse.json();

    if (!messageResponse.ok) {
      console.error("Message fetch failed:", messageData);
      return res.sendStatus(200);
    }

    const messages = Array.isArray(messageData.results)
      ? messageData.results
      : [];

    // STEP 3: Find exact outgoing message
    const latestMessage = messages.find(
      (message) =>
        message.type === "MESSAGE" &&
        message.direction === "OUTGOING" &&
        String(message.id) === String(webhookMessageId)
    );

    if (!latestMessage) {
      console.log("Matching outgoing message not found");
      return res.sendStatus(200);
    }

    console.log("Customer message ID:", latestMessage.id);

    // STEP 4: Get customer email
    const recipientEmail =
      latestMessage?.recipients?.[0]?.deliveryIdentifier?.value;

    if (!recipientEmail) {
      console.log("Recipient email not found");
      return res.sendStatus(200);
    }

    const normalizedEmail = String(recipientEmail)
      .trim()
      .toLowerCase();

    // STEP 5: Find customer contact
    const contactSearchResponse = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts/search",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: "email",
                  operator: "EQ",
                  value: normalizedEmail,
                },
              ],
            },
          ],
          properties: ["firstname", "fcm_token"],
          limit: 1,
        }),
      }
    );

    const contactData = await contactSearchResponse.json();

    if (!contactSearchResponse.ok) {
      console.error("Contact search failed:", contactData);
      return res.sendStatus(200);
    }

    const contact = contactData.results?.[0];

    if (!contact) {
      console.log("Customer contact not found");
      return res.sendStatus(200);
    }

    const fcmToken = contact.properties?.fcm_token;

    // STEP 6: Find ticket using thread ID
    const ticketSearchResponse = await fetch(
      "https://api.hubapi.com/crm/v3/objects/tickets/search",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName:
                    "hs_conversations_originating_thread_id",
                  operator: "EQ",
                  value: String(threadId),
                },
              ],
            },
          ],
          properties: [
            "subject",
            "customer_portal",
            "customer_unread_count",
            "hs_conversations_originating_thread_id",
          ],
          limit: 10,
        }),
      }
    );

    const ticketSearchData = await ticketSearchResponse.json();

    if (!ticketSearchResponse.ok) {
      console.error("Ticket search failed:", ticketSearchData);
      return res.sendStatus(200);
    }

    // STEP 7: Customer Portal tickets only
    const matchingTickets = Array.isArray(
      ticketSearchData.results
    )
      ? ticketSearchData.results
      : [];

    const ticket = matchingTickets.find((item) => {
      const customerPortal = String(
        item.properties?.customer_portal || ""
      )
        .trim()
        .toLowerCase();

      return ["true", "yes", "1"].includes(customerPortal);
    });

    if (!ticket) {
      console.log("Customer Portal ticket not found");
      return res.sendStatus(200);
    }

    const ticketId = String(ticket.id);

    const ticketSubject = String(
      ticket.properties?.subject || "Ticket Details"
    );

    // STEP 8: Increase customer unread count
    const currentUnreadCount = Math.max(
      0,
      Number(ticket.properties?.customer_unread_count || 0) || 0
    );

    const newUnreadCount = currentUnreadCount + 1;

    const unreadUpdateResponse = await fetch(
      `https://api.hubapi.com/crm/v3/objects/tickets/${ticketId}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          properties: {
            customer_unread_count: String(newUnreadCount),
          },
        }),
      }
    );

    if (!unreadUpdateResponse.ok) {
      console.error(
        "Customer unread count update failed:",
        await unreadUpdateResponse.text()
      );
    } else {
      console.log(
        `Customer Ticket ${ticketId}: Unread ${currentUnreadCount} -> ${newUnreadCount}`
      );
    }

    // STEP 9: Prepare notification
    const notificationBody = String(
      latestMessage.text ||
        "You have a new support message."
    );

    // STEP 10: Send Firebase notification
    if (fcmToken) {
      try {
        const firebaseResponse = await getMessaging().send({
          token: fcmToken,

          notification: {
            title: "SYIL Support",
            body: notificationBody,
          },

          data: {
            notificationTitle: "SYIL Support",
            notificationBody: notificationBody,
            ticketId: ticketId,
            ticketSubject: ticketSubject,
            threadId: String(threadId),
            messageId: String(latestMessage.id || ""),
          },

          android: {
            priority: "high",
          },
        });

        console.log(
          "Customer push sent successfully:",
          firebaseResponse
        );
      } catch (firebaseError) {
        console.error(
          "Customer Firebase push error:",
          firebaseError
        );
      }
    } else {
      console.log("Customer FCM token not found");
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("Customer webhook error:", error);
    return res.sendStatus(200);
  }
});


// Step 2: Create ticket and associate with contact
const uploadedFiles = [];
app.post('/upload-to-hubspot', hubspotUpload.array('files'), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.json({ success: true, files: [] });
    }
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(file.path));
      formData.append('fileName', file.originalname);
      formData.append('folderId', '204201997753');
      formData.append(
        'options',
        JSON.stringify({ access: 'PUBLIC_INDEXABLE' })
      );
      const response = await axios.post(
        'https://api.hubapi.com/files/v3/files',
        formData,
        {
          headers: {
            Authorization: `Bearer ${HUBSPOT_API_KEY}`,
            ...formData.getHeaders(),
          },
        }
      );
      uploadedFiles.push({
        id: response.data.id,
        url: response.data.url,
      });
      fs.unlinkSync(file.path);
    }
    res.json({
      success: true,
      files: uploadedFiles,
    });
  } catch (err) {
    console.log(err.response?.data || err);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// 2️⃣ Create ticket via HubSpot form submission
app.post('/create-ticket', async (req, res) => {
  try {
    const { contactId, ticketData } = req.body;

    // 🔥 IMPORTANT: ticketData ke andar se values nikalo
    if (!ticketData) {
      return res.status(400).json({ error: 'ticketData missing' });
    }

    const {
      email,
      company,
      machineType,
      controller,
      serialNo,
      salesOrder,
      subject,
      description,
      priority,
      warranty,
      categories,
      files,
    } = ticketData;

    // safety
    const categoryArray = Array.isArray(categories) ? categories : [];

    
    const fields = [
      { objectTypeId: '0-1', name: 'email', value: email || '' },

      { objectTypeId: '0-5', name: 'subject', value: subject || '' },
      { objectTypeId: '0-5', name: 'content', value: description || '' },
      { objectTypeId: '0-5', name: 'company', value: company || '' },
      { objectTypeId: '0-5', name: 'machine_type', value: machineType || '' },
      { objectTypeId: '0-5', name: 'controller', value: controller || '' },
      { objectTypeId: '0-5', name: 'machine_serial_number', value: serialNo || '' },
      { objectTypeId: '0-5', name: 'sales_order_number', value: salesOrder || '' },
      {
        objectTypeId: '0-5',
        name: 'warranty',
        value: warranty ? 'true' : 'false',
      },
      {
        objectTypeId: '0-5',
        name: 'hs_ticket_priority',
        value: priority || 'LOW',
      },
      {
        objectTypeId: '0-5',
        name: 'hs_ticket_category',
        value: categoryArray.join(';') || '',
      },
      {
        objectTypeId: '0-5',
        name: 'source_status',
        value: 'Mobile',
      },
      {
        objectTypeId: '0-5',
        name: 'customer_portal',
        value: 'True',
      },
    ];

  

    console.log('uploadedFiles----- ', uploadedFiles);

    if ( uploadedFiles && uploadedFiles.length > 0 ) 
        {
          const fileIds = uploadedFiles.map(f => f.id);

          fields.push({
            objectTypeId: '0-5',
            name: 'hs_file_upload', 
            value: fileIds.join(';'),
          });
        }

    const formUrl = 'https://api.hsforms.com/submissions/v3/integration/submit/4392290/6cfd4e04-60e6-42ae-aea8-5e3825d8c7c0';


    console.log('fields---- ' , fields);

    const response = await axios.post(
      formUrl,
      { fields },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
        },
      }
    );

    uploadedFiles.length = 0;
    console.log(response);
    console.log('HubSpot STATUS:', response.status);


    const fetch = (...args) =>
      import('node-fetch').then(({ default: fetch }) => fetch(...args));

    
    await new Promise(resolve => setTimeout(resolve, 15000));

    const searchResponse = await fetch(
      'https://api.hubapi.com/crm/v3/objects/contacts/search',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
        },
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'email',
                  operator: 'EQ',
                  value: email,
                },
              ],
            },
          ],
          properties: ['mobile_ticket_id'],
        }),
      }
    );

    const searchData = await searchResponse.json();

    const mobile_ticket_id =
      searchData?.results?.[0]?.properties?.mobile_ticket_id || null;

    /* ------------------ 3️⃣ FINAL RESPONSE ------------------ */

    return res.status(200).json({
      success: true,
      message: 'Ticket created successfully',
      contactId,
      mobile_ticket_id,
    });
    
    // return res.status(200).json({
    //   success: true,
    //   message: `Ticket created successfully ${response}`,
    // });

    


  } catch (err) {
    console.error(
      '❌ Error in /create-ticket:',
      err.response?.data || err.message
    );
    return res.status(500).json({ error: 'Ticket creation failed' });
  }
});


// app.post('/create-ticket', async (req, res) => {
//   const { contactId, ticketData } = req.body;
//   if (!contactId) {
//     return res.status(400).json({ error: 'Contact ID is required' });
//   }
//   try {
//     const fetch = (...args) =>
//       import('node-fetch').then(({ default: fetch }) => fetch(...args));
//       const properties = {
//         subject: ticketData.subject,
//         content: ticketData.description,
//         hs_pipeline: '94161297',
//         hs_pipeline_stage: '173580710',
//         hs_ticket_priority: ticketData.priority?.toUpperCase() || 'LOW',
//         end_customer_name: ticketData.company,
//         machine_type: ticketData.machineType,
//         controller: ticketData.controller,
//         machine_serial_number: ticketData.serialNo,
//         sales_order_number: ticketData.salesOrder,
//         warranty: ticketData.warranty,
//         hs_ticket_category: ticketData.categories?.join(';'),
//         hubspot_owner_id: '86106481',
//         hs_assigned_team_ids: '46557382',
//       };

//       if ( uploadedFiles && uploadedFiles.length > 0 ) 
//         {
//           const fileIds = uploadedFiles.map(f => f.id);
//           properties.hs_file_upload = fileIds.join(';');
//           console.log('uploadedFiles--- ticket----- ', uploadedFiles);
//         }

//         console.log('properties----- ' , properties);

//       const response = await fetch(
//         'https://api.hubapi.com/crm/v3/objects/tickets',
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${HUBSPOT_API_KEY}`,
//           },
//           body: JSON.stringify({
//             properties,
//             associations: [
//               {
//                 to: { id: contactId },
//                 types: [
//                   {
//                     associationCategory: 'HUBSPOT_DEFINED',
//                     associationTypeId: 16,
//                   },
//                 ],
//               },
//             ],
//           }),
//         }
//       );
//     const data = await response.json();
//     res.status(response.ok ? 201 : response.status).json(data);
//   } catch (error) {
//     console.error('Create Ticket Error:', error);
//     res.status(500).json({ error: 'Internal server error' });  
//   }
// });




// app.post('/upload-to-hubspot', upload.array('files'), async (req, res) => {
//   try {
//     const uploadedFiles = [];

//     if (req.files && req.files.length > 0) {
//       for (const file of req.files) {
//         const formData = new FormData();
//         formData.append('file', fs.createReadStream(file.path));
//         formData.append('fileName', file.originalname);
//         formData.append('folderId', '204201997753'); // Change to your folder ID
//         formData.append('options', JSON.stringify({ access: 'PUBLIC_INDEXABLE' }));

//         const response = await axios.post(
//           'https://api.hubapi.com/files/v3/files',
//           formData,
//           { headers: { Authorization: `Bearer ${HUBSPOT_API_KEY}`, ...formData.getHeaders() } }
//         );

//         uploadedFiles.push({ id: response.data.id, url: response.data.url });

//         fs.unlinkSync(file.path);
//       }
//     }

//     res.status(200).json({ files: uploadedFiles });
//   } catch (err) {
//     console.error(err.response?.data || err.message || err);
//     res.status(500).json({ error: 'File upload failed' });
//   }
// });









// app.post('/create-ticket', async (req, res) => {
//   const { contactId, ticketData } = req.body;
//   console.log('ticketData--- ', ticketData);
//   if (!contactId || !ticketData?.subject) {
//     return res.status(400).json({
//       error: 'Contact ID and subject are required',
//     });
//   }

//   try {
//     const fetch = (...args) =>
//       import('node-fetch').then(({ default: fetch }) => fetch(...args));

//     // 🔹 HubSpot Form Submission API
//     const response = await fetch(
//       'https://api.hsforms.com/submissions/v3/integration/submit/4392290/d3c790a4-c601-4a54-b826-0a5ca3f57428',
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           fields: [
//             { name: 'subject', value: ticketData.subject },
//             { name: 'content', value: ticketData.description },
//             { name: 'hs_ticket_priority', value: ticketData.priority },
//             { name: 'company', value: ticketData.company },
//             { name: 'machine_type', value: ticketData.machineType },
//             { name: 'controller', value: ticketData.controller },
//             { name: 'machine_serial_number', value: ticketData.serialNo },
//             { name: 'sales_order_number', value: ticketData.salesOrder },
//             { name: 'warranty', value: ticketData.warranty },
//             { name: 'email', value: ticketData.email },
//             {
//               name: 'hs_ticket_category',
//               value: ticketData.categories?.join(';'),
//             },
//           ],
//         }),
//       }
//     );

//     const data = await response.json();

//     if (!response.ok) {
//       console.error('Form submission failed:', data);
//       return res.status(500).json({
//         error: 'Ticket submission failed',
//         data,
//       });
//     }

//     // ✅ SAME response variable name
//     return res.status(201).json({
//       success: true,
//       message: 'Ticket created successfully',
//       data,
//     });

//   } catch (error) {
//     console.error('Create Ticket Error:', error);
//     return res.status(500).json({
//       error: 'Internal server error',
//     });
//   }
// });





app.post('/get-user-data', async (req, res) => {
  const { email } = req.body;

  try {
    const searchResponse = await fetch(
      'https://api.hubapi.com/crm/v3/objects/contacts/search',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
        },
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'email',
                  operator: 'EQ',
                  value: email,
                },
              ],
            },
          ],
          properties: ['app_support_team_member'],
        }),
      }
    );

    const data = await searchResponse.json();

    if (!data.results.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      app_support_team_member:
        data.results[0].properties.app_support_team_member || '',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
});





// ============================================================
// CHECK LOGIN DETAILS IN HUBSPOT - CUSTOMER APP
// ============================================================

app.post('/check_login_detail', async (req, res) => {

  const {
    email,
    password,
  } = req.body;

  // =====================================================
  // NORMALIZE EMAIL
  // =====================================================

  const normalizedEmail =
    String(email || '')
      .trim()
      .toLowerCase();


  console.log(
    '========== CUSTOMER APP LOGIN =========='
  );

  console.log(
    'Customer login email:',
    normalizedEmail
  );


  // =====================================================
  // VALIDATION
  // =====================================================

  if (
    !normalizedEmail ||
    !password
  ) {

    return res.status(400).json({
      success: false,
      message:
        'Email and password are required',
    });

  }


  try {

    const fetch =
      (...args) =>
        import('node-fetch').then(
          ({ default: fetch }) =>
            fetch(...args)
        );


    // =====================================================
    // STEP 1
    // SEARCH HUBSPOT CONTACT
    // =====================================================

    const searchResponse =
      await fetch(
        'https://api.hubapi.com/crm/v3/objects/contacts/search',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Authorization:
              `Bearer ${HUBSPOT_API_KEY}`,
          },

          body:
            JSON.stringify({

              filterGroups: [
                {
                  filters: [
                    {
                      propertyName:
                        'email',

                      operator:
                        'EQ',

                      value:
                        normalizedEmail,
                    },
                  ],
                },
              ],

              properties: [
                'email',
                'mobile_password',
                'firstname',
                'lastname',
                'profile_image',
                'bio',
                'phone',
                'gender',
                'app_support_team_member',
                'mobile_app_permission',
              ],

              limit: 1,

            }),
        }
      );


    const searchData =
      await searchResponse.json();


    // =====================================================
    // HUBSPOT ERROR
    // =====================================================

    if (!searchResponse.ok) {

      console.error(
        'Customer login HubSpot search failed:',
        searchData
      );

      return res.status(500).json({
        success: false,

        message:
          'Unable to verify your account. Please try again.',
      });

    }


    // =====================================================
    // CONTACT NOT FOUND
    // =====================================================

    if (
      !searchData.results ||
      searchData.results.length === 0
    ) {

      console.log(
        'Customer login failed: contact not found'
      );

      return res.status(401).json({
        success: false,

        message:
          'Invalid email or password.',
      });

    }


    const contact =
      searchData.results[0];

    const contactId =
      String(contact.id);

    const properties =
      contact.properties || {};

    const hubspotPassword =
      properties.mobile_password || '';


    // =====================================================
    // STEP 2
    // PASSWORD CHECK
    // =====================================================

    if (!hubspotPassword) {

      console.log(
        'Customer login failed: password not configured'
      );

      return res.status(401).json({
        success: false,

        message:
          'Password is not set for this account.',
      });

    }


    if (
      hubspotPassword !== password
    ) {

      console.log(
        'Customer login failed: invalid password'
      );

      return res.status(401).json({
        success: false,

        message:
          'Please enter a valid email and password.',
      });

    }


    // =====================================================
    // STEP 3
    // MOBILE APP PERMISSION CHECK
    // =====================================================

    const rawMobileAppPermission =
      properties.mobile_app_permission || '';

    const mobileAppPermission =
      String(
        rawMobileAppPermission
      )
        .trim()
        .toLowerCase();


    console.log(
      'Customer mobile_app_permission:',
      rawMobileAppPermission || 'EMPTY'
    );


    const hasCustomerAppPermission =
      mobileAppPermission === 'customer app' ||
      mobileAppPermission === 'customer_app';


    // =====================================================
    // EMPTY PERMISSION
    // =====================================================

    if (!mobileAppPermission) {

      console.log(
        `Customer login blocked: mobile_app_permission empty for contact ${contactId}`
      );

      return res.status(403).json({
        success: false,

        code:
          'MOBILE_APP_PERMISSION_MISSING',

        message:
          'You do not have permission to access the Customer App. Please contact SYIL Support.',
      });

    }


    // =====================================================
    // WRONG APP PERMISSION
    // =====================================================

    if (!hasCustomerAppPermission) {

      console.log(
        `Customer login blocked: wrong app permission "${rawMobileAppPermission}" for contact ${contactId}`
      );

      return res.status(403).json({
        success: false,

        code:
          'WRONG_MOBILE_APP',

        message:
          'These login details are not authorized for the Customer App. Please use the SYIL Dealer App or enter a valid Customer App account.',
      });

    }


    // =====================================================
    // STEP 4
    // LOGIN SUCCESS
    // =====================================================

    console.log(
      `Customer App login authorized for contact ${contactId}`
    );


    return res.status(200).json({

      success: true,

      message:
        'Login successful',

      contactId:
        contactId,

      user: {

        email:
          properties.email || '',

        firstName:
          properties.firstname || '',

        lastName:
          properties.lastname || '',

        profileImage:
          properties.profile_image || '',

        bio:
          properties.bio || '',

        phone:
          properties.phone || '',

        gender:
          properties.gender || '',

        app_support_team_member:
          properties.app_support_team_member || '',

        mobile_app_permission:
          properties.mobile_app_permission || '',

      },

    });


  } catch (error) {

    console.error(
      'Customer login error:',
      error
    );

    return res.status(500).json({

      success: false,

      message:
        'Internal server error',

    });

  }

});


// Step 3: Forgot Password
app.post('/forgot_password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const fetch = (...args) =>
      import('node-fetch').then(({ default: fetch }) => fetch(...args));

    // 1️⃣ Search contact by email in HubSpot
    const searchResponse = await fetch(
      'https://api.hubapi.com/crm/v3/objects/contacts/search',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
        },
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                { propertyName: 'email', operator: 'EQ', value: email },
              ],
            },
          ],
          properties: ['email'],
        }),
      }
    );

    const searchData = await searchResponse.json();

    // Email not found
    if (!searchData.results || searchData.results.length === 0) {
      return res.status(404).json({ message: 'Please enter a valid email.' });
    }

    // 2️⃣ Submit email to HubSpot form endpoint
    const formResponse = await fetch(
      'https://api.hsforms.com/submissions/v3/integration/submit/4392290/635124f0-b15f-40c2-9806-5405ca736690',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
        },
        body: JSON.stringify({
          fields: [
            {
              objectTypeId: '0-1',
              name: 'email',
              value: email,
            },
          ],
        }),
      }
    );

    if (!formResponse.ok) {
      const formError = await formResponse.text();
      console.error('Form submission error:', formError);
      return res.status(500).json({
        message: 'Failed to submit form. Please try again later.',
      });
    }

    // Success response
    return res.status(200).json({
      message:
        'Thank you for submitting the form. Please check your email to reset your password. If you do not see the email in your inbox, please check your spam or junk folder as well.',
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});




app.post('/submit-feedback', async (req, res) => {
  const { email, subject, message, rating } = req.body;

  console.log('req__body_____ ', req.body);

  if (!email || !subject) {
    return res.status(400).json({ error: 'Email and Subject are required' });
  }

  try {
    const fetch = (...args) =>
      import('node-fetch').then(({ default: fetch }) => fetch(...args));

    // -------- Step 1: Search contact --------
    const searchResponse = await fetch(
      'https://api.hubapi.com/crm/v3/objects/contacts/search',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
        },
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                { propertyName: 'email', operator: 'EQ', value: email },
              ],
            },
          ],
          properties: ['email'],
        }),
      }
    );

    const searchData = await searchResponse.json();

    if (!searchResponse.ok || !searchData.results?.length) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const contactId = searchData.results[0].id;

    // -------- Step 2: Create Feedback object & associate with contact --------
    const HUBSPOT_FEEDBACK_OBJECT_ID = '2-56321597'; // your feedback object type

    const feedbackResponse = await fetch(
      `https://api.hubapi.com/crm/v3/objects/${HUBSPOT_FEEDBACK_OBJECT_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            subject: subject,
            what_went_wrong: message,
            rating: rating,
          },
          associations: [
            {
              to: { id: contactId },
              types: [{ associationCategory: 'USER_DEFINED', associationTypeId: 131 }]
            }
          ]
        })
      }
    );

    const feedbackData = await feedbackResponse.json();

    if (!feedbackResponse.ok) {
      return res.status(feedbackResponse.status).json(feedbackData);
    }

    res.json({ success: true, feedback: feedbackData, contactId });

  } catch (error) {
    console.error('Submit Feedback Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/get-profile-by-email', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: 'Email is required',
    });
  }

  try {
    const fetch = (...args) =>
      import('node-fetch').then(({ default: fetch }) => fetch(...args));

    const response = await fetch(
      'https://api.hubapi.com/crm/v3/objects/contacts/search',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
        },
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'email',
                  operator: 'EQ',
                  value: email,
                },
              ],
            },
          ],
          properties: [
            'email',
            'firstname',
            'lastname',
            'bio',
            'phone',
            'gender',
          ],
        }),
      }
    );

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const contact = data.results[0].properties;

    // ✅ RESPONSE FOR PROFILE.JSX
    res.status(200).json({
      user: {
        email: contact.email || '',
        firstname: contact.firstname || '',
        lastname: contact.lastname || '',
        bio: contact.bio || '',
        phone: contact.phone || '',
        gender: contact.gender || '',
      },
    });

  } catch (error) {
    console.error('HubSpot API Error:', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
});



app.post('/update-profile', async (req, res) => {
  const { contactId, firstName, lastName, bio, phone, gender, image } = req.body;

  try {
    const fetch = (...args) =>
      import('node-fetch').then(({ default: fetch }) => fetch(...args));

    const response = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
        },
        body: JSON.stringify({
          properties: {
            firstname: firstName,
            lastname: lastName,
            bio,
            phone,
            gender,
            hs_avatar_url: image,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(400).json({ err });
    }

    res.json({
      success: true,
      user: { firstName, lastName, bio, phone, gender, profileImage: image },
    });

  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});


//Get Ticket Details
// app.post('/get_contact_tickets', async (req, res) => {
//   const { contactId } = req.body;

//   console.log('contactId---- ', contactId);
//   if (!contactId) {
//     return res.status(400).json({
//       message: 'Contact ID is required',
//     });
//   }

//   try {
//     const fetch = (...args) =>
//       import('node-fetch').then(({ default: fetch }) => fetch(...args));

//     // 1️⃣ GET TICKET ASSOCIATIONS
//     const associationResponse = await fetch(
//       `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}/associations/ticket`,
//       {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     const associationData = await associationResponse.json();


//     if (!associationData.results || associationData.results.length === 0) {
//       return res.status(200).json({
//         message: 'No tickets found',
//         tickets: [],
//       });
//     }

//     // 2️⃣ EXTRACT TICKET IDS
//     const ticketIds = associationData.results.map(item => item.id);

//     // 3️⃣ FETCH EACH TICKET DETAIL
//     const ticketPromises = ticketIds.map(ticketId =>
//       fetch(
//         `https://api.hubapi.com/crm/v3/objects/tickets/${ticketId}?properties=subject,createdate,hubspot_owner_id,hs_pipeline_stage`,
//         {
//           method: 'GET',
//           headers: {
//             'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       ).then(res => res.json())
//     );

//     const ticketResponses = await Promise.all(ticketPromises);

//     // 4️⃣ FORMAT RESPONSE (UI FRIENDLY)
//     const formattedTickets = ticketResponses.map(ticket => ({
//       ticketId: ticket.id,
//       subject: ticket.properties.subject || '',
//       createdDate: ticket.properties.createdate || '',
//       ownerId: ticket.properties.hubspot_owner_id || '',
//       status: ticket.properties.hs_pipeline_stage || '',
//     }));

//     return res.status(200).json({
//       message: 'Tickets fetched successfully',
//       tickets: formattedTickets,
//     });

//   } catch (error) {
//     console.error('Ticket Fetch Error:', error);
//     return res.status(500).json({
//       message: 'Internal server error',
//     });
//   }
// });




app.post('/get_tickets', async (req, res) => {
  const { contactId, type } = req.body || {};

  if (!contactId) {
    return res.status(400).json({
      message: 'Contact ID is required',
    });
  }

  if (!['me', 'org'].includes(type)) {
    return res.status(400).json({
      message: 'Invalid ticket type',
    });
  }

  try {
    const fetch = (...args) =>
      import('node-fetch').then(({ default: fetch }) => fetch(...args));

    const headers = {
      Authorization: `Bearer ${HUBSPOT_API_KEY}`,
      'Content-Type': 'application/json',
    };

    // HubSpot API request with retry for rate limits.
    const hubspotRequest = async (url, options = {}) => {
      for (let attempt = 0; attempt < 5; attempt++) {
        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (response.status === 429 || response.status >= 500) {
          if (attempt < 4) {
            const retryAfter = Number(
              response.headers.get('retry-after')
            );

            const delay = Number.isFinite(retryAfter) && retryAfter > 0
              ? retryAfter * 1000
              : Math.min(1000 * 2 ** attempt, 10000);

            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }

        const data = await response.json();

        if (!response.ok) {
          const error = new Error(
            `HubSpot request failed (${response.status}): ${JSON.stringify(data)}`
          );
          error.status = response.status;
          throw error;
        }

        return data;
      }
    };

    // Fetch every association page.
    const getAllAssociatedIds = async (
      objectType,
      objectId,
      targetType
    ) => {
      const ids = new Set();
      let after = null;

      do {
        const url = new URL(
          `https://api.hubapi.com/crm/v3/objects/${objectType}/${encodeURIComponent(String(objectId))}/associations/${targetType}`
        );

        url.searchParams.set('limit', '100');

        if (after) {
          url.searchParams.set('after', after);
        }

        const data = await hubspotRequest(url.toString());

        for (const item of data.results || []) {
          const id = item.id ?? item.toObjectId;
          if (id != null) ids.add(String(id));
        }

        after = data.paging?.next?.after || null;
      } while (after);

      return [...ids];
    };

    let ticketIds = [];

    // MY TICKETS
    if (type === 'me') {
      ticketIds = await getAllAssociatedIds(
        'contacts',
        contactId,
        'tickets'
      );
    }

    // ORGANIZATION TICKETS
    if (type === 'org') {
      const companyIds = await getAllAssociatedIds(
        'contacts',
        contactId,
        'companies'
      );

      const allOrgTicketIds = new Set();

      for (const companyId of companyIds) {
        const ids = await getAllAssociatedIds(
          'companies',
          companyId,
          'tickets'
        );

        ids.forEach(id => allOrgTicketIds.add(id));
      }

      ticketIds = [...allOrgTicketIds];
    }

    if (!ticketIds.length) {
      return res.status(200).json({
        message: 'No tickets found',
        tickets: [],
      });
    }

    // Fetch ticket details in batches of 100.
    const allTickets = [];

    for (let i = 0; i < ticketIds.length; i += 100) {
      const batchIds = ticketIds.slice(i, i + 100);

      const data = await hubspotRequest(
        'https://api.hubapi.com/crm/v3/objects/tickets/batch/read',
        {
          method: 'POST',
          body: JSON.stringify({
            properties: [
              'subject',
              'createdate',
              'hubspot_owner_id',
              'hs_pipeline_stage',
              'customer_portal',
              'customer_unread_count',
            ],
            inputs: batchIds.map(id => ({ id })),
          }),
        }
      );

      allTickets.push(...(data.results || []));
    }

    // Preserve the existing frontend response format.
    const tickets = allTickets.map(ticket => {
      const p = ticket.properties || {};

      return {
        ticketId: ticket.id,
        subject: p.subject || '',
        createdDate: p.createdate || '',
        ownerId: p.hubspot_owner_id || '',
        status: p.hs_pipeline_stage || '',
        customer_portal: p.customer_portal || '',
        customer_unread_count: Math.max(
          0,
          Number(p.customer_unread_count || 0) || 0
        ),
      };
    });

    console.log(
      `/get_tickets: type=${type}, total=${tickets.length}`
    );

    return res.status(200).json({
      tickets,
    });

  } catch (error) {
    console.error('/get_tickets error:', error.message);

    return res.status(error.status || 500).json({
      message: 'Unable to fetch all tickets',
    });
  }
});





app.post('/get_owner_ticket', async (req, res) => {
  const { ownerId } = req.body;

  if (!ownerId) {
    return res.status(400).json({
      message: 'Owner ID is required',
    });
  }

  try {
    const fetch = (...args) =>
      import('node-fetch').then(({ default: fetch }) => fetch(...args));

    let allTickets = [];
    let after = null;

    do {
      const response = await fetch(
        'https://api.hubapi.com/crm/v3/objects/tickets/search',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${HUBSPOT_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filterGroups: [
              {
                filters: [
                  {
                    propertyName: 'hubspot_owner_id',
                    operator: 'EQ',
                    value: ownerId,
                  },
                ],
              },
            ],
            limit: 100,
            ...(after ? { after } : {}),
            properties: [
              'subject',
              'content',
              'hs_pipeline',
              'hs_pipeline_stage',
              'hubspot_owner_id',
              'createdate',
              'customer_portal',

              // NEW: Customer unread count
              'customer_unread_count',
            ],
            sorts: ['createdate'],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          'Owner ticket search failed:',
          data
        );

        return res.status(response.status).json({
          message: 'Unable to fetch owner tickets',
        });
      }

      allTickets = [
        ...allTickets,
        ...(data.results || []),
      ];

      after = data?.paging?.next?.after || null;

    } while (after);

    // ==========================================
    // FORMAT OWNER TICKETS
    // ==========================================

    const tickets = allTickets.map(item => ({
      ticketId: item.id,

      subject:
        item.properties?.subject || '',

      createdDate:
        item.properties?.createdate || '',

      ownerId:
        item.properties?.hubspot_owner_id || '',

      status:
        item.properties?.hs_pipeline_stage || '',

      content:
        item.properties?.content || '',

      customer_portal:
        item.properties?.customer_portal || '',

      // NEW: Customer unread message count
      customer_unread_count: Math.max(
        0,
        Number(
          item.properties?.customer_unread_count || 0
        ) || 0
      ),
    }));

    return res.status(200).json({
      message: 'All owner tickets fetched',
      total: tickets.length,
      tickets,
    });

  } catch (error) {
    console.error(
      'Owner Ticket Fetch Error:',
      error
    );

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
});







app.post('/mark-ticket-read', async (req, res) => {
  const { ticketId, contactId } = req.body || {};

  if (!ticketId || !contactId) {
    return res.status(400).json({
      success: false,
      message: 'ticketId and contactId are required',
    });
  }

  try {
    const fetch = (...args) =>
      import('node-fetch').then(({ default: fetch }) => fetch(...args));

    const headers = {
      Authorization: `Bearer ${HUBSPOT_API_KEY}`,
      'Content-Type': 'application/json',
    };

    const isCustomerPortal = value =>
      ['true', 'yes', '1'].includes(
        String(value ?? '').trim().toLowerCase()
      );

    // Fetch all associations, including paginated results.
    const getAssociationIds = async (objectType, objectId, targetType) => {
      const ids = new Set();
      let after = null;

      do {
        const url = new URL(
          `https://api.hubapi.com/crm/v3/objects/${objectType}/${encodeURIComponent(String(objectId))}/associations/${targetType}`
        );

        url.searchParams.set('limit', '100');

        if (after) {
          url.searchParams.set('after', after);
        }

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers,
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('HubSpot association error:', data);

          const error = new Error('Unable to fetch associations');
          error.status = response.status;
          throw error;
        }

        for (const item of data.results || []) {
          const id = item.id ?? item.toObjectId;

          if (id != null) {
            ids.add(String(id));
          }
        }

        after = data.paging?.next?.after || null;
      } while (after);

      return ids;
    };

    // STEP 1: GET CONTACT'S DIRECT TICKETS
    const directTicketIds = await getAssociationIds(
      'contacts',
      contactId,
      'tickets'
    );

    // STEP 2: GET CONTACT'S ASSOCIATED COMPANIES
    const companyIds = await getAssociationIds(
      'contacts',
      contactId,
      'companies'
    );

    // STEP 3: GET ORGANIZATION TICKETS
    const organizationTicketIds = new Set();

    for (const companyId of companyIds) {
      const companyTickets = await getAssociationIds(
        'companies',
        companyId,
        'tickets'
      );

      for (const id of companyTickets) {
        organizationTicketIds.add(id);
      }
    }

    // STEP 4: VERIFY TICKET BELONGS TO CONTACT OR COMPANY
    const requestedTicketId = String(ticketId);

    const isDirectTicket = directTicketIds.has(requestedTicketId);
    const isOrganizationTicket =
      organizationTicketIds.has(requestedTicketId);

    if (!isDirectTicket && !isOrganizationTicket) {
      return res.status(403).json({
        success: false,
        message:
          'Ticket is not associated with this contact or organization',
      });
    }

    // STEP 5: VERIFY CUSTOMER PORTAL TICKET
    const ticketResponse = await fetch(
      `https://api.hubapi.com/crm/v3/objects/tickets/${encodeURIComponent(requestedTicketId)}?properties=customer_portal,customer_unread_count`,
      {
        method: 'GET',
        headers,
      }
    );

    const ticketData = await ticketResponse.json();

    if (!ticketResponse.ok) {
      return res.status(ticketResponse.status).json({
        success: false,
        message: 'Unable to verify Customer Portal ticket',
      });
    }

    if (!isCustomerPortal(ticketData.properties?.customer_portal)) {
      return res.status(403).json({
        success: false,
        message: 'This is not a Customer Portal ticket',
      });
    }

    // STEP 6: RESET CUSTOMER UNREAD COUNT
    const updateResponse = await fetch(
      `https://api.hubapi.com/crm/v3/objects/tickets/${encodeURIComponent(requestedTicketId)}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          properties: {
            customer_unread_count: '0',
          },
        }),
      }
    );

    if (!updateResponse.ok) {
      console.error(
        'Customer unread reset failed:',
        await updateResponse.text()
      );

      return res.status(updateResponse.status).json({
        success: false,
        message: 'Unable to mark ticket as read',
      });
    }

    // STEP 7: GET ALL ACCESSIBLE TICKETS
    const allTicketIds = [
      ...new Set([
        ...directTicketIds,
        ...organizationTicketIds,
      ]),
    ];

    // STEP 8: CALCULATE REMAINING UNREAD COUNT
    let totalUnreadCount = 0;

    const ticketResults = await Promise.all(
      allTicketIds.map(async id => {
        const response = await fetch(
          `https://api.hubapi.com/crm/v3/objects/tickets/${encodeURIComponent(id)}?properties=customer_portal,customer_unread_count`,
          {
            method: 'GET',
            headers,
          }
        );

        if (!response.ok) {
          const error = new Error(
            `Unable to fetch unread count for ticket ${id}`
          );
          error.status = response.status;
          throw error;
        }

        return response.json();
      })
    );

    for (const ticket of ticketResults) {
      if (!isCustomerPortal(ticket.properties?.customer_portal)) {
        continue;
      }

      totalUnreadCount += Math.max(
        0,
        Number(ticket.properties?.customer_unread_count || 0) || 0
      );
    }

    console.log(
      `Customer ticket ${requestedTicketId} marked read. Remaining unread: ${totalUnreadCount}`
    );

    // STEP 9: SUCCESS RESPONSE
    return res.status(200).json({
      success: true,
      ticketUnreadCount: 0,
      totalUnreadCount,
    });

  } catch (error) {
    console.error('Customer mark-ticket-read error:', error);

    return res.status(error.status || 500).json({
      success: false,
      message: 'Unable to complete mark-ticket-read request',
    });
  }
});







app.post('/get-owner-id', async (req, res) => {
  const { email } = req.body;
  console.log('=== get-owner-id hit ===');
  console.log('Email received:', email);

  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    const response = await axios.get(
      'https://api.hubapi.com/crm/v3/owners?archived=false',
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
        },
      }
    );

    const owners = response.data.results || [];
    console.log('Total owners found:', owners.length);
    console.log('All owner emails:', owners.map(o => o.email));

    const matchedOwner = owners.find(
      (owner) => owner.email?.toLowerCase() === email?.toLowerCase()
    );

    console.log('Matched owner:', matchedOwner || 'NOT FOUND');

    if (!matchedOwner) {
      return res.status(200).json({ ownerId: null }); 
    }

    return res.status(200).json({ ownerId: matchedOwner.userId, OwnerUserID: matchedOwner.id });

  } catch (err) {
    console.error('Get owner error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to get owner' });
  }
});


//Get Conversation Details
app.post('/get_ticket_conversation', async (req, res) => {
  const { ticketId } = req.body;

  if (!ticketId) {
    return res.status(400).json({ message: 'Ticket ID is required' });
  }

  try {
    const fetch = (...args) =>
      import('node-fetch').then(({ default: fetch }) => fetch(...args));

    // 1️⃣ GET THREAD ID FROM TICKET
    const ticketRes = await fetch(
      `https://api.hubapi.com/crm/v3/objects/tickets/${ticketId}?properties=hs_conversations_originating_thread_id`,
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
        },
      }
    );

    const ticketData = await ticketRes.json();
    const threadId =
      ticketData?.properties?.hs_conversations_originating_thread_id;

      console.log('threadId--- ' , threadId);
    if (!threadId) {
      return res.status(200).json({
        messages: [],
      });
    }

    // 2️⃣ GET THREAD MESSAGES
    const msgRes = await fetch(
      `https://api.hubapi.com/conversations/v3/conversations/threads/${threadId}/messages`,
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
        },
      }
    );

    const msgData = await msgRes.json();

    console.log('msgData--- ', msgData.results);  

    const formattedMessages = msgData.results
      .filter(m => m.type === 'MESSAGE')
      .map(m => {
        const sender = m.senders?.[0] || {};
        const email = sender?.deliveryIdentifier?.value || '';
        const name = sender?.name || email;

        return {
          id: m.id,
          direction: m.direction,
          senderName: name,
          text: m.text || '',
          richText: m.richText || '',
          createdAt: m.createdAt,
          subject : m.subject,
          attachments: m.attachments,
          channelAccountId : m.channelAccountId,
          channelId: m.channelId,
          conversationsThreadId: m.conversationsThreadId,
        };
      });

    return res.status(200).json({
      messages: formattedMessages,
    });

  } catch (err) {
    console.error('Conversation error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});



// app.post('/upload-to-hubspot', upload.array('files'), async (req, res) => {
//   try {
//     const uploadedFiles = [];

//     console.log('req.files--- ', req.files);

//     if (req.files && req.files.length > 0) {
//       for (const file of req.files) {
//         const formData = new FormData();
//         formData.append('file', fs.createReadStream(file.path));
//         formData.append('fileName', file.originalname);
//         formData.append('folderId', '204201997753');
//         formData.append('options', JSON.stringify({ access: 'PUBLIC_INDEXABLE' }));

//         const response = await axios.post(
//           'https://api.hubapi.com/files/v3/files',
//           formData,
//           {
//             headers: {
//               Authorization: `Bearer ${HUBSPOT_API_KEY}`,
//               ...formData.getHeaders(),
//             },
//           }
//         );

//         uploadedFiles.push({
//           id: response.data.id,
//           url: response.data.url,
//           name: file.originalname,
//         });

//         fs.unlinkSync(file.path); // temp file delete
//       }
//     }

//     res.status(200).json({ files: uploadedFiles });
//   } catch (err) {
//     console.error('Upload error:', err.response?.data || err.message);
//     res.status(500).json({ error: 'File upload failed' });
//   }
// });

// ✅ Send Message to HubSpot Thread


const uploadedFilesForViewTicket = [];
app.post('/upload-to-hubspot-view', hubspotUpload.array('files'), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.json({ success: true, files: [] });
    }
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(file.path));
      formData.append('fileName', file.originalname);
      formData.append('folderId', '204201997753'); 
      formData.append(
        'options',
        JSON.stringify({ access: 'PUBLIC_INDEXABLE' })
      );
      const response = await axios.post(
        'https://api.hubapi.com/files/v3/files',
        formData,
        {
          headers: {
            Authorization: `Bearer ${HUBSPOT_API_KEY}`,
            ...formData.getHeaders(),
          },
        }
      );
      uploadedFilesForViewTicket.push({
        id: response.data.id,
        url: response.data.url,
      });
      fs.unlinkSync(file.path);
    }
    res.json({
      success: true,
      files: uploadedFilesForViewTicket,
    });
    console.log('uploadedFilesForViewTicket--- ', uploadedFilesForViewTicket);
    uploadedFilesForViewTicket.length = 0; 
  } catch (err) {
    console.log(err.response?.data || err);
    res.status(500).json({ error: 'File upload failed' });
  }
});

app.post('/send-hubspot-message', async (req, res) => {
  const { threadId, text, recipientEmail, attachmentIds, channelAccountId, channelId, senderActorId, subject } = req.body;

  console.log('=== send-hubspot-message hit ===');
  console.log('threadId:', threadId);
  console.log('text:', text);
  console.log('recipientEmail:', recipientEmail);
  console.log('attachmentIds:', attachmentIds);
  console.log('channelAccountId:', channelAccountId);
  console.log('channelId:', channelId);
  console.log('senderActorId received:', senderActorId);
  console.log('subject:', subject);

  try {
    // ✅ Postman format exactly match
    const body = {
      type: 'MESSAGE',
      text: text,
      subject: subject,
      senderActorId: senderActorId,
      channelId: '1002',
      channelAccountId: '597383280',
      recipients: [
        {
          recipientField: 'TO',
          deliveryIdentifiers: [
            { type: 'HS_EMAIL_ADDRESS', value: recipientEmail },
          ],
        },
      ],
    };

    // ✅ Attachments sirf tab add karo jab hain
    if (attachmentIds && attachmentIds.length > 0) {
      body.attachments = attachmentIds.map((id) => ({ fileId: String(id) }));
    }

    console.log('Final body HubSpot ko ja raha hai:', JSON.stringify(body, null, 2));

    const response = await axios.post(
      `https://api.hubapi.com/conversations/v3/conversations/threads/${threadId}/messages`,
      body,
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ HubSpot response:', response.data);
    return res.status(200).json({ success: true, data: response.data });

  } catch (err) {
    console.error('❌ Send message error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Message send failed', detail: err.response?.data });
  }
});


app.get('/customer-news', async (req, res) => {  
  try {
    const response = await fetch(
      'https://api.hubapi.com/cms/v3/blogs/posts?contentGroupId__eq=189594723724',
      {
        method: 'GET',
        headers: { 
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.log('Customer News Error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
});
 


app.listen(PORT,'0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));


app.listen(PORT, () => console.log(`Server running on ${PORT}`));
// app.listen(PORT,'0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));