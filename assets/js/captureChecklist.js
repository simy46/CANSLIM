import html2canvas from 'html2canvas';
import { SERVER_URL } from "./const";

export async function captureAndSendImage() {
    const checklistElement = document.getElementById('buying-checklist');

    html2canvas(checklistElement).then(async canvas => {
        const base64Image = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, "");

        try {
            const response = await fetch(`${SERVER_URL}/upload-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ base64Image })
            });

            const data = await response.json();

            if (data.imageUrl) {
                console.log('Image URL:', data.imageUrl);
                shareOnTwitter(data.imageUrl);
            } else {
                console.error('Error during upload:', data.error);
            }
        } catch (error) {
            console.error('Error during server request:', error);
        }
    });
}

export async function captureAndDownloadImage() {
    const checklistElement = document.getElementById('buying-checklist');

    html2canvas(checklistElement).then(canvas => {
        const base64Image = canvas.toDataURL('image/png');
        
        const link = document.createElement('a');
        link.href = base64Image;
        link.download = 'canslim-checklist.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

function shareOnTwitter(imageUrl) {
    const text = encodeURIComponent("Check out this CANSLIM analysis! #Investment #CANSLIM");
    const twitterUrl = `https://twitter.com/intent/tweet?url=${imageUrl}&text=${text}`;
    window.open(twitterUrl, '_blank');
}