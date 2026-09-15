const fs = require('fs');
const path = require('path');
const http = require('http');
const xlsx = require('xlsx');

const workbook = xlsx.utils.book_new();
const sheet = xlsx.utils.aoa_to_sheet([
  ['skuCode', 'genericName', 'brandName', 'manufacturerName', 'pharmacyName', 'batchNumber', 'expiryDate', 'purchasePrice', 'sellingPrice', 'quantity'],
  ['IMPORT-001', 'Imported Medicine', 'Imported Brand', 'Imported Manufacturer', 'Wellness Plus Pharmacy', 'IMP-001', '2028-12-31', '15.50', '20.00', '25'],
]);
xlsx.utils.book_append_sheet(workbook, sheet, 'Sheet1');
const filePath = path.join(process.cwd(), 'tmp-import.xlsx');
xlsx.writeFile(workbook, filePath);

const uploadBuffer = fs.readFileSync(filePath);
const boundary = '----MediFindBoundary';
const header = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="tmp-import.xlsx"\r\nContent-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n`;
const footer = `\r\n--${boundary}--\r\n`;
const body = Buffer.concat([Buffer.from(header), uploadBuffer, Buffer.from(footer)]);

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
    const loginBody = JSON.parse(loginData);
    const token = loginBody.token;
    const importReq = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/medicines/import',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    }, (importRes) => {
      let importData = '';
      importRes.on('data', (chunk) => {
        importData += chunk;
      });
      importRes.on('end', () => {
        console.log('IMPORT_STATUS', importRes.statusCode);
        console.log(importData);
        fs.unlinkSync(filePath);
      });
    });
    importReq.on('error', (error) => {
      console.error(error);
      process.exit(1);
    });
    importReq.write(body);
    importReq.end();
  });
});

loginReq.on('error', (error) => {
  console.error(error);
  process.exit(1);
});

loginReq.write(loginPayload);
loginReq.end();
