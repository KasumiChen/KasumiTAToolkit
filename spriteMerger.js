document.addEventListener('DOMContentLoaded', function() {
    let images = [];
    let imageSize = null;
    let W = null;
    let H = null;
    let imageElements = [];

    document.getElementById('imageInput').addEventListener('change', handleFileSelect, false);
    document.getElementById('mergeButton').addEventListener('click', mergeImages);

    function handleFileSelect(event) {
        images = Array.from(event.target.files);
        imageSize = null;
        W = null;
        H = null;
        updateImagePreview();
    }

    function updateImagePreview() {
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = '';
        imageElements = [];

        images.forEach((file) => {
            if (!file.type.match('image/png') && !file.type.match('image/jpeg')) {
                alert("Please upload only PNG or JPG images.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const imgElement = document.createElement('img');
                imgElement.src = e.target.result;
                preview.appendChild(imgElement);
                imageElements.push(imgElement);

                imgElement.onload = () => {
                    if (imageSize === null) {
                        imageSize = imgElement.naturalWidth;
                        W = imgElement.naturalWidth;
                        H = imgElement.naturalHeight;
                    } else if (imgElement.naturalWidth !== W || imgElement.naturalHeight !== H) {
                        alert("All images must be of the same size. Please upload images with equal dimensions.");
                        images = [];
                        imageElements = [];
                        updateImagePreview();
                        return;
                    }
                };
            };
            reader.readAsDataURL(file);
        });

        initializeSortable();
    }

    function initializeSortable() {
        new Sortable(document.getElementById('imagePreview'), {
            animation: 150,
            onEnd: function(evt) {
                const newOrder = Array.from(document.getElementById('imagePreview').children);
                images = newOrder.map(img => images[imageElements.indexOf(img)]);
                imageElements = newOrder;
            }
        });
    }

    function mergeImages() {
        if (!imageSize || images.length === 0) {
            alert("Please upload images");
            return;
        }

        let canvas = document.getElementById('canvas');
        let ctx = canvas.getContext('2d');
        let totalWidth = W * images.length;
        canvas.width = totalWidth;
        canvas.height = H;

        mergeAndDownloadImages(canvas, ctx);
    }

    function mergeAndDownloadImages(canvas, ctx) {
        let loadedImages = 0;
        images.forEach((file, index) => {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, index * W, 0, W, H);
                loadedImages++;
                if (loadedImages === images.length) {
                    displayResult(canvas.toDataURL('image/png'));
                    document.getElementById('downloadButton').style.display = 'block';
                }
            };
            const reader = new FileReader();
            reader.onload = (e) => img.src = e.target.result;
            reader.readAsDataURL(file);
        });
    }


    function displayResult(dataUrl) {
        const resultContainer = document.getElementById('resultContainer');
        const resultImage = document.createElement('img');
        resultImage.src = dataUrl;

        resultImage.style.maxWidth = "30vh";
        resultImage.style.height = 'auto';

        resultContainer.innerHTML = '';
        resultContainer.appendChild(resultImage);
    }

    document.getElementById('downloadButton').addEventListener('click', function() {
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'mergedImage.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
});
