/* ============================================================
   THARVID CTF  –  A 5-stage CLI capture-the-flag game
   Author: Sunil Kumar  |  tharvid.in
   ============================================================ */

(function () {
    'use strict';

    // ── DOM refs ──
    const landing    = document.getElementById('ctfLanding');
    const termScreen = document.getElementById('ctfTerminal');
    const completeScr= document.getElementById('ctfComplete');
    const output     = document.getElementById('terminalOutput');
    const input      = document.getElementById('terminalInput');
    const promptEl   = document.getElementById('prompt');
    const hudStage   = document.getElementById('hudStage');
    const hudTitle   = document.getElementById('hudTitle');
    const hudTimer   = document.getElementById('hudTimer');
    const progressFill = document.getElementById('progressFill');
    const hintBtn    = document.getElementById('hintBtn');
    const hintCount  = document.getElementById('hintCount');
    const startBtn   = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    const shareTwitter  = document.getElementById('shareTwitter');
    const shareLinkedin = document.getElementById('shareLinkedin');
    const hamburger  = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    // ── State ──
    let currentStage = 0;
    let hintsUsed    = 0;
    let hintsLeft    = 3;
    let timerStart   = 0;
    let timerInterval= null;
    let commandHistory = [];
    let historyIdx   = -1;

    // ── Helpers ──
    function escapeHTML(s) {
        const d = document.createElement('div');
        d.appendChild(document.createTextNode(s));
        return d.innerHTML;
    }

    function print(text, cls) {
        const div = document.createElement('div');
        div.className = 'line' + (cls ? ' ' + cls : '');
        div.innerHTML = escapeHTML(text);
        output.appendChild(div);
        output.scrollTop = output.scrollHeight;
    }

    function printRaw(html, cls) {
        const div = document.createElement('div');
        div.className = 'line' + (cls ? ' ' + cls : '');
        div.innerHTML = html;
        output.appendChild(div);
        output.scrollTop = output.scrollHeight;
    }

    function printLines(lines, cls) {
        lines.forEach(function (l) { print(l, cls); });
    }

    function printBlank() { print(''); }

    function clearTerminal() { output.innerHTML = ''; }

    function setPrompt(p) { promptEl.textContent = p; }

    function updateHUD() {
        const s = stages[currentStage];
        hudStage.textContent = 'STAGE ' + (currentStage + 1) + '/5';
        hudTitle.textContent = s.title;
        progressFill.style.width = ((currentStage) / 5 * 100) + '%';
    }

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    function startTimer() {
        timerStart = Date.now();
        timerInterval = setInterval(function () {
            const elapsed = Math.floor((Date.now() - timerStart) / 1000);
            hudTimer.textContent = formatTime(elapsed);
        }, 1000);
    }

    function getElapsed() {
        return Math.floor((Date.now() - timerStart) / 1000);
    }

    function b64Encode(s) { return btoa(s); }
    function b64Decode(s) {
        try { return atob(s); } catch (e) { return null; }
    }

    // ── Stage definitions ──
    const stages = [
        // ──────── STAGE 1: RECON ────────
        {
            title: 'RECON',
            prompt: 'analyst@recon:~$ ',
            init: function () {
                printLines([
                    '╔══════════════════════════════════════════════════════╗',
                    '║  STAGE 1: RECONNAISSANCE                           ║',
                    '╚══════════════════════════════════════════════════════╝',
                ], 'header');
                printBlank();
                printLines([
                    '[BRIEFING] We\'ve identified a suspicious server at 10.13.37.100.',
                    'Your mission: gather intel and find the hidden access code.',
                    '',
                    'Available commands: nmap, whois, dig, curl, cat, help',
                ], 'system');
                printBlank();
            },
            hints: [
                'Try scanning the target with: nmap 10.13.37.100',
                'Look at the scan results carefully. Notice the HTTP service? Try: curl 10.13.37.100',
                'The response contains a base64 string in a comment. Decode it with: echo Y3J5cHQwX3VubG9ja2Vk | base64 -d',
            ],
            handle: function (cmd) {
                const raw = cmd.trim();
                const c = raw.toLowerCase();

                if (c === 'help') {
                    printLines([
                        'Available commands:',
                        '  nmap <target>   - Port scan a target',
                        '  whois <target>  - WHOIS lookup',
                        '  dig <target>    - DNS lookup',
                        '  curl <target>   - Fetch HTTP content',
                        '  echo <str> | base64 -d  - Decode base64',
                        '  clear           - Clear terminal',
                    ], 'dim');
                    return;
                }

                if (c === 'nmap') {
                    print('Usage: nmap <target>', 'error');
                    print('Example: nmap 10.13.37.100', 'dim');
                    return;
                }

                if (c.startsWith('nmap ')) {
                    var target = c.replace('nmap ', '').trim();
                    if (target !== '10.13.37.100' && target !== 'shadownet.io') {
                        print('Host seems down. Try the known target: 10.13.37.100', 'error');
                        return;
                    }
                    printBlank();
                    printLines([
                        'Starting Nmap 7.94 ( https://nmap.org )',
                        'Nmap scan report for 10.13.37.100',
                        'Host is up (0.0023s latency).',
                        '',
                        'PORT      STATE    SERVICE      VERSION',
                        '22/tcp    closed   ssh',
                        '80/tcp    open     http         Apache/2.4.52',
                        '443/tcp   filtered https',
                        '3306/tcp  closed   mysql',
                        '8080/tcp  open     http-proxy   nginx/1.18.0',
                        '',
                        'Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel',
                        '',
                        'Nmap done: 1 IP address (1 host up) scanned in 4.20s',
                    ]);
                    return;
                }

                if (c === 'whois') {
                    print('Usage: whois <domain>', 'error');
                    print('Example: whois shadownet.io', 'dim');
                    return;
                }

                if (c.startsWith('whois ')) {
                    printLines([
                        'Domain Name: SHADOWNET.IO',
                        'Registrar: NAMECHEAP INC',
                        'Creation Date: 2019-03-15T00:00:00Z',
                        'Registrant Organization: ShadowNet Corp',
                        'Registrant Email: admin@shadownet.io',
                        'Name Server: ns1.shadownet.io',
                    ]);
                    return;
                }

                if (c === 'dig') {
                    print('Usage: dig <domain>', 'error');
                    print('Example: dig shadownet.io', 'dim');
                    return;
                }

                if (c.startsWith('dig ')) {
                    printLines([
                        ';; ANSWER SECTION:',
                        'shadownet.io.    300    IN    A    10.13.37.100',
                        'shadownet.io.    300    IN    MX   mail.shadownet.io.',
                        'shadownet.io.    300    IN    TXT  "v=spf1 include:shadownet.io ~all"',
                    ]);
                    return;
                }

                if (c === 'curl') {
                    print('Usage: curl <url>', 'error');
                    print('Example: curl 10.13.37.100', 'dim');
                    return;
                }

                if (c.startsWith('curl ')) {
                    printBlank();
                    printLines([
                        'HTTP/1.1 200 OK',
                        'Server: Apache/2.4.52',
                        'Content-Type: text/html; charset=UTF-8',
                        'X-Powered-By: ShadowNet/3.1',
                        '',
                        '<html>',
                        '<head><title>ShadowNet Portal</title></head>',
                        '<body>',
                        '  <h1>Welcome to ShadowNet</h1>',
                        '  <p>Authorized personnel only.</p>',
                        '  <!-- TODO: remove before prod -->',
                        '  <!-- backup auth: Y3J5cHQwX3VubG9ja2Vk -->',
                        '</body>',
                        '</html>',
                    ]);
                    return;
                }

                if (c === 'echo') {
                    print('Usage: echo <string> | base64 -d', 'error');
                    print('Example: echo SGVsbG8= | base64 -d', 'dim');
                    return;
                }

                // Check for base64 decode attempts
                if (c.includes('base64') && c.includes('-d')) {
                    // Use raw (not lowercased) to preserve base64 case
                    const parts = raw.split('|')[0];
                    const echoMatch = parts.match(/echo\s+(.+)/);
                    if (echoMatch) {
                        const attempt = echoMatch[1].trim().replace(/['"]/g, '');
                        const decoded = b64Decode(attempt);
                        if (decoded) {
                            print(decoded);
                            if (decoded === 'crypt0_unlocked') {
                                printBlank();
                                print('[+] ACCESS CODE FOUND: crypt0_unlocked', 'success');
                                print('[+] Stage 1 complete! Moving to Stage 2...', 'success');
                                printBlank();
                                nextStage();
                                return;
                            }
                        } else {
                            print('base64: invalid input', 'error');
                        }
                    }
                    return;
                }

                // Direct answer check
                if (c === 'crypt0_unlocked') {
                    printBlank();
                    print('[+] ACCESS CODE ACCEPTED!', 'success');
                    print('[+] Stage 1 complete! Moving to Stage 2...', 'success');
                    printBlank();
                    nextStage();
                    return;
                }

                if (c === 'cat') {
                    print('cat: specify a file to read', 'error');
                    return;
                }

                print('Command not found: ' + cmd.split(' ')[0] + '. Type "help" for available commands.', 'error');
            }
        },

        // ──────── STAGE 2: CRYPTO ────────
        {
            title: 'CRYPTOGRAPHY',
            prompt: 'analyst@crypto:~$ ',
            init: function () {
                printLines([
                    '╔══════════════════════════════════════════════════════╗',
                    '║  STAGE 2: CRYPTOGRAPHY                              ║',
                    '╚══════════════════════════════════════════════════════╝',
                ], 'header');
                printBlank();
                printLines([
                    '[BRIEFING] You\'ve intercepted an encrypted message from ShadowNet.',
                    'The intel suggests they use a classic Caesar cipher.',
                    '',
                    'Intercepted message:',
                ], 'system');
                printBlank();
                // "ghost_protocol" shifted by 13 (ROT13) = "tubfg_cebgbpby"
                print('  ENCRYPTED: tubfg_cebgbpby', 'warning');
                printBlank();
                printLines([
                    'Available commands: rot <n> <text>, decrypt, submit <answer>, help',
                    '',
                    'Hint: Caesar ciphers shift letters by N positions.',
                ], 'system');
                printBlank();
            },
            hints: [
                'Caesar cipher with what shift? The most famous one is ROT13 (shift of 13).',
                'Try: rot 13 tubfg_cebgbpby',
                'The decrypted text is "ghost_protocol". Submit it with: submit ghost_protocol',
            ],
            handle: function (cmd) {
                const c = cmd.trim().toLowerCase();

                if (c === 'help') {
                    printLines([
                        'Available commands:',
                        '  rot <n> <text>    - Apply Caesar/ROT shift',
                        '  submit <answer>   - Submit decrypted answer',
                        '  clear             - Clear terminal',
                    ], 'dim');
                    return;
                }

                if (c === 'rot' || c === 'caesar') {
                    print('Usage: rot <shift> <text>', 'error');
                    print('Example: rot 13 tubfg_cebgbpby', 'dim');
                    return;
                }

                if (c === 'submit') {
                    print('Usage: submit <answer>', 'error');
                    return;
                }

                if (c.startsWith('rot ') || c.startsWith('caesar ')) {
                    const parts = c.split(/\s+/);
                    if (parts.length < 3) {
                        print('Usage: rot <shift> <text>', 'error');
                        return;
                    }
                    const shift = parseInt(parts[1], 10);
                    const text = parts.slice(2).join(' ');
                    if (isNaN(shift)) {
                        print('Shift must be a number', 'error');
                        return;
                    }
                    const result = caesarShift(text, shift);
                    print('Result: ' + result);
                    if (result === 'ghost_protocol') {
                        printBlank();
                        print('[*] That looks like it could be the password!', 'warning');
                    }
                    return;
                }

                if (c === 'decrypt') {
                    print('Trying all 25 shifts on "tubfg_cebgbpby":', 'system');
                    printBlank();
                    for (let i = 1; i <= 25; i++) {
                        const shifted = caesarShift('tubfg_cebgbpby', i);
                        const marker = (i === 13) ? '  <-- ROT13' : '';
                        print('  ROT-' + String(i).padStart(2, '0') + ': ' + shifted + marker, i === 13 ? 'success' : 'dim');
                    }
                    return;
                }

                if (c.startsWith('submit ')) {
                    const answer = c.replace('submit ', '').trim();
                    if (answer === 'ghost_protocol') {
                        printBlank();
                        print('[+] DECRYPTION SUCCESSFUL: ghost_protocol', 'success');
                        print('[+] Stage 2 complete! Moving to Stage 3...', 'success');
                        printBlank();
                        nextStage();
                        return;
                    } else {
                        print('[-] Incorrect. Keep trying.', 'error');
                        return;
                    }
                }

                // Direct answer
                if (c === 'ghost_protocol') {
                    printBlank();
                    print('[+] DECRYPTION SUCCESSFUL: ghost_protocol', 'success');
                    print('[+] Stage 2 complete! Moving to Stage 3...', 'success');
                    printBlank();
                    nextStage();
                    return;
                }

                print('Command not found: ' + cmd.split(' ')[0] + '. Type "help" for available commands.', 'error');
            }
        },

        // ──────── STAGE 3: LOG ANALYSIS ────────
        {
            title: 'FORENSICS',
            prompt: 'analyst@forensics:~$ ',
            init: function () {
                printLines([
                    '╔══════════════════════════════════════════════════════╗',
                    '║  STAGE 3: LOG FORENSICS                             ║',
                    '╚══════════════════════════════════════════════════════╝',
                ], 'header');
                printBlank();
                printLines([
                    '[BRIEFING] We\'ve gained access to the ShadowNet auth logs.',
                    'Analyze them to find the compromised account.',
                    '',
                    'Available commands: cat, grep, wc, head, tail, submit <user>, help',
                ], 'system');
                printBlank();
            },
            hints: [
                'Start by reading the logs: cat /var/log/auth.log',
                'Look for brute force patterns — multiple failed logins followed by a success. Try: grep "Failed" /var/log/auth.log',
                'The attacker used the account "dr.phantom". Submit it: submit dr.phantom',
            ],
            handle: function (cmd) {
                const c = cmd.trim().toLowerCase();

                var authLog = [
                    'Mar 15 02:13:01 shadow sshd[1201]: Accepted publickey for admin from 192.168.1.10 port 22',
                    'Mar 15 02:14:22 shadow sshd[1205]: Failed password for root from 45.33.32.156 port 22',
                    'Mar 15 02:14:23 shadow sshd[1206]: Failed password for root from 45.33.32.156 port 22',
                    'Mar 15 02:14:24 shadow sshd[1207]: Failed password for root from 45.33.32.156 port 22',
                    'Mar 15 02:15:01 shadow sshd[1210]: Accepted password for jenkins from 10.0.0.5 port 22',
                    'Mar 15 03:41:05 shadow sshd[1301]: Failed password for dr.phantom from 103.77.192.4 port 22',
                    'Mar 15 03:41:06 shadow sshd[1302]: Failed password for dr.phantom from 103.77.192.4 port 22',
                    'Mar 15 03:41:07 shadow sshd[1303]: Failed password for dr.phantom from 103.77.192.4 port 22',
                    'Mar 15 03:41:08 shadow sshd[1304]: Failed password for dr.phantom from 103.77.192.4 port 22',
                    'Mar 15 03:41:09 shadow sshd[1305]: Failed password for dr.phantom from 103.77.192.4 port 22',
                    'Mar 15 03:41:11 shadow sshd[1306]: Accepted password for dr.phantom from 103.77.192.4 port 22',
                    'Mar 15 03:42:00 shadow sudo: dr.phantom : TTY=pts/0 ; PWD=/home/dr.phantom ; COMMAND=/bin/cat /etc/shadow',
                    'Mar 15 04:00:15 shadow sshd[1401]: Accepted publickey for deploy from 10.0.0.20 port 22',
                    'Mar 15 04:12:33 shadow sshd[1410]: Failed password for guest from 198.51.100.7 port 22',
                    'Mar 15 05:00:00 shadow CRON[1501]: (root) CMD (/usr/bin/backup.sh)',
                ];

                if (c === 'help') {
                    printLines([
                        'Available commands:',
                        '  cat /var/log/auth.log          - Read the auth log',
                        '  grep "<pattern>" /var/log/auth.log  - Search logs',
                        '  head /var/log/auth.log         - First 5 lines',
                        '  tail /var/log/auth.log         - Last 5 lines',
                        '  wc /var/log/auth.log           - Count lines',
                        '  submit <username>              - Submit compromised account',
                        '  clear                          - Clear terminal',
                    ], 'dim');
                    return;
                }

                if (c.includes('cat') && c.includes('auth.log')) {
                    authLog.forEach(function (line) {
                        var cls = '';
                        if (line.includes('Failed')) cls = 'error';
                        else if (line.includes('Accepted')) cls = 'success';
                        else cls = 'dim';
                        print(line, cls);
                    });
                    return;
                }

                if (c.startsWith('grep') && c.includes('auth.log')) {
                    var pattern = '';
                    var match = c.match(/grep\s+["']([^"']+)["']/i);
                    if (!match) match = c.match(/grep\s+(\S+)/i);
                    if (match) pattern = match[1].toLowerCase();

                    if (!pattern) {
                        print('Usage: grep "<pattern>" /var/log/auth.log', 'error');
                        return;
                    }

                    var found = authLog.filter(function (l) {
                        return l.toLowerCase().includes(pattern);
                    });
                    if (found.length === 0) {
                        print('(no matches)', 'dim');
                    } else {
                        found.forEach(function (l) {
                            var cls = l.includes('Failed') ? 'error' : l.includes('Accepted') ? 'success' : '';
                            print(l, cls);
                        });
                    }
                    return;
                }

                if (c.includes('head') && c.includes('auth.log')) {
                    authLog.slice(0, 5).forEach(function (l) { print(l); });
                    return;
                }

                if (c.includes('tail') && c.includes('auth.log')) {
                    authLog.slice(-5).forEach(function (l) { print(l); });
                    return;
                }

                if (c.includes('wc') && c.includes('auth.log')) {
                    print('  ' + authLog.length + ' /var/log/auth.log');
                    return;
                }

                if (c.startsWith('submit ')) {
                    var answer = c.replace('submit ', '').trim();
                    if (answer === 'dr.phantom') {
                        printBlank();
                        print('[+] CORRECT! The attacker brute-forced dr.phantom\'s account.', 'success');
                        print('[+] 5 failed attempts from 103.77.192.4 followed by a successful login.', 'success');
                        print('[+] Stage 3 complete! Moving to Stage 4...', 'success');
                        printBlank();
                        nextStage();
                        return;
                    } else {
                        print('[-] Incorrect. Look for brute force patterns — multiple failures then success.', 'error');
                        return;
                    }
                }

                if (c === 'dr.phantom') {
                    printBlank();
                    print('[+] CORRECT! The attacker brute-forced dr.phantom\'s account.', 'success');
                    print('[+] Stage 3 complete! Moving to Stage 4...', 'success');
                    printBlank();
                    nextStage();
                    return;
                }

                print('Command not found: ' + cmd.split(' ')[0] + '. Type "help" for available commands.', 'error');
            }
        },

        // ──────── STAGE 4: WEB EXPLOITATION ────────
        {
            title: 'WEB EXPLOIT',
            prompt: 'analyst@web:~$ ',
            init: function () {
                printLines([
                    '╔══════════════════════════════════════════════════════╗',
                    '║  STAGE 4: WEB EXPLOITATION                          ║',
                    '╚══════════════════════════════════════════════════════╝',
                ], 'header');
                printBlank();
                printLines([
                    '[BRIEFING] We found ShadowNet\'s internal API at 10.13.37.100:8080.',
                    'It uses JWT tokens for authentication. Find a way in.',
                    '',
                    'Available commands: curl, jwt-decode, submit <answer>, help',
                ], 'system');
                printBlank();
            },
            hints: [
                'Try fetching the API: curl 10.13.37.100:8080/api/status',
                'The response has an Authorization header with a JWT. Decode it: jwt-decode <token>',
                'The JWT payload contains a hidden field "secret_project". Submit: submit operation_blackout',
            ],
            handle: function (cmd) {
                var raw = cmd.trim();
                var c = raw.toLowerCase();

                // Fake JWT: header.payload.signature
                // payload = {"sub":"dr.phantom","role":"admin","iat":1710460800,"secret_project":"operation_blackout"}
                var jwtHeader = btoa(JSON.stringify({alg:'HS256',typ:'JWT'})).replace(/=/g,'');
                var jwtPayload = btoa(JSON.stringify({
                    sub: 'dr.phantom',
                    role: 'admin',
                    iat: 1710460800,
                    secret_project: 'operation_blackout'
                })).replace(/=/g,'');
                var fakeJWT = jwtHeader + '.' + jwtPayload + '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

                if (c === 'help') {
                    printLines([
                        'Available commands:',
                        '  curl <url>              - Make HTTP requests',
                        '  jwt-decode <token>      - Decode a JWT token',
                        '  submit <answer>         - Submit the secret project name',
                        '  clear                   - Clear terminal',
                    ], 'dim');
                    return;
                }

                if (c === 'curl') {
                    print('Usage: curl <url>', 'error');
                    print('Example: curl 10.13.37.100:8080/api/status', 'dim');
                    return;
                }

                if (c === 'jwt-decode' || c === 'jwt decode') {
                    print('Usage: jwt-decode <token>', 'error');
                    print('Copy the Bearer token from the API response.', 'dim');
                    return;
                }

                if (c === 'submit') {
                    print('Usage: submit <answer>', 'error');
                    return;
                }

                if (c.includes('curl')) {
                    if (c.includes('/api/login') || c.includes('/api/auth')) {
                        printLines([
                            'HTTP/1.1 401 Unauthorized',
                            'Content-Type: application/json',
                            '',
                            '{"error": "Invalid credentials", "hint": "Try /api/status"}',
                        ]);
                        return;
                    }
                    if (c.includes('/api/status') || c.includes('8080')) {
                        printLines([
                            'HTTP/1.1 200 OK',
                            'Server: nginx/1.18.0',
                            'Content-Type: application/json',
                            'Authorization: Bearer ' + fakeJWT,
                            'X-Request-ID: a3f8c2d1-9b4e-4f7a-b8c3-2d1e9f4a7b8c',
                            '',
                            '{',
                            '  "status": "operational",',
                            '  "version": "3.1.4",',
                            '  "uptime": "142 days",',
                            '  "message": "All systems nominal"',
                            '}',
                        ]);
                        return;
                    }
                    printLines([
                        'HTTP/1.1 404 Not Found',
                        '{"error": "endpoint not found"}',
                    ]);
                    return;
                }

                if (c.startsWith('jwt-decode') || c.startsWith('jwt decode')) {
                    var token = raw.replace(/jwt[- ]decode\s*/i, '').trim();
                    if (!token || !token.includes('.')) {
                        print('Usage: jwt-decode <token>', 'error');
                        print('The token should have 3 parts separated by dots.', 'dim');
                        return;
                    }
                    var parts = token.split('.');
                    // Fix base64 padding — add correct number of = chars
                    function padB64(s) {
                        var pad = 4 - (s.length % 4);
                        if (pad < 4) s += '='.repeat(pad);
                        return s;
                    }
                    try {
                        var header = JSON.parse(atob(padB64(parts[0])));
                        var payload = JSON.parse(atob(padB64(parts[1])));
                        printLines([
                            '── JWT Header ──',
                            JSON.stringify(header, null, 2),
                            '',
                            '── JWT Payload ──',
                            JSON.stringify(payload, null, 2),
                            '',
                            '── Signature ──',
                            parts[2] + ' (not verified)',
                        ]);
                        if (payload.secret_project) {
                            printBlank();
                            print('[*] Interesting field found: secret_project', 'warning');
                        }
                    } catch (e) {
                        print('Error decoding JWT. Make sure you copied the full token.', 'error');
                    }
                    return;
                }

                if (c.startsWith('submit ')) {
                    var answer = c.replace('submit ', '').trim();
                    if (answer === 'operation_blackout') {
                        printBlank();
                        print('[+] SECRET PROJECT IDENTIFIED: operation_blackout', 'success');
                        print('[+] Stage 4 complete! Moving to final stage...', 'success');
                        printBlank();
                        nextStage();
                        return;
                    } else {
                        print('[-] Incorrect. Look for hidden fields in the JWT payload.', 'error');
                        return;
                    }
                }

                if (c === 'operation_blackout') {
                    printBlank();
                    print('[+] SECRET PROJECT IDENTIFIED: operation_blackout', 'success');
                    print('[+] Stage 4 complete! Moving to final stage...', 'success');
                    printBlank();
                    nextStage();
                    return;
                }

                print('Command not found: ' + cmd.split(' ')[0] + '. Type "help" for available commands.', 'error');
            }
        },

        // ──────── STAGE 5: PRIVILEGE ESCALATION ────────
        {
            title: 'PRIV-ESC',
            prompt: 'dr.phantom@shadow:~$ ',
            init: function () {
                printLines([
                    '╔══════════════════════════════════════════════════════╗',
                    '║  STAGE 5: PRIVILEGE ESCALATION                      ║',
                    '╚══════════════════════════════════════════════════════╝',
                ], 'header');
                printBlank();
                printLines([
                    '[BRIEFING] You\'re in as dr.phantom. You need root access.',
                    'Find a way to escalate your privileges and read the final flag.',
                    '',
                    'Available commands: ls, cat, find, sudo, id, whoami, file, strings, submit, help',
                ], 'system');
                printBlank();
            },
            hints: [
                'Look for files with special permissions. Try: find / -perm -4000 2>/dev/null',
                'There\'s a SUID binary at /usr/local/bin/shadow-backup. Try: strings /usr/local/bin/shadow-backup',
                'The binary calls /tmp/exploit without a full path. Create it: echo "cat /root/flag.txt" > /tmp/exploit && chmod +x /tmp/exploit && /usr/local/bin/shadow-backup',
            ],
            handle: function (cmd) {
                var c = cmd.trim();
                var cl = c.toLowerCase();
                var state = stages[4];
                if (!state._exploitCreated) state._exploitCreated = false;
                if (!state._gotRoot) state._gotRoot = false;

                if (cl === 'help') {
                    printLines([
                        'Available commands:',
                        '  ls [path]            - List files',
                        '  cat <file>           - Read a file',
                        '  find <opts>          - Search for files',
                        '  sudo <cmd>           - Run as root',
                        '  id                   - Show user info',
                        '  whoami               - Current user',
                        '  file <path>          - File type info',
                        '  strings <path>       - Extract strings from binary',
                        '  echo/chmod           - File manipulation',
                        '  submit <flag>        - Submit the final flag',
                        '  clear                - Clear terminal',
                    ], 'dim');
                    return;
                }

                if (cl === 'id') {
                    print('uid=1001(dr.phantom) gid=1001(dr.phantom) groups=1001(dr.phantom),100(users)');
                    return;
                }

                if (cl === 'whoami') {
                    print(state._gotRoot ? 'root' : 'dr.phantom');
                    return;
                }

                if (cl.startsWith('sudo')) {
                    print('[sudo] password for dr.phantom:', 'dim');
                    print('dr.phantom is not in the sudoers file. This incident will be reported.', 'error');
                    return;
                }

                if (cl.startsWith('ls')) {
                    if (cl.includes('/root')) {
                        if (state._gotRoot) {
                            printLines([
                                'total 8',
                                '-rw------- 1 root root  42 Mar 15 flag.txt',
                                '-rwx------ 1 root root 890 Mar 10 .bashrc',
                            ]);
                        } else {
                            print('ls: cannot open directory \'/root\': Permission denied', 'error');
                        }
                        return;
                    }
                    if (cl.includes('/tmp')) {
                        if (state._exploitCreated) {
                            printLines([
                                'total 4',
                                '-rwxr-xr-x 1 dr.phantom dr.phantom 23 Mar 15 exploit',
                            ]);
                        } else {
                            print('total 0');
                        }
                        return;
                    }
                    if (cl.includes('/usr/local/bin')) {
                        printLines([
                            'total 16',
                            '-rwsr-xr-x 1 root root 14328 Mar 10 shadow-backup',
                        ]);
                        return;
                    }
                    if (cl.includes('/home') || cl.includes('~') || cl === 'ls' || cl === 'ls -la' || cl === 'ls -al') {
                        printLines([
                            'total 12',
                            'drwxr-xr-x 2 dr.phantom dr.phantom 4096 Mar 15 .',
                            'drwxr-xr-x 4 root       root       4096 Mar 10 ..',
                            '-rw-r--r-- 1 dr.phantom dr.phantom  220 Mar 10 .bash_history',
                            '-rw-r--r-- 1 dr.phantom dr.phantom   45 Mar 15 notes.txt',
                        ]);
                        return;
                    }
                    print('ls: list the directory of your choice or try /usr/local/bin', 'dim');
                    return;
                }

                if (cl.startsWith('cat')) {
                    if (cl.includes('notes.txt')) {
                        printLines([
                            'TODO: Check the backup script. It has SUID bit set.',
                            'Path: /usr/local/bin/shadow-backup',
                        ]);
                        return;
                    }
                    if (cl.includes('.bash_history')) {
                        printLines([
                            'ls -la /usr/local/bin/',
                            'file /usr/local/bin/shadow-backup',
                            'strings /usr/local/bin/shadow-backup',
                            'find / -perm -4000 2>/dev/null',
                        ], 'dim');
                        return;
                    }
                    if (cl.includes('flag.txt') || cl.includes('/root/flag')) {
                        if (state._gotRoot) {
                            printBlank();
                            print('FLAG{connect_https://linkedin.com/in/tharvid}', 'flag');
                            printBlank();
                            print('[+] You\'ve captured the final flag!', 'success');
                            print('[+] Submit it: submit FLAG{connect_https://linkedin.com/in/tharvid}', 'system');
                            return;
                        } else {
                            print('cat: /root/flag.txt: Permission denied', 'error');
                            return;
                        }
                    }
                    if (cl.includes('/etc/passwd')) {
                        printLines([
                            'root:x:0:0:root:/root:/bin/bash',
                            'daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin',
                            'dr.phantom:x:1001:1001::/home/dr.phantom:/bin/bash',
                            'jenkins:x:1002:1002::/home/jenkins:/bin/bash',
                        ]);
                        return;
                    }
                    print('cat: specify a file to read', 'error');
                    return;
                }

                if (cl.startsWith('find')) {
                    if (cl.includes('-perm') || cl.includes('suid') || cl.includes('4000')) {
                        printLines([
                            '/usr/bin/passwd',
                            '/usr/bin/sudo',
                            '/usr/bin/newgrp',
                            '/usr/local/bin/shadow-backup',
                        ]);
                        printBlank();
                        print('[*] /usr/local/bin/shadow-backup looks unusual — it\'s custom.', 'warning');
                        return;
                    }
                    print('find: try searching for SUID binaries with -perm -4000', 'dim');
                    return;
                }

                if (cl.startsWith('file') && cl.includes('shadow-backup')) {
                    print('/usr/local/bin/shadow-backup: setuid ELF 64-bit LSB executable, x86-64, dynamically linked');
                    return;
                }

                if (cl.startsWith('strings') && cl.includes('shadow-backup')) {
                    printLines([
                        '/lib64/ld-linux-x86-64.so.2',
                        'libc.so.6',
                        'system',
                        'setuid',
                        'setgid',
                        '/tmp/exploit',
                        'Running backup...',
                        'Backup complete.',
                        'GCC: (Ubuntu 11.3.0-1ubuntu1~22.04)',
                    ]);
                    printBlank();
                    print('[*] The binary calls /tmp/exploit — and it runs as root (SUID)!', 'warning');
                    print('[*] If you create /tmp/exploit with your own commands, they\'ll run as root.', 'warning');
                    return;
                }

                // Handle the exploit creation chain
                if (cl.includes('echo') && cl.includes('/tmp/exploit')) {
                    state._exploitCreated = true;
                    print('[+] File /tmp/exploit created.', 'success');

                    // If they chained everything
                    if (cl.includes('shadow-backup')) {
                        state._gotRoot = true;
                        printBlank();
                        print('Running backup...', 'dim');
                        printBlank();
                        print('FLAG{connect_https://linkedin.com/in/tharvid}', 'flag');
                        printBlank();
                        print('[+] ROOT ACCESS OBTAINED!', 'success');
                        print('[+] Submit the flag: submit FLAG{connect_https://linkedin.com/in/tharvid}', 'system');
                    }
                    return;
                }

                if (cl.includes('chmod') && cl.includes('/tmp/exploit')) {
                    if (state._exploitCreated) {
                        print('[+] /tmp/exploit is now executable.', 'success');
                    } else {
                        print('chmod: /tmp/exploit: No such file or directory', 'error');
                    }
                    return;
                }

                if (cl.includes('shadow-backup') || cl.includes('./shadow-backup')) {
                    if (state._exploitCreated) {
                        state._gotRoot = true;
                        printBlank();
                        print('Running backup...', 'dim');
                        printBlank();
                        print('FLAG{connect_https://linkedin.com/in/tharvid}', 'flag');
                        printBlank();
                        print('[+] ROOT ACCESS OBTAINED!', 'success');
                        print('[+] Submit the flag: submit FLAG{connect_https://linkedin.com/in/tharvid}', 'system');
                    } else {
                        print('Running backup...', 'dim');
                        print('/tmp/exploit: not found', 'error');
                        print('Backup failed.', 'error');
                        printBlank();
                        print('[*] The binary tried to execute /tmp/exploit but it doesn\'t exist...', 'warning');
                    }
                    return;
                }

                if (cl.startsWith('submit ')) {
                    var answer = c.replace(/^submit\s+/i, '').trim();
                    if (answer === 'FLAG{connect_https://linkedin.com/in/tharvid}') {
                        printBlank();
                        print('[+] ██████████████████████████████████████', 'success');
                        print('[+] █                                    █', 'success');
                        print('[+] █     ALL STAGES COMPLETE!           █', 'success');
                        print('[+] █     FLAG CAPTURED SUCCESSFULLY     █', 'success');
                        print('[+] █                                    █', 'success');
                        print('[+] ██████████████████████████████████████', 'success');
                        printBlank();
                        setTimeout(showCompletion, 1500);
                        return;
                    } else {
                        print('[-] Incorrect flag. Read the flag file carefully.', 'error');
                        return;
                    }
                }

                // Direct flag submission
                if (c === 'FLAG{connect_https://linkedin.com/in/tharvid}') {
                    printBlank();
                    print('[+] ██████████████████████████████████████', 'success');
                    print('[+] █     ALL STAGES COMPLETE!           █', 'success');
                    print('[+] █     FLAG CAPTURED SUCCESSFULLY     █', 'success');
                    print('[+] ██████████████████████████████████████', 'success');
                    printBlank();
                    setTimeout(showCompletion, 1500);
                    return;
                }

                print('Command not found: ' + cmd.split(' ')[0] + '. Type "help" for available commands.', 'error');
            }
        },
    ];

    // ── Caesar cipher helper ──
    function caesarShift(text, shift) {
        return text.replace(/[a-z]/gi, function (ch) {
            var base = ch >= 'a' && ch <= 'z' ? 97 : 65;
            return String.fromCharCode(((ch.charCodeAt(0) - base + shift) % 26 + 26) % 26 + base);
        });
    }

    // ── Stage navigation ──
    function nextStage() {
        currentStage++;
        if (currentStage >= stages.length) {
            showCompletion();
            return;
        }
        hintsLeft = 3;
        hintCount.textContent = hintsLeft;
        updateHUD();
        var s = stages[currentStage];
        setPrompt(s.prompt);
        s.init();
        input.focus();
    }

    function showCompletion() {
        clearInterval(timerInterval);
        var elapsed = getElapsed();
        var timeStr = formatTime(elapsed);

        termScreen.style.display = 'none';
        completeScr.style.display = 'flex';

        document.getElementById('finalTime').textContent = timeStr;
        document.getElementById('finalHints').textContent = String(hintsUsed);

        // Rating
        var rating = 'Script Kiddie';
        if (hintsUsed === 0 && elapsed < 300) rating = 'Elite Hacker';
        else if (hintsUsed <= 3 && elapsed < 480) rating = 'Red Teamer';
        else if (hintsUsed <= 7 && elapsed < 600) rating = 'Pentester';
        else if (hintsUsed <= 10 && elapsed < 900) rating = 'Security Analyst';
        else if (elapsed < 1200) rating = 'Apprentice';
        document.getElementById('finalRating').textContent = rating;

        // Share URLs
        var shareText = 'I just completed the TharVid CTF on tharvid.in in ' + timeStr + ' with a rating of "' + rating + '"! Can you beat my time? 🏴';
        var siteUrl = 'https://tharvid.in/game/';
        var linkedinProfile = 'https://www.linkedin.com/in/tharvid/';

        shareTwitter.onclick = function () {
            window.open('https://x.com/intent/tweet?text=' + encodeURIComponent(shareText + '\n\n' + siteUrl), '_blank');
        };

        shareLinkedin.onclick = function () {
            window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(siteUrl), '_blank');
        };
    }

    // ── Global commands ──
    function handleGlobalCommand(cmd) {
        var c = cmd.trim().toLowerCase();
        if (c === 'clear') {
            clearTerminal();
            return true;
        }
        if (c === 'hint') {
            useHint();
            return true;
        }
        if (c === 'stage') {
            print('Current: Stage ' + (currentStage + 1) + '/5 — ' + stages[currentStage].title, 'system');
            return true;
        }
        if (c === 'time') {
            print('Elapsed: ' + formatTime(getElapsed()), 'system');
            return true;
        }
        if (c === 'reset') {
            resetGame();
            return true;
        }
        return false;
    }

    // ── Hint system ──
    function useHint() {
        if (hintsLeft <= 0) {
            print('[!] No hints remaining for this stage.', 'warning');
            return;
        }
        var hintIdx = 3 - hintsLeft;
        var hint = stages[currentStage].hints[hintIdx];
        hintsLeft--;
        hintsUsed++;
        hintCount.textContent = hintsLeft;
        printBlank();
        print('[HINT ' + (hintIdx + 1) + '/3] ' + hint, 'warning');
        printBlank();
    }

    // ── Input handling ──
    function handleInput(e) {
        if (e.key === 'Enter') {
            var cmd = input.value.trim();
            input.value = '';
            if (!cmd) return;

            commandHistory.push(cmd);
            historyIdx = commandHistory.length;

            // Echo the command
            print(stages[currentStage].prompt + cmd, 'prompt-line');

            // Global commands first
            if (handleGlobalCommand(cmd)) return;

            // Stage-specific handler
            stages[currentStage].handle(cmd);

            // Scroll to bottom
            output.scrollTop = output.scrollHeight;
        }

        // History navigation
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIdx > 0) {
                historyIdx--;
                input.value = commandHistory[historyIdx];
            }
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIdx < commandHistory.length - 1) {
                historyIdx++;
                input.value = commandHistory[historyIdx];
            } else {
                historyIdx = commandHistory.length;
                input.value = '';
            }
        }
    }

    // ── Start / Reset ──
    function startGame() {
        landing.style.display = 'none';
        termScreen.style.display = 'block';
        completeScr.style.display = 'none';
        currentStage = 0;
        hintsUsed = 0;
        hintsLeft = 3;
        commandHistory = [];
        historyIdx = -1;
        hintCount.textContent = '3';
        clearTerminal();
        updateHUD();

        // Welcome banner
        printLines([
            '┌─────────────────────────────────────────────────────────┐',
            '│  THARVID CTF v1.0 — ShadowNet Breach Simulation        │',
            '│  Type "help" at any stage for available commands.       │',
            '│  Type "hint" to use a hint (3 per stage).              │',
            '│  Global: clear, hint, stage, time, reset               │',
            '└─────────────────────────────────────────────────────────┘',
        ], 'system');
        printBlank();

        var s = stages[0];
        setPrompt(s.prompt);
        s.init();
        startTimer();
        input.focus();
    }

    function resetGame() {
        clearInterval(timerInterval);
        stages[4]._exploitCreated = false;
        stages[4]._gotRoot = false;
        startGame();
    }

    // ── Event listeners ──
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', function () {
        completeScr.style.display = 'none';
        stages[4]._exploitCreated = false;
        stages[4]._gotRoot = false;
        startGame();
    });
    input.addEventListener('keydown', handleInput);
    hintBtn.addEventListener('click', useHint);

    // Click anywhere on terminal to focus input
    document.querySelector('.terminal').addEventListener('click', function () {
        input.focus();
    });

    // Mobile hamburger
    hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });

    mobileMenu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    });

    // Keyboard shortcut to start
    document.addEventListener('keydown', function (e) {
        if (landing.style.display !== 'none' && e.key === 'Enter') {
            startGame();
        }
    });

})();
