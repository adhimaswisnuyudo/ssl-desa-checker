class SSLChecker {
    constructor() {
        this.domains = [];
        this.results = [];
        this.currentIndex = 0;
        this.isChecking = false;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('checkAll').addEventListener('click', () => this.checkAllSSL());
        document.getElementById('stopCheck').addEventListener('click', () => this.stopSSLCheck());
        document.getElementById('clearResults').addEventListener('click', () => this.clearResults());
        
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e.target.value));

    }

    async loadDomains() {
        try {
            // Load all 270 domains from list.txt
            const response = await fetch('list.txt');
            if (!response.ok) {
                throw new Error(`Failed to fetch list.txt: ${response.status}`);
            }
            
            const text = await response.text();
            this.domains = text.trim().split('\n').filter(domain => domain.trim() !== '');
            
            this.populateTable();
            console.log(`Loaded ${this.domains.length} domains from list.txt`);
            
        } catch (error) {
            console.error('Error loading domains from list.txt:', error);
            
            // Fallback to embedded domains if file loading fails
            this.domains = [
                'mekarjaya-arjasari.desa.id',
                'ancolmekar.desa.id',
                'patrolsari.desa.id',
                'pinggirsari.desa.id',
                'lebakwangi.desa.id',
                'arjasari.desa.id',
                'baros.desa.id',
                'batukarut.desa.id',
                'wargaluyu.desa.id',
                'rancakole.desa.id'
            ];
            
            this.populateTable();
            console.log(`Fallback: Loaded ${this.domains.length} embedded domains`);
        }
    }

    populateTable() {
        const tbody = document.querySelector('#domainTable tbody');
        tbody.innerHTML = '';
        
        this.domains.forEach((domain, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td class="domain-name">${domain}</td>
                <td class="ssl-status">-</td>
                <td class="ssl-issuer">-</td>
                <td class="ssl-organization">-</td>
                <td class="ssl-issued">-</td>
                <td class="ssl-expires">-</td>
                <td>
                    <button class="btn btn-sm btn-primary test-single" data-domain="${domain}" data-index="${index}">
                        🧪 Test
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        this.addTestButtonListeners();
    }

    async checkAllSSL() {
        if (this.isChecking) return;
        
        this.isChecking = true;
        this.currentIndex = 0;
        document.getElementById('checkAll').disabled = true;
        document.getElementById('stopCheck').style.display = 'inline-block';
        
        const progressContainer = document.getElementById('progressContainer');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        // Check if progress elements exist
        if (progressContainer && progressFill && progressText) {
            progressContainer.style.display = 'block';
        }
        
        // Add initial loading state to all rows
        const allRows = document.querySelectorAll('#domainTable tbody tr');
        if (allRows.length > 0) {
            allRows.forEach(row => {
                if (row.children && row.children.length >= 7) {
                    row.classList.add('loading-row');
                    // Show initial loading text
                    row.children[2].innerHTML = '<span class="loading-text">Waiting...</span>';
                    row.children[3].innerHTML = '<span class="loading-text">Waiting...</span>';
                    row.children[4].innerHTML = '<span class="loading-text">Waiting...</span>';
                    row.children[5].innerHTML = '<span class="loading-text">Waiting...</span>';
                    row.children[6].innerHTML = '<span class="loading-text">Waiting...</span>';
                }
            });
        }
        
        for (let i = 0; i < this.domains.length; i++) {
            if (!this.isChecking) break;
            
            await this.checkSingleDomain(i);
            this.currentIndex = i + 1;
            
            const progress = ((i + 1) / this.domains.length) * 100;
            if (progressFill && progressText) {
                progressFill.style.width = progress + '%';
                progressText.textContent = `${i + 1}/${this.domains.length}`;
            }
            
            // Add delay to avoid overwhelming the backend
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        this.isChecking = false;
        document.getElementById('checkAll').disabled = false;
        document.getElementById('stopCheck').style.display = 'none';
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
    }

    async checkSingleDomain(index) {
        const domain = this.domains[index];
        const row = document.querySelector(`#domainTable tbody tr:nth-child(${index + 1})`);
        
        if (!row) return;
        
        // Add loading state to row
        row.classList.add('loading-row');
        
        // Show loading text in status cells
        row.children[2].innerHTML = '<span class="loading-text">Checking SSL...</span>';
        row.children[3].innerHTML = '<span class="loading-text">Verifying...</span>';
        row.children[4].innerHTML = '<span class="loading-text">Extracting...</span>';
        row.children[5].innerHTML = '<span class="loading-text">Loading...</span>';
        row.children[6].innerHTML = '<span class="loading-text">Loading...</span>';
        
        try {
            console.log(`Checking domain: ${domain}`);
            
            // Check both HTTP and SSL using backend API
            const response = await fetch(`/ssl-desa-checker/api/check-domain/${domain}`);
            if (!response.ok) {
                throw new Error(`Backend error: ${response.status}`);
            }
            
            const result = await response.json();
            console.log(`Backend result for ${domain}:`, result);
            
            // Update SSL status and details
            if (result.ssl.hasSSL) {
                row.children[2].textContent = 'Valid';
                row.children[2].className = 'ssl-status status-valid';
                row.children[3].textContent = result.ssl.issuer || 'Unknown';
                
                // Extract Organization (O) from issuer
                const organization = this.extractOrganizationFromIssuer(result.ssl.issuer);
                row.children[4].textContent = organization;
                
                row.children[5].textContent = result.ssl.issuedOn || 'Unknown';
                row.children[6].textContent = result.ssl.expiresOn || 'Unknown';
            } else {
                row.children[2].textContent = 'No SSL';
                row.children[2].className = 'ssl-status status-invalid';
                row.children[3].textContent = 'N/A';
                row.children[4].textContent = 'N/A';
                row.children[5].textContent = 'N/A';
                row.children[6].textContent = 'N/A';
            }
            
            // Store results dengan data yang benar
            this.results[index] = {
                domain: domain,
                sslStatus: result.ssl.hasSSL ? 'Valid' : 'No SSL',
                sslIssuer: result.ssl.issuer || 'N/A',
                sslOrganization: this.extractOrganizationFromIssuer(result.ssl.issuer) || 'N/A',
                sslIssuedOn: result.ssl.issuedOn || 'N/A',
                sslExpiresOn: result.ssl.expiresOn || 'N/A'
            };
            
            console.log(`Updated row ${index} for ${domain}:`, {
                sslStatus: result.ssl.hasSSL ? 'Valid' : 'No SSL',
                sslIssuer: result.ssl.issuer,
                sslOrganization: this.extractOrganizationFromIssuer(result.ssl.issuer)
            });
            
        } catch (error) {
            console.error(`Error checking ${domain}:`, error);
            
            row.children[2].textContent = 'Error';
            row.children[2].className = 'ssl-status status-error';
            row.children[3].textContent = 'Error';
            row.children[4].textContent = 'Error';
            row.children[5].textContent = 'Error';
            row.children[6].textContent = 'Error';
            
            this.results[index] = {
                domain: domain,
                httpStatus: 'Error',
                sslStatus: 'Error',
                sslIssuer: 'Error',
                sslOrganization: 'Error',
                sslIssuedOn: 'Error',
                sslExpiresOn: 'Error'
            };
        } finally {
            // Remove loading state from row
            row.classList.remove('loading-row');
        }
    }

    getStatusClass(status) {
        if (status.includes('HTTPS OK') || status.includes('HTTP OK') || status === 'Valid') {
            return 'status-valid';
        } else if (status.includes('No SSL') || status.includes('Connection') || status.includes('DNS Error')) {
            return 'status-invalid';
        } else if (status === 'Error') {
            return 'status-error';
        } else {
            return 'status-pending';
        }
    }





    stopSSLCheck() {
        this.isChecking = false;
        document.getElementById('stopCheck').style.display = 'none';
        document.getElementById('checkAll').disabled = false;
    }

    clearResults() {
        this.results = [];
        this.currentIndex = 0;
        this.isChecking = false;
        
        const tbody = document.querySelector('#domainTable tbody');
        tbody.innerHTML = '';
        
        this.populateTable();
    }

    addTestButtonListeners() {
        document.querySelectorAll('.test-single').forEach(button => {
            button.addEventListener('click', async (e) => {
                const domain = e.target.dataset.domain;
                const index = parseInt(e.target.dataset.index);
                
                // Disable button and show loading
                e.target.disabled = true;
                e.target.innerHTML = '<span class="loading-spinner"></span>Testing...';
                
                await this.checkSingleDomain(index);
                
                // Re-enable button
                e.target.disabled = false;
                e.target.innerHTML = '🧪 Test';
            });
        });
    }

    handleSearch(searchTerm) {
        const rows = document.querySelectorAll('#domainTable tbody tr');
        let visibleCount = 0;
        
        rows.forEach(row => {
            const domain = row.children[1].textContent.toLowerCase();
            const sslStatus = row.children[2].textContent.toLowerCase();
            const sslIssuer = row.children[3].textContent.toLowerCase();
            const organization = row.children[4].textContent.toLowerCase();
            
            const matches = domain.includes(searchTerm.toLowerCase()) ||
                           sslStatus.includes(searchTerm.toLowerCase()) ||
                           sslIssuer.includes(searchTerm.toLowerCase()) ||
                           organization.includes(searchTerm.toLowerCase());
            
            row.style.display = matches ? '' : 'none';
            if (matches) visibleCount++;
        });
        
        this.updateSearchResults(visibleCount, rows.length, searchTerm);
    }

    updateSearchResults(visibleCount, totalRows, searchTerm) {
        const searchResults = document.getElementById('searchResults');
        if (searchTerm) {
            searchResults.textContent = `Showing ${visibleCount} of ${totalRows} results for "${searchTerm}"`;
            searchResults.style.display = 'block';
        } else {
            searchResults.style.display = 'none';
        }
    }


    
    // Extract Organization (O) from SSL Issuer
    extractOrganizationFromIssuer(issuer) {
        if (!issuer || issuer === 'Unknown' || issuer === 'N/A') {
            return 'Unknown';
        }
        
        try {
            // Look for O= (Organization) in the issuer string
            const orgMatch = issuer.match(/O\s*=\s*([^,]+)/);
            if (orgMatch) {
                return orgMatch[1].trim();
            }
            
            // If no O= found, try to extract from common patterns
            if (issuer.includes("Google Trust Services")) {
                return "Google Trust Services";
            } else if (issuer.includes("Let's Encrypt")) {
                return "Let's Encrypt";
            } else if (issuer.includes("DigiCert")) {
                return "DigiCert";
            } else if (issuer.includes("Sectigo")) {
                return "Sectigo";
            } else if (issuer.includes("Comodo")) {
                return "Comodo";
            } else if (issuer.includes("GlobalSign")) {
                return "GlobalSign";
            }
            
            // Return the issuer as fallback
            return issuer;
            
        } catch (error) {
            console.error('Error extracting organization from issuer:', error);
            return 'Unknown';
        }
    }
    




    autoLoadDomains() {
        this.loadDomains();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const sslChecker = new SSLChecker();
    sslChecker.autoLoadDomains();
});
