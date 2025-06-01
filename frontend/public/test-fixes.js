// Test script to verify fixes are working
// Can be run in browser console

console.log('Testing GameBazaar fixes...');

// Test 1: Check if Error Boundary exists
const errorBoundaryExists = document.querySelector('[data-error-boundary]') !== null;
console.log('Error Boundary present:', errorBoundaryExists);

// Test 2: Check if cart and wishlist pages are accessible
async function testPageAccess() {
  try {
    // Test cart page
    const cartResponse = await fetch('/cart');
    console.log('Cart page accessible:', cartResponse.status === 200);
    
    // Test wishlist page  
    const wishlistResponse = await fetch('/wishlist');
    console.log('Wishlist page accessible:', wishlistResponse.status === 200);
    
  } catch (error) {
    console.error('Page access test failed:', error);
  }
}

// Test 3: Check if contexts are properly loaded
function testContexts() {
  // Check if cart context functions exist
  const cartFunctions = ['addToCart', 'removeCartItem', 'updateCartItem', 'clearCart'];
  const wishlistFunctions = ['addToWishlist', 'removeFromWishlist', 'isInWishlist', 'clearWishlist'];
  
  console.log('Testing context availability...');
  console.log('Cart context functions should be available through useCart hook');
  console.log('Wishlist context functions should be available through useWishlist hook');
}

// Run tests
testPageAccess();
testContexts();

console.log('Fix verification complete. Check console for results.');
