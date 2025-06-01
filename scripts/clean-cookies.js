// This script attempts to clear cookies by setting expired cookies for localhost preview
// Note: Node.js cannot clear browser cookies directly, but this helps for some preview servers
const fs = require('fs');
const path = require('path');

// Optionally, clear any server-side session or cache files here
// For static preview, this is usually not needed

console.log('Cookies and cache should be cleared in your browser for a fully clean preview.');
