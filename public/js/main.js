/**
 * Main JavaScript file for Office Management System
 * Contains utility functions and general UI enhancements
 */

// Auto-hide flash messages after 5 seconds
document.addEventListener('DOMContentLoaded', function() {
  const alerts = document.querySelectorAll('.alert');
  
  alerts.forEach(alert => {
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }, 5000);
  });
});

// Confirm before deleting (backup confirmation)
document.addEventListener('DOMContentLoaded', function() {
  const deleteForms = document.querySelectorAll('form[action*="/delete/"]');
  
  deleteForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      const confirmed = confirm('Are you sure you want to delete this item?');
      if (!confirmed) {
        e.preventDefault();
      }
    });
  });
});

// Add active class to current navigation item
document.addEventListener('DOMContentLoaded', function() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (currentPath.startsWith(href) && href !== '/') {
      link.classList.add('active');
    }
  });
});

// Bootstrap form validation
(function() {
  'use strict';
  
  // Fetch all forms that need validation
  const forms = document.querySelectorAll('.needs-validation');
  
  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      form.classList.add('was-validated');
    }, false);
  });
})();

// Utility function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Utility function to format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Print function for employee details
function printEmployeeDetails() {
  window.print();
}

// Export to CSV function (basic implementation)
function exportToCSV(tableId, filename) {
  const table = document.getElementById(tableId);
  if (!table) return;
  
  let csv = [];
  const rows = table.querySelectorAll('tr');
  
  for (let i = 0; i < rows.length; i++) {
    const row = [];
    const cols = rows[i].querySelectorAll('td, th');
    
    for (let j = 0; j < cols.length; j++) {
      row.push(cols[j].innerText);
    }
    
    csv.push(row.join(','));
  }
  
  // Download CSV file
  const csvFile = new Blob([csv.join('\n')], { type: 'text/csv' });
  const downloadLink = document.createElement('a');
  downloadLink.download = filename;
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = 'none';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

// Loading spinner utility
function showLoading() {
  const spinner = document.createElement('div');
  spinner.id = 'loadingSpinner';
  spinner.className = 'position-fixed top-50 start-50 translate-middle';
  spinner.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
  document.body.appendChild(spinner);
}

function hideLoading() {
  const spinner = document.getElementById('loadingSpinner');
  if (spinner) {
    spinner.remove();
  }
}

// Console log to indicate JavaScript is loaded
console.log('Office Management System - JavaScript Loaded Successfully');
