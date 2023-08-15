
const dropArea = document.getElementById("drop-area");
const dropAreaXsn = document.getElementById("drop-area-xsn");

 // Trigger file input click when the drop area is clicked
dropArea.addEventListener("click", function () {
    console.log('inside click event');
    document.getElementById("screenshot-input").click();
});

 // Trigger file input click when the drop area is clicked
 dropAreaXsn.addEventListener("click", function () {
    console.log('inside xsn click event');
    document.getElementById("xsn-file-input").click();
});

// Handle selected file when the file input changes
document.getElementById("screenshot-input").addEventListener("change", function (e) {
    const selectedFiles = e.target.files;

    if(Array.from(selectedFiles).length > 0) {
        const filetext = document.getElementById('screenshot-name');
        filetext.textContent = "";

        const filetextSpans = document.querySelectorAll('#screenshot-name-span');
        for (const filetextSpan of filetextSpans) {
            filetextSpan.textContent = "";
        }
        
    }

    Array.from(selectedFiles).forEach((file, index) => {
      console.log(`File ${index + 1}: ${file.name}`);
      handleImageFile(file, index+1);
    });
});

// Handle selected file when the file input changes
document.getElementById("xsn-file-input").addEventListener("change", function (e) {
    const selectedFile = e.target.files[0];
    if(selectedFile) {
        console.log(`XSN File : ${selectedFile.name}`);
        handleXsnFile(selectedFile);
    }

});

function handleImageFile(file, i) {
    
    const filetextSpans = document.querySelectorAll('#screenshot-name-span');
    for (const filetextSpan of filetextSpans) {
        console.log(filetextSpan);
        filetextSpan.textContent = filetextSpan.textContent == "" ? `${i}. ${file.name}  ` : filetextSpan.textContent + `${i}. ${file.name}  `;
    }

      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
    
        reader.onload = function () {
            const thumbnailContainer = document.getElementById('screenshot-name');
        
            const thumbnailImg = document.createElement('img');
            thumbnailImg.src = reader.result;
            thumbnailImg.alt = file.name;
            thumbnailImg.style.width = "140px";
            thumbnailImg.style.height = "140px";
            thumbnailContainer.appendChild(thumbnailImg);
        };
    
        reader.readAsDataURL(file);
      }

}

function handleXsnFile(file) {
    const filetextSpans = document.querySelectorAll('#xsn-file-span');
    for (const filetextSpan of filetextSpans) {
        console.log(filetextSpan);
        filetextSpan.textContent = file.name;
    }

    const fileName = document.getElementById('xsn-file-name');
    if (fileName) {
        console.log(fileName);
        fileName.textContent = "";
        fileName.innerHTML = `<i class='bi bi-paperclip'></i> ${file.name}`;
    }
}
