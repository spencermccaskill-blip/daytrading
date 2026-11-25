#!/bin/bash
# Double-click this file to get the newest version of The Desk and start it.
# Your journal, settings and saved prices (the data folder) are kept.
{
  here="$(cd "$(dirname "$0")" && pwd)"
  folder="$(basename "$here")"
  cd "$here/.." || exit 1
  echo "Downloading the newest version..."
  if ! curl -fL -o the-desk.zip https://github.com/spencermccaskill-blip/daytrading/archive/refs/heads/claude/stoic-darwin-br4ivc.zip; then
    echo; echo "The download did not work. Check the internet connection and try again. Nothing was changed."
    read -r -p "Press Return to close this window." _; exit 1
  fi
  old=$(lsof -ti tcp:3000 -sTCP:LISTEN)
  if [ -n "$old" ]; then echo "Stopping the copy that is running..."; kill $old; sleep 1; fi
  unzip -o -q the-desk.zip && cd "$folder" && npm install || { echo; echo "The update did not finish. Send Claude a screenshot of this window."; read -r -p "Press Return to close this window." _; exit 1; }
  echo; echo "Updated. Starting The Desk. Leave this window open."
  echo "In your browser, open http://localhost:3000 and press Command + Shift + R."
  (sleep 2; open "http://localhost:3000") &
  npm start
  exit
}
