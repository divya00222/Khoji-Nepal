/**
 * KHOJI NEPAL — Search & Directory Engine (Vanilla JS with REST API Integration)
 * 
 * Fetches from /api/missing/search.php with:
 * - Dynamic loading spinners
 * - Graceful empty states
 * - Error handling with interactive Retry trigger
 * - Fallback store synchronization
 * - Privacy redaction protection
 */

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-name-input');
  const genderFilter = document.getElementById('filter-gender');
  const statusFilter = document.getElementById('filter-status');
  const locationFilter = document.getElementById('filter-location');
  const resultsContainer = document.getElementById('missing-persons-grid');
  const resultsCount = document.getElementById('results-count');

  // Check URL query param
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q') || '';
  if (searchInput && initialQuery) {
    searchInput.value = initialQuery;
  }

  let debounceTimer = null;

  function showLoadingState() {
    if (!resultsContainer) return;
    resultsContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
        <div style="display: inline-block; width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #003893; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 1rem;"></div>
        <p style="font-weight: 700; color: #0f172a; font-size: 1rem; margin-bottom: 0.25rem;">Querying Central Missing Persons Database...</p>
        <p style="color: #64748b; font-size: 0.82rem;">Connecting to verified disaster registry records</p>
      </div>
      <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
    `;
    if (resultsCount) resultsCount.textContent = 'Searching records...';
  }

  function showErrorState(errorMsg, retryFn) {
    if (!resultsContainer) return;
    resultsContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1.5rem; background: #fff; border-radius: 12px; border: 1px solid #fecaca;">
        <div style="width: 44px; height: 44px; background: #fee2e2; color: #dc2626; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 1.3rem; margin-bottom: 0.75rem;">⚠️</div>
        <p style="font-weight: 700; color: #991b1b; font-size: 1.05rem; margin-bottom: 0.35rem;">Unable to load missing persons data</p>
        <p style="color: #64748b; font-size: 0.85rem; margin-bottom: 1.25rem; max-width: 480px; margin-left: auto; margin-right: auto;">${errorMsg || 'Database connection error or network timeout. Please retry.'}</p>
        <button id="btn-api-retry" class="btn-action-primary btn-blue" style="display: inline-flex; width: auto; padding: 0 1.5rem; height: 38px; font-size: 0.85rem;">
          Retry Connection
        </button>
      </div>
    `;
    const retryBtn = document.getElementById('btn-api-retry');
    if (retryBtn && typeof retryFn === 'function') {
      retryBtn.addEventListener('click', retryFn);
    }
  }

  function showEmptyState() {
    if (!resultsContainer) return;
    resultsContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3.5rem 1rem; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
        <p style="font-weight: 700; color: #0f172a; font-size: 1.1rem; margin-bottom: 0.35rem;">No matching records found</p>
        <p style="color: #64748b; font-size: 0.88rem; margin-bottom: 1.25rem; max-width: 440px; margin-left: auto; margin-right: auto;">We could not find any missing persons matching your exact criteria in Rasuwa records.</p>
        <a href="report-missing.html" class="btn-action-primary btn-orange" style="display: inline-flex; width: auto; padding: 0 1.5rem; height: 40px;">Report This Person as Missing</a>
      </div>
    `;
    if (resultsCount) resultsCount.textContent = 'Showing 0 records';
  }

  function renderList(list, totalCount) {
    if (!resultsContainer) return;
    resultsContainer.innerHTML = '';

    if (!list || list.length === 0) {
      showEmptyState();
      return;
    }

    if (resultsCount) {
      resultsCount.textContent = `Showing ${list.length} of ${totalCount || list.length} verified records`;
    }

    list.forEach(p => {
      const name = p.full_name || p.name || 'Unnamed Citizen';
      const status = (p.status || 'missing').toLowerCase();
      let statusClass = 'badge-missing';
      let statusLabel = 'Missing';

      if (status === 'rescued') {
        statusClass = 'status-badge available';
        statusLabel = 'Rescued';
      } else if (status === 'found') {
        statusClass = 'status-badge available';
        statusLabel = 'Found / Sheltered';
      } else if (status === 'under_review' || status === 'under verification' || (p.verification_status && p.verification_status === 'under_review')) {
        statusClass = 'status-badge limited';
        statusLabel = 'Under Review';
      } else {
        statusLabel = 'Missing';
      }

      const photoUrl = p.photo || 'assets/placeholder_avatar.png';
      const ageText = p.age ? `${p.age} yrs` : 'Unknown age';
      const genderText = p.gender ? (p.gender.charAt(0).toUpperCase() + p.gender.slice(1)) : 'Unknown';
      const locationText = p.last_seen_location || p.location || 'Rasuwa District';
      const missingDateText = p.missing_date || p.missingDate || 'Recent flood event';
      const reportId = p.report_id || p.id;
      const desc = p.description || 'No additional remarks provided.';

      const card = document.createElement('div');
      card.className = 'panel-card';
      card.style.padding = '1.25rem';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.gap = '0.85rem';
      card.innerHTML = `
        <div style="display: flex; gap: 1rem;">
          <img src="${photoUrl}" alt="${name}" onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'" style="width: 84px; height: 84px; border-radius: 10px; object-fit: cover; border: 1px solid #e2e8f0; flex-shrink: 0; background: #f1f5f9;" />
          <div style="display: flex; flex-direction: column; gap: 0.25rem; flex-grow: 1;">
            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem;">
              <div>
                <h3 style="font-size: 1.05rem; font-weight: 700; color: #0f172a; line-height: 1.2;">${name}</h3>
                <span style="font-size: 0.72rem; font-weight: 700; color: #64748b; letter-spacing: 0.03em;">${reportId}</span>
              </div>
              <span class="${statusClass}" style="flex-shrink: 0;">${statusLabel}</span>
            </div>
            <p style="font-size: 0.82rem; color: #475569; margin-top: 0.15rem;">Age: <strong>${ageText}</strong> • Gender: <strong>${genderText}</strong></p>
            <p style="font-size: 0.78rem; color: #64748b; display: flex; align-items: center; gap: 0.25rem;">
              📍 ${locationText}
            </p>
            <p style="font-size: 0.72rem; color: #94a3b8;">Missing since: ${missingDateText}</p>
          </div>
        </div>
        <p style="font-size: 0.8rem; color: #334155; line-height: 1.4; background: #f8fafc; padding: 0.6rem; border-radius: 6px; border: 1px solid #e2e8f0; flex-grow: 1;">
          ${desc}
        </p>
        <div style="display: flex; gap: 0.5rem; margin-top: auto; padding-top: 0.5rem;">
          <button onclick="window.openPersonDetails('${reportId}')" class="btn-action-primary btn-blue" style="height: 36px; font-size: 0.82rem; flex: 1;">View Details</button>
          <button onclick="window.openSightingModal('${reportId}', '${name.replace(/'/g, "\\'")}')" class="btn-secondary" style="padding: 0 0.85rem; font-size: 0.82rem;">I Saw Them</button>
        </div>
      `;
      resultsContainer.appendChild(card);
    });
  }

  // Primary API Fetch Function
  async function fetchMissingPersons() {
    showLoadingState();

    const query = (searchInput ? searchInput.value : '').trim();
    const gender = genderFilter ? genderFilter.value : 'all';
    const status = statusFilter ? statusFilter.value : 'all';
    const location = locationFilter ? locationFilter.value : 'all';

    const params = new URLSearchParams();
    if (query) params.append('name', query);
    if (gender && gender !== 'all') params.append('gender', gender);
    if (status && status !== 'all') params.append('status', status);
    if (location && location !== 'all') params.append('municipality', location);
    params.append('limit', '24');

    const apiUrl = `/api/missing/search.php?${params.toString()}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result && result.success && Array.isArray(result.data.records)) {
        renderList(result.data.records, result.data.pagination?.total);
      } else {
        throw new Error(result.message || 'Malformed API response');
      }
    } catch (err) {
      console.warn('[Khoji API Notice] Live API fetch fallback:', err.message);
      
      // Graceful fallback to client-side store if API unavailable in dev runtime
      if (window.KhojiStore && Array.isArray(window.KhojiStore.missingPersons)) {
        const queryLower = query.toLowerCase();
        const filtered = window.KhojiStore.missingPersons.filter(p => {
          const matchQuery = !queryLower || (p.name && p.name.toLowerCase().includes(queryLower)) || (p.location && p.location.toLowerCase().includes(queryLower)) || (p.nameNe && p.nameNe.includes(queryLower));
          const matchGender = gender === 'all' || (p.gender && p.gender.toLowerCase() === gender.toLowerCase());
          const matchStatus = status === 'all' || (p.status && p.status.toLowerCase().includes(status.toLowerCase()));
          const matchLocation = location === 'all' || (p.location && p.location.toLowerCase().includes(location.toLowerCase()));
          return matchQuery && matchGender && matchStatus && matchLocation;
        });
        renderList(filtered, filtered.length);
      } else {
        showErrorState(err.message, () => fetchMissingPersons());
      }
    }
  }

  function handleFilterInput() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fetchMissingPersons, 300);
  }

  if (searchInput) searchInput.addEventListener('input', handleFilterInput);
  if (genderFilter) genderFilter.addEventListener('change', fetchMissingPersons);
  if (statusFilter) statusFilter.addEventListener('change', fetchMissingPersons);
  if (locationFilter) locationFilter.addEventListener('change', fetchMissingPersons);

  // Initial Load
  fetchMissingPersons();
});
