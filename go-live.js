const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const NGROK_PATH = path.join(__dirname, 'node_modules', 'ngrok', 'bin', 'ngrok.exe');

console.log(`
╔══════════════════════════════════════╗
║   🏪 صالون الأناقة - نظام الحجز     ║
║   🚀 تشغيل الموقع على الإنترنت...   ║
╚══════════════════════════════════════╝
`);

// 1. Kill any existing node/ngrok processes
try {
  execSync('taskkill /F /IM node.exe 2>nul', { stdio: 'ignore' });
} catch (e) { /* ignore */ }
try {
  execSync('taskkill /F /IM ngrok.exe 2>nul', { stdio: 'ignore' });
} catch (e) { /* ignore */ }

// 2. Start the Node.js server
console.log('📡 Starting server...');
const server = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

// 3. Give server a moment to start
setTimeout(() => {
  // 4. Start ngrok
  console.log('\n🔗 Creating public tunnel (ngrok)...');
  
  const ngrok = spawn(NGROK_PATH, ['http', '3000', '--log=stdout'], {
    cwd: __dirname,
    shell: true
  });

  let outputBuffer = '';

  ngrok.stdout.on('data', (data) => {
    const text = data.toString();
    outputBuffer += text;
    console.log('[ngrok]', text.trim());

    // Try to extract URL from output
    const urlMatch = outputBuffer.match(/https?:\/\/[a-zA-Z0-9-]+\.ngrok\.io/);
    if (urlMatch) {
      const url = urlMatch[0].replace(/\/$/, '');
      displayPublicURL(url);
    }
  });

  ngrok.stderr.on('data', (data) => {
    const text = data.toString();
    outputBuffer += text;
    
    // ngrok sometimes outputs URL to stderr
    const urlMatch = outputBuffer.match(/https?:\/\/[a-zA-Z0-9-]+\.ngrok\.io/);
    if (urlMatch) {
      const url = urlMatch[0].replace(/\/$/, '');
      displayPublicURL(url);
    }
  });

  ngrok.on('error', (err) => {
    console.error('❌ ngrok error:', err.message);
    alternativeSolution();
  });

  ngrok.on('close', (code) => {
    console.log(`ngrok exited with code ${code}`);
  });

  // 5. Also try to get URL from local ngrok API
  setTimeout(() => {
    checkNgrokAPI();
  }, 5000);

}, 2000);

// Try to get URL from ngrok's local API
function checkNgrokAPI() {
  const http = require('http');
  
  const req = http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const tunnels = JSON.parse(data);
        if (tunnels.tunnels && tunnels.tunnels.length > 0) {
          const publicUrl = tunnels.tunnels[0].public_url;
          displayPublicURL(publicUrl);
        }
      } catch (e) {
        // ngrok API not ready yet
      }
    });
  });
  
  req.on('error', () => {
    // ngrok API not available yet
  });
}

function displayPublicURL(url) {
  console.clear();
  console.log(`
╔══════════════════════════════════════════════════╗
║   ✅  صالون الأناقة - أصبح متاحاً على الإنترنت! ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║   📱  افتح هذا الرابط في الجوال أو أي جهاز:     ║
║                                                  ║
║   🔗  ${url}  ║
║                                                  ║
╠══════════════════════════════════════════════════╣
║   💡  الرابط ثابت طالما هذه النافذة مفتوحة      ║
║   ❌  اضغط Ctrl+C لإيقاف الخدمة                 ║
╚══════════════════════════════════════════════════╝
  `);

  // Save URL to a file for reference
  fs.writeFileSync(path.join(__dirname, 'public-url.txt'), url, 'utf-8');
  
  // Also open in browser
  try {
    execSync(`start "" "${url}"`, { stdio: 'ignore' });
  } catch (e) { /* ignore */ }
}

function alternativeSolution() {
  console.log(`
╔══════════════════════════════════════════════════╗
║   ❌  تعذر تشغيل ngrok تلقائياً                 ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║   افتح نافذة Terminal جديدة واكتب:              ║
║                                                  ║
║   cd "c:/Users/MS Tech/Desktop/My_Project"      ║
║   npx ngrok http 3000                            ║
║                                                  ║
║   ثم افتح http://localhost:4040 في المتصفح      ║
╚══════════════════════════════════════════════════╝
  `);
}

// Handle process exit
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  try { execSync('taskkill /F /IM node.exe 2>nul', { stdio: 'ignore' }); } catch(e) {}
  try { execSync('taskkill /F /IM ngrok.exe 2>nul', { stdio: 'ignore' }); } catch(e) {}
  process.exit(0);
});
