/**
 * Location API Integration using CountriesNow API
 * This script handles Country -> State -> City cascading dropdowns
 */

// API endpoint base URL
const API_BASE_URL = 'https://countriesnow.space/api/v0.1';

/**
 * Fetch all countries and populate the country dropdown
 */
async function loadCountries() {
  try {
    const countrySelect = document.getElementById('country');
    if (!countrySelect) return;
    
    // Show loading state
    countrySelect.innerHTML = '<option value="">Loading countries...</option>';
    
    // Fetch countries from API
    const response = await fetch(`${API_BASE_URL}/countries`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.msg);
    }
    
    // Clear and populate country dropdown
    countrySelect.innerHTML = '<option value="">Select Country</option>';
    
    data.data.forEach(country => {
      const option = document.createElement('option');
      option.value = country.country;
      option.textContent = country.country;
      countrySelect.appendChild(option);
    });
    
    // If editing, restore selected country
    if (window.existingLocation && window.existingLocation.country) {
      countrySelect.value = window.existingLocation.country;
      loadStates(window.existingLocation.country);
    }
    
  } catch (error) {
    console.error('Error loading countries:', error);
    const countrySelect = document.getElementById('country');
    countrySelect.innerHTML = '<option value="">Error loading countries</option>';
  }
}

/**
 * Fetch states for a selected country
 * @param {string} country - The selected country name
 */
async function loadStates(country) {
  try {
    const stateSelect = document.getElementById('state');
    const citySelect = document.getElementById('city');
    
    if (!stateSelect) return;
    
    // Reset state and city dropdowns
    stateSelect.innerHTML = '<option value="">Loading states...</option>';
    citySelect.innerHTML = '<option value="">Select City</option>';
    
    if (!country) {
      stateSelect.innerHTML = '<option value="">Select State</option>';
      return;
    }
    
    // Fetch states from API
    const response = await fetch(`${API_BASE_URL}/countries/states`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ country: country })
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.msg);
    }
    
    // Clear and populate state dropdown
    stateSelect.innerHTML = '<option value="">Select State</option>';
    
    data.data.states.forEach(state => {
      const option = document.createElement('option');
      option.value = state.name;
      option.textContent = state.name;
      stateSelect.appendChild(option);
    });
    
    // If editing, restore selected state
    if (window.existingLocation && window.existingLocation.state) {
      stateSelect.value = window.existingLocation.state;
      loadCities(country, window.existingLocation.state);
    }
    
  } catch (error) {
    console.error('Error loading states:', error);
    const stateSelect = document.getElementById('state');
    stateSelect.innerHTML = '<option value="">Error loading states</option>';
  }
}

/**
 * Fetch cities for a selected country and state
 * @param {string} country - The selected country name
 * @param {string} state - The selected state name
 */
async function loadCities(country, state) {
  try {
    const citySelect = document.getElementById('city');
    
    if (!citySelect) return;
    
    // Reset city dropdown
    citySelect.innerHTML = '<option value="">Loading cities...</option>';
    
    if (!state) {
      citySelect.innerHTML = '<option value="">Select City</option>';
      return;
    }
    
    // Fetch cities from API
    const response = await fetch(`${API_BASE_URL}/countries/state/cities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        country: country,
        state: state 
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.msg);
    }
    
    // Clear and populate city dropdown
    citySelect.innerHTML = '<option value="">Select City</option>';
    
    data.data.forEach(city => {
      const option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      citySelect.appendChild(option);
    });
    
    // If editing, restore selected city
    if (window.existingLocation && window.existingLocation.city) {
      citySelect.value = window.existingLocation.city;
    }
    
  } catch (error) {
    console.error('Error loading cities:', error);
    const citySelect = document.getElementById('city');
    citySelect.innerHTML = '<option value="">Error loading cities</option>';
  }
}

/**
 * Initialize event listeners when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  const countrySelect = document.getElementById('country');
  const stateSelect = document.getElementById('state');
  
  // Load countries on page load
  loadCountries();
  
  // Event listener for country change
  if (countrySelect) {
    countrySelect.addEventListener('change', function() {
      const selectedCountry = this.value;
      loadStates(selectedCountry);
    });
  }
  
  // Event listener for state change
  if (stateSelect) {
    stateSelect.addEventListener('change', function() {
      const selectedCountry = document.getElementById('country').value;
      const selectedState = this.value;
      loadCities(selectedCountry, selectedState);
    });
  }
});
