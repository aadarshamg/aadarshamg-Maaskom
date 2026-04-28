const header = document.getElementById('siteHeader');
const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');

function setHeaderState() {
  if (!header) return;
  if (window.scrollY > 20) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
}

window.addEventListener('scroll', setHeaderState);
setHeaderState();

if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

// Scroll-to-top button
const scrollTopBtn = document.getElementById('scrollTopBtn');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ========== Track / Ship Widget ==========

const panelTrack = document.getElementById('panelTrack');
const panelShip = document.getElementById('panelShip');
const trackTabs = document.querySelectorAll('.track-tab');

// Tab switching
trackTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    trackTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');

    if (tab.dataset.tab === 'ship') {
      panelTrack.classList.add('hidden');
      panelShip.classList.remove('hidden');
    } else {
      panelShip.classList.add('hidden');
      panelTrack.classList.remove('hidden');
    }
  });
});

// Track method buttons
const placeholders = {
  mobile: 'Enter your Mobile number',
  awb: 'Enter your AWB number',
  orderid: 'Enter your Order Id',
  lrn: 'Enter your LRN number',
};
const methodBtns = document.querySelectorAll('.method-btn');
const trackInput = document.getElementById('trackInput');

methodBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    methodBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    if (trackInput) {
      trackInput.placeholder = placeholders[btn.dataset.method] || '';
      trackInput.value = '';
    }
  });
});

// ========== Track Order — Functional ==========

const trackSubmit = document.getElementById('trackSubmit');
const trackResult = document.getElementById('trackResult');

function generateTrackingResult(query) {
  const statuses = ['in-transit', 'out-for-delivery', 'delivered'];
  const statusLabels = {
    'in-transit': 'In Transit',
    'out-for-delivery': 'Out for Delivery',
    'delivered': 'Delivered',
  };
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
  const origins = ['Mumbai Hub', 'Delhi Warehouse', 'Bangalore Center', 'Chennai Port'];

  // Use a hash of query for deterministic but varied results
  let hash = 0;
  for (let i = 0; i < query.length; i++) {
    hash = ((hash << 5) - hash) + query.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash);

  const status = statuses[idx % statuses.length];
  const origin = origins[idx % origins.length];
  const dest = cities[(idx + 3) % cities.length];

  const now = new Date();
  const booked = new Date(now.getTime() - (3 + (idx % 5)) * 86400000);
  const eta = new Date(now.getTime() + (1 + (idx % 3)) * 86400000);

  const fmt = (d) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return {
    status,
    statusLabel: statusLabels[status],
    origin,
    destination: dest,
    booked: fmt(booked),
    eta: status === 'delivered' ? fmt(now) : fmt(eta),
    lastUpdate: status === 'delivered'
      ? `Delivered at ${dest}`
      : status === 'out-for-delivery'
        ? `Out for delivery in ${dest}`
        : `In transit — Departed ${origin}`,
  };
}

if (trackSubmit && trackResult) {
  trackSubmit.addEventListener('click', () => {
    const query = trackInput.value.trim();
    if (!query) {
      trackResult.innerHTML = '<p class="result-error">Please enter a tracking number.</p>';
      return;
    }

    trackSubmit.classList.add('loading');
    trackSubmit.textContent = 'Tracking...';

    setTimeout(() => {
      const r = generateTrackingResult(query);
      trackResult.innerHTML = `
        <div class="result-card">
          <span class="result-status ${r.status}">${r.statusLabel}</span>
          <div class="result-row"><span class="label">Tracking ID</span><span class="value">${query.toUpperCase()}</span></div>
          <div class="result-row"><span class="label">Origin</span><span class="value">${r.origin}</span></div>
          <div class="result-row"><span class="label">Destination</span><span class="value">${r.destination}</span></div>
          <div class="result-row"><span class="label">Booked On</span><span class="value">${r.booked}</span></div>
          <div class="result-row"><span class="label">ETA / Delivered</span><span class="value">${r.eta}</span></div>
          <div class="result-row"><span class="label">Last Update</span><span class="value">${r.lastUpdate}</span></div>
        </div>
      `;
      trackSubmit.classList.remove('loading');
      trackSubmit.textContent = 'Track Order';
    }, 800);
  });
}

// ========== Ship Order — Price Calculator ==========

