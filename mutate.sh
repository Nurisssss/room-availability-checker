#!/bin/bash
NAME=$1; EXPR=$2; TEST=$3
D=$(mktemp -d)
cp package.json checker.js "$TEST" "$D"/
ln -s "$PWD/node_modules" "$D/node_modules"
cd "$D"
sed -i "$EXPR" checker.js
CHG=$(diff <(cat "$OLDPWD/checker.js") checker.js | grep '^>' | head -3)
OUT=$(npx vitest run "$(basename $TEST)" 2>&1)
FAILED=$(echo "$OUT" | grep -E "^ *(×|FAIL)" | sed 's/^ *//' | head -6 | tr '\n' ';')
SUM=$(echo "$OUT" | grep -E "Tests ")
echo "[$NAME] $(basename $TEST) | change: $CHG"
echo "   $SUM"
echo "   failing: $FAILED"
cd - >/dev/null; rm -rf "$D"
