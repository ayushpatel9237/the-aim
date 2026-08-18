════════════════════════════════════════════════════════
  THE AIM — HOW TO UPLOAD (the easy, no-problem way)
════════════════════════════════════════════════════════

Your last upload was missing the js, css, and images folders.
This guide fixes that. Follow it exactly — it takes 5 minutes.

────────────────────────────────────────────────────────
  THE ONE RULE THAT MATTERS
────────────────────────────────────────────────────────
When GitHub asks you to upload, you must drag the FOLDERS
(js, css, images) — NOT the files inside them.

If you open the js folder and drag the files out of it,
GitHub loses the folder. Drag the folder ITSELF.

────────────────────────────────────────────────────────
  EASIEST METHOD — replace everything at once
────────────────────────────────────────────────────────

STEP 1
  Unzip the file "the-aim-DEPLOY.zip".
  You now have a folder with everything inside:
     index.html, shop.html, ... (all pages)
     js  (folder)
     css (folder)
     images (folder)

STEP 2
  Go to your GitHub repo:
     github.com/ayushpatel9237/THE-AIM

STEP 3
  Click:  Add file  →  Upload files

STEP 4  ← THIS IS THE IMPORTANT PART
  Open the unzipped folder on your computer.
  Select EVERYTHING inside it:
     - all the .html files
     - the js folder
     - the css folder
     - the images folder
  (Select All = Ctrl+A on Windows, Cmd+A on Mac)

  Drag them ALL into the GitHub upload box together.

  The images folder is big (256 files) — wait for the
  counter to finish. It may take 1-3 minutes.

STEP 5
  Scroll down. In the box that says "Commit changes",
  click the green  Commit changes  button.

STEP 6  ← CHECK IT WORKED
  Your repo file list should now show, as FOLDERS:
     js
     css
     images
  If you see those three folders, IT WORKED. ✓

────────────────────────────────────────────────────────
  IF DRAG-AND-DROP STILL MISBEHAVES
────────────────────────────────────────────────────────
In the GitHub upload box there is a link:
   "choose your files"
Click it instead of dragging. In the file picker you can
select the folders directly, which is more reliable.

────────────────────────────────────────────────────────
  AFTER IT UPLOADS
────────────────────────────────────────────────────────
Netlify auto-updates in ~1 minute.
Then open your live site's  admin.html  → sign up →
and follow CURATOR-SETUP.md to make yourself admin.

Your Supabase keys are ALREADY in js/config.js in this
zip — you don't need to touch them. Just upload.
════════════════════════════════════════════════════════
