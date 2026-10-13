# Smart Campus – Practice #07 (runnable tests)
- checker.js              RECONSTRUCTION of checkAvailability(request, room, now). Replace with the real function from room-checker.html (keep `export`).
- booking.first.test.js   first suite (17 tests)
- booking.test.js         improved suite (23 tests)
- mutate.sh               mutation helper
Run: npm install && npx vitest run
Only the adapter `canBook` at the top of each test file knows the function's shape; edit it if your request/room objects differ.
