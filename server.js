const express = require('express');
const cors = require('cors');
const https = require('https');
const tls = require('tls');
const dns = require('dns');
const { promisify } = require('util');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Promisify DNS functions
const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);

// Promisify exec for OpenSSL commands
const execAsync = promisify(exec);

// OpenSSL SSL Certificate Checker
async function checkSSLWithOpenSSL(domain) {
    return new Promise(async (resolve, reject) => {
        try {
            // Check if OpenSSL is available
            try {
                await execAsync('openssl version');
            } catch (error) {
                console.log('OpenSSL not available, falling back to Node.js SSL check');
                resolve(null);
                return;
            }

            // Command to get certificate details
            const command = `echo | openssl s_client -connect ${domain}:443 -servername ${domain} -showcerts 2>/dev/null | openssl x509 -noout -text -nameopt RFC2253 2>/dev/null`;
            
            console.log(`Running OpenSSL command for ${domain}: ${command}`);
            
            const { stdout, stderr } = await execAsync(command, { timeout: 15000 });
            
            if (stderr) {
                console.log(`OpenSSL stderr for ${domain}:`, stderr);
            }
            
            if (!stdout || stdout.trim() === '') {
                console.log(`No OpenSSL output for ${domain}`);
                resolve(null);
                return;
            }
            
            // Parse OpenSSL output
            const certInfo = parseOpenSSLOutput(stdout);
            console.log(`OpenSSL result for ${domain}:`, certInfo);
            
            resolve(certInfo);
            
        } catch (error) {
            console.error(`OpenSSL error for ${domain}:`, error.message);
            resolve(null);
        }
    });
}

// Parse OpenSSL certificate output
function parseOpenSSLOutput(output) {
    try {
        const lines = output.split('\n');
        const certInfo = {
            issuer: 'Unknown',
            organization: 'Unknown',
            issuedOn: 'Unknown',
            expiresOn: 'Unknown',
            subject: 'Unknown',
            serialNumber: 'Unknown',
            signatureAlgorithm: 'Unknown',
            publicKeyAlgorithm: 'Unknown',
            keySize: 'Unknown',
            san: [],
            ocsp: false,
            crl: false
        };
        
        let currentSection = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.includes('Certificate:')) {
                currentSection = 'certificate';
            } else if (line.includes('Serial Number:')) {
                currentSection = 'serial';
                certInfo.serialNumber = line.split(':')[1]?.trim() || 'Unknown';
            } else if (line.includes('Signature Algorithm:')) {
                currentSection = 'signature';
                certInfo.signatureAlgorithm = line.split(':')[1]?.trim() || 'Unknown';
            } else if (line.includes('Issuer:')) {
                currentSection = 'issuer';
                // Parse issuer details
                let issuerLine = line;
                let j = i + 1;
                while (j < lines.length && lines[j].trim().startsWith('/')) {
                    issuerLine += ' ' + lines[j].trim();
                    j++;
                }
                certInfo.issuer = parseDN(issuerLine);
            } else if (line.includes('Validity')) {
                currentSection = 'validity';
            } else if (line.includes('Not Before:')) {
                const dateMatch = line.match(/Not Before:\s*(.+)/);
                if (dateMatch) {
                    certInfo.issuedOn = formatDate(dateMatch[1]);
                }
            } else if (line.includes('Not After:')) {
                const dateMatch = line.match(/Not After:\s*(.+)/);
                if (dateMatch) {
                    certInfo.expiresOn = formatDate(dateMatch[1]);
                }
            } else if (line.includes('Subject:')) {
                currentSection = 'subject';
                // Parse subject details
                let subjectLine = line;
                let j = i + 1;
                while (j < lines.length && lines[j].trim().startsWith('/')) {
                    subjectLine += ' ' + lines[j].trim();
                    j++;
                }
                certInfo.subject = parseDN(subjectLine);
                certInfo.organization = extractOrganization(subjectLine);
            } else if (line.includes('Subject Alternative Name:')) {
                currentSection = 'san';
                // Parse SAN
                let j = i + 1;
                while (j < lines.length && !lines[j].trim().startsWith('X509v3')) {
                    if (lines[j].includes('DNS:')) {
                        const dnsMatch = lines[j].match(/DNS:\s*(.+)/);
                        if (dnsMatch) {
                            certInfo.san.push(dnsMatch[1].trim());
                        }
                    }
                    j++;
                }
            } else if (line.includes('X509v3 Extended Key Usage:')) {
                currentSection = 'extensions';
            } else if (line.includes('OCSP - URI:')) {
                certInfo.ocsp = true;
            } else if (line.includes('CRL Distribution Points:')) {
                certInfo.crl = true;
            }
        }
        
        return certInfo;
        
    } catch (error) {
        console.error('Error parsing OpenSSL output:', error);
        return {
            issuer: 'Parse Error',
            organization: 'Parse Error',
            issuedOn: 'Parse Error',
            expiresOn: 'Parse Error',
            subject: 'Parse Error',
            serialNumber: 'Parse Error',
            signatureAlgorithm: 'Parse Error',
            publicKeyAlgorithm: 'Parse Error',
            keySize: 'Parse Error',
            san: [],
            ocsp: false,
            crl: false
        };
    }
}

