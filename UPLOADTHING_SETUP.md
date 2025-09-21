# UploadThing Setup Guide

## Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# UploadThing Configuration
UPLOADTHING_SECRET=your_uploadthing_secret_here
UPLOADTHING_APP_ID=your_uploadthing_app_id_here
```

## Getting UploadThing Credentials

1. Go to [UploadThing Dashboard](https://uploadthing.com/dashboard)
2. Create a new account or sign in
3. Create a new app
4. Copy the `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID` from your app settings
5. Add them to your `.env.local` file

## Features Added

✅ **Image Upload Component**: Drag & drop image upload with preview
✅ **Multiple File Support**: Upload up to 10 images per product
✅ **File Validation**: 4MB max file size, image formats only
✅ **Progress Indicators**: Upload progress and loading states
✅ **Error Handling**: Proper error messages and validation
✅ **Product Integration**: Images are saved with product data

## Usage

The image upload is now integrated into the product creation form. Users can:

- Drag and drop images onto the upload area
- Click to select files from their device
- Preview uploaded images before submitting
- Remove individual images
- See upload progress and error states

## File Structure

```
src/
├── lib/
│   ├── uploadthing.ts          # Server-side configuration
│   └── uploadthing-client.ts   # Client-side components
├── app/api/uploadthing/
│   └── route.ts                # API route handler
└── components/ui/
    └── image-upload.tsx        # Reusable upload component
```

## Next Steps

1. Set up your UploadThing account and get credentials
2. Add environment variables to `.env.local`
3. Test the image upload functionality
4. Customize the upload component styling if needed
