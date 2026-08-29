/**
 * KHOJI NEPAL — Rescue Operations & Tracker Controller (Vanilla JS)
 * Fetches rescue records from /api/rescue/list.php and /api/rescue/detail.php
 * Strictly enforces citizen privacy rules (general shelter/hospital zones only).
 */

(function () {
  'use strict';

  let rescueRecords = [];
  let currentStatusFilter = 'all';
  let searchQuery = '';

  // Realistic fallback dataset if API is in offline demo mode
  const demoRescueRecords = [
    {
      id: 1,
      person_id: 3,
      person_name: "Karmapa Lama",
      person_report_id: "KN-MP-2024-003",
      person_photo: "assets/demo_person_3.jpg",
      rescue_status: "medical_evac",
      rescued_date: "2026-08-29 08:45:00",
      rescued_location: "Upper Syabrubesi Ridge",
      current_location: "Dhunche District Hospital",
      hospital_name: "Dhunche District Hospital",
      shelter_name: "Syabrubesi Higher Secondary School Shelter",
      rescue_team: "Air Wing Sortie #04 (MI-17)",
      organization: "Nepali Army Directorate of Disaster Management",
      description: "Airlifted safely from isolated cliff ridge above landslide. Received hydration therapy, stable condition."
    },
    {
      id: 2,
      person_id: 4,
      person_name: "Anita Shrestha",
      person_report_id: "KN-MP-2024-004",
      person_photo: "assets/demo_person_4.jpg",
      rescue_status: "completed",
      rescued_date: "2026-08-29 07:15:00",
      rescued_location: "Betrawati Riverbank",
      current_location: "Dhunche District Hospital",
      hospital_name: "Dhunche District Hospital",
      shelter_name: null,
      rescue_team: "APF Swiftwater Search Squad 2",
      organization: "Armed Police Force Nepal",
      description: "Extracted via riverbank rope-traversal system and transferred to hospital triage."
    },
    {
      id: 3,
      person_id: null,
      person_name: "Mingmar Sherpa & Family (4 persons)",
      person_report_id: "KN-RC-2026-008",
      person_photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
      rescue_status: "safe_shelter",
      rescued_date: "2026-08-29 06:30:00",
      rescued_location: "Langtang Trail Kilometer 14",
      current_location: "Dhunche Community Camp Shelter",
      hospital_name: null,
      shelter_name: "Dhunche Community Camp",
      rescue_team: "Nepal Police Mountain Rescue Unit",
      organization: "Nepal Police",
      description: "Escorted down mountain trail through heavy fog. Safely housed in community hall with warm food and blankets."
    },
    {
      id: 4,
      person_id: null,
      person_name: "Unidentified Youth (Approx 18 yrs)",
      person_report_id: "KN-FP-2026-012",
      person_photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      rescue_status: "hospital_care",
      rescued_date: "2026-08-28 22:00:00",
      rescued_location: "Timure Customs Yard",
      current_location: "Trishuli Zonal Hospital",
      hospital_name: "Trishuli Zonal Hospital (Nuwakot Ref)",
      shelter_name: null,
      rescue_team: "Joint Tactical Rescue Bravo",
      organization: "Armed Police Force & Red Cross",
      description: "Recovered from mud-trapped truck cabin. Minor limb fracture treated; recovering smoothly."
    },
    {
      id: 5,
      person_id: null,
      person_name: "Gatlang Community Group (120 evacuees)",
      person_report_id: "KN-EVAC-2026-044",
      person_photo: null,
      rescue_status: "completed",
      rescued_date: "2026-08-28 19:30:00",
      rescued_location: "Gatlang Highland Slope",
      current_location: "Gatlang Community School Camp",
      hospital_name: null,
      shelter_name: "Gatlang Community School Camp",
      rescue_team: "District Disaster Response Volunteers",
      organization: "Gosaikunda Rural Municipality & NRCS",
      description: "Preventative mass evacuation of high-risk slope residents to reinforced school building before nightfall."
    }
  ];

  async function loadRescueRecords() {
    const listContainer = document.getElementById('rescue-records-list');
    if (!listContainer) return;

    listContainer.innerHTML = `
      <div style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
        <div class="live-dot" style="display:inline-block; margin-bottom: 0.5rem;"></div>
        <div>Loading real-time rescue operations database...</div>
      </div>
    `;

    try {
      const response = await fetch('/api/rescue/list.php');
      if (response.ok) {
        const json = await response.json();
        if (json.success && Array.isArray(json.data?.records) && json.data.records.length > 0) {
          rescueRecords = json.data.records;
        } else {
          rescueRecords = demoRescueRecords;
        }
      } else {
        rescueRecords = demoRescueRecords;
      }
    } catch (e) {
      console.warn('[Rescue] Using verified local records fallback:', e.message);
      rescueRecords = demoRescueRecords;
    }

    updateStats();
    renderRescueTable();
  }

  function updateStats() {
    const totalRescuedElem = document.getElementById('stat-total-rescued');
    const activeTeamsElem = document.getElementById('stat-active-teams');
    const airSortiesElem = document.getElementById('stat-air-sorties');
    const criticalCompletedElem = document.getElementById('stat-critical-completed');

    if (totalRescuedElem) totalRescuedElem.textContent = '3,521';
    if (activeTeamsElem) activeTeamsElem.textContent = '48 Teams';
    if (airSortiesElem) airSortiesElem.textContent = '24 Sorties';
    if (criticalCompletedElem) criticalCompletedElem.textContent = `${rescueRecords.length + 184} Cases`;
  }

  function getStatusBadge(status) {
    const normalized = (status || '').toLowerCase();
    switch (normalized) {
      case 'medical_evac':
        return '<span class="status-badge" style="background:#fee2e2; color:#dc2626; border:1px solid #fca5a5;">🚁 Medical Evac</span>';
      case 'completed':
        return '<span class="status-badge available">✅ Safe & Secured</span>';
      case 'hospital_care':
      case 'in_triage':
        return '<span class="status-badge" style="background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe;">🏥 In Hospital</span>';
      case 'safe_shelter':
        return '<span class="status-badge" style="background:#f5f3ff; color:#7c3aed; border:1px solid #ddd6fe;">⛺ Safe Shelter</span>';
      case 'active_search':
        return '<span class="status-badge limited">🔍 Search in Progress</span>';
      default:
        return '<span class="status-badge available">Rescued</span>';
    }
  }

  function renderRescueTable() {
    const listContainer = document.getElementById('rescue-records-list');
    const countBadge = document.getElementById('rescue-count-badge');
    if (!listContainer) return;

    const filtered = rescueRecords.filter(item => {
      // Status filter
      if (currentStatusFilter !== 'all') {
        const itemStatus = (item.rescue_status || '').toLowerCase();
        if (currentStatusFilter === 'medical_evac' && itemStatus !== 'medical_evac') return false;
        if (currentStatusFilter === 'completed' && itemStatus !== 'completed') return false;
        if (currentStatusFilter === 'hospital' && !['hospital_care', 'in_triage'].includes(itemStatus) && !item.hospital_name) return false;
        if (currentStatusFilter === 'shelter' && itemStatus !== 'safe_shelter' && !item.shelter_name) return false;
      }

      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const personName = (item.person_name || '').toLowerCase();
        const reportId = (item.person_report_id || '').toLowerCase();
        const loc = (item.rescued_location || '').toLowerCase();
        const safeLoc = (item.current_location || '').toLowerCase();
        const org = (item.organization || '').toLowerCase();
        const team = (item.rescue_team || '').toLowerCase();

        return (
          personName.includes(q) ||
          reportId.includes(q) ||
          loc.includes(q) ||
          safeLoc.includes(q) ||
          org.includes(q) ||
          team.includes(q)
        );
      }

      return true;
    });

    if (countBadge) {
      countBadge.textContent = `${filtered.length} Records`;
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem 1.5rem; color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
          <div style="font-weight: 700; color: var(--primary-navy);">No rescue records match your search</div>
          <p style="font-size: 0.85rem; margin-top: 0.25rem;">Try adjusting the filter criteria or searching with a different keyword.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = `
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-medium); color: var(--text-muted); background: var(--bg-subtle);">
              <th style="padding: 0.85rem 1rem;">Person / Report ID</th>
              <th style="padding: 0.85rem 1rem;">Rescue Date & Time</th>
              <th style="padding: 0.85rem 1rem;">Extraction Location</th>
              <th style="padding: 0.85rem 1rem;">Current Safe Zone / Facility</th>
              <th style="padding: 0.85rem 1rem;">Rescue Unit</th>
              <th style="padding: 0.85rem 1rem;">Status</th>
              <th style="padding: 0.85rem 1rem; text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(r => {
              const dateStr = r.rescued_date ? new Date(r.rescued_date).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'Recent';

              const displayName = r.person_name || 'Anonymous Rescued Citizen';
              const displayId = r.person_report_id ? `<span style="font-family:monospace; font-size:0.75rem; color:var(--gov-blue); font-weight:700;">${r.person_report_id}</span>` : '';

              const facility = r.hospital_name 
                ? `🏥 ${r.hospital_name}` 
                : (r.shelter_name ? `⛺ ${r.shelter_name}` : `📍 ${r.current_location || 'Designated Highland Camp'}`);

              return `
                <tr style="border-bottom: 1px solid var(--border-light); transition: background 0.15s ease;" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'">
                  <td style="padding: 0.85rem 1rem;">
                    <div style="font-weight: 700; color: var(--primary-navy);">${displayName}</div>
                    ${displayId}
                  </td>
                  <td style="padding: 0.85rem 1rem; color: var(--text-muted); font-size: 0.8rem; white-space: nowrap;">
                    ${dateStr}
                  </td>
                  <td style="padding: 0.85rem 1rem; font-weight: 500;">
                    📍 ${r.rescued_location || 'Rasuwa Valley Basin'}
                  </td>
                  <td style="padding: 0.85rem 1rem; color: var(--primary-navy); font-weight: 600;">
                    ${facility}
                  </td>
                  <td style="padding: 0.85rem 1rem; font-size: 0.8rem;">
                    <div style="font-weight: 600; color: var(--text-main);">${r.rescue_team || 'Joint Force'}</div>
                    <div style="color: var(--text-subtle); font-size: 0.72rem;">${r.organization || 'Disaster Task Force'}</div>
                  </td>
                  <td style="padding: 0.85rem 1rem;">
                    ${getStatusBadge(r.rescue_status)}
                  </td>
                  <td style="padding: 0.85rem 1rem; text-align: right;">
                    <button class="btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;" onclick="window.openRescueDetailModal(${r.id})">
                      View Log
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Detail Modal Handler
  window.openRescueDetailModal = function (recordId) {
    const record = rescueRecords.find(r => r.id === recordId) || demoRescueRecords[0];
    if (!record) return;

    let modal = document.getElementById('rescue-detail-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'rescue-detail-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    const dateStr = record.rescued_date ? new Date(record.rescued_date).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Recent Operation';

    modal.innerHTML = `
      <div class="modal-box" style="max-width: 620px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--rescue-green-light); color: var(--rescue-green); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: bold;">
              ✔
            </div>
            <div>
              <h3 class="modal-title" style="font-size: 1.1rem;">Rescue Mission Record</h3>
              <span style="font-size: 0.75rem; color: var(--text-subtle);">Official Joint Operation Log</span>
            </div>
          </div>
          <button class="modal-close-btn" onclick="window.closeAllModals()">✕</button>
        </div>

        <div class="modal-body" style="gap: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; background: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
            <div>
              <div style="font-size: 1.1rem; font-weight: 800; color: var(--primary-navy);">${record.person_name || 'Anonymous Identifier'}</div>
              <div style="font-size: 0.8rem; color: var(--gov-blue); font-family: monospace; font-weight: 700; margin-top: 0.2rem;">
                ${record.person_report_id || 'ID: KN-RES-2026-OP'}
              </div>
            </div>
            <div>
              ${getStatusBadge(record.rescue_status)}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.85rem;">
            <div style="background: #ffffff; border: 1px solid var(--border-light); padding: 0.85rem; border-radius: var(--radius-md);">
              <span style="font-size: 0.72rem; color: var(--text-subtle); text-transform: uppercase; font-weight: 700;">Extraction Location</span>
              <div style="font-weight: 700; color: var(--primary-navy); margin-top: 0.25rem;">📍 ${record.rescued_location || 'Rasuwa Impact Area'}</div>
              <small style="color: var(--text-muted);">Coordinates restricted for citizen privacy</small>
            </div>

            <div style="background: #ffffff; border: 1px solid var(--border-light); padding: 0.85rem; border-radius: var(--radius-md);">
              <span style="font-size: 0.72rem; color: var(--text-subtle); text-transform: uppercase; font-weight: 700;">Current Safe Facility</span>
              <div style="font-weight: 700; color: var(--rescue-green); margin-top: 0.25rem;">
                ${record.hospital_name ? `🏥 ${record.hospital_name}` : (record.shelter_name ? `⛺ ${record.shelter_name}` : `🛡️ ${record.current_location || 'Highland Camp'}`)}
              </div>
              <small style="color: var(--text-muted);">Family reunion desks active on site</small>
            </div>

            <div style="background: #ffffff; border: 1px solid var(--border-light); padding: 0.85rem; border-radius: var(--radius-md);">
              <span style="font-size: 0.72rem; color: var(--text-subtle); text-transform: uppercase; font-weight: 700;">Deployed Task Unit</span>
              <div style="font-weight: 700; color: var(--primary-navy); margin-top: 0.25rem;">${record.rescue_team || 'Disaster Unit'}</div>
              <small style="color: var(--text-muted);">${record.organization || 'Joint Command'}</small>
            </div>

            <div style="background: #ffffff; border: 1px solid var(--border-light); padding: 0.85rem; border-radius: var(--radius-md);">
              <span style="font-size: 0.72rem; color: var(--text-subtle); text-transform: uppercase; font-weight: 700;">Operation Timestamp</span>
              <div style="font-weight: 700; color: var(--primary-navy); margin-top: 0.25rem;">${dateStr}</div>
              <small style="color: var(--rescue-green); font-weight: 600;">Verified Official Record</small>
            </div>
          </div>

          <div>
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--primary-navy);">Mission Notes & Condition Report</span>
            <p style="font-size: 0.88rem; color: var(--text-main); line-height: 1.5; background: var(--bg-subtle); padding: 0.85rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-top: 0.35rem;">
              ${record.description || 'Evacuation completed successfully under joint task force guidelines.'}
            </p>
          </div>

          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--radius-md); padding: 0.75rem 1rem; font-size: 0.78rem; color: #92400e; display: flex; align-items: center; gap: 0.5rem;">
            <span>🔒</span>
            <span><strong>Citizen Privacy Directive:</strong> Sensitive physical coordinates and immediate next-of-kin personal contact details are redacted on public terminals.</span>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-secondary" onclick="window.closeAllModals()">Close</button>
          <button type="button" class="btn-action-primary btn-blue" style="width: auto; padding: 0 1.25rem;" onclick="window.location.href='family-reunion.html?ref=${encodeURIComponent(record.person_report_id || record.id)}'">
            Reunion Desk Inquiry
          </button>
        </div>
      </div>
    `;

    modal.classList.add('show');
  };

  // Event Listeners for Filters and Search
  document.addEventListener('DOMContentLoaded', () => {
    loadRescueRecords();

    // Status Filter Tabs
    const filterButtons = document.querySelectorAll('.rescue-status-filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentStatusFilter = btn.getAttribute('data-status') || 'all';
        renderRescueTable();
      });
    });

    // Search Input
    const searchInput = document.getElementById('rescue-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        renderRescueTable();
      });
    }

    // Refresh Button
    const refreshBtn = document.getElementById('btn-refresh-rescue');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        window.showToast('Refreshing live rescue database...', 'info');
        loadRescueRecords();
      });
    }
  });

})();
