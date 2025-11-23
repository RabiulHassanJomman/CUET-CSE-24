# Google Drive File Manager Setup Guide

This guide will help you set up the Google Drive API integration for the file manager in your Course Resources section.

## Prerequisites

- A Google Account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter a project name (e.g., "CUET-CSE-24-Drive")
5. Click "CREATE"

## Step 2: Enable Google Drive API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google Drive API"
3. Click on it and press "ENABLE"

## Step 3: Create an API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "CREATE CREDENTIALS" > "API key"
3. Your API key will be created
4. Click on the API key to configure it

### Configure API Key Restrictions (Recommended)

1. Under "Application restrictions":

   - Select "HTTP referrers (web sites)"
   - Add your website URLs (e.g., `http://localhost:*`, `https://yourdomain.com/*`)

2. Under "API restrictions":
   - Select "Restrict key"
   - Choose "Google Drive API" from the dropdown
   - Click "SAVE"

## Step 4: Make Your Drive Folder Publicly Accessible

Since you're using an API key (not OAuth), the Drive folder needs to be publicly accessible:

1. Go to your Drive folder: https://drive.google.com/drive/folders/1yicK2IwOWPZmSLExYV4wSDW4OQIe4Ein
2. Right-click on the folder
3. Select "Share"
4. Click "Change to anyone with the link"
5. Set permission to "Viewer"
6. Click "Done"

**Important**: Make sure all files and subfolders you want to be accessible are also set to "Anyone with the link can view"

## Step 5: Update Your Code

1. Open `/js/modules/drive-file-manager.js`
2. Find this line:
   ```javascript
   const API_KEY = "YOUR_GOOGLE_API_KEY";
   ```
3. Replace `YOUR_GOOGLE_API_KEY` with your actual API key:
   ```javascript
   const API_KEY = "AIzaSyD...your-actual-key-here";
   ```
4. Save the file

## Step 6: Test the Integration

1. Open your website
2. Click on "📚 Course Resources"
3. The "📁 Drive Files" tab should now display your files
4. You should be able to:
   - Browse folders
   - View files
   - Search for files
   - Navigate back to parent folders

## Troubleshooting

### Error: "The API key doesn't exist. Please pass a valid API key."

- Make sure you copied the entire API key
- Check that the API key is properly set in the code (no extra spaces or quotes)

### Error: "The caller does not have permission"

- Ensure the Drive folder is shared publicly
- Check that the API key has Google Drive API enabled
- Verify the folder ID is correct: `1yicK2IwOWPZmSLExYV4wSDW4OQIe4Ein`

### Files not showing up

- Verify folder sharing settings
- Check browser console for errors (F12 > Console)
- Ensure files are not in trash

### API quota exceeded

- Google Drive API has daily quotas
- If you exceed the quota, you'll need to wait 24 hours or upgrade your project

## Alternative: Direct Link Fallback

If you don't want to set up the API immediately, the file manager will show a fallback option with a direct link to open the folder in Google Drive.

## Security Notes

1. **API Key Security**:

   - API keys are meant to be used in client-side code
   - They should have proper restrictions (HTTP referrers and API restrictions)
   - Never commit API keys to public repositories if they don't have restrictions

2. **Rate Limits**:

   - Free tier: 1,000 requests per 100 seconds per user
   - Daily limit: 1 billion queries per day (for the whole project)
   - Per-user quotas may apply

3. **Consider OAuth 2.0** for production:
   - For better security and access to private files
   - Requires user authentication
   - No need to make all files public

## Features

✅ Browse folders and subfolders  
✅ View file information (name, size, date)  
✅ Search files by name  
✅ Navigate with breadcrumbs  
✅ Direct link to view files in Google Drive  
✅ Responsive design for mobile devices  
✅ File type icons  
✅ Refresh functionality

## Future Enhancements

- File preview (PDFs, images)
- Download functionality
- Sorting options (by name, date, size)
- Grid view option
- Folder size calculation
- File upload (requires OAuth)

---

**Need Help?** Check the browser console for error messages or refer to [Google Drive API Documentation](https://developers.google.com/drive/api/v3/about-sdk)
