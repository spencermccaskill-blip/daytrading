#!/bin/bash
# Double-click this file to start The Desk. It stops any copy that is already running first.
{
  cd "$(dirname "$0")" || exit 1
  old=$(lsof -ti tcp:3000 -sTCP:LISTEN)
  if [ -n "$old" ]; then echo "Stopping the copy that is already running..."; kill $old; sleep 1; fi
  echo "Starting The Desk. Leave this window open. Open http://localhost:3000 in your browser."
  (sleep 2; open "http://localhost:3000") &
  npm start
  exit
}
