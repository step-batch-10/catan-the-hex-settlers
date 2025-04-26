#!/bin/bash

# Ask for summary line
read -p "[#STORY-ID] Who/What was done: " summary

# Ask what changes were made
echo ""
echo "What changes have you made?"
echo "Press ENTER to start typing, then CTRL+D when done:"
changes=$(</dev/stdin)

# Ask why the change was needed
echo ""
echo "Why do we need this change?"
echo "Press ENTER to start typing, then CTRL+D when done:"
reason=$(</dev/stdin)

# Format the commit message
commit_msg="$summary

What changes have you made?

$changes

Why do we need this change?

$reason
"

# Save to a file
output_file="commit_message.txt"
echo "$commit_msg" > "$output_file"

# Copy to clipboard
echo "$commit_msg" | pbcopy

echo ""
echo "✅ Commit message saved to $output_file and copied to clipboard."