// Parse Distinguished Name (DN)
function parseDN(dnString) {
    try {
        const dn = {};
        const parts = dnString.split('/').filter(part => part.trim());
        
        parts.forEach(part => {
            const [key, value] = part.split('=');
            if (key && value) {
                dn[key.trim()] = value.trim();
            }
        });
        
        // Return most relevant part
        if (dn.CN) return dn.CN;
        if (dn.O) return dn.O;
        if (dn.OU) return dn.OU;
        if (dn.C) return dn.C;
        
        return dnString;
    } catch (error) {
        return dnString;
    }
}

// Extract organization from subject
function extractOrganization(subjectString) {
    try {
        const orgMatch = subjectString.match(/O\s*=\s*([^\/]+)/);
        if (orgMatch) {
            return orgMatch[1].trim();
        }
        
        const cnMatch = subjectString.match(/CN\s*=\s*([^\/]+)/);
        if (cnMatch) {
            return cnMatch[1].trim();
        }
        
        return 'Unknown';
    } catch (error) {
        return 'Unknown';
    }
}

// Format date to Indonesian format
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString;
        }
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}

// SSL Checker function with OpenSSL integration
async function checkSSL(domain) {
    return new Promise(async (resolve, reject) => {
        try {
            // Check if domain resolves
            let ipAddress;
            try {
                const ips = await resolve4(domain);
                ipAddress = ips[0];
            } catch (error) {
                try {
                    const ips = await resolve6(domain);
                    ipAddress = ips[0];
                } catch (error) {
                    return resolve({
                        hasSSL: false,
                        status: 'DNS Error',
                        issuer: null,
                        organization: null,
                        issuedOn: null,
                        expiresOn: null,
                        ipAddress: null,
                        error: 'Domain tidak dapat di-resolve'
                    });
                }
            }

            // Try OpenSSL first for detailed certificate info
            console.log(`Trying OpenSSL for ${domain}...`);
            const openSSLResult = await checkSSLWithOpenSSL(domain);
            
            if (openSSLResult) {
                console.log(`OpenSSL successful for ${domain}:`, openSSLResult);
                
                // Check HTTPS connection to verify SSL is working
                const options = {
                    hostname: domain,
                    port: 443,
                    method: 'GET',
                    path: '/',
                    timeout: 5000,
                    rejectUnauthorized: false
                };

                const req = https.request(options, (res) => {
                    const sslInfo = {
                        hasSSL: true,
                        status: `HTTPS OK (${res.statusCode})`,
                        ipAddress: ipAddress,
                        httpStatus: res.statusCode,
                        headers: res.headers,
                        // Use OpenSSL data
                        issuer: openSSLResult.issuer,
                        organization: openSSLResult.organization,
                        issuedOn: openSSLResult.issuedOn,
                        expiresOn: openSSLResult.expiresOn,
                        // Additional OpenSSL data
                        serialNumber: openSSLResult.serialNumber,
                        signatureAlgorithm: openSSLResult.signatureAlgorithm,
                        publicKeyAlgorithm: openSSLResult.publicKeyAlgorithm,
                        keySize: openSSLResult.keySize,
                        san: openSSLResult.san,
                        ocsp: openSSLResult.ocsp,
                        crl: openSSLResult.crl
                    };

                    resolve(sslInfo);
                });

                req.on('error', (error) => {
                    // Even if HTTPS fails, we have OpenSSL data
                    const sslInfo = {
                        hasSSL: true,
                        status: 'HTTPS Connection Failed but SSL Valid',
                        ipAddress: ipAddress,
                        httpStatus: null,
                        headers: null,
                        // Use OpenSSL data
                        issuer: openSSLResult.issuer,
                        organization: openSSLResult.organization,
                        issuedOn: openSSLResult.issuedOn,
                        expiresOn: openSSLResult.expiresOn,
                        // Additional OpenSSL data
                        serialNumber: openSSLResult.serialNumber,
                        signatureAlgorithm: openSSLResult.signatureAlgorithm,
                        publicKeyAlgorithm: openSSLResult.publicKeyAlgorithm,
                        keySize: openSSLResult.keySize,
                        san: openSSLResult.san,
                        ocsp: openSSLResult.ocsp,
                        crl: openSSLResult.crl
                    };

                    resolve(sslInfo);
                });

                req.on('timeout', () => {
                    req.destroy();
                    // Even if HTTPS timeout, we have OpenSSL data
                    const sslInfo = {
                        hasSSL: true,
                        status: 'HTTPS Timeout but SSL Valid',
                        ipAddress: ipAddress,
                        httpStatus: null,
                        headers: null,
                        // Use OpenSSL data
                        issuer: openSSLResult.issuer,
                        organization: openSSLResult.organization,
                        issuedOn: openSSLResult.issuedOn,
                        expiresOn: openSSLResult.expiresOn,
                        // Additional OpenSSL data
                        serialNumber: openSSLResult.serialNumber,
                        signatureAlgorithm: openSSLResult.signatureAlgorithm,
                        publicKeyAlgorithm: openSSLResult.publicKeyAlgorithm,
                        keySize: openSSLResult.keySize,
                        san: openSSLResult.san,
                        ocsp: openSSLResult.ocsp,
                        crl: openSSLResult.crl
                    };

                    resolve(sslInfo);
                });

                req.end();
                
            } else {
                console.log(`OpenSSL failed for ${domain}, falling back to Node.js SSL check...`);
                
                // Fallback to Node.js SSL check
                const options = {
                    hostname: domain,
                    port: 443,
                    method: 'GET',
                    path: '/',
                    timeout: 10000,
                    rejectUnauthorized: false
                };

                const req = https.request(options, (res) => {
                    let sslInfo = {
                        hasSSL: true,
                        status: `HTTPS OK (${res.statusCode})`,
                        ipAddress: ipAddress,
                        httpStatus: res.statusCode,
                        headers: res.headers
                    };

                    // Get SSL certificate info from Node.js
                    const socket = req.socket;
                    if (socket.authorized) {
                        const cert = socket.getPeerCertificate();
                        sslInfo.issuer = cert.issuer?.CN || cert.issuer?.O || 'Unknown';
                        sslInfo.organization = cert.subject?.O || cert.subject?.CN || 'Unknown';
                        sslInfo.issuedOn = cert.valid_from ? new Date(cert.valid_from).toLocaleDateString('id-ID') : 'Unknown';
                        sslInfo.expiresOn = cert.valid_to ? new Date(cert.valid_to).toLocaleDateString('id-ID') : 'Unknown';
                        sslInfo.validDays = cert.valid_to ? Math.ceil((new Date(cert.valid_to) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
                    } else {
                        sslInfo.hasSSL = false;
                        sslInfo.status = 'SSL Certificate Invalid';
                        sslInfo.issuer = null;
                        sslInfo.organization = null;
                        sslInfo.issuedOn = null;
                        sslInfo.expiresOn = null;
                    }

                    resolve(sslInfo);
                });

                req.on('error', (error) => {
                    if (error.code === 'ENOTFOUND') {
                        resolve({
                            hasSSL: false,
                            status: 'DNS Error',
                            issuer: null,
                            organization: null,
                            issuedOn: null,
                            expiresOn: null,
                            ipAddress: null,
                            error: 'Domain tidak ditemukan'
                        });
                    } else if (error.code === 'ECONNREFUSED') {
                        resolve({
                            hasSSL: false,
                            status: 'Connection Refused',
                            issuer: null,
                            organization: null,
                            issuedOn: null,
                            expiresOn: null,
                            ipAddress: ipAddress,
                            error: 'Koneksi ditolak'
                        });
                    } else if (error.code === 'ETIMEDOUT') {
                        resolve({
                            hasSSL: false,
                            status: 'Connection Timeout',
                            issuer: null,
                            organization: null,
                            issuedOn: null,
                            expiresOn: null,
                            ipAddress: ipAddress,
                            error: 'Koneksi timeout'
                        });
                    } else {
                        resolve({
                            hasSSL: false,
                            status: 'Connection Failed',
                            issuer: null,
                            organization: null,
                            issuedOn: null,
                            expiresOn: null,
                            ipAddress: ipAddress,
                            error: error.message
                        });
                    }
                });

                req.on('timeout', () => {
                    req.destroy();
                    resolve({
                        hasSSL: false,
                        status: 'Connection Timeout',
                        issuer: null,
                        organization: null,
                        issuedOn: null,
                        expiresOn: null,
                        ipAddress: ipAddress,
                        error: 'Koneksi timeout'
                    });
                });

                req.end();
            }

        } catch (error) {
            resolve({
                hasSSL: false,
                status: 'Error',
                issuer: null,
                organization: null,
                issuedOn: null,
                expiresOn: null,
                ipAddress: null,
                error: error.message
            });
        }
    });
}

// HTTP Check function
async function checkHTTP(domain) {
    return new Promise(async (resolve, reject) => {
        try {
            // Check if domain resolves
            let ipAddress;
            try {
                const ips = await resolve4(domain);
                ipAddress = ips[0];
            } catch (error) {
                try {
                    const ips = await resolve6(domain);
                    ipAddress = ips[0];
                } catch (error) {
                    return resolve({
                        hasSSL: false,
                        status: 'DNS Error',
                        ipAddress: null,
                        error: 'Domain tidak dapat di-resolve'
                    });
                }
            }

            // Check HTTP connection
            const options = {
                hostname: domain,
                port: 80,
                method: 'GET',
                path: '/',
                timeout: 5000
            };

            const http = require('http');
            const req = http.request(options, (res) => {
                resolve({
                    hasSSL: false,
                    status: `HTTP OK (${res.statusCode})`,
                    ipAddress: ipAddress,
                    httpStatus: res.statusCode,
                    headers: res.headers
                });
            });

            req.on('error', (error) => {
                if (error.code === 'ECONNREFUSED') {
                    resolve({
                        hasSSL: false,
                        status: 'HTTP Connection Refused',
                        ipAddress: ipAddress,
                        error: 'HTTP koneksi ditolak'
                    });
                } else if (error.code === 'ETIMEDOUT') {
                    resolve({
                        hasSSL: false,
                        status: 'HTTP Connection Timeout',
                        ipAddress: ipAddress,
                        error: 'HTTP koneksi timeout'
                    });
                } else {
                    resolve({
                        hasSSL: false,
                        status: 'HTTP Connection Failed',
                        ipAddress: ipAddress,
                        error: error.message
                    });
                }
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({
                    hasSSL: false,
                    status: 'HTTP Connection Timeout',
                    ipAddress: ipAddress,
                    error: 'HTTP koneksi timeout'
                });
            });

            req.end();

        } catch (error) {
            resolve({
                hasSSL: false,
                status: 'HTTP Error',
                ipAddress: null,
                error: error.message
            });
        }
    });
}

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'SSL Checker Backend API with OpenSSL', status: 'Running' });
});

