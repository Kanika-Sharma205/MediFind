const http = require('http');
const fs = require('fs');
const path = require('path');

const loginPayload = JSON.stringify({ email: 'admin@medifind.test', password: 'Admin@1234' });

const loginReq = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginPayload),
  },
}, (loginRes) => {
  let loginData = '';
  loginRes.on('data', (chunk) => {
    loginData += chunk;
  });
  loginRes.on('end', () => {
    const body = JSON.parse(loginData);
    const auth = `Bearer ${body.token}`;
    const boundary = '----MediFindBoundary';
    const fileBuffer = Buffer.from('sample prescription upload');
    const header = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="prescription.txt"\r\nContent-Type: text/plain\r\n\r\n`;
    const footer = `\r\n--${boundary}--\r\n`;
    const requestBody = Buffer.concat([Buffer.from(header), fileBuffer, Buffer.from(footer)]);

    const uploadReq = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/prescriptions',
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': requestBody.length,
      },
    }, (uploadRes) => {
      let uploadData = '';
      uploadRes.on('data', (chunk) => {
        uploadData += chunk;
      });
      uploadRes.on('end', () => {
        console.log('UPLOAD_STATUS', uploadRes.statusCode);
        console.log(uploadData);
      });
    });

    uploadReq.on('error', (error) => {
      console.error(error);
      process.exit(1);
    });

    uploadReq.write(requestBody);
    uploadReq.end();
  });
});

loginReq.on('error', (error) => {
  console.error(error);
  process.exit(1);
});

loginReq.write(loginPayload);
loginReq.end();
