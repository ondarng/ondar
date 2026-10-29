const { SignJWT } = require('jose');
const http = require('http');

async function main() {
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET is required');
  }
  const secretKey = new TextEncoder().encode(process.env.SESSION_SECRET);
  const token = await new SignJWT({ merchantId: 'cmvfgin1c0002u914agtq7qqs' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secretKey);

  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/dashboard',
    method: 'GET',
    headers: {
      Cookie: `ondar_session=${token}`,
    },
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('STATUS:', res.statusCode);
      console.log('HTML PREVIEW:');
      console.log('Includes Caleb:', data.includes('Caleb'));
      console.log('Includes cybar:', data.includes('cybar'));
      console.log('Includes 64,000:', data.includes('64,000'));
      console.log('Includes ₦0:', data.includes('₦0'));
      console.log('Includes All caught up:', data.includes('All caught up'));
    });
  });

  req.end();
}

main();