// Check SSL endpoint
app.get('/api/check-ssl/:domain', async (req, res) => {
    try {
        const domain = req.params.domain;
        console.log(`Checking SSL for domain: ${domain}`);
        
        const sslResult = await checkSSL(domain);
        console.log(`SSL result for ${domain}:`, sslResult);
        
        res.json(sslResult);
    } catch (error) {
        console.error('Error checking SSL:', error);
        res.status(500).json({ error: error.message });
    }
});

// Check HTTP endpoint
app.get('/api/check-http/:domain', async (req, res) => {
    try {
        const domain = req.params.domain;
        console.log(`Checking HTTP for domain: ${domain}`);
        
        const httpResult = await checkHTTP(domain);
        console.log(`HTTP result for ${domain}:`, httpResult);
        
        res.json(httpResult);
    } catch (error) {
        console.error('Error checking HTTP:', error);
        res.status(500).json({ error: error.message });
    }
});

// Check both SSL and HTTP
app.get('/api/check-domain/:domain', async (req, res) => {
    try {
        const domain = req.params.domain;
        console.log(`Checking both SSL and HTTP for domain: ${domain}`);
        
        const [sslResult, httpResult] = await Promise.all([
            checkSSL(domain),
            checkHTTP(domain)
        ]);
        
        const combinedResult = {
            domain: domain,
            ssl: sslResult,
            http: httpResult,
            timestamp: new Date().toISOString()
        };
        
        console.log(`Combined result for ${domain}:`, combinedResult);
        res.json(combinedResult);
    } catch (error) {
        console.error('Error checking domain:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 SSL Checker Backend with OpenSSL running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}`);
    console.log(`🔍 SSL check: http://localhost:${PORT}/api/check-ssl/example.com`);
    console.log(`🌐 HTTP check: http://localhost:${PORT}/api/check-http/example.com`);
    console.log(`📊 Full check: http://localhost:${PORT}/api/check-domain/example.com`);
});

module.exports = app;
