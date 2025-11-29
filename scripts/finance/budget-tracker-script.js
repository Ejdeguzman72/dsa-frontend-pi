const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const statusDiv = document.getElementById('status');

// If you want to reuse this client elsewhere, define it once:
const apiClient = axios.create({
  baseURL: 'http://192.168.1.36:8080',
});

// Simple helper to get the JWT
const retrieveJwt = () => {
  try {
    return localStorage.getItem('DeGuzmanStuffAnywhere');
  } catch (error) {
    console.log('Error retrieving jwt token:', error.message);
    return null;
  }
};

const uploadBudgetFile = async () => {
    console.log('fileinput: ' + fileInput)
  const file = fileInput.files[0];
  if (!file) return;

  fileName.textContent = file.name;

  const formData = new FormData();
  formData.append('file', file);

  statusDiv.textContent = 'Uploading...';

  try {
    const jwtToken = retrieveJwt();
    if (!jwtToken) {
      statusDiv.textContent = 'No token found.';
      return;
    }

    const response = await apiClient.post(
      '/app/v2/budget/upload-file',
      formData,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    console.log('Server response:', response.data);
    statusDiv.textContent = 'Upload successful!';
    alert('Budget file has been uploaded')
  } catch (error) {
    console.error('Upload error:', error);
    statusDiv.textContent = 'Upload failed.';
  }
};

// Hook up your nice button behaviour:
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', uploadBudgetFile);
