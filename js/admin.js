/**
 * KHOJI NEPAL — Official Command Center Admin Dashboard Controller
 * /js/admin.js (Vanilla JavaScript, Strict RBAC, CSRF Protection)
 */

document.addEventListener('DOMContentLoaded', () => {
  const AdminApp = {
    state: {
      user: null,
      csrfToken: '',
      activeTab: 'dashboard',
      stats: null,
      missingRecords: [],
      foundRecords: [],
      matchRecords: [],
      rescueRecords: [],
      reliefCenters: [],
      reliefRequests: [],
      newsRecords: [],
      reportsRecords: [],
      orgsRecords: [],
      userRecords: [],
      auditLogs: [],
      settings: null,
      searchQueries: {}
    },

    init() {
      this.bindSidebar();
      this.checkSession();
    },

    async checkSession() {
      try {
        const res = await fetch('/api/auth/session.php');
        const data = await res.json();
        if (data.success && data.data.authenticated) {
          this.state.user = data.data.user;
          this.state.csrfToken = data.data.csrf_token;
          this.renderAuthenticatedUI();
          this.loadTab('dashboard');
        } else {
          this.renderLoginModal();
        }
      } catch (err) {
        console.error('Session check failed:', err);
        this.renderLoginModal();
      }
    },

    bindSidebar() {
      document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const tab = item.getAttribute('data-tab');
          if (tab) {
            this.switchTab(tab);
          }
        });
      });

      const mobileToggle = document.getElementById('admin-mobile-toggle');
      if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
          const sidebar = document.querySelector('.admin-sidebar');
          sidebar.classList.toggle('open');
        });
      }

      const logoutBtn = document.getElementById('admin-logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => this.handleLogout());
      }
    },

    switchTab(tab) {
      this.state.activeTab = tab;
      document.querySelectorAll('.admin-nav-item').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-tab') === tab);
      });

      // Close mobile sidebar if open
      const sidebar = document.querySelector('.admin-sidebar');
      if (sidebar) sidebar.classList.remove('open');

      const titleMap = {
        'dashboard': 'Command Operations Overview',
        'missing': 'Missing Persons Management',
        'found': 'Found / Unidentified Persons',
        'matches': 'AI Photo Match Verification Desk',
        'rescue': 'Rescue Operations & Logistics',
        'relief': 'Relief Distribution Hubs & SOS Requests',
        'news': 'Government Bulletins & Advisories',
        'reports': 'Citizen Sightings & Review Flags',
        'organizations': 'Authorized Response Agencies',
        'users': 'Official Accounts & Role-Based Access',
        'audit-logs': 'Immutable Audit Logs Ledger',
        'settings': 'Emergency Hotlines & Platform Settings'
      };

      const heading = document.getElementById('admin-page-title');
      if (heading) heading.textContent = titleMap[tab] || 'Command Center';

      const breadcrumb = document.getElementById('admin-breadcrumb-current');
      if (breadcrumb) breadcrumb.textContent = titleMap[tab] || tab;

      this.loadTab(tab);
    },

    async loadTab(tab) {
      const container = document.getElementById('admin-tab-content');
      if (!container) return;

      container.innerHTML = `
        <div style="padding: 3rem; text-align: center; color: var(--admin-text-muted);">
          <div class="admin-pulse-dot" style="display:inline-block; margin-bottom: 0.5rem;"></div>
          <p>Loading secure official data for <strong>${tab.toUpperCase()}</strong>...</p>
        </div>
      `;

      switch (tab) {
        case 'dashboard':
          await this.renderDashboard();
          break;
        case 'missing':
          await this.renderMissing();
          break;
        case 'found':
          await this.renderFound();
          break;
        case 'matches':
          await this.renderMatches();
          break;
        case 'rescue':
          await this.renderRescue();
          break;
        case 'relief':
          await this.renderRelief();
          break;
        case 'news':
          await this.renderNews();
          break;
        case 'reports':
          await this.renderReports();
          break;
        case 'organizations':
          await this.renderOrganizations();
          break;
        case 'users':
          await this.renderUsers();
          break;
        case 'audit-logs':
          await this.renderAuditLogs();
          break;
        case 'settings':
          await this.renderSettings();
          break;
        default:
          container.innerHTML = `<p>Section not found.</p>`;
      }
    },

    // -------------------------------------------------------------
    // 1. DASHBOARD OVERVIEW
    // -------------------------------------------------------------
    async renderDashboard() {
      try {
        const res = await fetch('/api/admin/stats.php');
        const json = await res.json();
        const stats = json.data;
        this.state.stats = stats;

        const container = document.getElementById('admin-tab-content');
        container.innerHTML = `
          <!-- Statistics Grid -->
          <div class="admin-stats-grid">
            <div class="admin-stat-card">
              <div class="admin-stat-header">
                <span class="admin-stat-title">Missing Persons</span>
                <div class="admin-stat-icon danger">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
              </div>
              <div class="admin-stat-value">${stats.missing_persons.total}</div>
              <div class="admin-stat-footer">
                <span class="admin-badge admin-badge-missing">${stats.missing_persons.active_missing} Active</span>
                <span class="admin-badge admin-badge-pending">${stats.missing_persons.pending_verification} Pending Review</span>
              </div>
            </div>

            <div class="admin-stat-card">
              <div class="admin-stat-header">
                <span class="admin-stat-title">Found / Sheltered</span>
                <div class="admin-stat-icon primary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg>
                </div>
              </div>
              <div class="admin-stat-value">${stats.found_persons.total}</div>
              <div class="admin-stat-footer">
                <span class="admin-badge admin-badge-found">${stats.found_persons.verified} Verified</span>
              </div>
            </div>

            <div class="admin-stat-card">
              <div class="admin-stat-header">
                <span class="admin-stat-title">Rescued Persons</span>
                <div class="admin-stat-icon success">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </div>
              <div class="admin-stat-value">${stats.rescue.total}</div>
              <div class="admin-stat-footer">
                <span class="admin-badge admin-badge-rescued">${stats.rescue.completed} Extracted</span>
                <span class="admin-badge admin-badge-pending">${stats.rescue.in_progress} Sorties Active</span>
              </div>
            </div>

            <div class="admin-stat-card">
              <div class="admin-stat-header">
                <span class="admin-stat-title">Possible AI Matches</span>
                <div class="admin-stat-icon purple">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                </div>
              </div>
              <div class="admin-stat-value">${stats.possible_matches.total}</div>
              <div class="admin-stat-footer">
                <span class="admin-badge admin-badge-pending">${stats.possible_matches.pending_review} Awaiting Human Review</span>
              </div>
            </div>

            <div class="admin-stat-card">
              <div class="admin-stat-header">
                <span class="admin-stat-title">Relief SOS Requests</span>
                <div class="admin-stat-icon warning">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </div>
              </div>
              <div class="admin-stat-value">${stats.relief_requests.total}</div>
              <div class="admin-stat-footer">
                <span class="admin-badge admin-badge-critical">${stats.relief_requests.critical} Critical</span>
                <span class="admin-badge admin-badge-found">${stats.relief_requests.people_impacted} People Impacted</span>
              </div>
            </div>

            <div class="admin-stat-card">
              <div class="admin-stat-header">
                <span class="admin-stat-title">Government Updates</span>
                <div class="admin-stat-icon primary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                </div>
              </div>
              <div class="admin-stat-value">${stats.government_updates.published}</div>
              <div class="admin-stat-footer">
                <span class="admin-badge admin-badge-critical">${stats.government_updates.critical_alerts} Flash Bulletins</span>
              </div>
            </div>
          </div>

          <!-- Fast Action Strip -->
          <div class="admin-card">
            <div class="admin-card-header">
              <span class="admin-card-title">Joint Command Action Center</span>
              <span style="font-size: 0.8rem; color: var(--admin-text-muted);">Current Operational Authority: <strong>${this.escapeHtml(this.state.user.name)} (${this.state.user.role.toUpperCase()})</strong></span>
            </div>
            <div class="admin-card-body" style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
              <button class="admin-btn admin-btn-primary" onclick="window.AdminApp.openModal('create-missing')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Register Missing Person
              </button>
              <button class="admin-btn admin-btn-secondary" onclick="window.AdminApp.switchTab('matches')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                Review Photo Matches (${stats.possible_matches.pending_review})
              </button>
              <button class="admin-btn admin-btn-secondary" onclick="window.AdminApp.switchTab('relief')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                Dispatch Relief Teams (${stats.relief_requests.critical} Critical)
              </button>
              <button class="admin-btn admin-btn-secondary" onclick="window.AdminApp.openModal('create-news')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg>
                Issue Emergency Advisory
              </button>
              <button class="admin-btn admin-btn-secondary" onclick="window.AdminApp.switchTab('audit-logs')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
                Audit Logs Ledger (${stats.system.audit_logs_count})
              </button>
            </div>
          </div>
        `;
      } catch (err) {
        console.error('Dashboard render error:', err);
      }
    },

    // -------------------------------------------------------------
    // 2. MISSING PERSONS MANAGEMENT
    // -------------------------------------------------------------
    async renderMissing() {
      const search = this.state.searchQueries['missing'] || '';
      try {
        const res = await fetch(`/api/admin/missing.php?search=${encodeURIComponent(search)}`);
        const json = await res.json();
        const records = json.data.records || [];
        this.state.missingRecords = records;

        const container = document.getElementById('admin-tab-content');
        container.innerHTML = `
          <div class="admin-card">
            <div class="admin-card-header">
              <div class="admin-card-title">Missing Persons Registry (${records.length})</div>
              <button class="admin-btn admin-btn-primary admin-btn-sm" onclick="window.AdminApp.openModal('create-missing')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Missing Person
              </button>
            </div>
            <div class="admin-card-body">
              <div class="admin-toolbar">
                <div class="admin-search-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input type="text" placeholder="Search by name, report ID, location..." value="${this.escapeHtml(search)}" onkeydown="if(event.key==='Enter'){window.AdminApp.state.searchQueries['missing']=this.value; window.AdminApp.renderMissing();}">
                </div>
                <div class="admin-filter-group">
                  <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.AdminApp.renderMissing()">Refresh</button>
                </div>
              </div>

              <div class="admin-table-responsive">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th>Photo</th>
                      <th>Name & Details</th>
                      <th>Age / Gender</th>
                      <th>Last Seen Location</th>
                      <th>Missing Date</th>
                      <th>Status</th>
                      <th>Verification</th>
                      <th>Source</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${records.length === 0 ? '<tr><td colspan="9" style="text-align:center; padding: 2rem;">No matching records found.</td></tr>' : ''}
                    ${records.map(r => `
                      <tr>
                        <td>
                          <img src="${r.photo || 'assets/demo_person_1.jpg'}" alt="${this.escapeHtml(r.full_name)}" class="admin-thumb" onerror="this.src='assets/demo_person_1.jpg'" />
                        </td>
                        <td>
                          <div class="admin-cell-title">${this.escapeHtml(r.full_name)}</div>
                          <div class="admin-cell-sub">ID: ${this.escapeHtml(r.report_id)}</div>
                        </td>
                        <td>${r.age ? r.age + ' yrs' : 'Unknown'} / ${this.escapeHtml(r.gender)}</td>
                        <td>
                          <div>${this.escapeHtml(r.last_seen_location)}</div>
                          <div class="admin-cell-sub">${this.escapeHtml(r.municipality || 'Rasuwa')}</div>
                        </td>
                        <td>${r.missing_date}</td>
                        <td>
                          <span class="admin-badge admin-badge-${r.status}">${r.status.toUpperCase()}</span>
                        </td>
                        <td>
                          <span class="admin-badge admin-badge-${r.verification_status}">${r.verification_status.toUpperCase()}</span>
                        </td>
                        <td>
                          <div style="font-size:0.75rem;">${this.escapeHtml(r.source_type)}</div>
                          <div class="admin-cell-sub">${this.escapeHtml(r.source_name || '')}</div>
                        </td>
                        <td>
                          <div class="admin-btn-group">
                            <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.AdminApp.viewMissingDetail(${r.id})" title="View Details">View</button>
                            ${r.verification_status === 'pending' ? `
                              <button class="admin-btn admin-btn-success admin-btn-sm" onclick="window.AdminApp.verifyMissing(${r.id})" title="Officially Verify">Verify</button>
                              <button class="admin-btn admin-btn-danger admin-btn-sm" onclick="window.AdminApp.rejectMissing(${r.id})" title="Reject">Reject</button>
                            ` : ''}
                            ${r.status === 'missing' ? `
                              <button class="admin-btn admin-btn-primary admin-btn-sm" onclick="window.AdminApp.markMissingFound(${r.id})" title="Mark Found">Mark Found</button>
                            ` : ''}
                            <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.AdminApp.archiveMissing(${r.id})" title="Archive">Archive</button>
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `;
      } catch (err) {
        console.error('Missing render error:', err);
      }
    },

    // -------------------------------------------------------------
    // 3. FOUND PERSONS MANAGEMENT
    // -------------------------------------------------------------
    async renderFound() {
      try {
        const res = await fetch('/api/admin/found.php');
        const json = await res.json();
        const records = json.data.records || [];
        this.state.foundRecords = records;

        const container = document.getElementById('admin-tab-content');
        container.innerHTML = `
          <div class="admin-card">
            <div class="admin-card-header">
              <div class="admin-card-title">Found / Unidentified Persons Registry (${records.length})</div>
              <button class="admin-btn admin-btn-primary admin-btn-sm" onclick="window.AdminApp.openModal('create-found')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Register Found Person
              </button>
            </div>
            <div class="admin-card-body">
              <div class="admin-table-responsive">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th>Photo</th>
                      <th>Identifier / Name</th>
                      <th>Approx Age / Gender</th>
                      <th>Found Location</th>
                      <th>Current Hospital / Shelter</th>
                      <th>Verification</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${records.map(r => `
                      <tr>
                        <td>
                          <img src="${r.photo || 'assets/demo_found_1.jpg'}" alt="Found" class="admin-thumb" onerror="this.src='assets/demo_found_1.jpg'" />
                        </td>
                        <td>
                          <div class="admin-cell-title">${this.escapeHtml(r.approx_name || 'Unidentified Person')}</div>
                          <div class="admin-cell-sub">ID: ${this.escapeHtml(r.report_id)}</div>
                        </td>
                        <td>${r.approx_age ? '~' + r.approx_age + ' yrs' : 'Unknown'} / ${this.escapeHtml(r.gender)}</td>
                        <td>${this.escapeHtml(r.found_location)}</td>
                        <td>${this.escapeHtml(r.current_location)}</td>
                        <td>
                          <span class="admin-badge admin-badge-${r.verification_status}">${r.verification_status.toUpperCase()}</span>
                        </td>
                        <td>
                          <div class="admin-btn-group">
                            ${r.verification_status === 'pending' ? `
                              <button class="admin-btn admin-btn-success admin-btn-sm" onclick="window.AdminApp.verifyFound(${r.id})">Verify</button>
                              <button class="admin-btn admin-btn-danger admin-btn-sm" onclick="window.AdminApp.rejectFound(${r.id})">Reject</button>
                            ` : ''}
                            <button class="admin-btn admin-btn-primary admin-btn-sm" onclick="window.AdminApp.markFoundReunited(${r.id})">Reunited</button>
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `;
      } catch (err) {
        console.error('Found render error:', err);
      }
    },

    // -------------------------------------------------------------
    // 4. AI PHOTO MATCH VERIFICATION DESK
    // -------------------------------------------------------------
    async renderMatches() {
      try {
        const res = await fetch('/api/admin/matches.php');
        const json = await res.json();
        const matches = json.data.matches || [];
        this.state.matchRecords = matches;

        const container = document.getElementById('admin-tab-content');
        container.innerHTML = `
          <!-- Privacy Notice Box -->
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 1rem 1.25rem; border-radius: 8px; margin-bottom: 1.5rem; display: flex; gap: 0.8rem; align-items: flex-start;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" style="flex-shrink:0; margin-top:2px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <div>
              <div style="font-weight: 700; color: #1e40af; font-size: 0.9rem;">Official Verification Protocol & Privacy Shield</div>
              <div style="font-size: 0.82rem; color: #1e3a8a; margin-top: 0.2rem;">
                Every AI candidate is displayed strictly as a <strong>Possible Match</strong>. Admin confirmation marks the match for ground investigation by authorized teams and does NOT automatically expose private guardian contact numbers publicly.
              </div>
            </div>
          </div>

          <div class="admin-card">
            <div class="admin-card-header">
              <div class="admin-card-title">Pending Match Comparisons (${matches.length})</div>
              <span class="admin-badge admin-badge-pending">Mandatory Human Verification</span>
            </div>
            <div class="admin-card-body">
              ${matches.map(m => `
                <div class="admin-match-card">
                  <div class="admin-match-grid">
                    <!-- 1. Uploaded Query Image -->
                    <div class="admin-match-box">
                      <img src="${m.query_image}" alt="Query Photo" class="admin-match-photo" onerror="this.src='assets/demo_found_1.jpg'" />
                      <div>
                        <div style="font-size:0.75rem; color:var(--admin-text-muted); font-weight:700;">UPLOADED QUERY</div>
                        <div class="admin-cell-title">${m.match_id}</div>
                        <div class="admin-cell-sub">Source: ${this.escapeHtml(m.source)}</div>
                      </div>
                    </div>

                    <!-- 2. Similarity Gauge -->
                    <div class="admin-similarity-gauge">
                      <div class="admin-gauge-score">${m.similarity_score}%</div>
                      <div class="admin-gauge-label">Similarity</div>
                    </div>

                    <!-- 3. Candidate Record -->
                    <div class="admin-match-box">
                      <img src="${m.candidate_photo}" alt="Candidate Photo" class="admin-match-photo" onerror="this.src='assets/demo_person_1.jpg'" />
                      <div>
                        <div style="font-size:0.75rem; color:var(--admin-text-muted); font-weight:700;">CANDIDATE RECORD</div>
                        <div class="admin-cell-title">${this.escapeHtml(m.candidate_name)}</div>
                        <div class="admin-cell-sub">Report: ${this.escapeHtml(m.candidate_report)}</div>
                        <div class="admin-cell-sub">Last Seen: ${this.escapeHtml(m.last_seen)}</div>
                      </div>
                    </div>

                    <!-- 4. Signals & Actions -->
                    <div>
                      <div style="font-size: 0.78rem; color: #475569; margin-bottom: 0.6rem;">
                        <strong>Signal Breakdown:</strong> Visual ${m.signals.visual_similarity}% | Age ${m.signals.age_proximity}% | Location ${m.signals.location_match}%
                      </div>
                      <div style="font-size: 0.76rem; color: #64748b; margin-bottom: 0.8rem;">
                        <strong>Protected Guardian:</strong> ${this.escapeHtml(m.sensitive_guardian_masked)}
                      </div>
                      <div class="admin-btn-group" style="flex-wrap: wrap;">
                        <button class="admin-btn admin-btn-success admin-btn-sm" onclick="window.AdminApp.confirmMatchReview('${m.match_id}')">Confirm for Review</button>
                        <button class="admin-btn admin-btn-danger admin-btn-sm" onclick="window.AdminApp.rejectMatch('${m.match_id}')">Reject Match</button>
                        <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.AdminApp.requestMatchInfo('${m.match_id}')">Request More Info</button>
                        <button class="admin-btn admin-btn-primary admin-btn-sm" onclick="window.AdminApp.forwardMatchAuthority('${m.match_id}')">Forward to Police / NRCS</button>
                      </div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } catch (err) {
        console.error('Matches render error:', err);
      }
    },

    // -------------------------------------------------------------
    // 5. RESCUE OPERATIONS
    // -------------------------------------------------------------
    async renderRescue() {
      try {
        const res = await fetch('/api/admin/rescue.php');
        const json = await res.json();
        const records = json.data.records || [];
        this.state.rescueRecords = records;

        const container = document.getElementById('admin-tab-content');
        container.innerHTML = `
          <div class="admin-card">
            <div class="admin-card-header">
              <div class="admin-card-title">Active Rescue Operations & Extrications (${records.length})</div>
              <button class="admin-btn admin-btn-primary admin-btn-sm" onclick="window.AdminApp.openModal('create-rescue')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Log Rescue Operation
              </button>
            </div>
            <div class="admin-card-body">
              <div class="admin-table-responsive">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th>Rescued Person</th>
                      <th>Rescue Location</th>
                      <th>Current Hospital / Shelter</th>
                      <th>Rescue Team</th>
                      <th>Organization</th>
                      <th>Status</th>
                      <th>Date / Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${records.map(r => `
                      <tr>
                        <td>
                          <div class="admin-cell-title">${this.escapeHtml(r.person_name || 'Extricated Citizen')}</div>
                          <div class="admin-cell-sub">${r.person_report_id ? 'Ref: ' + r.person_report_id : ''}</div>
                        </td>
                        <td>${this.escapeHtml(r.rescued_location)}</td>
                        <td>${this.escapeHtml(r.current_location)}</td>
                        <td>${this.escapeHtml(r.rescue_team)}</td>
                        <td>${this.escapeHtml(r.organization)}</td>
                        <td>
                          <span class="admin-badge admin-badge-${r.rescue_status}">${r.rescue_status.toUpperCase()}</span>
                        </td>
                        <td>${r.rescued_date}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `;
      } catch (err) {
        console.error('Rescue render error:', err);
      }
    },

    // -------------------------------------------------------------
    // 6. RELIEF HUBS & SOS CITIZEN REQUESTS
    // -------------------------------------------------------------
    async renderRelief() {
      try {
        const [resCenters, resRequests] = await Promise.all([
          fetch('/api/admin/relief.php?section=centers'),
          fetch('/api/admin/relief.php?section=requests')
        ]);
        const jsonCenters = await resCenters.json();
        const jsonRequests = await resRequests.json();

        const centers = jsonCenters.data.centers || [];
        const requests = jsonRequests.data.requests || [];

        const container = document.getElementById('admin-tab-content');
        container.innerHTML = `
          <!-- 1. Relief Centers Stock Status -->
          <div class="admin-card">
            <div class="admin-card-header">
              <div class="admin-card-title">Relief Distribution Centers (${centers.length})</div>
              <button class="admin-btn admin-btn-primary admin-btn-sm" onclick="window.AdminApp.openModal('create-relief-center')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Register Relief Hub
              </button>
            </div>
            <div class="admin-card-body">
              <div class="admin-table-responsive">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th>Center Name & Location</th>
                      <th>Organization</th>
                      <th>Food</th>
                      <th>Water</th>
                      <th>Medicine</th>
                      <th>Blankets</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${centers.map(c => `
                      <tr>
                        <td>
                          <div class="admin-cell-title">${this.escapeHtml(c.name)}</div>
                          <div class="admin-cell-sub">${this.escapeHtml(c.municipality || 'Rasuwa')}, ${this.escapeHtml(c.ward || '')}</div>
                        </td>
                        <td>${this.escapeHtml(c.organization)}</td>
                        <td><span class="admin-badge admin-badge-${c.food_status === 'adequate' ? 'verified' : 'critical'}">${c.food_status.toUpperCase()}</span></td>
                        <td><span class="admin-badge admin-badge-${c.water_status === 'adequate' ? 'verified' : 'critical'}">${c.water_status.toUpperCase()}</span></td>
                        <td><span class="admin-badge admin-badge-${c.medicine_status === 'adequate' ? 'verified' : 'critical'}">${c.medicine_status.toUpperCase()}</span></td>
                        <td><span class="admin-badge admin-badge-${c.blanket_status === 'adequate' ? 'verified' : 'critical'}">${c.blanket_status.toUpperCase()}</span></td>
                        <td><span class="admin-badge admin-badge-${c.status === 'operational' ? 'active' : 'inactive'}">${c.status.toUpperCase()}</span></td>
                        <td>
                          <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.AdminApp.openEditCenterModal(${c.id})">Update Stock</button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 2. Emergency SOS Requests -->
          <div class="admin-card">
            <div class="admin-card-header">
              <div class="admin-card-title">Emergency Relief SOS Requests (${requests.length})</div>
              <span class="admin-badge admin-badge-critical">Field Dispatch Command</span>
            </div>
            <div class="admin-card-body">
              <div class="admin-table-responsive">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th>Requester & Phone</th>
                      <th>Type & People</th>
                      <th>Emergency Description</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Assigned Brigade</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${requests.map(r => `
                      <tr>
                        <td>
                          <div class="admin-cell-title">${this.escapeHtml(r.requester_name)}</div>
                          <div class="admin-cell-sub">${this.escapeHtml(r.phone)}</div>
                        </td>
                        <td>
                          <div class="admin-cell-title">${this.escapeHtml(r.request_type)}</div>
                          <div class="admin-cell-sub">${r.people_count} citizens</div>
                        </td>
                        <td style="max-width: 280px;">${this.escapeHtml(r.description)}</td>
                        <td><span class="admin-badge admin-badge-${r.priority === 'critical' ? 'critical' : 'pending'}">${r.priority.toUpperCase()}</span></td>
                        <td><span class="admin-badge admin-badge-${r.status === 'fulfilled' ? 'verified' : 'pending'}">${r.status.toUpperCase()}</span></td>
                        <td>${this.escapeHtml(r.assigned_team || 'Unassigned')}</td>
                        <td>
                          <div class="admin-btn-group">
                            <button class="admin-btn admin-btn-primary admin-btn-sm" onclick="window.AdminApp.dispatchReliefTeam(${r.id})">Dispatch</button>
                            <button class="admin-btn admin-btn-success admin-btn-sm" onclick="window.AdminApp.fulfillReliefRequest(${r.id})">Fulfill</button>
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `;
      } catch (err) {
        console.error('Relief render error:', err);
      }
    },

    // -------------------------------------------------------------
    // 7. GOVERNMENT NEWS & ADVISORIES
    // -------------------------------------------------------------
    async renderNews() {
      try {
        const res = await fetch('/api/admin/news.php');
        const json = await res.json();
        const news = json.data.news || [];
        this.state.newsRecords = news;

        const container = document.getElementById('admin-tab-content');
        container.innerHTML = `
          <div class="admin-card">
            <div class="admin-card-header">
              <div class="admin-card-title">Government Emergency Bulletins & Advisories (${news.length})</div>
              <button class="admin-btn admin-btn-primary admin-btn-sm" onclick="window.AdminApp.openModal('create-news')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Publish New Advisory
              </button>
            </div>
            <div class="admin-card-body">
              <div class="admin-table-responsive">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th>Title & Summary</th>
                      <th>Issuing Agency</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Published Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${news.map(n => `
                      <tr>
                        <td style="max-width: 320px;">
                          <div class="admin-cell-title">${this.escapeHtml(n.title)}</div>
                          <div class="admin-cell-sub">${this.escapeHtml(n.summary)}</div>
                        </td>
                        <td>${this.escapeHtml(n.organization)}</td>
                        <td><span class="admin-badge admin-badge-found">${this.escapeHtml(n.category)}</span></td>
                        <td><span class="admin-badge admin-badge-${n.priority === 'critical' ? 'critical' : 'pending'}">${n.priority.toUpperCase()}</span></td>
                        <td>${n.published_at}</td>
                        <td>
                          <span class="admin-badge admin-badge-${n.is_published ? 'verified' : 'rejected'}">
                            ${n.is_published ? 'PUBLISHED' : 'DRAFT/UNPUBLISHED'}
                          </span>
                        </td>
                        <td>
                          <div class="admin-btn-group">
                            ${n.is_published ? `
                              <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.AdminApp.unpublishNews(${n.id})">Unpublish</button>
                            ` : `
                              <button class="admin-btn admin-btn-success admin-btn-sm" onclick="window.AdminApp.publishNews(${n.id})">Publish</button>
                            `}
                            <button class="admin-btn admin-btn-danger admin-btn-sm" onclick="window.AdminApp.archiveNews(${n.id})">Archive</button>
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `;
      } catch (err) {
        console.error('News render error:', err);
      }
    },

    // -------------------------------------------------------------
    // 8. CITIZEN SIGHTINGS & REPORTS
    // -------------------------------------------------------------
    async renderReports() {
      try {
        const res = await fetch('/api/admin/reports.php');
        const json = await res.json();
        const reports = json.data.reports || [];
        this.state.reportsRecords = reports;

        const container = document.getElementById('admin-tab-content');
        container.innerHTML = `
          <div class="admin-card">
            <div class="admin-card-header">
              <div class="admin-card-title">Citizen Sightings & Verification Flags (${reports.length})</div>
            </div>
            <div class="admin-card-body">
              <div class="admin-table-responsive">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th>Type & Target Record</th>
                      <th>Report Reason</th>
                      <th>Citizen Description</th>
                      <th>Status</th>
                      <th>Submission Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${reports.map(r => `
                      <tr>
                        <td>
                          <div class="admin-cell-title">${this.escapeHtml(r.report_type)}</div>
                          <div class="admin-cell-sub">Target: ${this.escapeHtml(r.target_name || 'Missing Record #' + r.target_id)}</div>
                        </td>
                        <td>${this.escapeHtml(r.reason)}</td>
                        <td style="max-width: 300px;">${this.escapeHtml(r.description)}</td>
                        <td><span class="admin-badge admin-badge-${r.status === 'resolved' ? 'verified' : (r.status === 'pending' ? 'pending' : 'found')}">${r.status.toUpperCase()}</span></td>
                        <td>${r.created_at}</td>
                        <td>
                          <div class="admin-btn-group">
                            <button class="admin-btn admin-btn-success admin-btn-sm" onclick="window.AdminApp.updateReportStatus(${r.id}, 'resolved')">Resolve</button>
                            <button class="admin-btn admin-btn-danger admin-btn-sm" onclick="window.AdminApp.updateReportStatus(${r.id}, 'dismissed')">Dismiss</button>
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `;
      } catch (err) {
        console.error('Reports render error:', err);
      }
    },

    // -------------------------------------------------------------
    // 9. ORGANIZATIONS
    // -------------------------------------------------------------
    async renderOrganizations() {
      try {
        const res = await fetch('/api/admin/organizations.php');
        const json = await res.json();
        const orgs = json.data.organizations || [];

        const container = document.getElementById('admin-tab-content');
        container.innerHTML = `
          <div class="admin-card">
            <div class="admin-card-header">
              <div class="admin-card-title">Authorized Disaster Response Agencies (${orgs.length})</div>
              <button class="admin-btn admin-btn-primary admin-btn-sm" onclick="window.AdminApp.openModal('create-org')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Authorized Agency
              </button>
            </div>
            <div class="admin-card-body">
              <div class="admin-table-responsive">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th>Agency Name</th>
                      <th>Code</th>
                      <th>Category</th>
                      <th>Hotline</th>
                      <th>Official Clearance</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${orgs.map(o => `
                      <tr>
                        <td>
                          <div class="admin-cell-title">${this.escapeHtml(o.name)}</div>
                          <div class="admin-cell-sub">${this.escapeHtml(o.description || '')}</div>
                        </td>
                        <td><code>${this.escapeHtml(o.code)}</code></td>
                        <td>${this.escapeHtml(o.category)}</td>
                        <td>${this.escapeHtml(o.contact_phone || 'N/A')}</td>
                        <td>
                          <span class="admin-badge admin-badge-${o.is_verified_source ? 'verified' : 'rejected'}">
                            ${o.is_verified_source ? 'VERIFIED' : 'UNVERIFIED'}
                          </span>
                        </td>
                        <td>
                          <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.AdminApp.toggleOrgVerification(${o.id})">Toggle Clearance</button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `;
      } catch (err) {
        console.error('Orgs render error:', err);
      }
    },

    // -------------------------------------------------------------
    // 10. USERS (RBAC)
    // -------------------------------------------------------------
    async renderUsers() {
      if (this.state.user.role !== 'super_admin' && this.state.user.role !== 'admin') {
        const container = document.getElementById('admin-tab-content');
        container.innerHTML = `
          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 2rem; border-radius: 8px; text-align: center;">
            <div style="font-weight: 700; color: #991b1b; font-size: 1.1rem;">Access Restricted</div>
            <p style="font-size: 0.88rem; color: #7f1d1d; margin-top: 0.5rem;">User Account & Role Management requires Super Administrator clearance.</p>
          </div>
        `;
        return;
      }

      try {
        const res = await fetch('/api/admin/users.php');
        const json = await res.json();
        const users = json.data.users || [];
        this.state.userRecords = users;

        const container = document.getElementById('admin-tab-content');
        container.innerHTML = `
          <div class="admin-card">
            <div class="admin-card-header">
              <div class="admin-card-title">Official Users & Role-Based Access Control (${users.length})</div>
              <button class="admin-btn admin-btn-primary admin-btn-sm" onclick="window.AdminApp.openModal('create-user')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Provision User Account
              </button>
            </div>
            <div class="admin-card-body">
              <div class="admin-table-responsive">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th>Official Name</th>
                      <th>Email Address</th>
                      <th>Assigned Role</th>
                      <th>Status</th>
                      <th>Account Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${users.map(u => `
                      <tr>
                        <td>
                          <div class="admin-cell-title">${this.escapeHtml(u.name)}</div>
                          <div class="admin-cell-sub">${this.escapeHtml(u.phone || '')}</div>
                        </td>
                        <td>${this.escapeHtml(u.email)}</td>
                        <td>
                          <span class="admin-badge admin-badge-found">${u.role.toUpperCase()}</span>
                        </td>
                        <td>
                          <span class="admin-badge admin-badge-${u.status === 'active' ? 'active' : 'inactive'}">${u.status.toUpperCase()}</span>
                        </td>
                        <td>${u.created_at}</td>
                        <td>
                          <div class="admin-btn-group">
                            <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.AdminApp.toggleUserStatus(${u.id}, '${u.status === 'active' ? 'suspended' : 'active'}')">
                              ${u.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                            <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.AdminApp.resetUserPassword(${u.id})">Reset Pass</button>
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `;
      } catch (err) {
        console.error('Users render error:', err);
      }
    },

    // -------------------------------------------------------------
    // 11. AUDIT LOGS LEDGER
    // -------------------------------------------------------------
    async renderAuditLogs() {
      try {
        const res = await fetch('/api/admin/audit-logs.php');
        const json = await res.json();
        const logs = json.data.logs || [];
        this.state.auditLogs = logs;

        const container = document.getElementById('admin-tab-content');
        container.innerHTML = `
          <div class="admin-card">
            <div class="admin-card-header">
              <div class="admin-card-title">Immutable Audit Trail Ledger (${logs.length} Recent Events)</div>
              <a href="/api/admin/audit-logs.php?format=csv" class="admin-btn admin-btn-secondary admin-btn-sm" download>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Export CSV Ledger
              </a>
            </div>
            <div class="admin-card-body">
              <div class="admin-table-responsive">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Official / User</th>
                      <th>Action Performed</th>
                      <th>Entity Type</th>
                      <th>Entity ID</th>
                      <th>IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${logs.map(l => `
                      <tr>
                        <td><code>${l.created_at}</code></td>
                        <td>
                          <div class="admin-cell-title">${this.escapeHtml(l.user_name)}</div>
                          <div class="admin-cell-sub">Role: ${l.user_role}</div>
                        </td>
                        <td><span class="admin-badge admin-badge-found">${this.escapeHtml(l.action)}</span></td>
                        <td><code>${this.escapeHtml(l.entity_type)}</code></td>
                        <td>${l.entity_id ? '#' + l.entity_id : 'N/A'}</td>
                        <td><code>${this.escapeHtml(l.ip_address || '127.0.0.1')}</code></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `;
      } catch (err) {
        console.error('Audit logs error:', err);
      }
    },

    // -------------------------------------------------------------
    // 12. SETTINGS
    // -------------------------------------------------------------
    async renderSettings() {
      try {
        const res = await fetch('/api/admin/settings.php');
        const json = await res.json();
        const contacts = json.data.emergency_contacts || [];
        const cfg = json.data.system_config || {};

        const container = document.getElementById('admin-tab-content');
        container.innerHTML = `
          <!-- System Configuration Overview -->
          <div class="admin-card">
            <div class="admin-card-header">
              <div class="admin-card-title">Incident Response System Configuration</div>
              <span class="admin-badge admin-badge-critical">${cfg.operations_status}</span>
            </div>
            <div class="admin-card-body">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem;">
                <div>
                  <div class="admin-label">Incident Designation</div>
                  <div class="admin-cell-title">${cfg.incident_name}</div>
                </div>
                <div>
                  <div class="admin-label">Lead Federal Coordinator</div>
                  <div class="admin-cell-title">${cfg.lead_agency}</div>
                </div>
                <div>
                  <div class="admin-label">AI Photo Verification Policy</div>
                  <div class="admin-badge admin-badge-verified">${cfg.ai_photo_verification}</div>
                </div>
                <div>
                  <div class="admin-label">Public Privacy Masking</div>
                  <div class="admin-badge admin-badge-verified">${cfg.sensitive_data_redaction}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Emergency Hotlines -->
          <div class="admin-card">
            <div class="admin-card-header">
              <div class="admin-card-title">Emergency Hotlines & Dispatches (${contacts.length})</div>
              <button class="admin-btn admin-btn-primary admin-btn-sm" onclick="window.AdminApp.openModal('create-contact')">
                Add Hotline
              </button>
            </div>
            <div class="admin-card-body">
              <div class="admin-table-responsive">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th>Agency / Organization</th>
                      <th>Service Desk</th>
                      <th>Phone Hotline</th>
                      <th>Description</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${contacts.map(c => `
                      <tr>
                        <td class="admin-cell-title">${this.escapeHtml(c.organization)}</td>
                        <td>${this.escapeHtml(c.service)}</td>
                        <td><strong style="color:#2563eb; font-size:1rem;">${this.escapeHtml(c.phone)}</strong></td>
                        <td>${this.escapeHtml(c.description || '')}</td>
                        <td>
                          <span class="admin-badge admin-badge-${c.is_active ? 'active' : 'inactive'}">
                            ${c.is_active ? 'ACTIVE 24/7' : 'INACTIVE'}
                          </span>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `;
      } catch (err) {
        console.error('Settings error:', err);
      }
    },

    // -------------------------------------------------------------
    // ACTIONS & CONTROLLERS
    // -------------------------------------------------------------
    async verifyMissing(id) {
      if (!confirm('Officially verify this missing person record?')) return;
      await this.sendPost('/api/admin/missing.php', { action: 'verify', id });
      this.toast('Record officially verified.');
      this.renderMissing();
    },

    async rejectMissing(id) {
      if (!confirm('Reject or mark this record as duplicate/invalid?')) return;
      await this.sendPost('/api/admin/missing.php', { action: 'reject', id });
      this.toast('Record marked as rejected.');
      this.renderMissing();
    },

    async markMissingFound(id) {
      if (!confirm('Mark this missing person as safely found / rescued?')) return;
      await this.sendPost('/api/admin/missing.php', { action: 'mark_found', id, status: 'found' });
      this.toast('Status updated to Found.');
      this.renderMissing();
    },

    async archiveMissing(id) {
      if (!confirm('Archive and close this missing case?')) return;
      await this.sendPost('/api/admin/missing.php', { action: 'archive', id });
      this.toast('Record archived.');
      this.renderMissing();
    },

    async viewMissingDetail(id) {
      try {
        const res = await fetch(`/api/admin/missing.php?action=detail&id=${id}`);
        const json = await res.json();
        const r = json.data;

        this.showCustomModal(`
          <div class="admin-modal-header">
            <h3 class="admin-modal-title">Missing Person Dossier: ${this.escapeHtml(r.full_name)}</h3>
            <button class="admin-modal-close" onclick="window.AdminApp.closeModal()">&times;</button>
          </div>
          <div class="admin-modal-body">
            <div style="display:flex; gap:1.25rem; margin-bottom:1.25rem;">
              <img src="${r.photo || 'assets/demo_person_1.jpg'}" alt="${this.escapeHtml(r.full_name)}" style="width:110px; height:110px; border-radius:8px; object-fit:cover; border:1px solid #cbd5e1;" onerror="this.src='assets/demo_person_1.jpg'" />
              <div>
                <div style="font-size:1.15rem; font-weight:700;">${this.escapeHtml(r.full_name)}</div>
                <div style="color:#64748b; font-size:0.85rem;">Report ID: <strong>${r.report_id}</strong></div>
                <div style="margin-top:0.4rem;">
                  <span class="admin-badge admin-badge-${r.status}">${r.status.toUpperCase()}</span>
                  <span class="admin-badge admin-badge-${r.verification_status}">${r.verification_status.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <!-- Sensitive Contact Box for Official Verifiers -->
            <div style="background:#fffbeb; border:1px solid #fde68a; padding:0.9rem; border-radius:6px; margin-bottom:1rem;">
              <div style="font-weight:700; color:#b45309; font-size:0.82rem; margin-bottom:0.3rem;">AUTHORIZED GUARDIAN CONTACT DETAILS</div>
              <div style="font-size:0.88rem;"><strong>Guardian Name:</strong> ${this.escapeHtml(r.guardian_name || 'N/A')}</div>
              <div style="font-size:0.88rem; margin-top:0.2rem;"><strong>Direct Phone:</strong> <a href="tel:${r.guardian_phone}" style="color:#2563eb; font-weight:700;">${this.escapeHtml(r.guardian_phone || 'N/A')}</a></div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.8rem; font-size:0.85rem;">
              <div><strong>Age:</strong> ${r.age || 'Unknown'}</div>
              <div><strong>Gender:</strong> ${this.escapeHtml(r.gender)}</div>
              <div><strong>Missing Date:</strong> ${r.missing_date}</div>
              <div><strong>Last Seen:</strong> ${this.escapeHtml(r.last_seen_location)}</div>
              <div><strong>Municipality / Ward:</strong> ${this.escapeHtml(r.municipality || '')} ${this.escapeHtml(r.ward || '')}</div>
              <div><strong>Source:</strong> ${this.escapeHtml(r.source_type)} (${this.escapeHtml(r.source_name || '')})</div>
            </div>

            <div style="margin-top:1rem; font-size:0.85rem;">
              <div><strong>Clothing Description:</strong> ${this.escapeHtml(r.clothing_description || 'N/A')}</div>
              <div style="margin-top:0.4rem;"><strong>Identifying Marks:</strong> ${this.escapeHtml(r.identifying_marks || 'None')}</div>
              <div style="margin-top:0.4rem;"><strong>General Description:</strong> ${this.escapeHtml(r.description || 'N/A')}</div>
            </div>
          </div>
          <div class="admin-modal-footer">
            <button class="admin-btn admin-btn-secondary" onclick="window.AdminApp.closeModal()">Close Dossier</button>
          </div>
        `);
      } catch (err) {
        this.toast('Failed to load dossier.', 'error');
      }
    },

    async verifyFound(id) {
      await this.sendPost('/api/admin/found.php', { action: 'verify', id });
      this.toast('Found individual verified.');
      this.renderFound();
    },

    async rejectFound(id) {
      await this.sendPost('/api/admin/found.php', { action: 'reject', id });
      this.toast('Record rejected.');
      this.renderFound();
    },

    async markFoundReunited(id) {
      if (!confirm('Mark individual as safely reunited with family?')) return;
      await this.sendPost('/api/admin/found.php', { action: 'mark_reunited', id });
      this.toast('Family reunion logged.');
      this.renderFound();
    },

    async confirmMatchReview(matchId) {
      await this.sendPost('/api/admin/matches.php', { match_id: matchId, action: 'confirm_review' });
      this.toast('Match confirmed for field investigation. Contact details remain protected.');
      this.renderMatches();
    },

    async rejectMatch(matchId) {
      await this.sendPost('/api/admin/matches.php', { match_id: matchId, action: 'reject_match' });
      this.toast('Match rejected.');
      this.renderMatches();
    },

    async requestMatchInfo(matchId) {
      const notes = prompt('Enter request note for submitting party (e.g. additional photos, scar details):');
      if (!notes) return;
      await this.sendPost('/api/admin/matches.php', { match_id: matchId, action: 'request_info', notes });
      this.toast('Information request sent.');
    },

    async forwardMatchAuthority(matchId) {
      const auth = prompt('Target Authority (e.g. Nepal Police Verification Desk / Nepal Red Cross RFL):', 'Nepal Police RFL Desk');
      if (!auth) return;
      await this.sendPost('/api/admin/matches.php', { match_id: matchId, action: 'forward_authority', authority: auth });
      this.toast(`Dossier forwarded to ${auth}.`);
      this.renderMatches();
    },

    async dispatchReliefTeam(id) {
      const team = prompt('Assign Rescue/Relief Team:', 'APF Rapid Relief Unit 4');
      if (!team) return;
      await this.sendPost('/api/admin/relief.php', { target: 'request', action: 'update', id, status: 'dispatched', assigned_team: team });
      this.toast(`Team ${team} dispatched to request.`);
      this.renderRelief();
    },

    async fulfillReliefRequest(id) {
      await this.sendPost('/api/admin/relief.php', { target: 'request', action: 'update', id, status: 'fulfilled' });
      this.toast('Relief request marked as fulfilled.');
      this.renderRelief();
    },

    async publishNews(id) {
      await this.sendPost('/api/admin/news.php', { action: 'publish', id });
      this.toast('Advisory published to official feed.');
      this.renderNews();
    },

    async unpublishNews(id) {
      await this.sendPost('/api/admin/news.php', { action: 'unpublish', id });
      this.toast('Advisory unpublished.');
      this.renderNews();
    },

    async archiveNews(id) {
      await this.sendPost('/api/admin/news.php', { action: 'archive', id });
      this.toast('Advisory archived.');
      this.renderNews();
    },

    async updateReportStatus(id, status) {
      await this.sendPost('/api/admin/reports.php', { id, status });
      this.toast(`Report marked as ${status}.`);
      this.renderReports();
    },

    async toggleOrgVerification(id) {
      await this.sendPost('/api/admin/organizations.php', { action: 'toggle_verify', id });
      this.toast('Agency clearance updated.');
      this.renderOrganizations();
    },

    async toggleUserStatus(id, status) {
      await this.sendPost('/api/admin/users.php', { action: 'toggle_status', id, status });
      this.toast(`User status set to ${status}.`);
      this.renderUsers();
    },

    async resetUserPassword(id) {
      const pass = prompt('Enter new 8+ character password for this official user:');
      if (!pass || pass.length < 8) {
        alert('Password must be at least 8 characters long.');
        return;
      }
      await this.sendPost('/api/admin/users.php', { action: 'reset_password', id, password: pass });
      this.toast('Password reset successfully.');
    },

    // -------------------------------------------------------------
    // MODALS & FORMS
    // -------------------------------------------------------------
    openModal(type) {
      const modal = document.getElementById('admin-modal');
      const body = document.getElementById('admin-modal-content');
      if (!modal || !body) return;

      if (type === 'create-missing') {
        body.innerHTML = `
          <div class="admin-modal-header">
            <h3 class="admin-modal-title">Register Missing Person</h3>
            <button class="admin-modal-close" onclick="window.AdminApp.closeModal()">&times;</button>
          </div>
          <form id="create-missing-form" onsubmit="window.AdminApp.handleCreateMissing(event)">
            <div class="admin-modal-body">
              <div class="admin-form-group">
                <label class="admin-label">Full Name of Missing Citizen *</label>
                <input type="text" name="full_name" class="admin-input" required placeholder="e.g. Pasang Norbu Tamang">
              </div>
              <div class="admin-form-row">
                <div class="admin-form-group">
                  <label class="admin-label">Age</label>
                  <input type="number" name="age" class="admin-input" placeholder="e.g. 34">
                </div>
                <div class="admin-form-group">
                  <label class="admin-label">Gender</label>
                  <select name="gender" class="admin-form-select">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>
              <div class="admin-form-row">
                <div class="admin-form-group">
                  <label class="admin-label">Missing Date *</label>
                  <input type="date" name="missing_date" class="admin-input" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="admin-form-group">
                  <label class="admin-label">Last Seen Location *</label>
                  <input type="text" name="last_seen_location" class="admin-input" required placeholder="e.g. Syabrubesi Bridge">
                </div>
              </div>
              <div class="admin-form-row">
                <div class="admin-form-group">
                  <label class="admin-label">Municipality</label>
                  <input type="text" name="municipality" class="admin-input" value="Gosaikunda Rural Municipality">
                </div>
                <div class="admin-form-group">
                  <label class="admin-label">Ward</label>
                  <input type="text" name="ward" class="admin-input" placeholder="e.g. Ward 5">
                </div>
              </div>
              <div class="admin-form-row">
                <div class="admin-form-group">
                  <label class="admin-label">Guardian / Reporter Name</label>
                  <input type="text" name="guardian_name" class="admin-input" placeholder="e.g. Dawa Tamang">
                </div>
                <div class="admin-form-group">
                  <label class="admin-label">Guardian Phone (Protected)</label>
                  <input type="text" name="guardian_phone" class="admin-input" placeholder="e.g. +977-9841234111">
                </div>
              </div>
              <div class="admin-form-group">
                <label class="admin-label">Clothing & Identifying Physical Marks</label>
                <textarea name="clothing_description" class="admin-textarea" placeholder="e.g. Dark blue windcheater, scar on left forearm."></textarea>
              </div>
            </div>
            <div class="admin-modal-footer">
              <button type="button" class="admin-btn admin-btn-secondary" onclick="window.AdminApp.closeModal()">Cancel</button>
              <button type="submit" class="admin-btn admin-btn-primary">Register Record</button>
            </div>
          </form>
        `;
      }

      if (type === 'create-news') {
        body.innerHTML = `
          <div class="admin-modal-header">
            <h3 class="admin-modal-title">Publish Government Emergency Advisory</h3>
            <button class="admin-modal-close" onclick="window.AdminApp.closeModal()">&times;</button>
          </div>
          <form onsubmit="window.AdminApp.handleCreateNews(event)">
            <div class="admin-modal-body">
              <div class="admin-form-group">
                <label class="admin-label">Advisory Headline *</label>
                <input type="text" name="title" class="admin-input" required placeholder="e.g. Trishuli River High Alert & Evacuation Order">
              </div>
              <div class="admin-form-row">
                <div class="admin-form-group">
                  <label class="admin-label">Category</label>
                  <select name="category" class="admin-form-select">
                    <option value="EVACUATION NOTICE">EVACUATION NOTICE</option>
                    <option value="SAFETY NOTICE">SAFETY NOTICE</option>
                    <option value="WEATHER ALERT">WEATHER ALERT</option>
                    <option value="ROAD CLOSURE">ROAD CLOSURE</option>
                    <option value="RELIEF UPDATE">RELIEF UPDATE</option>
                  </select>
                </div>
                <div class="admin-form-group">
                  <label class="admin-label">Priority Level</label>
                  <select name="priority" class="admin-form-select">
                    <option value="critical">Critical Emergency (Flash Alert)</option>
                    <option value="warning">Warning / Caution</option>
                    <option value="info">General Advisory</option>
                  </select>
                </div>
              </div>
              <div class="admin-form-group">
                <label class="admin-label">Issuing Organization</label>
                <input type="text" name="organization" class="admin-input" value="NDRRMA / Ministry of Home Affairs">
              </div>
              <div class="admin-form-group">
                <label class="admin-label">Summary Bulletin (Short) *</label>
                <input type="text" name="summary" class="admin-input" required placeholder="Brief bullet summary for public broadcast">
              </div>
              <div class="admin-form-group">
                <label class="admin-label">Full Directive Content</label>
                <textarea name="content" class="admin-textarea" rows="4" placeholder="Detailed official instructions, designated shelters, and safe zones."></textarea>
              </div>
            </div>
            <div class="admin-modal-footer">
              <button type="button" class="admin-btn admin-btn-secondary" onclick="window.AdminApp.closeModal()">Cancel</button>
              <button type="submit" class="admin-btn admin-btn-primary">Publish Advisory</button>
            </div>
          </form>
        `;
      }

      if (type === 'create-user') {
        body.innerHTML = `
          <div class="admin-modal-header">
            <h3 class="admin-modal-title">Provision Official User Account</h3>
            <button class="admin-modal-close" onclick="window.AdminApp.closeModal()">&times;</button>
          </div>
          <form onsubmit="window.AdminApp.handleCreateUser(event)">
            <div class="admin-modal-body">
              <div class="admin-form-group">
                <label class="admin-label">Official Full Name *</label>
                <input type="text" name="name" class="admin-input" required placeholder="e.g. SI Rajesh Shrestha">
              </div>
              <div class="admin-form-group">
                <label class="admin-label">Official Email Address *</label>
                <input type="email" name="email" class="admin-input" required placeholder="e.g. officer@rasuwa.police.gov.np">
              </div>
              <div class="admin-form-row">
                <div class="admin-form-group">
                  <label class="admin-label">Assigned Role *</label>
                  <select name="role" class="admin-form-select">
                    <option value="moderator">Moderator (Verification Officer)</option>
                    <option value="organization">Organization (Rescue / Relief Ops)</option>
                    <option value="admin">Admin (Command Operations)</option>
                    <option value="user">Viewer (Read-Only Monitor)</option>
                  </select>
                </div>
                <div class="admin-form-group">
                  <label class="admin-label">Contact Phone</label>
                  <input type="text" name="phone" class="admin-input" placeholder="+977-9851000000">
                </div>
              </div>
              <div class="admin-form-group">
                <label class="admin-label">Initial Password (Min 8 Characters) *</label>
                <input type="password" name="password" class="admin-input" required minlength="8" value="KhojiDemo@2024">
              </div>
            </div>
            <div class="admin-modal-footer">
              <button type="button" class="admin-btn admin-btn-secondary" onclick="window.AdminApp.closeModal()">Cancel</button>
              <button type="submit" class="admin-btn admin-btn-primary">Create Account</button>
            </div>
          </form>
        `;
      }

      document.getElementById('admin-modal-overlay').classList.add('active');
    },

    openEditCenterModal(id) {
      const center = this.state.reliefCenters.find(c => c.id === id) || { id };
      this.showCustomModal(`
        <div class="admin-modal-header">
          <h3 class="admin-modal-title">Update Relief Center Stock Levels</h3>
          <button class="admin-modal-close" onclick="window.AdminApp.closeModal()">&times;</button>
        </div>
        <form onsubmit="window.AdminApp.handleUpdateCenterStock(event, ${id})">
          <div class="admin-modal-body">
            <div class="admin-form-row">
              <div class="admin-form-group">
                <label class="admin-label">Food Supply Status</label>
                <select name="food_status" class="admin-form-select">
                  <option value="adequate">Adequate (3+ Days)</option>
                  <option value="low">Low (1-2 Days)</option>
                  <option value="critical">Critical Shortage (&lt; 24h)</option>
                  <option value="depleted">Depleted</option>
                </select>
              </div>
              <div class="admin-form-group">
                <label class="admin-label">Potable Water Status</label>
                <select name="water_status" class="admin-form-select">
                  <option value="adequate">Adequate</option>
                  <option value="low">Low</option>
                  <option value="critical">Critical Shortage</option>
                  <option value="depleted">Depleted</option>
                </select>
              </div>
            </div>
            <div class="admin-form-row">
              <div class="admin-form-group">
                <label class="admin-label">Medicine / First Aid</label>
                <select name="medicine_status" class="admin-form-select">
                  <option value="adequate">Adequate</option>
                  <option value="low">Low</option>
                  <option value="critical">Critical Shortage</option>
                  <option value="depleted">Depleted</option>
                </select>
              </div>
              <div class="admin-form-group">
                <label class="admin-label">Blankets & Shelter Kits</label>
                <select name="blanket_status" class="admin-form-select">
                  <option value="adequate">Adequate</option>
                  <option value="low">Low</option>
                  <option value="critical">Critical Shortage</option>
                  <option value="depleted">Depleted</option>
                </select>
              </div>
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Operational Status</label>
              <select name="status" class="admin-form-select">
                <option value="operational">Operational</option>
                <option value="overwhelmed">Overwhelmed</option>
                <option value="relocating">Relocating</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div class="admin-modal-footer">
            <button type="button" class="admin-btn admin-btn-secondary" onclick="window.AdminApp.closeModal()">Cancel</button>
            <button type="submit" class="admin-btn admin-btn-primary">Save Stock Update</button>
          </div>
        </form>
      `);
    },

    showCustomModal(html) {
      const modal = document.getElementById('admin-modal');
      const body = document.getElementById('admin-modal-content');
      if (body) body.innerHTML = html;
      document.getElementById('admin-modal-overlay').classList.add('active');
    },

    closeModal() {
      document.getElementById('admin-modal-overlay').classList.remove('active');
    },

    async handleCreateMissing(e) {
      e.preventDefault();
      const formData = new FormData(e.target);
      const payload = Object.fromEntries(formData.entries());
      payload.action = 'create';

      const res = await this.sendPost('/api/admin/missing.php', payload);
      if (res.success) {
        this.toast('Missing person registered successfully.');
        this.closeModal();
        this.renderMissing();
      }
    },

    async handleCreateNews(e) {
      e.preventDefault();
      const formData = new FormData(e.target);
      const payload = Object.fromEntries(formData.entries());
      payload.action = 'create';

      const res = await this.sendPost('/api/admin/news.php', payload);
      if (res.success) {
        this.toast('Advisory published successfully.');
        this.closeModal();
        this.renderNews();
      }
    },

    async handleCreateUser(e) {
      e.preventDefault();
      const formData = new FormData(e.target);
      const payload = Object.fromEntries(formData.entries());
      payload.action = 'create';

      const res = await this.sendPost('/api/admin/users.php', payload);
      if (res.success) {
        this.toast('Official user created.');
        this.closeModal();
        this.renderUsers();
      }
    },

    async handleUpdateCenterStock(e, id) {
      e.preventDefault();
      const formData = new FormData(e.target);
      const payload = Object.fromEntries(formData.entries());
      payload.target = 'center';
      payload.action = 'update';
      payload.id = id;

      const res = await this.sendPost('/api/admin/relief.php', payload);
      if (res.success) {
        this.toast('Relief center stock updated.');
        this.closeModal();
        this.renderRelief();
      }
    },

    // -------------------------------------------------------------
    // AUTHENTICATION & LOGIN DIALOG
    // -------------------------------------------------------------
    renderAuthenticatedUI() {
      const user = this.state.user;
      const nameEl = document.getElementById('admin-user-name');
      const roleEl = document.getElementById('admin-user-role');
      const avatarEl = document.getElementById('admin-user-avatar');

      if (nameEl) nameEl.textContent = user.name;
      if (roleEl) roleEl.textContent = user.role.toUpperCase();
      if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();

      // Show/Hide SuperAdmin only tabs
      const userNav = document.querySelector('[data-tab="users"]');
      if (userNav) {
        userNav.style.display = (user.role === 'super_admin' || user.role === 'admin') ? 'flex' : 'none';
      }
      const auditNav = document.querySelector('[data-tab="audit-logs"]');
      if (auditNav) {
        auditNav.style.display = (user.role === 'super_admin' || user.role === 'admin') ? 'flex' : 'none';
      }
    },

    renderLoginModal() {
      const overlay = document.getElementById('admin-modal-overlay');
      const body = document.getElementById('admin-modal-content');
      if (!overlay || !body) return;

      body.innerHTML = `
        <div class="admin-modal-header">
          <h3 class="admin-modal-title">Official Command Center Login</h3>
        </div>
        <form id="admin-login-form" onsubmit="window.AdminApp.handleLogin(event)">
          <div class="admin-modal-body">
            <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:0.8rem; border-radius:6px; margin-bottom:1.25rem; font-size:0.82rem; color:#1e40af;">
              🔒 <strong>Restricted Access:</strong> Authorized personnel only (NEOC, Nepal Police, Armed Police Force, Nepali Army, Nepal Red Cross Society).
            </div>

            <div class="admin-form-group">
              <label class="admin-label">Official Email Address</label>
              <input type="email" id="login-email" class="admin-input" required value="admin@neoc.gov.np">
            </div>
            <div class="admin-form-group">
              <label class="admin-label">Password</label>
              <input type="password" id="login-password" class="admin-input" required value="KhojiDemo@2024">
            </div>

            <!-- Quick Demo Credential Switcher -->
            <div style="margin-top: 1rem;">
              <div style="font-size:0.75rem; font-weight:700; color:#64748b; margin-bottom:0.4rem; text-transform:uppercase;">Quick Demo Role Switcher:</div>
              <div style="display:flex; flex-wrap:wrap; gap:0.4rem;">
                <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.AdminApp.fillCreds('admin@neoc.gov.np')">Super Admin</button>
                <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.AdminApp.fillCreds('moderator.police@rasuwa.police.gov.np')">Police Moderator</button>
                <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.AdminApp.fillCreds('rfl.rasuwa@nrcs.org')">Red Cross Org</button>
                <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.AdminApp.fillCreds('apf.rescue@rasuwa.gov.np')">APF Rescue</button>
                <button type="button" class="admin-btn admin-btn-secondary admin-btn-sm" onclick="window.AdminApp.fillCreds('viewer.desk@khoji.np')">Viewer</button>
              </div>
            </div>
          </div>
          <div class="admin-modal-footer">
            <a href="index.html" class="admin-btn admin-btn-secondary">Return to Public Portal</a>
            <button type="submit" class="admin-btn admin-btn-primary">Authenticate & Enter Console</button>
          </div>
        </form>
      `;

      overlay.classList.add('active');
    },

    fillCreds(email) {
      const emailInput = document.getElementById('login-email');
      const passInput = document.getElementById('login-password');
      if (emailInput) emailInput.value = email;
      if (passInput) passInput.value = 'KhojiDemo@2024';
    },

    async handleLogin(e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      try {
        const res = await fetch('/api/auth/login.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
          this.state.user = data.data.user;
          this.state.csrfToken = data.data.csrf_token;
          this.closeModal();
          this.renderAuthenticatedUI();
          this.toast(`Welcome, ${data.data.user.name}`);
          this.switchTab('dashboard');
        } else {
          alert(data.message || 'Login failed.');
        }
      } catch (err) {
        alert('Authentication failed due to network error.');
      }
    },

    async handleLogout() {
      if (!confirm('Log out from official command console?')) return;
      try {
        await fetch('/api/auth/logout.php', { method: 'POST' });
      } catch {}
      this.state.user = null;
      window.location.reload();
    },

    // -------------------------------------------------------------
    // HELPERS & HTTP UTILITIES
    // -------------------------------------------------------------
    async sendPost(url, payload) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': this.state.csrfToken
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.success) {
          this.toast(data.message || 'Operation failed.', 'error');
        }
        return data;
      } catch (err) {
        this.toast('Network error during request.', 'error');
        return { success: false };
      }
    },

    toast(msg, type = 'success') {
      let container = document.querySelector('.admin-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'admin-toast-container';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `admin-toast ${type}`;
      toast.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>${this.escapeHtml(msg)}</span>
      `;
      container.appendChild(toast);

      setTimeout(() => {
        toast.remove();
      }, 3500);
    },

    escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  };

  window.AdminApp = AdminApp;
  AdminApp.init();
});
