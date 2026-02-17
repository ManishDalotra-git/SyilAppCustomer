require('dotenv').config();
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
    // const { question } = req.body;
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

    // 🔹 Extract message block
    const messageBlock = response.data.output.find(
      o => o.type === 'message'
    );

    const content = messageBlock?.content?.[0] || {};
    const text = content.text || '';
    const annotations = content.annotations || [];

    // 🔹 Only FIRST title
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









// storage config for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // temporary folder
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

// endpoint to upload JSON
app.post('/upload-articles', upload.single('file'), (req, res) => {
  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, 'assets', 'articles.json');

  fs.readFile(tempPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error reading file' });

    // optional: validate JSON
    try {
      JSON.parse(data);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid JSON file' });
    }

    fs.writeFile(targetPath, data, 'utf8', (err) => {
      if (err) return res.status(500).json({ message: 'Error saving file' });

      // delete temp file
      fs.unlinkSync(tempPath);

      res.json({ message: 'articles.json updated successfully' });
    });
  });
});









// Step 1: Search contact by email
app.post('/get-contact-id', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const fetch = (...args) =>
      import('node-fetch').then(({ default: fetch }) => fetch(...args));

    // 1️⃣ SEARCH CONTACT
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
    console.log('uploadedFiles----- ' , uploadedFiles);
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

    // 🟡 safety
    const categoryArray = Array.isArray(categories) ? categories : [];

    // ✅ HubSpot FORM FIELDS (value kabhi undefined nahi)
    const fields = [
      { objectTypeId: '0-1', name: 'email', value: email || '' },

      { objectTypeId: '0-5', name: 'subject', value: subject || '' },
      { objectTypeId: '0-5', name: 'content', value: description || '' },
      { objectTypeId: '0-5', name: 'end_customer_name', value: company || '' },
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
    ];

  

    console.log('uploadedFiles----- ', uploadedFiles);

    if ( uploadedFiles && uploadedFiles.length > 0 ) 
        {
          const fileIds = uploadedFiles.map(f => f.id);

          fields.push({
            objectTypeId: '0-5',
            name: 'hs_file_upload', // HubSpot form file field name
            value: fileIds.join(';'),
          });
        }

    const formUrl = 'https://api.hsforms.com/submissions/v3/integration/submit/4392290/d3c790a4-c601-4a54-b826-0a5ca3f57428';


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


 



// Step 3: check login details in hubspot
app.post('/check_login_detail', async (req, res) => {
  const { email, password } = req.body;
  console.log('email---- ' , email);
  console.log(HUBSPOT_API_KEY);
  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required',
    });
  }

  try {
    const fetch = (...args) =>
      import('node-fetch').then(({ default: fetch }) => fetch(...args));

    // 1️⃣ SEARCH CONTACT BY EMAIL
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
          properties: ['email', 'mobile_password', 'firstname', 'lastname', 'profile_image', 'bio', 'phone', 'gender'],
        }),
      }
    );

    const searchData = await searchResponse.json();

    // EMAIL NOT FOUND
    if (!searchData.results || searchData.results.length === 0) {
      return res.status(401).json({
        message: 'Invalid email, please enter your valid email',
      });
    }

    // CONTACT FOUND
    const contact = searchData.results[0];
    const contactId = contact.id;
    const hubspotPassword = contact.properties.mobile_password;

    // PASSWORD NOT SET
    if (!hubspotPassword) {
      return res.status(401).json({
        message: 'Password not set for this account',
      });
    }

    // PASSWORD DOES NOT MATCH
    if (hubspotPassword !== password) {
      return res.status(401).json({
        message: 'Please enter a valid password',
      });
    }

    // LOGIN SUCCESS
    return res.status(200).json({
      message: 'Login successful',
      contactId: contactId,
      user: {
        email: contact.properties.email,
        firstName: contact.properties.firstname || '',
        lastName: contact.properties.lastname || '',
        profileImage: contact.properties.hs_avatar_url || '',
        bio: contact.properties.bio || '',
        phone: contact.properties.phone || '',
        gender: contact.properties.gender || '',
      },
    });

  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      message: 'Internal server error',
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
app.post('/get_contact_tickets', async (req, res) => {
  const { contactId } = req.body;

  console.log('contactId---- ', contactId);
  if (!contactId) {
    return res.status(400).json({
      message: 'Contact ID is required',
    });
  }

  try {
    const fetch = (...args) =>
      import('node-fetch').then(({ default: fetch }) => fetch(...args));

    // 1️⃣ GET TICKET ASSOCIATIONS
    const associationResponse = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}/associations/ticket`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const associationData = await associationResponse.json();

    if (!associationData.results || associationData.results.length === 0) {
      return res.status(200).json({
        message: 'No tickets found',
        tickets: [],
      });
    }

    // 2️⃣ EXTRACT TICKET IDS
    const ticketIds = associationData.results.map(item => item.id);

    // 3️⃣ FETCH EACH TICKET DETAIL
    const ticketPromises = ticketIds.map(ticketId =>
      fetch(
        `https://api.hubapi.com/crm/v3/objects/tickets/${ticketId}?properties=subject,createdate,hubspot_owner_id,hs_pipeline_stage`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      ).then(res => res.json())
    );

    const ticketResponses = await Promise.all(ticketPromises);

    // 4️⃣ FORMAT RESPONSE (UI FRIENDLY)
    const formattedTickets = ticketResponses.map(ticket => ({
      ticketId: ticket.id,
      subject: ticket.properties.subject || '',
      createdDate: ticket.properties.createdate || '',
      ownerId: ticket.properties.hubspot_owner_id || '',
      status: ticket.properties.hs_pipeline_stage || '',
    }));

    return res.status(200).json({
      message: 'Tickets fetched successfully',
      tickets: formattedTickets,
    });

  } catch (error) {
    console.error('Ticket Fetch Error:', error);
    return res.status(500).json({
      message: 'Internal server error',
    });
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

    // 3️⃣ FORMAT MESSAGES
    const formattedMessages = msgData.results
      .filter(m => m.type === 'MESSAGE')
      .map(m => {
        const sender = m.senders?.[0] || {};
        const email = sender?.deliveryIdentifier?.value || '';
        const name = sender?.name || email;

        return {
          id: m.id,
          direction: m.direction, // INCOMING / OUTGOING
          senderName: name,
          text: m.text || '',
          richText: m.richText || '',
          createdAt: m.createdAt,
          subject : m.subject,
          attachments: m.attachments,
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


app.listen(PORT,'0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));


app.listen(PORT, () => console.log(`Server running on ${PORT}`));
// app.listen(PORT,'0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));