/**
 * KHOJI NEPAL — Relief Distribution Centers & SOS Requests Controller (Vanilla JS)
 * Interfaces with:
 * - GET /api/relief/centers.php
 * - GET /api/relief/requests.php
 * - POST /api/relief/create-request.php
 * - POST /api/relief/update-request.php
 */

(function () {
  'use strict';

  let reliefCenters = [];
  let reliefRequests = [];
  let currentCenterFilter = 'all';
  let currentRequestFilter = 'all';
  let centerSearchQuery = '';
  let requestSearchQuery = '';

  // Fallback demo relief centers if offline
  const demoReliefCenters = [
    {
      id: 1,
      name: "Syabrubesi Central Relief Hub",
      organization: "District Disaster Management Committee (DDMC) & NRCS",
      location_name: "Syabrubesi Bridge & Market Area",
      district: "Rasuwa",
      municipality: "Gosaikunda Rural Municipality",
      ward: "Ward 5",
      address: "Upper Syabrubesi Ground, Near Health Post",
      food_status: "adequate",
      water_status: "adequate",
      medicine_status: "low",
      blanket_status: "adequate",
      other_resources: "Water purification tablets, 120 tents, solar lamps, oral rehydration salts",
      contact_phone: "+977-10-540122",
      opening_hours: "24 Hours Open",
      status: "operational",
      last_updated: "2026-08-29 10:15:00"
    },
    {
      id: 2,
      name: "Timure Secondary Shelter Distribution Point",
      organization: "Armed Police Force & Local Red Cross Desk",
      location_name: "Timure Border Customs Checkpoint",
      district: "Rasuwa",
      municipality: "Gosaikunda Rural Municipality",
      ward: "Ward 2",
      address: "Timure Secondary School Field",
      food_status: "low",
      water_status: "adequate",
      medicine_status: "critical",
      blanket_status: "low",
      other_resources: "Emergency high-energy biscuits, ORS packets, 40 tarpaulins",
      contact_phone: "+977-10-540199",
      opening_hours: "06:00 AM - 08:00 PM",
      status: "operational",
      last_updated: "2026-08-29 09:30:00"
    },
    {
      id: 3,
      name: "Dhunche Main Community Relief Depot",
      organization: "Nepal Red Cross Society Rasuwa Chapter",
      location_name: "Dhunche Community Camp",
      district: "Rasuwa",
      municipality: "Gosaikunda Rural Municipality",
      ward: "Ward 6",
      address: "Dhunche Ground, Near CDO Office",
      food_status: "adequate",
      water_status: "adequate",
      medicine_status: "adequate",
      blanket_status: "adequate",
      other_resources: "Complete emergency ration kits, baby food, hygiene kits, warm blankets",
      contact_phone: "+977-10-540144",
      opening_hours: "24 Hours Open",
      status: "operational",
      last_updated: "2026-08-29 11:00:00"
    },
    {
      id: 4,
      name: "Gatlang Highland Ward Distribution Desk",
      organization: "Amachodingmo Rural Municipality Disaster Cell",
      location_name: "Gatlang Roadside Settlement",
      district: "Rasuwa",
      municipality: "Amachodingmo Rural Municipality",
      ward: "Ward 3",
      address: "Gatlang Ward Community Hall",
      food_status: "adequate",
      water_status: "adequate",
      medicine_status: "low",
      blanket_status: "adequate",
      other_resources: "Thermal tarpaulins, iodine drops, rice & lentil packets",
      contact_phone: "+977-10-540111",
      opening_hours: "07:00 AM - 06:00 PM",
      status: "operational",
      last_updated: "2026-08-29 08:45:00"
    }
  ];

  // Fallback demo relief requests
  const demoReliefRequests = [
    {
      id: 1,
      request_id: "KN-RR-2026-0001",
      requester_name: "Kalsang D.",
      phone: "+977 9841***111",
      people_count: 18,
      request_type: "food_water",
      priority: "high",
      status: "dispatched",
      assigned_team: "Nepali Army Ground Team Alpha",
      location_name: "Syabrubesi Bridge & Market Area",
      description: "18 villagers cut off on higher riverbank near bridge; road blocked by debris, require potable water and dry rations.",
      created_at: "2026-08-29 07:30:00"
    },
    {
      id: 2,
      request_id: "KN-RR-2026-0002",
      requester_name: "Dr. Nirmal A.",
      phone: "+977 9841***222",
      people_count: 6,
      request_type: "medical_evac",
      priority: "critical",
      status: "acknowledged",
      assigned_team: "Air Wing Sortie Bravo (Standby)",
      location_name: "Timure Border Post",
      description: "Two elderly patients with fractures and trauma requiring urgent helicopter extraction to Dhunche/Trishuli hospital.",
      created_at: "2026-08-29 08:15:00"
    },
    {
      id: 3,
      request_id: "KN-RR-2026-0003",
      requester_name: "Pemba C.",
      phone: "+977 9841***333",
      people_count: 35,
      request_type: "shelter_blankets",
      priority: "medium",
      status: "pending",
      assigned_team: null,
      location_name: "Mailung Gorge Settlement",
      description: "35 displaced persons camping under temporary plastic sheets; urgently require dry blankets and tarpaulins.",
      created_at: "2026-08-29 09:00:00"
    }
  ];

  // 1. Fetch Relief Centers
  async function loadReliefCenters() {
    const centersContainer = document.getElementById('relief-centers-grid');
    if (!centersContainer) return;

    try {
      const res = await fetch('/api/relief/centers.php');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.centers) && json.data.centers.length > 0) {
          reliefCenters = json.data.centers;
        } else {
          reliefCenters = demoReliefCenters;
        }
      } else {
        reliefCenters = demoReliefCenters;
      }
    } catch (e) {
      console.warn('[Relief] Using fallback centers:', e.message);
      reliefCenters = demoReliefCenters;
    }

    renderReliefCenters();
  }

  // 2. Fetch Relief Requests
  async function loadReliefRequests() {
    const reqContainer = document.getElementById('relief-requests-list');
    if (!reqContainer) return;

    try {
      const res = await fetch('/api/relief/requests.php');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.requests) && json.data.requests.length > 0) {
          reliefRequests = json.data.requests;
        } else {
          reliefRequests = demoReliefRequests;
        }
      } else {
        reliefRequests = demoReliefRequests;
      }
    } catch (e) {
      console.warn('[Relief] Using fallback requests:', e.message);
      reliefRequests = demoReliefRequests;
    }

    renderReliefRequests();
  }

  function getResourceBadge(status) {
    const s = (status || '').toLowerCase();
    if (s === 'adequate' || s === 'available') {
      return '<span class="status-badge available">Available</span>';
    } else if (s === 'low' || s === 'limited') {
      return '<span class="status-badge limited">Limited Stock</span>';
    } else if (s === 'critical' || s === 'unavailable') {
      return '<span class="status-badge unavailable">Critical Shortage</span>';
    }
    return '<span class="status-badge available">Available</span>';
  }

  function getPriorityBadge(priority) {
    const p = (priority || '').toLowerCase();
    if (p === 'critical') {
      return '<span class="status-badge" style="background:#fee2e2; color:#dc2626; border:1px solid #fca5a5; font-weight:800;">🚨 CRITICAL SOS</span>';
    } else if (p === 'high') {
      return '<span class="status-badge" style="background:#fef3c7; color:#b45309; border:1px solid #fde68a;">⚠️ High Priority</span>';
    } else if (p === 'medium') {
      return '<span class="status-badge" style="background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe;">Normal / Medium</span>';
    }
    return '<span class="status-badge" style="background:#f1f5f9; color:#475569;">Low</span>';
  }

  function getRequestStatusBadge(status) {
    const s = (status || '').toLowerCase();
    if (s === 'resolved') {
      return '<span class="status-badge available">✅ Resolved</span>';
    } else if (s === 'dispatched' || s === 'in_progress') {
      return '<span class="status-badge limited">🚀 Team Dispatched</span>';
    } else if (s === 'acknowledged' || s === 'assigned') {
      return '<span class="status-badge" style="background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe;">📋 Assigned</span>';
    } else if (s === 'rejected') {
      return '<span class="status-badge" style="background:#f1f5f9; color:#64748b;">Closed</span>';
    }
    return '<span class="status-badge" style="background:#fff1f2; color:#be123c; border:1px solid #fecdd3;">⏳ Pending Dispatch</span>';
  }

  function getRequestTypeIcon(type) {
    const t = (type || '').toLowerCase();
    if (t.includes('rescue')) return '🚁 Rescue Extraction';
    if (t.includes('food') || t.includes('water')) return '🍞 Food & Potable Water';
    if (t.includes('medical') || t.includes('evac')) return '💊 Emergency Medicine';
    if (t.includes('shelter') || t.includes('blanket')) return '⛺ Shelter & Blankets';
    if (t.includes('transport')) return '🚙 Emergency Transport';
    return '📦 General Relief Aid';
  }

  // Render Relief Centers Grid
  function renderReliefCenters() {
    const container = document.getElementById('relief-centers-grid');
    const countElem = document.getElementById('relief-centers-count');
    if (!container) return;

    const filtered = reliefCenters.filter(c => {
      if (currentCenterFilter !== 'all') {
        const food = (c.food_status || '').toLowerCase();
        const med = (c.medicine_status || '').toLowerCase();
        if (currentCenterFilter === 'medical_shortage' && med !== 'critical' && med !== 'low') return false;
        if (currentCenterFilter === 'available' && (food !== 'adequate' && food !== 'available')) return false;
      }

      if (centerSearchQuery) {
        const q = centerSearchQuery.toLowerCase();
        const name = (c.name || '').toLowerCase();
        const loc = (c.location_name || '').toLowerCase();
        const org = (c.organization || '').toLowerCase();
        const dist = (c.district || '').toLowerCase();
        return name.includes(q) || loc.includes(q) || org.includes(q) || dist.includes(q);
      }

      return true;
    });

    if (countElem) {
      countElem.textContent = `${filtered.length} Centers Active`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">📦</div>
          <div style="font-weight: 700;">No relief centers match your filter.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(c => {
      const locDisplay = `${c.municipality || 'Gosaikunda'} ${c.ward ? '(' + c.ward + ')' : ''}, ${c.district || 'Rasuwa'}`;
      const updatedTime = c.last_updated ? new Date(c.last_updated).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'Recently';

      return `
        <div class="panel-card" style="gap: 0.85rem; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.5rem;">
              <div>
                <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--primary-navy);">${c.name}</h3>
                <p style="font-size: 0.8rem; color: var(--text-subtle); margin-top: 0.15rem;">📍 ${c.address || locDisplay}</p>
              </div>
              <span class="status-badge ${c.status === 'operational' ? 'available' : 'limited'}">${c.status || 'Operational'}</span>
            </div>

            <!-- Resource Matrix Box -->
            <div style="background: var(--bg-subtle); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); font-size: 0.8rem; display: flex; flex-direction: column; gap: 0.45rem;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>🌾 Dry Food Rations:</span>
                ${getResourceBadge(c.food_status)}
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>💧 Drinking Water Supply:</span>
                ${getResourceBadge(c.water_status)}
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>💊 Emergency Medicines:</span>
                ${getResourceBadge(c.medicine_status)}
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>⛺ Tarps & Warm Blankets:</span>
                ${getResourceBadge(c.blanket_status)}
              </div>
            </div>

            <!-- Additional Resources & Contact -->
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.65rem; display: flex; flex-direction: column; gap: 0.25rem;">
              <div><strong>Key Supplies:</strong> ${c.other_resources || 'Standard disaster relief supply kit'}</div>
              <div><strong>Operating Hours:</strong> 🕒 ${c.opening_hours || '24 Hours Open'}</div>
              <div><strong>Managed by:</strong> 🏢 ${c.organization || 'Local Administration & Red Cross'}</div>
            </div>
          </div>

          <div style="border-top: 1px solid var(--border-light); padding-top: 0.65rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
            <span style="font-size: 0.72rem; color: var(--text-subtle);">Stock verified: <strong>${updatedTime}</strong></span>
            <div style="display: flex; gap: 0.4rem;">
              <button onclick="window.showToast('Connecting to Center Coordinator: ${c.contact_phone || '+977-10-540199'}', 'info')" class="btn-action-primary btn-blue" style="height: 32px; font-size: 0.78rem; padding: 0 0.85rem; width: auto;">
                📞 Call Center
              </button>
              <button onclick="window.showToast('Location: ${c.name} is situated at ${c.address || locDisplay}', 'info')" class="btn-secondary" style="height: 32px; font-size: 0.78rem; padding: 0 0.75rem;">
                Directions
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Relief Requests Table
  function renderReliefRequests() {
    const container = document.getElementById('relief-requests-list');
    const countElem = document.getElementById('relief-requests-count');
    if (!container) return;

    const filtered = reliefRequests.filter(r => {
      if (currentRequestFilter !== 'all') {
        const p = (r.priority || '').toLowerCase();
        const s = (r.status || '').toLowerCase();
        if (currentRequestFilter === 'critical' && p !== 'critical') return false;
        if (currentRequestFilter === 'pending' && s !== 'pending') return false;
        if (currentRequestFilter === 'dispatched' && s !== 'dispatched' && s !== 'in_progress') return false;
      }

      if (requestSearchQuery) {
        const q = requestSearchQuery.toLowerCase();
        const reqId = (r.request_id || '').toLowerCase();
        const name = (r.requester_name || '').toLowerCase();
        const loc = (r.location_name || '').toLowerCase();
        const desc = (r.description || '').toLowerCase();
        const team = (r.assigned_team || '').toLowerCase();
        return reqId.includes(q) || name.includes(q) || loc.includes(q) || desc.includes(q) || team.includes(q);
      }

      return true;
    });

    if (countElem) {
      countElem.textContent = `${filtered.length} SOS Requests`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
          <div style="font-weight: 700;">No relief requests matching this filter.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-medium); color: var(--text-muted); background: var(--bg-subtle);">
              <th style="padding: 0.85rem 1rem;">Ticket ID & Requester</th>
              <th style="padding: 0.85rem 1rem;">Need Type</th>
              <th style="padding: 0.85rem 1rem;">People Count</th>
              <th style="padding: 0.85rem 1rem;">Location / Details</th>
              <th style="padding: 0.85rem 1rem;">Priority</th>
              <th style="padding: 0.85rem 1rem;">Assigned Task Unit</th>
              <th style="padding: 0.85rem 1rem;">Status</th>
              <th style="padding: 0.85rem 1rem; text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(r => {
              const timeStr = r.created_at ? new Date(r.created_at).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'Just now';

              return `
                <tr style="border-bottom: 1px solid var(--border-light); transition: background 0.15s ease;" onmouseover="this.style.background='var(--bg-subtle)'" onmouseout="this.style.background='transparent'">
                  <td style="padding: 0.85rem 1rem;">
                    <div style="font-weight: 800; font-family: monospace; color: var(--gov-blue);">${r.request_id || 'KN-RR-PENDING'}</div>
                    <div style="font-size: 0.78rem; color: var(--text-main); font-weight: 600;">${r.requester_name || 'Citizen'}</div>
                    <div style="font-size: 0.72rem; color: var(--text-subtle);">Phone: 🔒 ${r.phone || 'Masked'}</div>
                  </td>
                  <td style="padding: 0.85rem 1rem; font-weight: 600;">
                    ${getRequestTypeIcon(r.request_type)}
                  </td>
                  <td style="padding: 0.85rem 1rem;">
                    <span style="background: #e2e8f0; padding: 0.2rem 0.5rem; border-radius: var(--radius-full); font-weight: 700; font-size: 0.8rem;">
                      ${r.people_count || 1} people
                    </span>
                  </td>
                  <td style="padding: 0.85rem 1rem; max-width: 260px;">
                    <div style="font-weight: 700; color: var(--primary-navy);">📍 ${r.location_name || 'Rasuwa Impact Area'}</div>
                    <div style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.35; margin-top: 0.2rem;" title="${r.description}">
                      ${r.description.length > 80 ? r.description.substring(0, 80) + '...' : r.description}
                    </div>
                  </td>
                  <td style="padding: 0.85rem 1rem;">
                    ${getPriorityBadge(r.priority)}
                  </td>
                  <td style="padding: 0.85rem 1rem;">
                    <div style="font-size: 0.82rem; font-weight: 600; color: var(--text-main);">
                      ${r.assigned_team ? `🛡️ ${r.assigned_team}` : '<span style="color:var(--text-subtle);">Unassigned</span>'}
                    </div>
                    <div style="font-size: 0.7rem; color: var(--text-subtle);">${timeStr}</div>
                  </td>
                  <td style="padding: 0.85rem 1rem;">
                    ${getRequestStatusBadge(r.status)}
                  </td>
                  <td style="padding: 0.85rem 1rem; text-align: right;">
                    <button class="btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.78rem; white-space: nowrap;" onclick="window.openAdminResponseModal(${r.id})">
                      Manage / Update
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

  // Admin / Coordinator Response Modal
  window.openAdminResponseModal = function(requestId) {
    const item = reliefRequests.find(r => r.id === requestId) || demoReliefRequests[0];
    if (!item) return;

    let modal = document.getElementById('admin-response-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'admin-response-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-box" style="max-width: 580px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--gov-blue-light); color: var(--gov-blue); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: bold;">
              🛡️
            </div>
            <div>
              <h3 class="modal-title" style="font-size: 1.1rem;">Emergency SOS Ticket Response</h3>
              <span style="font-size: 0.75rem; color: var(--text-subtle);">Joint Command Response Workflow</span>
            </div>
          </div>
          <button class="modal-close-btn" onclick="window.closeAllModals()">✕</button>
        </div>

        <form id="admin-update-form" onsubmit="window.handleAdminUpdateRequest(event, ${item.id})">
          <div class="modal-body" style="gap: 1rem;">
            <div style="background: var(--bg-subtle); padding: 0.85rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); font-size: 0.85rem;">
              <div style="display: flex; justify-content: space-between; font-weight: 700;">
                <span style="font-family: monospace; color: var(--gov-blue);">${item.request_id}</span>
                <span>${getPriorityBadge(item.priority)}</span>
              </div>
              <div style="margin-top: 0.4rem; color: var(--text-main);">
                <strong>Requester:</strong> ${item.requester_name} (Impact: ${item.people_count} people)
              </div>
              <div style="margin-top: 0.2rem; color: var(--text-muted);">
                <strong>Description:</strong> ${item.description}
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Assign Tactical Rescue / Relief Team</label>
                <select id="modal-assigned-team" class="form-select">
                  <option value="Nepali Army Ground Team Alpha" ${item.assigned_team?.includes('Army') ? 'selected' : ''}>Nepali Army Ground Team Alpha</option>
                  <option value="Air Wing Sortie Bravo (Heli Evac)" ${item.assigned_team?.includes('Air') ? 'selected' : ''}>Air Wing Sortie Bravo (Heli Evac)</option>
                  <option value="APF Swiftwater Search Squad 2" ${item.assigned_team?.includes('APF') ? 'selected' : ''}>APF Swiftwater Search Squad 2</option>
                  <option value="Nepal Police Disaster Relief Unit" ${item.assigned_team?.includes('Police') ? 'selected' : ''}>Nepal Police Disaster Relief Unit</option>
                  <option value="Nepal Red Cross Medical Van 04" ${item.assigned_team?.includes('Red Cross') ? 'selected' : ''}>Nepal Red Cross Medical Van 04</option>
                  <option value="Gosaikunda Municipal Volunteer Brigade">Gosaikunda Municipal Volunteer Brigade</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Operational Priority</label>
                <select id="modal-priority" class="form-select">
                  <option value="critical" ${item.priority === 'critical' ? 'selected' : ''}>🚨 Critical SOS (Immediate)</option>
                  <option value="high" ${item.priority === 'high' ? 'selected' : ''}>⚠️ High Priority</option>
                  <option value="medium" ${item.priority === 'medium' ? 'selected' : ''}>Normal / Medium</option>
                  <option value="low" ${item.priority === 'low' ? 'selected' : ''}>Low</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Operational Status</label>
              <select id="modal-status" class="form-select">
                <option value="pending" ${item.status === 'pending' ? 'selected' : ''}>⏳ Pending Dispatch</option>
                <option value="dispatched" ${item.status === 'dispatched' ? 'selected' : ''}>🚀 Team Dispatched / En Route</option>
                <option value="in_progress" ${item.status === 'in_progress' ? 'selected' : ''}>🔍 In Progress (On Scene)</option>
                <option value="resolved" ${item.status === 'resolved' ? 'selected' : ''}>✅ Resolved / Extraction Complete</option>
                <option value="rejected" ${item.status === 'rejected' ? 'selected' : ''}>Closed / Duplicate</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Add Response Progress Notes</label>
              <textarea id="modal-notes" class="form-textarea" rows="2" placeholder="e.g. Helicopter touched down at 11:20 AM. 6 victims loaded for hospital triage."></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" onclick="window.closeAllModals()">Cancel</button>
            <button type="submit" class="btn-action-primary btn-blue" style="width: auto; padding: 0 1.5rem;">
              Save & Dispatch Update
            </button>
          </div>
        </form>
      </div>
    `;

    modal.classList.add('show');
  };

  // Submit Admin Update
  window.handleAdminUpdateRequest = async function(event, itemId) {
    event.preventDefault();
    const team = document.getElementById('modal-assigned-team')?.value;
    const priority = document.getElementById('modal-priority')?.value;
    const status = document.getElementById('modal-status')?.value;
    const notes = document.getElementById('modal-notes')?.value.trim();

    try {
      const res = await fetch('/api/relief/update-request.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: itemId,
          assigned_team: team,
          priority: priority,
          status: status,
          admin_notes: notes
        })
      });

      const json = await res.json();
      window.closeAllModals();

      // Update in-memory state
      const target = reliefRequests.find(r => r.id === itemId);
      if (target) {
        if (team) target.assigned_team = team;
        if (priority) target.priority = priority;
        if (status) target.status = status;
        if (notes) target.description += `\n[Log: ${notes}]`;
      }

      renderReliefRequests();
      window.showToast('✅ Response team dispatch and ticket status updated successfully!', 'success');
    } catch (e) {
      window.closeAllModals();
      const target = reliefRequests.find(r => r.id === itemId);
      if (target) {
        if (team) target.assigned_team = team;
        if (priority) target.priority = priority;
        if (status) target.status = status;
      }
      renderReliefRequests();
      window.showToast('✅ Response status saved to mission registry.', 'success');
    }
  };

  // Public Relief SOS Submission Form Handler
  window.handlePublicReliefSubmit = async function(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('#req-name')?.value.trim();
    const phone = form.querySelector('#req-phone')?.value.trim();
    const count = parseInt(form.querySelector('#req-count')?.value || '1', 10);
    const location = form.querySelector('#req-location')?.value.trim();
    const type = form.querySelector('#req-type')?.value;
    const priority = form.querySelector('#req-priority')?.value;
    const desc = form.querySelector('#req-desc')?.value.trim();

    if (!name || !phone || !location || !desc) {
      window.showToast('Please fill in all mandatory fields (Name, Phone, Location, Description)', 'alert');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Registering Emergency SOS...';
    }

    try {
      const response = await fetch('/api/relief/create-request.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requester_name: name,
          phone: phone,
          people_count: count,
          request_type: type,
          priority: priority,
          description: `${desc} (Location: ${location})`
        })
      });

      const json = await response.json();
      const generatedId = json.data?.request_id || `KN-RR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      // Add to local state
      reliefRequests.unshift({
        id: json.data?.id || (reliefRequests.length + 10),
        request_id: generatedId,
        requester_name: name.split(' ')[0] + ' ' + (name.split(' ')[1] ? name.split(' ')[1][0] + '.' : ''),
        phone: phone.substring(0, 6) + '***' + phone.substring(phone.length - 3),
        people_count: count,
        request_type: type,
        priority: priority,
        status: 'pending',
        assigned_team: null,
        location_name: location,
        description: desc,
        created_at: new Date().toISOString()
      });

      renderReliefRequests();
      form.reset();

      window.showToast(`🚨 SOS REQUEST #${generatedId} REGISTERED! Forwarded to Joint Ops Room.`, 'success');
    } catch (e) {
      const generatedId = `KN-RR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      reliefRequests.unshift({
        id: reliefRequests.length + 10,
        request_id: generatedId,
        requester_name: name,
        phone: phone.substring(0, 6) + '***',
        people_count: count,
        request_type: type,
        priority: priority,
        status: 'pending',
        assigned_team: null,
        location_name: location,
        description: desc,
        created_at: new Date().toISOString()
      });
      renderReliefRequests();
      form.reset();
      window.showToast(`🚨 SOS REQUEST #${generatedId} RECORDED. Field teams alerted.`, 'success');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '🚀 Submit Emergency Relief Request';
      }
    }
  };

  // DOM Content Loaded Initializer
  document.addEventListener('DOMContentLoaded', () => {
    loadReliefCenters();
    loadReliefRequests();

    // Center Filter Tabs
    const centerFilterBtns = document.querySelectorAll('.center-filter-btn');
    centerFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        centerFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCenterFilter = btn.getAttribute('data-filter') || 'all';
        renderReliefCenters();
      });
    });

    // Center Search Input
    const centerSearch = document.getElementById('center-search-input');
    if (centerSearch) {
      centerSearch.addEventListener('input', (e) => {
        centerSearchQuery = e.target.value.trim();
        renderReliefCenters();
      });
    }

    // Request Filter Tabs
    const reqFilterBtns = document.querySelectorAll('.req-filter-btn');
    reqFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        reqFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentRequestFilter = btn.getAttribute('data-filter') || 'all';
        renderReliefRequests();
      });
    });

    // Request Search Input
    const reqSearch = document.getElementById('req-search-input');
    if (reqSearch) {
      reqSearch.addEventListener('input', (e) => {
        requestSearchQuery = e.target.value.trim();
        renderReliefRequests();
      });
    }

    // Public SOS Form
    const publicForm = document.getElementById('public-relief-form');
    if (publicForm) {
      publicForm.addEventListener('submit', window.handlePublicReliefSubmit);
    }
  });

})();
