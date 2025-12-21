import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await req.json();
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googledrive');

    if (!accessToken) {
      return Response.json({ 
        error: 'Google Drive not connected',
        needsAuth: true 
      }, { status: 401 });
    }

    switch (action) {
      case 'list_files': {
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files?pageSize=100&fields=files(id,name,mimeType,modifiedTime,size)`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const result = await response.json();
        return Response.json({ files: result.files || [] });
      }

      case 'upload_file': {
        const { fileName, content, mimeType } = data;
        
        const metadata = {
          name: fileName,
          mimeType: mimeType || 'application/octet-stream'
        };

        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append('file', new Blob([content], { type: mimeType }));

        const response = await fetch(
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            },
            body: formData
          }
        );

        const result = await response.json();
        return Response.json({ file: result });
      }

      case 'download_file': {
        const { fileId } = data;
        
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );

        const content = await response.text();
        return Response.json({ content });
      }

      case 'export_analysis': {
        const { analysisId } = data;
        const analysis = await base44.entities.Analysis.filter({ id: analysisId });
        
        if (analysis.length === 0) {
          return Response.json({ error: 'Analysis not found' }, { status: 404 });
        }

        const content = JSON.stringify(analysis[0], null, 2);
        const fileName = `CAIO_Analysis_${analysisId}_${Date.now()}.json`;

        const metadata = {
          name: fileName,
          mimeType: 'application/json'
        };

        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append('file', new Blob([content], { type: 'application/json' }));

        const response = await fetch(
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            },
            body: formData
          }
        );

        const result = await response.json();
        return Response.json({ success: true, fileId: result.id, fileName });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Google Drive sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});