// Distance matrix (approximate km between cities)
const distances = {
  mumbai:    { mumbai: 0, delhi: 1400, bangalore: 985, chennai: 1330, kolkata: 2050, hyderabad: 710, pune: 150, ahmedabad: 525 },
  delhi:     { mumbai: 1400, delhi: 0, bangalore: 2150, chennai: 2180, kolkata: 1530, hyderabad: 1550, pune: 1430, ahmedabad: 940 },
  bangalore: { mumbai: 985, delhi: 2150, bangalore: 0, chennai: 350, kolkata: 1870, hyderabad: 570, pune: 840, ahmedabad: 1500 },
  chennai:   { mumbai: 1330, delhi: 2180, bangalore: 350, chennai: 0, kolkata: 1660, hyderabad: 630, pune: 1180, ahmedabad: 1850 },
  kolkata:   { mumbai: 2050, delhi: 1530, bangalore: 1870, chennai: 1660, kolkata: 0, hyderabad: 1490, pune: 1900, ahmedabad: 1980 },
  hyderabad: { mumbai: 710, delhi: 1550, bangalore: 570, chennai: 630, kolkata: 1490, hyderabad: 0, pune: 560, ahmedabad: 1220 },
  pune:      { mumbai: 150, delhi: 1430, bangalore: 840, chennai: 1180, kolkata: 1900, hyderabad: 560, pune: 0, ahmedabad: 660 },
  ahmedabad: { mumbai: 525, delhi: 940, bangalore: 1500, chennai: 1850, kolkata: 1980, hyderabad: 1220, pune: 660, ahmedabad: 0 },
};

// Service rate per kg per km
const serviceRates = {
  road:    0.012,
  air:     0.065,
  ocean:   0.008,
  express: 0.085,
};

const serviceNames = {
  road: 'Road Freight',
  air: 'Air Freight',
  ocean: 'Ocean Freight',
  express: 'Express Delivery',
};

const shipCalcBtn = document.getElementById('shipCalcBtn');
const shipResult = document.getElementById('shipResult');

if (shipCalcBtn && shipResult) {
  shipCalcBtn.addEventListener('click', () => {
    const origin = document.getElementById('shipOrigin').value;
    const dest = document.getElementById('shipDest').value;
    const weight = parseFloat(document.getElementById('shipWeight').value);
    const service = document.getElementById('shipService').value;

    // Validation
    if (!origin) {
      shipResult.innerHTML = '<p class="result-error">Please select an origin city.</p>';
      return;
    }
    if (!dest) {
      shipResult.innerHTML = '<p class="result-error">Please select a destination city.</p>';
      return;
    }
    if (origin === dest) {
      shipResult.innerHTML = '<p class="result-error">Origin and destination cannot be the same.</p>';
      return;
    }
    if (!weight || weight <= 0) {
      shipResult.innerHTML = '<p class="result-error">Please enter a valid weight.</p>';
      return;
    }

    shipCalcBtn.classList.add('loading');
    shipCalcBtn.textContent = 'Calculating...';

    setTimeout(() => {
      const dist = distances[origin][dest];
      const rate = serviceRates[service];
      const baseCost = dist * rate * weight;
      const fuel = baseCost * 0.12;
      const handling = weight * 15;
      const gst = (baseCost + fuel + handling) * 0.18;
      const total = baseCost + fuel + handling + gst;

      const fmt = (n) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const originName = document.getElementById('shipOrigin').selectedOptions[0].text;
      const destName = document.getElementById('shipDest').selectedOptions[0].text;

      shipResult.innerHTML = `
        <div class="result-card">
          <div class="result-row"><span class="label">Route</span><span class="value">${originName} → ${destName}</span></div>
          <div class="result-row"><span class="label">Distance</span><span class="value">${dist.toLocaleString()} km</span></div>
          <div class="result-row"><span class="label">Weight</span><span class="value">${weight} kg</span></div>
          <div class="result-row"><span class="label">Service</span><span class="value">${serviceNames[service]}</span></div>
          <div class="price-breakdown">
            <div class="price-row"><span>Base Freight</span><span>${fmt(baseCost)}</span></div>
            <div class="price-row"><span>Fuel Surcharge (12%)</span><span>${fmt(fuel)}</span></div>
            <div class="price-row"><span>Handling Charges</span><span>${fmt(handling)}</span></div>
            <div class="price-row"><span>GST (18%)</span><span>${fmt(gst)}</span></div>
            <div class="price-row total"><span>Total Estimated Cost</span><span>${fmt(total)}</span></div>
          </div>
        </div>
      `;
      shipCalcBtn.classList.remove('loading');
      shipCalcBtn.textContent = 'Calculate Price';
    }, 600);
  });
}
